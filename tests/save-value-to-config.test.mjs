import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
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

// Test utilities
function assertContains(content, expected, message) {
  if (!content.includes(expected)) {
    throw new Error(
      `${message}\nExpected content to contain: ${expected}\nActual content:\n${content}`,
    );
  }
}

function assertNotContains(content, unexpected, message) {
  if (content.includes(unexpected)) {
    throw new Error(
      `${message}\nExpected content NOT to contain: ${unexpected}\nActual content:\n${content}`,
    );
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

// Test cases
const tests = [
  // Test 1: Save string value to empty file
  {
    name: "Save string value to empty file",
    async run() {
      await saveValueToConfig("projectName", "test-project");
      const content = await readConfigFile();

      assertContains(
        content,
        'projectName: "test-project"',
        "Should save string value with quotes",
      );
    },
  },

  // Test 2: Save string value with comment to empty file
  {
    name: "Save string value with comment to empty file",
    async run() {
      await saveValueToConfig("projectDesc", "A test project", "Project description");
      const content = await readConfigFile();

      assertContains(content, "# Project description", "Should include comment");
      assertContains(content, 'projectDesc: "A test project"', "Should save string value");
    },
  },

  // Test 3: Save array value to empty file
  {
    name: "Save array value to empty file",
    async run() {
      await saveValueToConfig("translateLanguages", ["zh", "ja", "ko"]);
      const content = await readConfigFile();

      assertContains(content, "translateLanguages:", "Should have array key");
      assertContains(content, "  - zh", "Should have first array item");
      assertContains(content, "  - ja", "Should have second array item");
      assertContains(content, "  - ko", "Should have third array item");
    },
  },

  // Test 4: Save empty array
  {
    name: "Save empty array",
    async run() {
      await saveValueToConfig("emptyArray", []);
      const content = await readConfigFile();

      assertContains(content, "emptyArray: []", "Should save empty array as []");
    },
  },

  // Test 5: Save array with comment
  {
    name: "Save array with comment",
    async run() {
      await saveValueToConfig("sourcePaths", ["./src", "./lib"], "Source code paths");
      const content = await readConfigFile();

      assertContains(content, "# Source code paths", "Should include comment");
      assertContains(content, "sourcePaths:", "Should have array key");
      assertContains(content, "  - ./src", "Should have first path");
      assertContains(content, "  - ./lib", "Should have second path");
    },
  },

  // Test 6: Update existing string value
  {
    name: "Update existing string value",
    async run() {
      await createInitialConfig('projectName: "old-project"\nversion: "1.0.0"');

      await saveValueToConfig("projectName", "new-project");
      const content = await readConfigFile();

      assertContains(content, 'projectName: "new-project"', "Should update string value");
      assertContains(content, 'version: "1.0.0"', "Should preserve other values");
      assertNotContains(content, "old-project", "Should not contain old value");
    },
  },

  // Test 7: Update existing array value
  {
    name: "Update existing array value",
    async run() {
      await createInitialConfig(`translateLanguages:
  - en
  - fr
version: "1.0.0"`);

      await saveValueToConfig("translateLanguages", ["zh", "ja"]);
      const content = await readConfigFile();

      assertContains(content, "translateLanguages:", "Should have array key");
      assertContains(content, "  - zh", "Should have new first item");
      assertContains(content, "  - ja", "Should have new second item");
      assertNotContains(content, "  - en", "Should not contain old first item");
      assertNotContains(content, "  - fr", "Should not contain old second item");
      assertContains(content, 'version: "1.0.0"', "Should preserve other values");
    },
  },

  // Test 8: Update array to empty array
  {
    name: "Update array to empty array",
    async run() {
      await createInitialConfig(`translateLanguages:
  - en
  - fr
version: "1.0.0"`);

      await saveValueToConfig("translateLanguages", []);
      const content = await readConfigFile();

      assertContains(content, "translateLanguages: []", "Should update to empty array");
      assertNotContains(content, "  - en", "Should remove old items");
      assertContains(content, 'version: "1.0.0"', "Should preserve other values");
    },
  },

  // Test 9: Update empty array to populated array
  {
    name: "Update empty array to populated array",
    async run() {
      await createInitialConfig(`translateLanguages: []
version: "1.0.0"`);

      await saveValueToConfig("translateLanguages", ["zh", "ja"]);
      const content = await readConfigFile();

      assertContains(content, "translateLanguages:", "Should have array key");
      assertContains(content, "  - zh", "Should have first item");
      assertContains(content, "  - ja", "Should have second item");
      assertNotContains(content, "translateLanguages: []", "Should not contain empty array format");
      assertContains(content, 'version: "1.0.0"', "Should preserve other values");
    },
  },

  // Test 10: Add comment to existing value without comment
  {
    name: "Add comment to existing value without comment",
    async run() {
      await createInitialConfig('projectName: "test-project"\nversion: "1.0.0"');

      await saveValueToConfig("projectName", "updated-project", "Updated project name");
      const content = await readConfigFile();

      assertContains(content, "# Updated project name", "Should add comment");
      assertContains(content, 'projectName: "updated-project"', "Should update value");
    },
  },

  // Test 11: Update value that already has comment
  {
    name: "Update value that already has comment",
    async run() {
      await createInitialConfig(`# Project information
projectName: "old-project"
version: "1.0.0"`);

      await saveValueToConfig("projectName", "new-project", "Updated project info");
      const content = await readConfigFile();

      assertContains(content, "# Project information", "Should preserve existing comment");
      assertContains(content, 'projectName: "new-project"', "Should update value");
      assertNotContains(content, "# Updated project info", "Should not add duplicate comment");
    },
  },

  // Test 12: Complex array with various items
  {
    name: "Complex array with various items",
    async run() {
      const complexArray = ["./src/components", "./lib/utils", "./modules/auth"];
      await saveValueToConfig("sourcePaths", complexArray, "All source paths");
      const content = await readConfigFile();

      assertContains(content, "# All source paths", "Should include comment");
      assertContains(content, "sourcePaths:", "Should have array key");
      assertContains(content, "  - ./src/components", "Should have first complex path");
      assertContains(content, "  - ./lib/utils", "Should have second complex path");
      assertContains(content, "  - ./modules/auth", "Should have third complex path");
    },
  },

  // Test 13: Mixed content preservation
  {
    name: "Mixed content preservation",
    async run() {
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

      assertContains(content, "# Project configuration", "Should preserve file header comment");
      assertContains(content, 'projectName: "original-project"', "Should preserve string value");
      assertContains(content, "# Updated languages", "Should add new comment");
      assertContains(content, "translateLanguages:", "Should have updated array key");
      assertContains(content, "  - zh", "Should have new array items");
      assertContains(content, "  - ja", "Should have new array items");
      assertContains(content, "  - ko", "Should have new array items");
      assertContains(content, "# Other settings", "Should preserve other comments");
      assertContains(content, 'version: "1.0.0"', "Should preserve other values");
      assertContains(content, "locale: en", "Should preserve other values");
      assertNotContains(content, "  - en", "Should remove old array items");
      assertNotContains(content, "  - fr", "Should remove old array items");
    },
  },

  // Test 14: Array in middle of file
  {
    name: "Array in middle of file",
    async run() {
      await createInitialConfig(`projectName: "test-project"
translateLanguages:
  - en
  - fr
locale: en
version: "1.0.0"`);

      await saveValueToConfig("translateLanguages", ["zh"]);
      const content = await readConfigFile();

      assertContains(content, 'projectName: "test-project"', "Should preserve content before");
      assertContains(content, "translateLanguages:", "Should have array key");
      assertContains(content, "  - zh", "Should have new array item");
      assertContains(content, "locale: en", "Should preserve content after");
      assertContains(content, 'version: "1.0.0"', "Should preserve content after");
      assertNotContains(content, "  - en", "Should remove old items");
      assertNotContains(content, "  - fr", "Should remove old items");
    },
  },

  // Test 15: Handle undefined values
  {
    name: "Handle undefined values",
    async run() {
      const initialContent = 'projectName: "test-project"';
      await createInitialConfig(initialContent);

      await saveValueToConfig("undefinedKey", undefined);
      const content = await readConfigFile();

      assertEqual(content, initialContent, "Should not modify file when value is undefined");
    },
  },
];

// Run all tests
async function runTests() {
  console.log("🧪 Running saveValueToConfig tests...\n");

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await setupTestDir();
      await test.run();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    } finally {
      await teardownTestDir();
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${tests.length}`);

  if (failed > 0) {
    console.log(`\n❌ ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All tests passed!`);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
}

export { runTests, tests };
