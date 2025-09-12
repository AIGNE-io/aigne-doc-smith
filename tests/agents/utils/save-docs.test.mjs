import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import saveDocs from "../../../agents/utils/save-docs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("save-docs", () => {
  let testDir;

  beforeEach(async () => {
    // Set test environment variable to prevent actual config file modification
    process.env.NODE_ENV = "test";

    // Create a temporary test directory
    testDir = join(__dirname, "test-docs");
    await mkdir(testDir, { recursive: true });

    // Create some test files
    const testFiles = [
      "overview.md",
      "getting-started.md",
      "getting-started.zh.md",
      "getting-started.en.md",
      "old-file.md", // This should be deleted
      "another-old-file.md", // This should be deleted
      "old-translation.zh.md", // This should be deleted
      "_sidebar.md", // This should be preserved
    ];

    for (const file of testFiles) {
      await writeFile(join(testDir, file), `# Test content for ${file}`);
    }
  });

  afterEach(async () => {
    // Clean up environment variable
    delete process.env.NODE_ENV;

    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  });

  test("should clean up invalid files and maintain valid ones", async () => {
    const initialFiles = await readdir(testDir);
    expect(initialFiles).toContain("overview.md");
    expect(initialFiles).toContain("getting-started.md");
    expect(initialFiles).toContain("old-file.md");

    // Test structure plan
    const documentStructure = [
      {
        path: "/overview",
        title: "Overview",
        description: "Overview page",
      },
      {
        path: "/getting-started",
        title: "Getting Started",
        description: "Getting started guide",
      },
    ];

    // Test with translation languages
    const translateLanguages = ["zh", "en"];

    const result = await saveDocs({
      documentStructureResult: documentStructure,
      docsDir: testDir,
      translateLanguages,
    });

    expect(result).toBeDefined();

    const remainingFiles = await readdir(testDir);

    // Expected files after cleanup:
    // - overview.md (existing)
    // - getting-started.md (existing)
    // - getting-started.zh.md (existing)
    // - _sidebar.md (generated)
    // Note: getting-started.en.md may be cleaned up if not needed
    // Note: overview.zh.md and overview.en.md are not created by saveDocs,
    // they would be created by saveDocWithTranslations when content is generated
    const expectedFiles = [
      "overview.md",
      "getting-started.md",
      "getting-started.zh.md",
      "_sidebar.md",
    ];

    const missingFiles = expectedFiles.filter((file) => !remainingFiles.includes(file));
    const extraFiles = remainingFiles.filter((file) => !expectedFiles.includes(file));

    expect(missingFiles).toHaveLength(0);
    expect(extraFiles).toHaveLength(0);

    // Verify that invalid files were deleted
    const deletedFiles = ["old-file.md", "another-old-file.md", "old-translation.zh.md"];
    const stillExist = deletedFiles.filter((file) => remainingFiles.includes(file));

    expect(stillExist).toHaveLength(0);
  });
});
