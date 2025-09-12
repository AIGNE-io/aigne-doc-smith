import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import loadConfig from "../../utils/load-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("load-config", () => {
  let testDir;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(__dirname, "test-load-config");
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  });

  test("should load valid YAML config file", async () => {
    const configPath = join(testDir, "config.yaml");
    const configContent = `
projectName: "Test Project"
locale: "en"
docsDir: "./docs"
sourcesPath:
  - "./src"
  - "./lib"
`;
    await writeFile(configPath, configContent);

    const result = await loadConfig({ config: configPath });

    expect(result).toBeDefined();
    expect(result.projectName).toBe("Test Project");
    expect(result.locale).toBe("en");
    expect(result.docsDir).toBe("./docs");
    expect(result.sourcesPath).toEqual(["./src", "./lib"]);
    expect(result.lastGitHead).toBe("");
  });

  test("should handle appUrl parameter", async () => {
    const configPath = join(testDir, "config.yaml");
    const configContent = `
projectName: "Test Project"
locale: "en"
`;
    await writeFile(configPath, configContent);

    const result = await loadConfig({
      config: configPath,
      appUrl: "example.com",
    });

    expect(result.appUrl).toBe("https://example.com");
  });

  test("should preserve appUrl with existing protocol", async () => {
    const configPath = join(testDir, "config.yaml");
    const configContent = `
projectName: "Test Project"
locale: "en"
`;
    await writeFile(configPath, configContent);

    const result = await loadConfig({
      config: configPath,
      appUrl: "http://localhost:3000",
    });

    expect(result.appUrl).toBe("http://localhost:3000");
  });

  test("should handle absolute config path", async () => {
    const configPath = join(testDir, "absolute-config.yaml");
    const configContent = `
projectName: "Absolute Path Test"
locale: "zh"
`;
    await writeFile(configPath, configContent);

    const result = await loadConfig({ config: configPath });

    expect(result.projectName).toBe("Absolute Path Test");
    expect(result.locale).toBe("zh");
  });

  test("should throw error for non-existent config file", async () => {
    const nonExistentPath = join(testDir, "non-existent.yaml");

    await expect(loadConfig({ config: nonExistentPath })).rejects.toThrow(
      `Config file not found: ${nonExistentPath}`,
    );
  });

  test("should throw error for invalid YAML syntax", async () => {
    const configPath = join(testDir, "invalid.yaml");
    const invalidContent = `
projectName: "Test
locale: en
invalid: yaml: syntax
`;
    await writeFile(configPath, invalidContent);

    await expect(loadConfig({ config: configPath })).rejects.toThrow(
      "Failed to parse config file:",
    );
  });

  test("should throw error for empty config file", async () => {
    const configPath = join(testDir, "empty.yaml");
    await writeFile(configPath, "");

    // Empty YAML files result in null, which causes an error in the processing
    await expect(loadConfig({ config: configPath })).rejects.toThrow(
      "Failed to parse config file:",
    );
  });

  test("should handle config with lastGitHead", async () => {
    const configPath = join(testDir, "config-with-git.yaml");
    const configContent = `
projectName: "Git Project"
lastGitHead: "abc123def456"
locale: "en"
`;
    await writeFile(configPath, configContent);

    const result = await loadConfig({ config: configPath });

    expect(result.lastGitHead).toBe("abc123def456");
    expect(result.projectName).toBe("Git Project");
  });
});
