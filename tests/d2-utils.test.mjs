import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtemp, rmdir } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import Debug from "debug";

import { TMP_ASSETS_DIR } from "../utils/constants.mjs";
import {
  beforePublishHook,
  checkContent,
  ensureTmpDir,
  getChart,
  isValidCode,
  saveAssets,
} from "../utils/d2-utils.mjs";

describe("d2-utils", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await new Promise((resolve, reject) => {
      mkdtemp(path.join(tmpdir(), "d2-test-"), (err, dir) => {
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
    test("should generate chart for valid d2 content", async () => {
      const content = "A -> B";
      const result = await getChart({ content });
      expect(typeof result).toBe("string");
      expect(result).toContain("<svg");
    }, 15000);

    test("should return null for invalid d2 content with strict=false", async () => {
      const content = "A -> B -> C -> [invalid syntax";
      const result = await getChart({ content, strict: false });
      expect(result).toBe(null);
    }, 15000);

    test("should throw for invalid d2 content with strict=true", async () => {
      const content = "A -> B -> C -> [invalid syntax";
      await expect(getChart({ content, strict: true })).rejects.toThrow();
    }, 15000);

    test("should handle empty content", async () => {
      const result = await getChart({ content: "" });
      expect(typeof result).toBe("string");
      expect(result).toContain("<svg");
    }, 10000);

    test("should add stroke-dash to container shapes", async () => {
      const content = `
        container {
          A -> B
        }
      `;
      const result = await getChart({ content });
      expect(typeof result).toBe("string");
      expect(result).toContain('stroke-dasharray="3"');
    }, 15000);

    test("should not add stroke-dash to sequence diagrams", async () => {
      const content = `
        shape: sequence_diagram
        A -> B: Hello
      `;
      const result = await getChart({ content });
      expect(typeof result).toBe("string");
      expect(result).not.toContain('stroke-dasharray="3"');
    }, 15000);
  });

  describe("saveAssets", () => {
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

      const result = await saveAssets({ markdown, docsDir });

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

      const result = await saveAssets({ markdown, docsDir });

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

      const result = await saveAssets({ markdown, docsDir });

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

      const result = await saveAssets({ markdown: "", docsDir });
      expect(result).toBe("");
    });

    test("should skip generation if SVG file already exists", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });
      const markdown = `\`\`\`d2\nA -> B\n\`\`\``;

      // 1. First run to generate the file
      await saveAssets({ markdown, docsDir });

      // 2. Second run to check if cache is used
      const debugLogs = [];
      const originalWrite = process.stderr.write;
      process.stderr.write = (chunk) => {
        debugLogs.push(chunk.toString());
        return true;
      };
      Debug.enable("doc-smith");

      try {
        const result = await saveAssets({ markdown, docsDir });

        expect(typeof result).toBe("string");
        expect(result).toContain(`![](${path.posix.join("..", TMP_ASSETS_DIR, "d2")}`);
        expect(
          debugLogs.some((log) => log.includes("Found assets cache, skipping generation")),
        ).toBe(true);
      } finally {
        process.stderr.write = originalWrite;
        Debug.disable();
      }
    });

    test("should handle D2 generation errors gracefully", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `\`\`\`d2\nA -> B -> [invalid\n\`\`\``;

      const result = await saveAssets({ markdown, docsDir });
      expect(result).toContain("![](../assets/d2/");
    });

    test("should write .d2 file when debug is enabled", async () => {
      const docsDir = path.join(tempDir, "docs");
      await mkdir(docsDir, { recursive: true });

      const markdown = `\`\`\`d2\nA -> B\n\`\`\``;

      // Enable debug mode
      Debug.enable("doc-smith");

      try {
        await saveAssets({ markdown, docsDir });

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
      // glob will just return an empty array, so no error should be thrown.
      await expect(beforePublishHook({ docsDir: nonExistentDir })).resolves.toBeUndefined();
    });
  });

  describe("checkContent", () => {
    test("should generate and cache D2 SVG", async () => {
      const content = "A -> B: test connection";
      await expect(checkContent({ content })).resolves.toBeUndefined();
    });

    test("should use cached file when available", async () => {
      const content = "A -> B: cached test";

      // First call should generate
      await checkContent({ content });

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
        await checkContent({ content });
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
      const malformedContent = "A -> B -> [invalid";
      await expect(checkContent({ content: malformedContent })).rejects.toThrow();
    });

    test("should handle empty content", async () => {
      await expect(checkContent({ content: "" })).resolves.toBeUndefined();
    });

    test("should write .d2 file when debug is enabled", async () => {
      const content = "A -> B: debug test";

      Debug.enable("doc-smith");

      try {
        await checkContent({ content });

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
  });

  describe("isValidCode", () => {
    test("should return true for 'd2'", () => {
      expect(isValidCode("d2")).toBe(true);
    });

    test("should return true for 'D2'", () => {
      expect(isValidCode("D2")).toBe(true);
    });

    test("should return false for other languages", () => {
      expect(isValidCode("javascript")).toBe(false);
      expect(isValidCode("python")).toBe(false);
      expect(isValidCode("")).toBe(false);
      expect(isValidCode(null)).toBe(false);
      expect(isValidCode(undefined)).toBe(false);
    });
  });
});
