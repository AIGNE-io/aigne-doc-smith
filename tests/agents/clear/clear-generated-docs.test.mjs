import { afterEach, beforeAll, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as fsPromises from "node:fs/promises";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import clearGeneratedDocs from "../../../agents/clear/clear-generated-docs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("clear-generated-docs", () => {
  let testDir;
  let docsDir;
  let chooseDocsMock;

  beforeAll(() => {
    mock.module("../../../agents/utils/choose-docs.mjs", () => ({
      __esModule: true,
      default: (...args) => chooseDocsMock?.(...args),
    }));
  });

  beforeEach(async () => {
    chooseDocsMock = async () => ({ selectedDocs: [{ path: "/test" }] });
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
    chooseDocsMock = async () => ({
      selectedDocs: [
        { path: "/index" },
        { path: "/guide" },
        { path: "/api" },
        { path: "/advanced/config" },
      ],
    });

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
    expect(result.message).toContain("Deleted");

    // Verify selected files are deleted but directory remains
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    expect(await pathExists(join(docsDir, "index.md"))).toBe(false);
    expect(await pathExists(join(docsDir, "guide.md"))).toBe(false);
    expect(await pathExists(join(docsDir, "api.md"))).toBe(false);
    expect(await pathExists(docsDir)).toBe(true);
  });

  test("should handle non-existent documents directory", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [] });
    const nonExistentDir = join(testDir, "non-existent-docs");

    const result = await clearGeneratedDocs({ docsDir: nonExistentDir });

    expect(result.cleared).toBe(false);
    expect(result.message).toContain("does not exist");
  });

  test("should return error message when no docsDir provided", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [] });
    const result = await clearGeneratedDocs({});

    expect(result.message).toContain("No generated documents directory specified");
  });

  test("should handle null docsDir", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [] });
    const result = await clearGeneratedDocs({ docsDir: null });

    expect(result.message).toContain("No generated documents directory specified");
  });

  test("should handle empty string docsDir", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [] });
    const result = await clearGeneratedDocs({ docsDir: "" });

    expect(result.message).toContain("No generated documents directory specified");
  });

  test("should handle undefined docsDir", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [] });
    const result = await clearGeneratedDocs({ docsDir: undefined });

    expect(result.message).toContain("No generated documents directory specified");
  });

  test("should provide correct return structure", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [{ path: "/test" }] });
    await writeFile(join(docsDir, "test.md"), "test content");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("cleared");
    expect(typeof result.message).toBe("string");
    expect(typeof result.cleared).toBe("boolean");
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
    expect(clearGeneratedDocs.taskTitle).toBe("Clear generated documents");
    expect(clearGeneratedDocs.description).toBe(
      "Select and delete specific generated documents from the docs directory",
    );
  });

  test("should handle relative paths", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [{ path: "/test" }] });
    // Create test files
    await writeFile(join(docsDir, "test.md"), "test content");

    // Use relative path
    const relativePath = "./docs";
    const originalCwd = process.cwd();

    try {
      process.chdir(testDir);
      const result = await clearGeneratedDocs({ docsDir: relativePath });

      expect(result.cleared).toBe(true);
      expect(result.message).toContain("Deleted");
    } finally {
      process.chdir(originalCwd);
    }
  });

  test("should handle absolute paths", async () => {
    // Create test files
    await writeFile(join(docsDir, "test.md"), "test content");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Deleted");
  });

  test("should handle complex directory structures", async () => {
    chooseDocsMock = async () => ({
      selectedDocs: [
        { path: "/api/content" },
        { path: "/guides/getting-started/content" },
        { path: "/tutorials/advanced/content" },
        { path: "/.hidden/content" },
        { path: "/index" },
      ],
    });
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
    expect(result.message).toContain("Deleted");
  });

  test("should handle paths with special characters", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [{ path: "/test file" }] });
    // Create directory with special characters
    const specialDocsDir = join(testDir, "docs with spaces & symbols-123");
    await mkdir(specialDocsDir, { recursive: true });
    await writeFile(join(specialDocsDir, "test file.md"), "special content");

    const result = await clearGeneratedDocs({ docsDir: specialDocsDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Deleted");
  });

  test("should handle file system errors gracefully", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [{ path: "/test" }] });
    // Create some test files first
    await writeFile(join(docsDir, "test.md"), "test content");

    // Create a spy on rm to simulate an error
    const rmSpy = spyOn(fsPromises, "rm");
    rmSpy.mockImplementation(() => {
      throw new Error("Permission denied");
    });

    try {
      const result = await clearGeneratedDocs({ docsDir });

      expect(result.error).toBe(true);
      expect(result.message).toContain("Failed to delete");
      expect(result.message).toContain("Permission denied");
    } finally {
      rmSpy.mockRestore();
    }
  });

  test("should skip when no documents selected", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [] });
    await writeFile(join(docsDir, "keep.md"), "keep");

    const result = await clearGeneratedDocs({ docsDir });

    expect(result.cleared).toBe(false);
    expect(result.message).toContain("No documents selected for deletion");
    // File should remain
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    expect(await pathExists(join(docsDir, "keep.md"))).toBe(true);
  });

  test("should delete all language variants for selected docs", async () => {
    chooseDocsMock = async () => ({ selectedDocs: [{ path: "/multi" }] });
    // Create files for en (default), zh, ja
    await writeFile(join(docsDir, "multi.md"), "en");
    await writeFile(join(docsDir, "multi.zh.md"), "zh");
    await writeFile(join(docsDir, "multi.ja.md"), "ja");

    const result = await clearGeneratedDocs({
      docsDir,
      locale: "en",
      translateLanguages: ["zh", "ja"],
    });

    expect(result.cleared).toBe(true);
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    expect(await pathExists(join(docsDir, "multi.md"))).toBe(false);
    expect(await pathExists(join(docsDir, "multi.zh.md"))).toBe(false);
    expect(await pathExists(join(docsDir, "multi.ja.md"))).toBe(false);
  });
});
