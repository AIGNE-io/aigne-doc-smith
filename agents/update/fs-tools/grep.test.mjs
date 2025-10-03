import assert from "node:assert";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import grep from "./grep.mjs";

describe("grep tool", () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    // Save original working directory
    originalCwd = process.cwd();

    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "grep-test-"));

    // Change to temp directory
    process.chdir(tempDir);

    // Create test files
    await fs.writeFile("test1.txt", "hello world\nthis is a test\nworld of testing");

    await fs.writeFile(
      "test2.js",
      'function hello() {\n  return "world";\n}\nconst test = "hello";',
    );

    await fs.mkdir("subdir");
    await fs.writeFile("subdir/nested.txt", "nested hello file\nwith world content");

    await fs.writeFile("test3.md", "# Hello\nMarkdown with world content\n## World Section");
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("basic functionality", () => {
    it("should find matches using JavaScript fallback", async () => {
      const result = await grep({
        pattern: "hello",
      });

      assert.strictEqual(result.command, "grep");
      assert.deepStrictEqual(result.arguments, { pattern: "hello", include: undefined });
      assert.strictEqual(result.error, null);
      assert(result.result.includes("Found"));
      assert(result.result.includes("hello"));
      assert(result.result.includes("test1.txt"));
      assert(result.result.includes("test2.js"));
      assert(result.result.includes("nested.txt"));
    });

    it("should find matches with include filter", async () => {
      const result = await grep({
        pattern: "hello",

        include: "*.js",
      });

      assert(result.result.includes("test2.js"));
      assert(!result.result.includes("test1.txt"));
      assert(result.result.includes('filter: "*.js"'));
    });

    it("should return no matches when pattern not found", async () => {
      const result = await grep({
        pattern: "nonexistent",
      });

      assert(result.result.includes("No matches found"));
      assert(result.result.includes("nonexistent"));
      assert.strictEqual(result.error, null);
    });

    it("should be case insensitive", async () => {
      const result = await grep({
        pattern: "HELLO",
      });

      assert(result.result.includes("Found"));
      assert(result.result.includes("hello"));
      assert.strictEqual(result.error, null);
    });
  });

  describe("error handling", () => {
    it("should handle invalid regex pattern", async () => {
      const result = await grep({
        pattern: "[[[",
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("Invalid regular expression"));
      assert(result.result.includes("Error during grep search"));
    });

    it("should handle file read errors gracefully", async () => {
      // Create a binary file that might cause read issues
      await fs.writeFile("binary.bin", Buffer.from([0x00, 0x01, 0x02]));

      const result = await grep({
        pattern: "hello",
      });

      // Should still work, just ignore unreadable files
      assert.strictEqual(result.error, null);
      assert.strictEqual(typeof result.result, "string");
    });
  });

  describe("output formatting", () => {
    it("should format single match correctly", async () => {
      // Create a file with single match
      await fs.writeFile("single.txt", "one hello here");

      const result = await grep({
        pattern: "hello",

        include: "single.txt",
      });

      assert(result.result.includes("Found 1 match"));
      assert(result.result.includes("File: single.txt"));
      assert(result.result.includes("L1: one hello here"));
    });

    it("should format multiple matches correctly", async () => {
      const result = await grep({
        pattern: "world",
      });

      assert(/Found \d+ matches/.test(result.result));
      assert(result.result.includes("File:"));
      assert(result.result.includes("L1:"));
      assert(result.result.includes("---"));
    });

    it("should group matches by file and sort by line number", async () => {
      // Create file with multiple matches
      await fs.writeFile(
        "multi.txt",
        "line 1 with test\nline 2 normal\nline 3 with test\nline 4 with test",
      );

      const result = await grep({
        pattern: "test",

        include: "multi.txt",
      });

      const lines = result.result.split("\n");
      const lineNumbers = lines
        .filter((line) => line.startsWith("L"))
        .map((line) => parseInt(line.match(/L(\d+):/)[1]));

      // Should be in ascending order
      assert.deepStrictEqual(lineNumbers, [1, 3, 4]);
    });
  });

  describe("directory and file filtering", () => {
    it("should exclude node_modules and .git directories", async () => {
      // Create node_modules and .git directories with files
      await fs.mkdir("node_modules");
      await fs.writeFile("node_modules/package.js", "hello from node_modules");

      await fs.mkdir(".git");
      await fs.writeFile(".git/config", "hello from git");

      const result = await grep({
        pattern: "hello",
      });

      // Should not include matches from node_modules or .git
      assert(!result.result.includes("node_modules"));
      assert(!result.result.includes(".git"));
    });

    it("should respect include glob pattern in JS fallback", async () => {
      const result = await grep({
        pattern: "hello",

        include: "*.md",
      });

      assert(result.result.includes("test3.md"));
      assert(!result.result.includes("test1.txt"));
      assert(!result.result.includes("test2.js"));
    });
  });

  describe("path handling", () => {
    it("should default to current directory when no path specified", async () => {
      const result = await grep({
        pattern: "hello",
      });

      assert.strictEqual(result.arguments.path, undefined);
      assert(result.result.includes("Found"));
    });

    it("should search in nested directories", async () => {
      const result = await grep({
        pattern: "nested",
      });

      assert(result.result.includes("nested.txt"));
      assert(result.result.includes("nested hello file"));
    });
  });

  describe("regex patterns", () => {
    it("should handle regex special characters correctly", async () => {
      // Create file with content that matches regex pattern
      await fs.writeFile("regex.txt", 'const foo = "bar";');

      const result = await grep({
        pattern: "foo.*bar",

        include: "regex.txt",
      });

      assert(result.result.includes("Found"));
      assert(result.result.includes('const foo = "bar";'));
    });

    it("should handle word boundaries", async () => {
      await fs.writeFile("boundary.txt", "hello\nhelloing\nworld hello test");

      const result = await grep({
        pattern: "\\bhello\\b",

        include: "boundary.txt",
      });

      // Should match 'hello' but not 'helloing'
      assert(result.result.includes("L1: hello"));
      assert(result.result.includes("L3: world hello test"));
      assert(!result.result.includes("helloing"));
    });
  });

  describe("input validation", () => {
    it("should require pattern parameter", async () => {
      const result = await grep({});

      assert.notStrictEqual(result.error, null);
      assert(result.result.includes("Error"));
    });

    it("should handle empty pattern", async () => {
      const result = await grep({
        pattern: "",
      });

      // Empty pattern should match all lines
      assert(result.result.includes("Found"));
    });
  });
});

describe("schema validation", () => {
  it("should have correct input schema", () => {
    assert.strictEqual(typeof grep.input_schema, "object");
    assert.strictEqual(grep.input_schema.type, "object");
    assert(Array.isArray(grep.input_schema.required));
    assert(grep.input_schema.required.includes("pattern"));
    assert.strictEqual(typeof grep.input_schema.properties, "object");
    assert.strictEqual(typeof grep.input_schema.properties.pattern, "object");
    assert.strictEqual(grep.input_schema.properties.pattern.type, "string");
  });
});
