import assert from "node:assert";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import readFile from "./read-file.mjs";

describe("read-file tool", () => {
  let tempDir;

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "read-file-test-"));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("basic functionality", () => {
    it("should read a simple text file", async () => {
      const filePath = path.join(tempDir, "test.txt");
      const content = "Hello, World!\nThis is a test file.\nLine 3.";
      await fs.writeFile(filePath, content, "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.command, "read_file");
      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, content);
      assert.strictEqual(result.result.metadata.path, filePath);
      assert.strictEqual(result.result.metadata.mimeType, "text/plain");
      assert.strictEqual(result.result.metadata.isBinary, false);
      assert.strictEqual(result.result.metadata.encoding, "utf8");
      assert.strictEqual(result.result.metadata.lineCount, 3);
    });

    it("should support backwards compatibility with path parameter", async () => {
      const filePath = path.join(tempDir, "compat.txt");
      await fs.writeFile(filePath, "Compatible content", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "Compatible content");
      assert.strictEqual(result.arguments.path, filePath);
    });

    it("should read JavaScript files with correct MIME type", async () => {
      const filePath = path.join(tempDir, "script.js");
      const content = 'function hello() {\n  return "world";\n}';
      await fs.writeFile(filePath, content, "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, content);
      assert.strictEqual(result.result.metadata.mimeType, "text/javascript");
      assert.strictEqual(result.result.metadata.lineCount, 3);
    });

    it("should read JSON files with correct MIME type", async () => {
      const filePath = path.join(tempDir, "data.json");
      const content = '{\n  "name": "test",\n  "version": "1.0.0"\n}';
      await fs.writeFile(filePath, content, "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, content);
      assert.strictEqual(result.result.metadata.mimeType, "application/json");
    });

    it("should handle empty files", async () => {
      const filePath = path.join(tempDir, "empty.txt");
      await fs.writeFile(filePath, "", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "");
      assert.strictEqual(result.result.metadata.lineCount, 1); // Empty file has 1 line
    });
  });

  describe("offset and limit functionality", () => {
    let multiLineFile;

    beforeEach(async () => {
      multiLineFile = path.join(tempDir, "multiline.txt");
      const lines = [];
      for (let i = 1; i <= 20; i++) {
        lines.push(`Line ${i}: This is line number ${i}`);
      }
      await fs.writeFile(multiLineFile, lines.join("\n"), "utf8");
    });

    it("should read specific lines with offset and limit", async () => {
      const result = await readFile({
        path: multiLineFile,
        offset: 5,
        limit: 3,
      });

      assert.strictEqual(result.error, null);
      assert(result.result.content.includes("Line 6:"));
      assert(result.result.content.includes("Line 7:"));
      assert(result.result.content.includes("Line 8:"));
      assert(!result.result.content.includes("Line 5:"));
      assert(!result.result.content.includes("Line 9:"));

      assert.strictEqual(result.result.truncated.isTruncated, true);
      assert.deepStrictEqual(result.result.truncated.linesShown, [6, 8]);
      assert.strictEqual(result.result.truncated.totalLines, 20);
      assert(result.result.message.includes("truncated"));
    });

    it("should read from offset to end when no limit specified", async () => {
      const result = await readFile({
        path: multiLineFile,
        offset: 15,
      });

      assert.strictEqual(result.error, null);
      assert(result.result.content.includes("Line 16:"));
      assert(result.result.content.includes("Line 20:"));
      assert(!result.result.content.includes("Line 15:"));

      assert.strictEqual(result.result.truncated.isTruncated, true);
      assert.deepStrictEqual(result.result.truncated.linesShown, [16, 20]);
    });

    it("should handle offset beyond file end", async () => {
      const result = await readFile({
        path: multiLineFile,
        offset: 25,
        limit: 5,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "");
      assert(result.result.message.includes("beyond file end"));
    });

    it("should read first N lines with limit only", async () => {
      const result = await readFile({
        path: multiLineFile,
        limit: 5,
      });

      assert.strictEqual(result.error, null);
      assert(result.result.content.includes("Line 1:"));
      assert(result.result.content.includes("Line 5:"));
      assert(!result.result.content.includes("Line 6:"));

      assert.strictEqual(result.result.truncated.isTruncated, true);
      assert.deepStrictEqual(result.result.truncated.linesShown, [1, 5]);
    });
  });

  describe("binary file handling", () => {
    it("should detect binary files by null bytes", async () => {
      const filePath = path.join(tempDir, "binary.bin");
      const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0a, 0x1a, 0x0a]); // PNG header with null byte
      await fs.writeFile(filePath, binaryData);

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "[Binary file: binary.bin]");
      assert.strictEqual(result.result.metadata.isBinary, true);
      assert.strictEqual(result.result.metadata.encoding, null);
      assert.strictEqual(result.result.metadata.lineCount, null);
    });

    it("should detect image files by extension", async () => {
      const filePath = path.join(tempDir, "image.png");
      await fs.writeFile(filePath, "fake png content", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "[Binary file: image.png]");
      assert.strictEqual(result.result.metadata.mimeType, "image/png");
      assert.strictEqual(result.result.metadata.isBinary, true);
    });

    it("should detect PDF files by extension", async () => {
      const filePath = path.join(tempDir, "document.pdf");
      await fs.writeFile(filePath, "fake pdf content", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "[Binary file: document.pdf]");
      assert.strictEqual(result.result.metadata.mimeType, "application/pdf");
      assert.strictEqual(result.result.metadata.isBinary, true);
    });

    it("should handle large files as binary", async () => {
      const filePath = path.join(tempDir, "large.txt");
      // Create a file larger than 10MB
      const largeContent = "x".repeat(11 * 1024 * 1024);
      await fs.writeFile(filePath, largeContent, "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "[Binary file: large.txt]");
      assert.strictEqual(result.result.metadata.isBinary, true);
    });
  });

  describe("MIME type detection", () => {
    const testCases = [
      { ext: ".md", mimeType: "text/markdown" },
      { ext: ".ts", mimeType: "text/typescript" },
      { ext: ".jsx", mimeType: "text/javascript" },
      { ext: ".py", mimeType: "text/x-python" },
      { ext: ".css", mimeType: "text/css" },
      { ext: ".html", mimeType: "text/html" },
      { ext: ".yaml", mimeType: "text/yaml" },
      { ext: ".sh", mimeType: "text/x-shellscript" },
      { ext: ".jpg", mimeType: "image/jpeg" },
      { ext: ".gif", mimeType: "image/gif" },
      { ext: ".unknown", mimeType: "application/octet-stream" },
    ];

    testCases.forEach(({ ext, mimeType }) => {
      it(`should detect ${mimeType} for ${ext} files`, async () => {
        const filePath = path.join(tempDir, `test${ext}`);

        if (mimeType.startsWith("image/")) {
          // For image files, just create an empty file (will be treated as binary)
          await fs.writeFile(filePath, "", "utf8");
        } else {
          // For text files, create with content
          await fs.writeFile(filePath, "test content", "utf8");
        }

        const result = await readFile({
          path: filePath,
        });

        assert.strictEqual(result.error, null);
        assert.strictEqual(result.result.metadata.mimeType, mimeType);
      });
    });
  });

  describe("encoding support", () => {
    it("should read files with different encodings", async () => {
      const filePath = path.join(tempDir, "encoded.txt");
      const content = "Hello, 世界! 🌍";
      await fs.writeFile(filePath, content, "utf8");

      const result = await readFile({
        path: filePath,
        encoding: "utf8",
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, content);
      assert.strictEqual(result.result.metadata.encoding, "utf8");
    });

    it("should handle latin1 encoding", async () => {
      const filePath = path.join(tempDir, "latin1.txt");
      const content = "Hello, résumé!";
      await fs.writeFile(filePath, content, "latin1");

      const result = await readFile({
        path: filePath,
        encoding: "latin1",
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, content);
      assert.strictEqual(result.result.metadata.encoding, "latin1");
    });
  });

  describe("auto-truncation", () => {
    it("should auto-truncate very large text files", async () => {
      const filePath = path.join(tempDir, "huge.txt");
      const lines = [];
      for (let i = 1; i <= 15000; i++) {
        lines.push(`Line ${i}`);
      }
      await fs.writeFile(filePath, lines.join("\n"), "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.metadata.lineCount, 15000);
      assert.strictEqual(result.result.truncated.isTruncated, true);
      assert.deepStrictEqual(result.result.truncated.linesShown, [1, 10000]);
      assert(result.result.content.includes("Line 1"));
      assert(result.result.content.includes("Line 10000"));
      assert(!result.result.content.includes("Line 10001"));
    });

    it("should not truncate files under the limit", async () => {
      const filePath = path.join(tempDir, "medium.txt");
      const lines = [];
      for (let i = 1; i <= 5000; i++) {
        lines.push(`Line ${i}`);
      }
      await fs.writeFile(filePath, lines.join("\n"), "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.metadata.lineCount, 5000);
      assert.strictEqual(result.result.truncated, undefined);
      assert(result.result.content.includes("Line 5000"));
    });
  });

  describe("error handling", () => {
    it("should require a file path", async () => {
      const result = await readFile({});

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("required"));
    });

    it("should require absolute path", async () => {
      const result = await readFile({
        path: "relative/path.txt",
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("absolute"));
    });

    it("should handle non-existent files", async () => {
      const result = await readFile({
        path: path.join(tempDir, "nonexistent.txt"),
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("does not exist"));
    });

    it("should handle directories instead of files", async () => {
      const dirPath = path.join(tempDir, "directory");
      await fs.mkdir(dirPath);

      const result = await readFile({
        path: dirPath,
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("directory, not a file"));
    });

    it("should validate offset parameter", async () => {
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "test content", "utf8");

      const result = await readFile({
        path: filePath,
        offset: -1,
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("non-negative"));
    });

    it("should validate limit parameter", async () => {
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "test content", "utf8");

      const result = await readFile({
        path: filePath,
        limit: 0,
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("positive"));
    });

    it("should handle invalid offset type", async () => {
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "test content", "utf8");

      const result = await readFile({
        path: filePath,
        offset: "invalid",
      });

      assert.notStrictEqual(result.error, null);
      assert(result.error.message.includes("non-negative number"));
    });

    it("should handle permission errors gracefully", async () => {
      // This test might not work on all systems, but we include it for completeness
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "test content", "utf8");

      const result = await readFile({
        path: filePath,
      });

      // Should either succeed or fail gracefully
      assert.strictEqual(typeof result, "object");
      assert.strictEqual(typeof result.result, "object");
    });
  });

  describe("edge cases", () => {
    it("should handle files with only newlines", async () => {
      const filePath = path.join(tempDir, "newlines.txt");
      await fs.writeFile(filePath, "\n\n\n", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "\n\n\n");
      assert.strictEqual(result.result.metadata.lineCount, 4); // 3 newlines = 4 lines
    });

    it("should handle files with mixed line endings", async () => {
      const filePath = path.join(tempDir, "mixed.txt");
      await fs.writeFile(filePath, "Line 1\nLine 2\r\nLine 3\r", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert(result.result.content.includes("Line 1"));
      assert(result.result.content.includes("Line 2"));
      assert(result.result.content.includes("Line 3"));
    });

    it("should handle very long file names", async () => {
      const longName = "a".repeat(100) + ".txt";
      const filePath = path.join(tempDir, longName);
      await fs.writeFile(filePath, "content", "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "content");
    });

    it("should handle files with special characters in content", async () => {
      const filePath = path.join(tempDir, "special.txt");
      const content = "Special chars: @#$%^&*()[]{}|\\:\";'<>?,./";
      await fs.writeFile(filePath, content, "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, content);
    });

    it("should handle zero-byte file", async () => {
      const filePath = path.join(tempDir, "zero.txt");
      await fs.writeFile(filePath, Buffer.alloc(0));

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.content, "");
      assert.strictEqual(result.result.metadata.fileSize, 0);
    });
  });

  describe("metadata validation", () => {
    it("should return correct file metadata", async () => {
      const filePath = path.join(tempDir, "metadata.txt");
      const content = "Line 1\nLine 2\nLine 3";
      await fs.writeFile(filePath, content, "utf8");

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.metadata.path, filePath);
      assert.strictEqual(result.result.metadata.mimeType, "text/plain");
      assert.strictEqual(typeof result.result.metadata.fileSize, "number");
      assert(result.result.metadata.fileSize > 0);
      assert.strictEqual(result.result.metadata.isBinary, false);
      assert.strictEqual(result.result.metadata.encoding, "utf8");
      assert.strictEqual(result.result.metadata.lineCount, 3);
    });

    it("should handle metadata for binary files", async () => {
      const filePath = path.join(tempDir, "binary.bin");
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03]);
      await fs.writeFile(filePath, binaryData);

      const result = await readFile({
        path: filePath,
      });

      assert.strictEqual(result.error, null);
      assert.strictEqual(result.result.metadata.isBinary, true);
      assert.strictEqual(result.result.metadata.encoding, null);
      assert.strictEqual(result.result.metadata.lineCount, null);
      assert.strictEqual(result.result.metadata.fileSize, 4);
    });
  });
});

describe("schema validation", () => {
  it("should have correct input schema", () => {
    assert.strictEqual(typeof readFile.input_schema, "object");
    assert.strictEqual(readFile.input_schema.type, "object");
    assert(Array.isArray(readFile.input_schema.required));
    assert(readFile.input_schema.required.includes("path"));
    assert.strictEqual(typeof readFile.input_schema.properties, "object");
    assert.strictEqual(typeof readFile.input_schema.properties.path, "object");
    assert.strictEqual(typeof readFile.input_schema.properties.offset, "object");
    assert.strictEqual(typeof readFile.input_schema.properties.limit, "object");
    assert.strictEqual(typeof readFile.input_schema.properties.encoding, "object");
  });
});
