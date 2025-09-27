import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import clearDocumentConfig from "../../../agents/clear/clear-document-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("clear-document-config", () => {
  let testDir;
  let configPath;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(__dirname, "test-clear-config");
    await mkdir(testDir, { recursive: true });

    // Create .aigne/doc-smith directory structure
    const aigneDir = join(testDir, ".aigne", "doc-smith");
    await mkdir(aigneDir, { recursive: true });

    configPath = join(aigneDir, "config.yaml");
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  });

  test("should clear existing document configuration successfully", async () => {
    // Create a test config file
    const configContent = `
projectName: "Test Project"
projectDesc: "Test Description"
locale: "en"
documentPurpose: ["API", "Tutorial"]
`;
    await writeFile(configPath, configContent);

    const result = await clearDocumentConfig({ workDir: testDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared document configuration");
    expect(result.path).toBeDefined();
    expect(result.suggestions).toEqual([
      "Run `aigne doc init` to generate a fresh configuration file.",
    ]);

    // Verify file is actually deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(configPath);
    expect(exists).toBe(false);
  });

  test("should handle non-existent configuration file", async () => {
    // Don't create the config file
    const result = await clearDocumentConfig({ workDir: testDir });

    expect(result.cleared).toBe(false);
    expect(result.message).toContain("Document configuration already empty");
    expect(result.path).toBeDefined();
    expect(result.suggestions).toEqual([]);
  });

  test("should use current working directory when workDir not provided", async () => {
    const originalCwd = process.cwd();

    try {
      // Change to test directory
      process.chdir(testDir);

      // Create config in current directory's .aigne structure
      await writeFile(configPath, "test: content");

      const result = await clearDocumentConfig({});

      expect(result.cleared).toBe(true);
      expect(result.message).toContain("Cleared document configuration");
    } finally {
      // Restore original working directory
      process.chdir(originalCwd);
    }
  });

  test("should provide correct return structure", async () => {
    await writeFile(configPath, "test: content");

    const result = await clearDocumentConfig({ workDir: testDir });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("cleared");
    expect(result).toHaveProperty("path");
    expect(result).toHaveProperty("suggestions");
    expect(typeof result.message).toBe("string");
    expect(typeof result.cleared).toBe("boolean");
    expect(typeof result.path).toBe("string");
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  test("should have correct task metadata", () => {
    expect(clearDocumentConfig.taskTitle).toBe("Clear document configuration");
    expect(clearDocumentConfig.description).toBe("Clear the document configuration file");
  });

  test("should handle nested directory structures", async () => {
    // Create nested test directory
    const nestedDir = join(testDir, "nested", "project");
    await mkdir(nestedDir, { recursive: true });

    const nestedAigneDir = join(nestedDir, ".aigne", "doc-smith");
    await mkdir(nestedAigneDir, { recursive: true });

    const nestedConfigPath = join(nestedAigneDir, "config.yaml");
    await writeFile(nestedConfigPath, "nested: config");

    const result = await clearDocumentConfig({ workDir: nestedDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared document configuration");

    // Verify nested file is deleted
    const { pathExists } = await import("../../../utils/file-utils.mjs");
    const exists = await pathExists(nestedConfigPath);
    expect(exists).toBe(false);
  });

  test("should handle path with special characters", async () => {
    // Create directory with spaces and special characters
    const specialDir = join(testDir, "special dir-with_chars");
    await mkdir(specialDir, { recursive: true });

    const specialAigneDir = join(specialDir, ".aigne", "doc-smith");
    await mkdir(specialAigneDir, { recursive: true });

    const specialConfigPath = join(specialAigneDir, "config.yaml");
    await writeFile(specialConfigPath, "special: config");

    const result = await clearDocumentConfig({ workDir: specialDir });

    expect(result.cleared).toBe(true);
    expect(result.message).toContain("Cleared document configuration");
  });
});
