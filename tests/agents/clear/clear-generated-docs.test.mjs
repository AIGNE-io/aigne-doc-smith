import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import clearGeneratedDocs from "../../../agents/clear/clear-generated-docs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("clear-generated-docs", () => {
  let testDir;
  let docsDir;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(__dirname, "test-clear-docs");
    await mkdir(testDir, { recursive: true });

    docsDir = join(testDir, "docs");
    await mkdir(docsDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  });

  test("should clear existing generated documents successfully", async () => {
    // Create some test files in docs directory
    const testFiles = ["index.md", "guide.md", "api.md", "README.md"];
    for (const file of testFiles) {
      await writeFile(join(docsDir, file), `# ${file} content`);
    }

    // Create subdirectories with files
    const subDir = join(docsDir, "advanced");
    await mkdir(subDir, { recursive: true });
    await writeFile(join(subDir, "config.md"), "# Config content");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared generated documents");
    expect(result.path).toBeDefined();

    // Verify directory is actually deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(docsDir);
    expect(exists).toBe(false);
  });

  test("should handle non-existent documents directory", async () => {
    const nonExistentDir = join(testDir, "non-existent-docs");

    const result = await clearGeneratedDocs({ docsDir: nonExistentDir });

    expect(result.cleared).toBe(false);
    expect(result.message).toContain("Generated documents already empty");
    expect(result.path).toBeDefined();
  });

  test("should return error message when no docsDir provided", async () => {
    const result = await clearGeneratedDocs({});

    expect(result.message).toBe("No generated documents directory specified");
    expect(result).not.toHaveProperty("cleared");
    expect(result).not.toHaveProperty("path");
  });

  test("should handle null docsDir", async () => {
    const result = await clearGeneratedDocs({ docsDir: null });

    expect(result.message).toBe("No generated documents directory specified");
  });

  test("should handle empty string docsDir", async () => {
    const result = await clearGeneratedDocs({ docsDir: "" });

    expect(result.message).toBe("No generated documents directory specified");
  });

  test("should handle undefined docsDir", async () => {
    const result = await clearGeneratedDocs({ docsDir: undefined });

    expect(result.message).toBe("No generated documents directory specified");
  });

  test("should provide correct return structure", async () => {
    await writeFile(join(docsDir, "test.md"), "test content");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("cleared");
    expect(result).toHaveProperty("path");
    expect(typeof result.message).toBe("string");
    expect(typeof result.cleared).toBe("boolean");
    expect(typeof result.path).toBe("string");
  });

  test("should have correct input schema", () => {
    expect(clearGeneratedDocs.input_schema).toBeDefined();
    expect(clearGeneratedDocs.input_schema.type).toBe("object");
    expect(clearGeneratedDocs.input_schema.properties.docsDir).toBeDefined();
    expect(clearGeneratedDocs.input_schema.properties.docsDir.type).toBe("string");
    expect(clearGeneratedDocs.input_schema.properties.docsDir.description).toBe(
      "The generated documents directory to clear",
    );
    expect(clearGeneratedDocs.input_schema.required).toEqual(["docsDir"]);
  });

  test("should have correct task metadata", () => {
    expect(clearGeneratedDocs.taskTitle).toBe("Clear all generated documents");
    expect(clearGeneratedDocs.description).toBe("Clear the generated documents directory");
  });

  test("should handle relative paths", async () => {
    // Create test files
    await writeFile(join(docsDir, "test.md"), "test content");

    // Use relative path
    const relativePath = "./docs";
    const originalCwd = process.cwd();

    try {
      process.chdir(testDir);
      const result = await clearGeneratedDocs({ docsDir: relativePath });

      expect(result.cleared).toBe(true);
      expect(result.message).toContain("Cleared generated documents");
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("should handle absolute paths", async () => {
    // Create test files
    await writeFile(join(docsDir, "test.md"), "test content");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared generated documents");

    // Verify absolute path works
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(docsDir);
    expect(exists).toBe(false);
  });

  test("should handle complex directory structures", async () => {
    // Create complex nested structure
    const nestedDirs = [
      join(docsDir, "api"),
      join(docsDir, "guides", "getting-started"),
      join(docsDir, "tutorials", "advanced"),
      join(docsDir, ".hidden"),
    ];

    for (const dir of nestedDirs) {
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "content.md"), "nested content");
    }

    // Create files at root level
    await writeFile(join(docsDir, "index.md"), "root content");
    await writeFile(join(docsDir, ".gitignore"), "node_modules/");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared generated documents");

    // Verify entire structure is deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(docsDir);
    expect(exists).toBe(false);
  });

  test("should handle paths with special characters", async () => {
    // Create directory with special characters
    const specialDocsDir = join(testDir, "docs with spaces & symbols-123");
    await mkdir(specialDocsDir, { recursive: true });
    await writeFile(join(specialDocsDir, "test file.md"), "special content");

    const result = await clearGeneratedDocs({ docsDir: specialDocsDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared generated documents");

    // Verify special path is deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(specialDocsDir);
    expect(exists).toBe(false);
  });
});
