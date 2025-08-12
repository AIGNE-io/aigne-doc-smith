import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import saveDocs from "../agents/save-docs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testSaveDocs() {
  // Create a temporary test directory
  const testDir = join(__dirname, "test-docs");

  try {
    // Create test directory
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

    console.log("Created test files:");
    const files = await readdir(testDir);
    console.log(files);

    // Test structure plan
    const structurePlan = [
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

    console.log("\nRunning saveDocs with cleanup...");
    const result = await saveDocs({
      structurePlanResult: structurePlan,
      docsDir: testDir,
      translateLanguages,
    });

    console.log("\nSaveDocs result:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\nFiles after cleanup:");
    const remainingFiles = await readdir(testDir);
    console.log(remainingFiles);

    // Expected files after cleanup:
    // - overview.md (existing)
    // - getting-started.md (existing)
    // - getting-started.zh.md (existing)
    // - getting-started.en.md (existing)
    // - _sidebar.md (generated)
    // Note: overview.zh.md and overview.en.md are not created by saveDocs,
    // they would be created by saveDocWithTranslations when content is generated
    const expectedFiles = [
      "overview.md",
      "getting-started.md",
      "getting-started.zh.md",
      "getting-started.en.md",
      "_sidebar.md",
    ];

    const missingFiles = expectedFiles.filter((file) => !remainingFiles.includes(file));
    const extraFiles = remainingFiles.filter((file) => !expectedFiles.includes(file));

    if (missingFiles.length === 0 && extraFiles.length === 0) {
      console.log("\n✅ Test passed! All files are as expected.");
    } else {
      console.log("\n❌ Test failed!");
      if (missingFiles.length > 0) {
        console.log("Missing files:", missingFiles);
      }
      if (extraFiles.length > 0) {
        console.log("Extra files:", extraFiles);
      }
    }

    // Verify that invalid files were deleted
    const deletedFiles = ["old-file.md", "another-old-file.md", "old-translation.zh.md"];
    const stillExist = deletedFiles.filter((file) => remainingFiles.includes(file));

    if (stillExist.length === 0) {
      console.log("✅ All invalid files were successfully deleted.");
    } else {
      console.log("❌ Some invalid files still exist:", stillExist);
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    // Clean up test directory
    try {
      const { rm } = await import("node:fs/promises");
      await rm(testDir, { recursive: true, force: true });
      console.log("\nCleaned up test directory");
    } catch (err) {
      console.log("Failed to clean up test directory:", err.message);
    }
  }
}

testSaveDocs();
