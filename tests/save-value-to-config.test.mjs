import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { saveValueToConfig } from "../utils/utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test directory for isolated testing
const TEST_DIR = join(__dirname, "temp-config-test");
const TEST_CONFIG_DIR = join(TEST_DIR, ".aigne", "doc-smith");
const TEST_CONFIG_PATH = join(TEST_CONFIG_DIR, "config.yaml");

// Setup and teardown helpers
async function setupTestDir() {
  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
  await mkdir(TEST_DIR, { recursive: true });

  // Change to test directory for the duration of tests
  process.chdir(TEST_DIR);
}

async function teardownTestDir() {
  // Change back to original directory
  process.chdir(dirname(TEST_DIR));

  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
}

async function readConfigFile() {
  if (!existsSync(TEST_CONFIG_PATH)) {
    return "";
  }
  return await readFile(TEST_CONFIG_PATH, "utf8");
}

async function createInitialConfig(content) {
  await mkdir(TEST_CONFIG_DIR, { recursive: true });
  await writeFile(TEST_CONFIG_PATH, content, "utf8");
}


// Test suite
describe("saveValueToConfig", () => {
  beforeEach(async () => {
    await setupTestDir();
  });

  afterEach(async () => {
    await teardownTestDir();
  });

  test("Save string value to empty file", async () => {
    await saveValueToConfig("projectName", "test-project");
    const content = await readConfigFile();

    expect(content).toContain('projectName: "test-project"');
  });

  test("Save string value with comment to empty file", async () => {
    await saveValueToConfig("projectDesc", "A test project", "Project description");
    const content = await readConfigFile();

    expect(content).toContain("# Project description");
    expect(content).toContain('projectDesc: "A test project"');
  });

  test("Save array value to empty file", async () => {
    await saveValueToConfig("translateLanguages", ["zh", "ja", "ko"]);
    const content = await readConfigFile();

    expect(content).toContain("translateLanguages:");
    expect(content).toContain("  - zh");
    expect(content).toContain("  - ja");
    expect(content).toContain("  - ko");
  });

  test("Save empty array", async () => {
    await saveValueToConfig("emptyArray", []);
    const content = await readConfigFile();

    expect(content).toContain("emptyArray: []");
  });

  test("Save array with comment", async () => {
    await saveValueToConfig("sourcePaths", ["./src", "./lib"], "Source code paths");
    const content = await readConfigFile();

    expect(content).toContain("# Source code paths");
    expect(content).toContain("sourcePaths:");
    expect(content).toContain("  - ./src");
    expect(content).toContain("  - ./lib");
  });

  test("Update existing string value", async () => {
    await createInitialConfig('projectName: "old-project"\nversion: "1.0.0"');

    await saveValueToConfig("projectName", "new-project");
    const content = await readConfigFile();

    expect(content).toContain('projectName: "new-project"');
    expect(content).toContain('version: "1.0.0"');
    expect(content).not.toContain("old-project");
  });

  test("Update existing array value", async () => {
    await createInitialConfig(`translateLanguages:
  - en
  - fr
version: "1.0.0"`);

    await saveValueToConfig("translateLanguages", ["zh", "ja"]);
    const content = await readConfigFile();

    expect(content).toContain("translateLanguages:");
    expect(content).toContain("  - zh");
    expect(content).toContain("  - ja");
    expect(content).not.toContain("  - en");
    expect(content).not.toContain("  - fr");
    expect(content).toContain('version: "1.0.0"');
  });

  test("Update array to empty array", async () => {
    await createInitialConfig(`translateLanguages:
  - en
  - fr
version: "1.0.0"`);

    await saveValueToConfig("translateLanguages", []);
    const content = await readConfigFile();

    expect(content).toContain("translateLanguages: []");
    expect(content).not.toContain("  - en");
    expect(content).toContain('version: "1.0.0"');
  });

  test("Update empty array to populated array", async () => {
    await createInitialConfig(`translateLanguages: []
version: "1.0.0"`);

    await saveValueToConfig("translateLanguages", ["zh", "ja"]);
    const content = await readConfigFile();

    expect(content).toContain("translateLanguages:");
    expect(content).toContain("  - zh");
    expect(content).toContain("  - ja");
    expect(content).not.toContain("translateLanguages: []");
    expect(content).toContain('version: "1.0.0"');
  });

  test("Add comment to existing value without comment", async () => {
    await createInitialConfig('projectName: "test-project"\nversion: "1.0.0"');

    await saveValueToConfig("projectName", "updated-project", "Updated project name");
    const content = await readConfigFile();

    expect(content).toContain("# Updated project name");
    expect(content).toContain('projectName: "updated-project"');
  });

  test("Update value that already has comment", async () => {
    await createInitialConfig(`# Project information
projectName: "old-project"
version: "1.0.0"`);

    await saveValueToConfig("projectName", "new-project", "Updated project info");
    const content = await readConfigFile();

    expect(content).toContain("# Project information");
    expect(content).toContain('projectName: "new-project"');
    expect(content).not.toContain("# Updated project info");
  });

  test("Complex array with various items", async () => {
    const complexArray = ["./src/components", "./lib/utils", "./modules/auth"];
    await saveValueToConfig("sourcePaths", complexArray, "All source paths");
    const content = await readConfigFile();

    expect(content).toContain("# All source paths");
    expect(content).toContain("sourcePaths:");
    expect(content).toContain("  - ./src/components");
    expect(content).toContain("  - ./lib/utils");
    expect(content).toContain("  - ./modules/auth");
  });

  test("Mixed content preservation", async () => {
    await createInitialConfig(`# Project configuration
projectName: "original-project"
translateLanguages:
  - en
  - fr
# Other settings
version: "1.0.0"
locale: en`);

    await saveValueToConfig("translateLanguages", ["zh", "ja", "ko"], "Updated languages");
    const content = await readConfigFile();

    expect(content).toContain("# Project configuration");
    expect(content).toContain('projectName: "original-project"');
    expect(content).toContain("# Updated languages");
    expect(content).toContain("translateLanguages:");
    expect(content).toContain("  - zh");
    expect(content).toContain("  - ja");
    expect(content).toContain("  - ko");
    expect(content).toContain("# Other settings");
    expect(content).toContain('version: "1.0.0"');
    expect(content).toContain("locale: en");
    expect(content).not.toContain("  - en");
    expect(content).not.toContain("  - fr");
  });

  test("Array in middle of file", async () => {
    await createInitialConfig(`projectName: "test-project"
translateLanguages:
  - en
  - fr
locale: en
version: "1.0.0"`);

    await saveValueToConfig("translateLanguages", ["zh"]);
    const content = await readConfigFile();

    expect(content).toContain('projectName: "test-project"');
    expect(content).toContain("translateLanguages:");
    expect(content).toContain("  - zh");
    expect(content).toContain("locale: en");
    expect(content).toContain('version: "1.0.0"');
    expect(content).not.toContain("  - en");
    expect(content).not.toContain("  - fr");
  });

  test("Handle undefined values", async () => {
    const initialContent = 'projectName: "test-project"';
    await createInitialConfig(initialContent);

    await saveValueToConfig("undefinedKey", undefined);
    const content = await readConfigFile();

    expect(content).toBe(initialContent);
  });
});
