import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import clearDocumentStructure from "../../../agents/clear/clear-document-structure.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("clear-document-structure", () => {
  let testDir;
  let structurePlanPath;
  let docsDir;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(__dirname, "test-clear-structure");
    await mkdir(testDir, { recursive: true });

    // Create .aigne/doc-smith/output directory structure
    const outputDir = join(testDir, ".aigne", "doc-smith", "output");
    await mkdir(outputDir, { recursive: true });

    structurePlanPath = join(outputDir, "structure-plan.json");
    docsDir = join(testDir, "docs");
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  });

  test("should clear structure plan only when no docsDir provided", async () => {
    // Create a test structure plan file
    const structurePlan = {
      documents: [
        { path: "/intro", title: "Introduction" },
        { path: "/guide", title: "User Guide" },
      ],
    };
    await writeFile(structurePlanPath, JSON.stringify(structurePlan, null, 2));

    const result = await clearDocumentStructure({ workDir: testDir });

    expect(result.message).toContain("Document structure cleared successfully!");
    expect(result.hasError).toBe(false);
    expect(result.clearedCount).toBe(1);

    // Verify structure plan file is actually deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(structurePlanPath);
    expect(exists).toBe(false);
  });

  test("should clear both structure plan and docs directory when docsDir provided", async () => {
    // Create structure plan
    await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));

    // Create docs directory with files
    await mkdir(docsDir, { recursive: true });
    await writeFile(join(docsDir, "index.md"), "# Index");
    await writeFile(join(docsDir, "guide.md"), "# Guide");

    const result = await clearDocumentStructure({ workDir: testDir, docsDir });

    expect(result.message).toContain("Document structure cleared successfully!");
    expect(result.clearedCount).toBe(2);

    // Verify both are deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const structureExists = await pathExists(structurePlanPath);
    const docsExists = await pathExists(docsDir);
    expect(structureExists).toBe(false);
    expect(docsExists).toBe(false);
  });

  test("should handle non-existent structure plan file", async () => {
    // Don't create the structure plan file
    const result = await clearDocumentStructure({ workDir: testDir });

    expect(result.message).toContain("Document structure already empty.");
    expect(result.clearedCount).toBe(0);
    expect(result.hasError).toBe(false);
  });

  test("should handle non-existent docs directory", async () => {
    // Create structure plan but not docs directory
    await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));

    const nonExistentDocsDir = join(testDir, "non-existent-docs");

    const result = await clearDocumentStructure({
      workDir: testDir,
      docsDir: nonExistentDocsDir,
    });

    expect(result.message).toContain("Document structure cleared successfully!");
    expect(result.clearedCount).toBe(1); // Only structure plan cleared

    // Verify structure plan is deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(structurePlanPath);
    expect(exists).toBe(false);
  });

  test("should use current working directory when workDir not provided", async () => {
    const originalCwd = process.cwd();

    try {
      // Change to test directory
      process.chdir(testDir);

      // Create structure plan in current directory's structure
      await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));

      const result = await clearDocumentStructure({});

      expect(result.message).toContain("Document structure cleared successfully!");
      expect(result.clearedCount).toBe(1);
    } finally {
      // Restore original working directory
      process.chdir(originalCwd);
    }
  });

  test("should provide correct return structure", async () => {
    await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));

    const result = await clearDocumentStructure({ workDir: testDir });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("results");
    expect(result).toHaveProperty("hasError");
    expect(result).toHaveProperty("clearedCount");
    expect(typeof result.message).toBe("string");
    expect(Array.isArray(result.results)).toBe(true);
    expect(typeof result.hasError).toBe("boolean");
    expect(typeof result.clearedCount).toBe("number");
  });

  test("should have correct input schema", () => {
    expect(clearDocumentStructure.input_schema).toBeDefined();
    expect(clearDocumentStructure.input_schema.type).toBe("object");
    expect(clearDocumentStructure.input_schema.properties.docsDir).toBeDefined();
    expect(clearDocumentStructure.input_schema.properties.docsDir.type).toBe("string");
    expect(clearDocumentStructure.input_schema.properties.docsDir.description).toBe(
      "The documents directory to clear (optional)",
    );
    expect(clearDocumentStructure.input_schema.properties.workDir).toBeDefined();
    expect(clearDocumentStructure.input_schema.properties.workDir.type).toBe("string");
    expect(clearDocumentStructure.input_schema.properties.workDir.description).toBe(
      "The working directory (defaults to current directory)",
    );
  });

  test("should have correct task metadata", () => {
    expect(clearDocumentStructure.taskTitle).toBe(
      "Clear document structure and all generated documents",
    );
    expect(clearDocumentStructure.description).toBe(
      "Clear the document structure plan (structure-plan.json) and optionally the documents directory",
    );
  });

  test("should handle complex document structures", async () => {
    // Create complex structure plan
    const complexStructure = {
      documents: [
        {
          path: "/introduction",
          title: "Introduction",
          children: [
            { path: "/introduction/overview", title: "Overview" },
            { path: "/introduction/getting-started", title: "Getting Started" },
          ],
        },
        {
          path: "/api",
          title: "API Reference",
          children: [
            { path: "/api/authentication", title: "Authentication" },
            { path: "/api/endpoints", title: "Endpoints" },
          ],
        },
      ],
      metadata: {
        version: "1.0.0",
        generated: new Date().toISOString(),
      },
    };

    await writeFile(structurePlanPath, JSON.stringify(complexStructure, null, 2));

    // Create corresponding docs structure
    await mkdir(docsDir, { recursive: true });
    const nestedDirs = [
      join(docsDir, "introduction"),
      join(docsDir, "api"),
      join(docsDir, "tutorials"),
    ];

    for (const dir of nestedDirs) {
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "index.md"), `# ${dir} content`);
    }

    const result = await clearDocumentStructure({ workDir: testDir, docsDir });

    expect(result.clearedCount).toBe(2);
    expect(result.hasError).toBe(false);

    // Verify everything is cleaned up
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const structureExists = await pathExists(structurePlanPath);
    const docsExists = await pathExists(docsDir);
    expect(structureExists).toBe(false);
    expect(docsExists).toBe(false);
  });

  test("should handle paths with special characters", async () => {
    // Create directory with special characters
    const specialTestDir = join(__dirname, "test-clear-structure with spaces & symbols");
    await mkdir(specialTestDir, { recursive: true });

    const specialOutputDir = join(specialTestDir, ".aigne", "doc-smith", "output");
    await mkdir(specialOutputDir, { recursive: true });

    const specialStructurePath = join(specialOutputDir, "structure-plan.json");
    await writeFile(specialStructurePath, JSON.stringify({ special: "test" }));

    try {
      const result = await clearDocumentStructure({ workDir: specialTestDir });

      expect(result.clearedCount).toBe(1);
      expect(result.hasError).toBe(false);

      // Verify special path works
      const { pathExists } = await import("../../../utils/file-utils.mjs");
      const exists = await pathExists(specialStructurePath);
      expect(exists).toBe(false);
    } finally {
      // Clean up special directory
      try {
        await rm(specialTestDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test("should handle relative and absolute paths for docsDir", async () => {
    await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));

    // Create docs with relative path reference
    const relativeDocs = join(testDir, "relative-docs");
    await mkdir(relativeDocs, { recursive: true });
    await writeFile(join(relativeDocs, "test.md"), "test content");

    const originalCwd = process.cwd();

    try {
      process.chdir(testDir);
      const result = await clearDocumentStructure({
        workDir: testDir,
        docsDir: "./relative-docs",
      });

      expect(result.clearedCount).toBe(2);
      expect(result.hasError).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("should provide detailed results information", async () => {
    await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));
    await mkdir(docsDir, { recursive: true });
    await writeFile(join(docsDir, "test.md"), "test content");

    const result = await clearDocumentStructure({ workDir: testDir, docsDir });

    expect(result.results).toHaveLength(2);

    // Check structure result
    const structureResult = result.results.find((r) => r.type === "structure");
    expect(structureResult).toBeDefined();
    expect(structureResult.cleared).toBe(true);
    expect(structureResult.message).toContain("structure plan");

    // Check documents result
    const docsResult = result.results.find((r) => r.type === "documents");
    expect(docsResult).toBeDefined();
    expect(docsResult.cleared).toBe(true);
    expect(docsResult.message).toContain("documents directory");
  });

  test("should handle structure plan file removal errors", async () => {
    // Create a spy on rm to simulate an error for structure plan
    const rmSpy = spyOn(fsPromises, "rm");
    rmSpy.mockImplementation((path, _options) => {
      if (path.includes("structure-plan.json")) {
        throw new Error("Permission denied for structure plan");
      }
      return Promise.resolve();
    });

    try {
      const result = await clearDocumentStructure({ workDir: testDir });

      expect(result.hasError).toBe(true);
      expect(result.message).toContain("Document structure cleanup finished with some issues.");

      const structureResult = result.results.find((r) => r.type === "structure");
      expect(structureResult.error).toBe(true);
      expect(structureResult.message).toContain("Failed to clear document structure plan");
      expect(structureResult.message).toContain("Permission denied for structure plan");
    } finally {
      rmSpy.mockRestore();
    }
  });

  test("should handle documents directory removal errors", async () => {
    // Create structure plan file
    await writeFile(structurePlanPath, JSON.stringify({ test: "data" }));

    // Create a spy on rm to simulate an error for docs directory
    const rmSpy = spyOn(fsPromises, "rm");
    rmSpy.mockImplementation((path, _options) => {
      if (path === docsDir) {
        throw new Error("Permission denied for docs directory");
      }
      return Promise.resolve();
    });

    try {
      const result = await clearDocumentStructure({ workDir: testDir, docsDir });

      expect(result.hasError).toBe(true);
      expect(result.message).toContain("Document structure cleanup finished with some issues.");

      const docsResult = result.results.find((r) => r.type === "documents");
      expect(docsResult.error).toBe(true);
      expect(docsResult.message).toContain("Failed to clear documents directory");
      expect(docsResult.message).toContain("Permission denied for docs directory");
    } finally {
      rmSpy.mockRestore();
    }
  });

  test("should handle both structure and docs errors simultaneously", async () => {
    // Create a spy on rm to simulate errors for both operations
    const rmSpy = spyOn(fsPromises, "rm");
    rmSpy.mockImplementation(() => {
      throw new Error("File system error");
    });

    try {
      const result = await clearDocumentStructure({ workDir: testDir, docsDir });

      expect(result.hasError).toBe(true);
      expect(result.message).toContain("Document structure cleanup finished with some issues.");
      expect(result.results).toHaveLength(2);

      // Both operations should have errors
      expect(result.results.every((r) => r.error)).toBe(true);
    } finally {
      rmSpy.mockRestore();
    }
  });
});
