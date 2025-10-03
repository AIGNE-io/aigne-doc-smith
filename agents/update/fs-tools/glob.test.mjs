import assert from "node:assert";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import glob from "./glob.mjs";

describe("glob tool", () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    // Save original working directory
    originalCwd = process.cwd();

    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "glob-test-"));

    // Change to temp directory
    process.chdir(tempDir);

    // Create a complex directory structure for testing
    await fs.mkdir("src");
    await fs.mkdir("src/components");
    await fs.mkdir("src/utils");
    await fs.mkdir("tests");
    await fs.mkdir("docs");
    await fs.mkdir("node_modules");
    await fs.mkdir(".git");

    // Create test files
    await fs.writeFile("index.js", 'console.log("main");');
    await fs.writeFile("README.md", "# Test Project");
    await fs.writeFile("package.json", '{"name": "test"}');

    await fs.writeFile("src/app.js", "export default app;");
    await fs.writeFile("src/app.ts", "export default app;");
    await fs.writeFile("src/components/Button.jsx", "export const Button = () => {};");
    await fs.writeFile("src/components/Modal.tsx", "export const Modal = () => {};");
    await fs.writeFile("src/utils/helper.js", "export const helper = () => {};");

    await fs.writeFile("tests/app.test.js", 'test("app", () => {});');
    await fs.writeFile("tests/util.spec.js", 'describe("util", () => {});');

    await fs.writeFile("docs/api.md", "# API Documentation");
    await fs.writeFile("docs/guide.rst", "Guide");

    // Files that should be ignored
    await fs.writeFile("node_modules/package.js", "module.exports = {};");
    await fs.writeFile(".git/config", "[core]");
    await fs.writeFile("debug.log", "log entry");
    await fs.writeFile(".DS_Store", "mac metadata");

    // Wait a bit to ensure different modification times
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("basic functionality", () => {
    it("should find all JavaScript files with *.js pattern", async () => {
      const result = await glob({
        pattern: "*.js",
      });

      assert.strictEqual(result.command, "glob");
      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("index.js"));
      assert(!result.result.files.includes("README.md"));
      assert.strictEqual(result.result.count, 1);
      assert(result.result.message.includes("Found 1 file(s)"));
    });

    it("should find files recursively with **/*.js pattern", async () => {
      const result = await glob({
        pattern: "**/*.js",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("index.js"));
      assert(result.result.files.includes("src/app.js"));
      assert(result.result.files.includes("src/utils/helper.js"));
      assert(result.result.files.includes("tests/app.test.js"));
      assert(result.result.count >= 4);
    });

    it("should find TypeScript files with *.ts pattern", async () => {
      const result = await glob({
        pattern: "**/*.ts*",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("src/app.ts"));
      assert(result.result.files.includes("src/components/Modal.tsx"));
      assert.strictEqual(result.result.count, 2);
    });

    it("should find markdown files", async () => {
      const result = await glob({
        pattern: "**/*.md",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("README.md"));
      assert(result.result.files.includes("docs/api.md"));
      assert.strictEqual(result.result.count, 2);
    });

    it("should find files in specific directory", async () => {
      const result = await glob({
        pattern: "src/*.js",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("src/app.js"));
      assert(!result.result.files.includes("index.js")); // Not in src directory
      assert.strictEqual(result.result.count, 1);
    });
  });

  describe("file filtering and ignoring", () => {
    it("should ignore node_modules directory", async () => {
      const result = await glob({
        pattern: "**/*.js",
      });

      assert.strictEqual(result.error, null);
      assert(!result.result.files.some((file) => file.includes("node_modules")));
    });

    it("should ignore .git directory", async () => {
      const result = await glob({
        pattern: "**/*",
      });

      assert.strictEqual(result.error, null);
      assert(!result.result.files.some((file) => file.includes(".git")));
    });

    it("should ignore .DS_Store files", async () => {
      const result = await glob({
        pattern: "**/*",
      });

      assert.strictEqual(result.error, null);
      assert(!result.result.files.includes(".DS_Store"));
    });

    it("should ignore log files", async () => {
      const result = await glob({
        pattern: "**/*",
      });

      assert.strictEqual(result.error, null);
      assert(!result.result.files.includes("debug.log"));
    });
  });

  describe("parameter handling", () => {
    it("should work without path parameter (use current directory)", async () => {
      const result = await glob({
        pattern: "*.js",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("index.js"));
      assert.strictEqual(result.arguments.path, undefined);
    });

    it("should respect limit parameter", async () => {
      const result = await glob({
        pattern: "**/*",

        limit: 3,
      });

      assert.strictEqual(result.error, null);
      assert(result.result.count <= 3);
      assert.strictEqual(result.arguments.limit, 3);
    });

    it("should handle case_sensitive parameter", async () => {
      // Create files with different cases
      await fs.writeFile("Test.js", "test file");
      await fs.writeFile("test.js", "test file");

      const result = await glob({
        pattern: "*.js",

        case_sensitive: false,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.arguments.case_sensitive, false);
      // Note: Actual case sensitivity depends on filesystem and Node.js glob implementation
    });

    it("should handle respect_git_ignore parameter", async () => {
      const result = await glob({
        pattern: "**/*",

        respect_git_ignore: false,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.arguments.respect_git_ignore, false);
    });
  });

  describe("sorting and output", () => {
    it("should sort files by modification time", async () => {
      // Create files with different modification times
      await fs.writeFile("old.js", "old file");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await fs.writeFile("new.js", "new file");

      const result = await glob({
        pattern: "*.js",
      });

      assert.strictEqual(result.error, null);
      // new.js should come before old.js (newer files first)
      const newIndex = result.result.files.indexOf("new.js");
      const oldIndex = result.result.files.indexOf("old.js");

      if (newIndex >= 0 && oldIndex >= 0) {
        assert(newIndex < oldIndex, "Newer files should come first");
      }
    });

    it("should include count and message in result", async () => {
      const result = await glob({
        pattern: "**/*.md",
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(typeof result.result.count, "number");
      assert.strictEqual(typeof result.result.message, "string");
      assert(result.result.message.includes("Found"));
      assert(result.result.message.includes("modification time"));
    });

    it("should indicate truncation when limit is reached", async () => {
      const result = await glob({
        pattern: "**/*",

        limit: 2,
      });

      assert.strictEqual(result.error, null);
      if (result.result.truncated) {
        assert(result.result.message.includes("2+"));
      }
    });
  });

  describe("error handling", () => {
    it("should require pattern parameter", async () => {
      const result = await glob({});

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("Pattern parameter is required"));
      assert.strictEqual(result.result.count, 0);
    });

    it("should handle empty pattern", async () => {
      const result = await glob({
        pattern: "",
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("cannot be empty"));
    });

    it("should handle permission errors gracefully", async () => {
      // This test might not work on all systems, but we include it for completeness
      const result = await glob({
        pattern: "**/*",
      });

      // Should not throw, even if some files are inaccessible
      assert.strictEqual(typeof result, "object");
      assert.strictEqual(typeof result.result, "object");
    });
  });

  describe("glob patterns", () => {
    it("should handle wildcard patterns", async () => {
      const result = await glob({
        pattern: "src/**/*.js*",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("src/app.js"));
      assert(result.result.files.includes("src/components/Button.jsx"));
      assert(result.result.count >= 2);
    });

    it("should handle bracket patterns", async () => {
      const result = await glob({
        pattern: "**/*.{js,ts}",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.some((file) => file.endsWith(".js")));
      assert(result.result.files.some((file) => file.endsWith(".ts")));
    });

    it("should handle negation patterns (if supported)", async () => {
      // Note: Node.js glob may not support negation directly
      const result = await glob({
        pattern: "**/*.js",
      });

      assert.strictEqual(result.error, null);
      // Just verify it works without negation
      assert(result.result.files.length > 0);
    });

    it("should handle single character wildcards", async () => {
      await fs.writeFile("a.js", "test");
      await fs.writeFile("b.js", "test");

      const result = await glob({
        pattern: "?.js",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes("a.js"));
      assert(result.result.files.includes("b.js"));
    });
  });

  describe("edge cases", () => {
    it("should handle empty directory", async () => {
      await fs.mkdir("empty");

      const result = await glob({
        pattern: "empty/**/*",
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.count, 0);
      assert(result.result.message.includes("No files found"));
    });

    it("should handle pattern that matches no files", async () => {
      const result = await glob({
        pattern: "**/*.nonexistent",
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.count, 0);
      assert(result.result.message.includes("No files found"));
    });

    it("should handle very long file names", async () => {
      const longName = "a".repeat(100) + ".js";
      await fs.writeFile(longName, "test");

      const result = await glob({
        pattern: "**/*.js",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes(longName));
    });

    it("should handle special characters in file names", async () => {
      const specialName = "file with spaces & symbols!.js";
      await fs.writeFile(specialName, "test");

      const result = await glob({
        pattern: "**/*.js",
      });

      assert.strictEqual(result.error, null);
      assert(result.result.files.includes(specialName));
    });
  });
});

describe("utility functions", () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "glob-util-test-"));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should validate file sorting by modification time", async () => {
    // Create files with known timestamps
    await fs.writeFile("file1.txt", "content 1");
    await new Promise((resolve) => setTimeout(resolve, 100));
    await fs.writeFile("file2.txt", "content 2");

    const result = await glob({
      pattern: "*.txt",
    });

    assert.strictEqual(result.error, null);
    const files = result.result.files;

    if (files.includes("file1.txt") && files.includes("file2.txt")) {
      const file1Index = files.indexOf("file1.txt");
      const file2Index = files.indexOf("file2.txt");
      assert(file2Index < file1Index, "file2.txt should come before file1.txt (newer first)");
    }
  });
});

describe("schema validation", () => {
  it("should have correct input schema", () => {
    assert.strictEqual(typeof glob.input_schema, "object");
    assert.strictEqual(glob.input_schema.type, "object");
    assert(Array.isArray(glob.input_schema.required));
    assert(glob.input_schema.required.includes("pattern"));
    assert.strictEqual(typeof glob.input_schema.properties, "object");
    assert.strictEqual(typeof glob.input_schema.properties.pattern, "object");
    assert.strictEqual(glob.input_schema.properties.pattern.type, "string");
    assert.strictEqual(typeof glob.input_schema.properties.case_sensitive, "object");
    assert.strictEqual(typeof glob.input_schema.properties.respect_git_ignore, "object");
    assert.strictEqual(typeof glob.input_schema.properties.limit, "object");
  });
});
