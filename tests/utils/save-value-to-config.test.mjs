import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs";
import { existsSync } from "node:fs";
import fsPromisesDefault, * as fsPromises from "node:fs/promises";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DOC_SMITH_DIR } from "../../utils/constants/index.mjs";
import { saveValueToConfig } from "../../utils/utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test directory for isolated testing
const TEST_DIR = join(__dirname, "temp-config-test");
const TEST_CONFIG_DIR = join(TEST_DIR, DOC_SMITH_DIR);
const TEST_CONFIG_PATH = join(TEST_CONFIG_DIR, "config.yaml");

// Store original working directory
let originalCwd;

// Setup and teardown helpers
async function setupTestDir() {
  // Save original working directory
  originalCwd = process.cwd();

  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
  await mkdir(TEST_DIR, { recursive: true });

  // Change to test directory for the duration of tests
  process.chdir(TEST_DIR);
}

async function teardownTestDir() {
  // Change back to original directory
  process.chdir(originalCwd);

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
describe("save-value-to-config", () => {
  let restoreFunctions = [];

  beforeEach(async () => {
    await setupTestDir();

    // Restore any existing mocks that might interfere with our file operations
    // This is crucial when running alongside other test files like utils.test.mjs
    restoreFunctions = [];

    // Restore fs sync mocks if they exist
    if (typeof fs.existsSync.mockRestore === "function") {
      fs.existsSync.mockRestore();
      restoreFunctions.push(() => spyOn(fs, "existsSync").mockReturnValue(true));
    }
    if (typeof fs.mkdirSync.mockRestore === "function") {
      fs.mkdirSync.mockRestore();
      restoreFunctions.push(() => spyOn(fs, "mkdirSync").mockImplementation(() => {}));
    }

    // Restore fs async mocks if they exist
    if (typeof fsPromises.writeFile.mockRestore === "function") {
      fsPromises.writeFile.mockRestore();
      restoreFunctions.push(() => spyOn(fsPromises, "writeFile").mockResolvedValue());
    }
    if (typeof fsPromises.mkdir.mockRestore === "function") {
      fsPromises.mkdir.mockRestore();
      restoreFunctions.push(() => spyOn(fsPromises, "mkdir").mockResolvedValue());
    }
    if (typeof fsPromises.readFile.mockRestore === "function") {
      fsPromises.readFile.mockRestore();
      restoreFunctions.push(() => spyOn(fsPromises, "readFile").mockResolvedValue("test content"));
    }

    // Restore default import mocks if they exist
    if (typeof fsPromisesDefault.writeFile.mockRestore === "function") {
      fsPromisesDefault.writeFile.mockRestore();
      restoreFunctions.push(() => spyOn(fsPromisesDefault, "writeFile").mockResolvedValue());
    }
    if (typeof fsPromisesDefault.mkdir.mockRestore === "function") {
      fsPromisesDefault.mkdir.mockRestore();
      restoreFunctions.push(() => spyOn(fsPromisesDefault, "mkdir").mockResolvedValue());
    }
  });

  afterEach(async () => {
    await teardownTestDir();

    // Restore the original mocks that other tests might depend on
    restoreFunctions.forEach((restoreFn) => {
      try {
        restoreFn();
      } catch {
        // Ignore errors when restoring mocks
      }
    });
  });

  test("Save string value to empty file", async () => {
    await saveValueToConfig("projectName", "test-project");
    const content = await readConfigFile();

    expect(content).toContain("projectName: test-project");
  });

  test("Save string value with comment to empty file", async () => {
    await saveValueToConfig("projectDesc", "A test project", "Project description");
    const content = await readConfigFile();

    expect(content).toContain("# Project description");
    expect(content).toContain("projectDesc: A test project");
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

    expect(content).toContain("projectName: new-project");
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
    expect(content).toContain("projectName: updated-project");
  });

  test("Update value that already has comment", async () => {
    await createInitialConfig(`# Project information
projectName: "old-project"
version: "1.0.0"`);

    await saveValueToConfig("projectName", "new-project", "Updated project info");
    const content = await readConfigFile();

    expect(content).toContain("# Project information");
    expect(content).toContain("projectName: new-project");
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

  // Edge cases and special character tests
  describe("Special characters and edge cases", () => {
    test("Save string with double quotes", async () => {
      await saveValueToConfig("projectDesc", 'My "awesome" project with quotes');
      const content = await readConfigFile();

      // Should be properly escaped
      expect(content).toContain('My "awesome" project with quotes');
      // Verify YAML is valid by checking structure
      expect(content).toContain("projectDesc:");
    });

    test("Save string with single quotes", async () => {
      await saveValueToConfig("projectName", "It's a 'great' project");
      const content = await readConfigFile();

      expect(content).toContain("It's a 'great' project");
      expect(content).toContain("projectName:");
    });

    test("Save string with colons and special YAML characters", async () => {
      await saveValueToConfig(
        "rule",
        "Use proper formatting: semicolons; colons: and pipes | symbols",
      );
      const content = await readConfigFile();

      expect(content).toContain("Use proper formatting: semicolons; colons: and pipes | symbols");
      expect(content).toContain("rule:");
    });

    test("Save multiline string with newlines", async () => {
      const multilineValue =
        "Line 1: First line\nLine 2: Second line\nLine 3: Third line with: special characters";
      await saveValueToConfig("multilineRule", multilineValue);
      const content = await readConfigFile();

      expect(content).toContain("Line 1: First line");
      expect(content).toContain("Line 2: Second line");
      expect(content).toContain("Line 3: Third line with: special characters");
    });

    test("Save string with Chinese characters and symbols", async () => {
      await saveValueToConfig(
        "chineseProject",
        '中文项目：包含特殊符号！@#￥%…（）—— quotes"and" colons:',
      );
      const content = await readConfigFile();

      expect(content).toContain('中文项目：包含特殊符号！@#￥%…（）—— quotes"and" colons:');
      expect(content).toContain("chineseProject:");
    });

    test("Save string with emoji and Unicode", async () => {
      await saveValueToConfig(
        "emojiProject",
        "🚀 Project with emoji: 🔥 hot features 💯 and symbols ⭐ ✨ 🎉",
      );
      const content = await readConfigFile();

      expect(content).toContain("🚀 Project with emoji: 🔥 hot features 💯 and symbols ⭐ ✨ 🎉");
      expect(content).toContain("emojiProject:");
    });

    test("Save array with special character items", async () => {
      const specialPaths = [
        "./src: main source",
        "./lib/utils: helper functions",
        "./docs-中文/guide",
        "./path with spaces/file",
        "./symbols@#$%/directory",
        './quotes"and"colons:/path',
      ];
      await saveValueToConfig("specialPaths", specialPaths);
      const content = await readConfigFile();

      expect(content).toContain("specialPaths:");
      specialPaths.forEach((path) => {
        expect(content).toContain(path);
      });
    });

    test("Save array with multiline items", async () => {
      const multilineArray = [
        "Item 1:\nWith newline content",
        "Item 2: Simple item",
        "Item 3:\nMultiple\nLines\nWith: colons and | pipes",
      ];
      await saveValueToConfig("multilineArray", multilineArray);
      const content = await readConfigFile();

      expect(content).toContain("multilineArray:");
      expect(content).toContain("Item 1:");
      expect(content).toContain("With newline content");
      expect(content).toContain("Item 3:");
      expect(content).toContain("With: colons and | pipes");
    });

    test("Update existing value containing special characters", async () => {
      await createInitialConfig('projectName: "old: project with | pipes"\nversion: "1.0.0"');

      await saveValueToConfig("projectName", 'new: project with "quotes" and | pipes: updated');
      const content = await readConfigFile();

      expect(content).toContain('new: project with "quotes" and | pipes: updated');
      expect(content).toContain('version: "1.0.0"');
      expect(content).not.toContain("old: project");
    });

    test("Save very long string with special characters", async () => {
      const longString =
        "A very long project description that contains many special characters: colons, semicolons; quotes \"like this\", single quotes 'like this', pipes | symbols, Chinese characters 中文内容：包含各种符号！@#￥%…（）——, emojis 🚀🔥💯⭐✨🎉, and newlines\nSecond line with more content\nThird line: even more special content with all sorts of symbols @#$%^&*()_+-=[]{}|\\;':./?,<>~`";
      await saveValueToConfig("veryLongDesc", longString);
      const content = await readConfigFile();

      expect(content).toContain("veryLongDesc:");
      expect(content).toContain("A very long project description");
      expect(content).toContain("中文内容：包含各种符号");
      expect(content).toContain("🚀🔥💯⭐✨🎉");
      expect(content).toContain("Second line with more content");
    });

    test("Save empty string", async () => {
      await saveValueToConfig("emptyString", "");
      const content = await readConfigFile();

      expect(content).toContain('emptyString: ""');
    });

    test("Save string that looks like YAML syntax", async () => {
      await saveValueToConfig("yamlLikeString", "key: value\nother: - item1\n- item2: subvalue");
      const content = await readConfigFile();

      expect(content).toContain("yamlLikeString:");
      expect(content).toContain("key: value");
      expect(content).toContain("other: - item1");
      expect(content).toContain("- item2: subvalue");
    });

    test("Complex mixed scenario with multiple special character values", async () => {
      // Create initial config with some special content
      await createInitialConfig(`# Project configuration
# with special comments: and symbols
projectName: "original: project"
locale: zh`);

      // Update with various special character content
      await saveValueToConfig("projectDesc", 'Updated description: with "quotes" and | pipes');
      await saveValueToConfig("specialArray", [
        "path: with colons",
        "中文路径/文件",
        "emoji 🔥 path",
      ]);
      await saveValueToConfig(
        "multilineContent",
        "Line 1: content\nLine 2: more content\nLine 3: final content",
      );

      const content = await readConfigFile();

      // Check all content is preserved
      expect(content).toContain("# Project configuration");
      expect(content).toContain("# with special comments: and symbols");
      expect(content).toContain('projectName: "original: project"');
      expect(content).toContain("locale: zh");
      expect(content).toContain('Updated description: with "quotes" and | pipes');
      expect(content).toContain("specialArray:");
      expect(content).toContain("path: with colons");
      expect(content).toContain("中文路径/文件");
      expect(content).toContain("emoji 🔥 path");
      expect(content).toContain("multilineContent:");
      expect(content).toContain("Line 1: content");
      expect(content).toContain("Line 2: more content");
      expect(content).toContain("Line 3: final content");
    });
  });
});
