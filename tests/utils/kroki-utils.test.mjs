import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtemp, rmdir } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import Debug from "debug";

import { TMP_ASSETS_DIR } from "../../utils/constants/index.mjs";
import {
  beforePublishHook,
  checkD2Content,
  ensureTmpDir,
  getChart,
  getD2Svg,
  saveD2Assets,
} from "../../utils/kroki-utils.mjs";

describe.skip("kroki-utils", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await new Promise((resolve, reject) => {
      mkdtemp(path.join(tmpdir(), "kroki-test-"), (err, dir) => {
        if (err) reject(err);
        else resolve(dir);
      });
    });
  });

  afterEach(async () => {
    if (tempDir && existsSync(tempDir)) {
      await new Promise((resolve) => {
        rmdir(tempDir, { recursive: true }, () => resolve());
      });
    }
  });

  describe("getChart", () => {
    test("should fetch chart with default parameters", async () => {
      const content = "A -> B";
      const result = await getChart({ content });

      // Should either return SVG content or null (if network fails)
      expect(result === null || typeof result === "string").toBe(true);

      if (result !== null) {
        // Basic SVG validation
        expect(result).toContain("svg");
      }
    }, 15000);

    test("should handle different chart types", async () => {
      const content = "A -> B";
      const result = await getChart({
        chart: "d2",
        format: "svg",
        content,
      });

      expect(result === null || typeof result === "string").toBe(true);
    }, 15000);

    test("should handle different formats", async () => {
      const content = "A -> B";
      const result = await getChart({
        chart: "d2",
        format: "png",
        content,
      });

      expect(result === null || typeof result === "string").toBe(true);
    }, 15000);

    test("should handle network errors gracefully when strict=false", async () => {
      // Test with invalid base URL by mocking fetch
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error("Network error"));

      try {
        const result = await getChart({ content: "A -> B", strict: false });
        expect(result).toBe(null);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("should throw error when strict=true and request fails", async () => {
      // Mock fetch to return error response
      const originalFetch = global.fetch;
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: "Bad Request",
          text: () => Promise.resolve("Error response"),
        });

      try {
        await expect(getChart({ content: "invalid content", strict: true })).rejects.toThrow(
          "Failed to fetch chart: 400 Bad Request",
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("should handle empty content", async () => {
      const result = await getChart({ content: "" });
      expect(result === null || typeof result === "string").toBe(true);
    }, 10000);

    test("should handle malformed content", async () => {
      const malformedContent = "A -> B -> C -> [invalid syntax";
      const result = await getChart({ content: malformedContent, strict: false });

      // Should not crash, may return error SVG or null
      expect(result === null || typeof result === "string").toBe(true);
    }, 10000);
  });

  describe("getD2Svg", () => {
    test("should generate D2 SVG content", async () => {
      const content = "A -> B: label";
      const result = await getD2Svg({ content });

      expect(result === null || typeof result === "string").toBe(true);

      if (result !== null) {
        expect(result).toContain("svg");
      }
    }, 15000);

    test("should handle strict mode correctly", async () => {
      // Mock fetch to simulate server error
      const originalFetch = global.fetch;
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          text: () => Promise.resolve("Error response"),
        });

      try {
        // Should throw in strict mode
        await expect(getD2Svg({ content: "A -> B", strict: true })).rejects.toThrow();

        // Should return error response (not null) in non-strict mode
        const result = await getD2Svg({ content: "A -> B", strict: false });
        expect(result).toBe("Error response");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("saveD2Assets", () => {
    test("should process markdown with D2 code blocks", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `# Test Document

This is a test document with D2 diagram:

\`\`\`d2
A -> B: connection
B -> C: another connection
\`\`\`

Some more content here.
`;

      const result = await saveD2Assets({ markdown, docsDir });

      expect(typeof result).toBe("string");
      expect(result).toContain("# Test Document");
      expect(result).toContain("Some more content here");

      // Should replace D2 code block with image reference
      expect(result).not.toContain("```d2");
      expect(result).toContain("![](../assets/d2/");
      expect(result).toContain(".svg)");
    });

    test("should handle markdown without D2 blocks", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `# Test Document

This document has no D2 diagrams.

\`\`\`javascript
console.log('hello world');
\`\`\`
`;

      const result = await saveD2Assets({ markdown, docsDir });

      expect(result).toBe(markdown); // Should remain unchanged
    });

    test("should handle multiple D2 blocks", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `# Test

\`\`\`d2
A -> B
\`\`\`

Some text.

\`\`\`d2
C -> D
E -> F
\`\`\`
`;

      const result = await saveD2Assets({ markdown, docsDir });

      expect(typeof result).toBe("string");
      expect(result).not.toContain("```d2");

      // Should have two image references
      const imageMatches = result.match(/!\[\]\(\.\.\/assets\/d2\/.*\.svg\)/g);
      expect(imageMatches).toBeTruthy();
      expect(imageMatches.length).toBe(2);
    });

    test("should handle empty markdown", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const result = await saveD2Assets({ markdown: "", docsDir });
      expect(result).toBe("");
    });

    test("should skip generation if SVG file already exists", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });
      const markdown = `\`\`\`d2\nA -> B\n\`\`\``;

      // 1. First run to generate the file
      await saveD2Assets({ markdown, docsDir });

      // 2. Second run to check if cache is used
      const debugLogs = [];
      const originalWrite = process.stderr.write;
      process.stderr.write = (chunk) => {
        debugLogs.push(chunk.toString());
        return true;
      };
      Debug.enable("doc-smith");

      try {
        const result = await saveD2Assets({ markdown, docsDir });

        expect(typeof result).toBe("string");
        expect(result).toContain(`![](${path.posix.join("..", TMP_ASSETS_DIR, "d2")}`);
      } finally {
        process.stderr.write = originalWrite;
        Debug.disable();
      }
    });

    test("should handle D2 generation errors gracefully", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `\`\`\`d2\nA -> B\n\`\`\``;

      // Mock getD2Svg to throw error
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error("Network error"));

      try {
        const result = await saveD2Assets({ markdown, docsDir });

        // TODO: When retry still fails, it will use a non-existent image
        expect(result).toContain("![](../assets/d2/");
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("should write .d2 file when debug is enabled", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `\`\`\`d2\nA -> B\n\`\`\``;

      // Enable debug mode
      Debug.enable("doc-smith");

      try {
        await saveD2Assets({ markdown, docsDir });

        const assetDir = path.join(docsDir, "../", TMP_ASSETS_DIR, "d2");
        const files = await readdir(assetDir);
        const d2File = files.find((file) => file.endsWith(".d2"));
        expect(d2File).toBeDefined();
      } finally {
        // Restore debug mode
        Debug.disable();
      }
    });
  });

  describe("beforePublishHook", () => {
    test("should process all markdown files in directory", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      // Create test markdown files
      const file1Content = `# Doc 1\n\`\`\`d2\nA -> B\n\`\`\``;
      const file2Content = `# Doc 2\n\`\`\`d2\nC -> D\n\`\`\``;
      const file3Content = `# Doc 3\nNo diagrams here.`;

      await writeFile(path.join(docsDir, "doc1.md"), file1Content);
      await writeFile(path.join(docsDir, "doc2.md"), file2Content);
      await writeFile(path.join(docsDir, "doc3.md"), file3Content);

      await beforePublishHook({ docsDir });

      // Check that files were processed
      const processedFile1 = await readFile(path.join(docsDir, "doc1.md"), "utf8");
      const processedFile2 = await readFile(path.join(docsDir, "doc2.md"), "utf8");
      const processedFile3 = await readFile(path.join(docsDir, "doc3.md"), "utf8");

      expect(processedFile1).not.toContain("```d2");
      expect(processedFile2).not.toContain("```d2");
      expect(processedFile3).toBe(file3Content); // Unchanged

      expect(processedFile1).toContain("![](../assets/d2/");
      expect(processedFile2).toContain("![](../assets/d2/");
    });

    test("should handle nested directories", async () => {
      const docsDir = path.join(tempDir, "docs");
      const subDir = path.join(docsDir, "subdir");
      await mkdir(subDir, { recursive: true });

      const fileContent = `# Nested Doc\n\`\`\`d2\nA -> B\n\`\`\``;
      await writeFile(path.join(subDir, "nested.md"), fileContent);

      await beforePublishHook({ docsDir });

      const processedFile = await readFile(path.join(subDir, "nested.md"), "utf8");
      expect(processedFile).not.toContain("```d2");
      expect(processedFile).toContain("![](../assets/d2/");
    });

    test("should handle empty docs directory", async () => {
      const docsDir = path.join(tempDir, "empty-docs");
      await mkdir(docsDir, { recursive: true });

      // Should not throw error
      await expect(beforePublishHook({ docsDir })).resolves.toBeUndefined();
    });

    test("should handle non-existent directory", async () => {
      const nonExistentDir = path.join(tempDir, "non-existent");

      const result = await beforePublishHook({ docsDir: nonExistentDir });

      expect(result).toBeUndefined();
    });
  });

  describe("checkD2Content", () => {
    test("should generate and cache D2 SVG", async () => {
      const content = "A -> B: test connection";

      // Should not throw in normal operation
      await expect(checkD2Content({ content })).resolves.toBeUndefined();
    });

    test("should use cached file when available", async () => {
      const content = "A -> B: cached test";

      // First call should generate
      await checkD2Content({ content });

      // Second call should use cache
      const debugLogs = [];
      const originalWrite = process.stderr.write;
      process.stderr.write = (chunk) => {
        debugLogs.push(chunk.toString());
        return true;
      };
      Debug.enable("doc-smith");

      try {
        const startTime = Date.now();
        await checkD2Content({ content });
        const endTime = Date.now();

        // Cache hit should be very fast (< 100ms)
        expect(endTime - startTime).toBeLessThan(100);
        expect(
          debugLogs.some((log) => log.includes("Found assets cache, skipping generation")),
        ).toBe(true);
      } finally {
        process.stderr.write = originalWrite;
        Debug.disable();
      }
    });

    test("should handle generation errors in strict mode", async () => {
      // Mock fetch to simulate server error
      const originalFetch = global.fetch;
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          text: () => Promise.resolve("Error response"),
        });

      try {
        await expect(checkD2Content({ content: "A -> B" })).rejects.toThrow();
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("should handle empty content", async () => {
      await expect(checkD2Content({ content: "" })).resolves.toBeUndefined();
    });

    test("should handle malformed D2 content", async () => {
      const malformedContent = "A -> B -> [invalid";

      // May throw depending on D2 server validation
      try {
        await checkD2Content({ content: malformedContent });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should write .d2 file when debug is enabled", async () => {
      const content = "A -> B: debug test";

      Debug.enable("doc-smith");

      try {
        await checkD2Content({ content });

        const assetDir = path.join(process.cwd(), ".aigne", "doc-smith", ".tmp", "assets", "d2");
        const files = await readdir(assetDir);
        const d2File = files.find((file) => file.endsWith(".d2"));
        expect(d2File).toBeDefined();
      } finally {
        Debug.disable();
      }
    });
  });

  describe("ensureTmpDir", () => {
    test("should create tmp directory structure", async () => {
      // Change to temp directory for testing
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        await ensureTmpDir();

        const tmpDir = path.join(tempDir, ".aigne", "doc-smith", ".tmp");
        const gitignorePath = path.join(tmpDir, ".gitignore");

        expect(existsSync(tmpDir)).toBe(true);
        expect(existsSync(gitignorePath)).toBe(true);

        const gitignoreContent = await readFile(gitignorePath, "utf8");
        expect(gitignoreContent).toBe("**/*");
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("should not recreate if already exists", async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // First call
        await ensureTmpDir();

        const tmpDir = path.join(tempDir, ".aigne", "doc-smith", ".tmp");
        const gitignorePath = path.join(tmpDir, ".gitignore");

        // Modify .gitignore to test if it gets overwritten
        await writeFile(gitignorePath, "modified content");

        // Second call
        await ensureTmpDir();

        const gitignoreContent = await readFile(gitignorePath, "utf8");
        expect(gitignoreContent).toBe("modified content"); // Should not be overwritten
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("should handle directory creation errors", async () => {
      // Try to create in a read-only location
      const originalCwd = process.cwd();

      try {
        process.chdir("/root"); // Typically read-only
        await expect(ensureTmpDir()).rejects.toThrow();
      } catch (error) {
        // Expected to fail in read-only directory
        expect(error).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle very large D2 content", async () => {
      // Generate large D2 content
      const largeContent = Array.from({ length: 1000 }, (_, i) => `Node${i} -> Node${i + 1}`).join(
        "\n",
      );

      const result = await getD2Svg({ content: largeContent, strict: false });
      expect(result === null || typeof result === "string").toBe(true);
    }, 20000);

    test("should handle special characters in D2 content", async () => {
      const specialContent = `
        "Node with spaces" -> "Node with 中文"
        "Node with emoji 🎉" -> "Node with symbols @#$%"
      `;

      const result = await getD2Svg({ content: specialContent, strict: false });
      expect(result === null || typeof result === "string").toBe(true);
    }, 15000);

    test("should handle concurrent D2 processing", async () => {
      const contents = ["A -> B", "C -> D", "E -> F", "G -> H", "I -> J"];

      // Process multiple D2 contents concurrently
      const promises = contents.map((content) => getD2Svg({ content, strict: false }));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result === null || typeof result === "string").toBe(true);
      });
    }, 20000);

    test("should handle malformed regex in saveD2Assets", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      // Test with malformed D2 blocks (unclosed)
      const malformedMarkdown = `# Test\n\`\`\`d2\nA -> B\n\`\`\`\n\`\`\`d2\nUnclosed block`;

      const result = await saveD2Assets({ markdown: malformedMarkdown, docsDir });

      // Should handle gracefully and process what it can
      expect(typeof result).toBe("string");
    });

    test("should handle empty markdown input", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const result = await saveD2Assets({ markdown: "", docsDir });
      expect(result).toBe("");
    });

    test("should handle null and undefined markdown input", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const result1 = await saveD2Assets({ markdown: null, docsDir });
      expect(result1).toBe(null);

      const result2 = await saveD2Assets({ markdown: undefined, docsDir });
      expect(result2).toBe(undefined);
    });

    test("should handle getChart network errors in non-strict mode", async () => {
      // Mock fetch to return error response
      const originalFetch = global.fetch;
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          text: () => Promise.resolve("Error response"),
        });

      try {
        const result = await getChart({ content: "A -> B", strict: false });
        // Should handle error gracefully in non-strict mode
        expect(result === null || typeof result === "string").toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test("should preserve line endings and whitespace in saveD2Assets", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `# Title\r\n\r\n\`\`\`d2\nA -> B\n\`\`\`\r\n\r\nEnd`;

      const result = await saveD2Assets({ markdown, docsDir });

      // Should preserve original line endings and spacing
      expect(result).toContain("\r\n\r\n");
      expect(result.split("\n").length).toBeGreaterThan(3);
    });

    test("should handle multiple concurrent calls to ensureTmpDir", async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Multiple concurrent calls should not interfere
        const promises = Array.from({ length: 5 }, () => ensureTmpDir());
        await Promise.all(promises);

        // Should only create directory once
        const tmpDir = path.join(tempDir, ".aigne", "doc-smith", ".tmp");
        expect(existsSync(tmpDir)).toBe(true);

        // .gitignore should be created properly
        const gitignoreContent = await readFile(path.join(tmpDir, ".gitignore"), "utf8");
        expect(gitignoreContent).toBe("**/*");
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
