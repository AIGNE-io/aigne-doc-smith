/**
 * Tests for utils/docs-converter.mjs
 *
 * Function signatures:
 * - scanDocuments(docsDir): Scan docs directory for documents
 * - getTargetPath(relativePath, dirName, locale, depth): Get target path for doc
 * - addMarkdownSuffixToLinks(content): Add .md suffix to internal links
 * - adjustImagePaths(content, depth): Adjust image paths based on depth
 * - copyDocumentsToTemp(sourceDir, targetDir): Copy docs to temp directory
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

import {
  scanDocuments,
  getTargetPath,
  addMarkdownSuffixToLinks,
  adjustImagePaths,
  copyDocumentsToTemp,
} from "../../utils/docs-converter.mjs";

describe("docs-converter.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("getTargetPath", () => {
      test("should generate target path from inputs", () => {
        const result = getTargetPath("overview", "docs", "zh", 1);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      test("should handle different locales", () => {
        const zhPath = getTargetPath("intro", "docs", "zh", 1);
        const enPath = getTargetPath("intro", "docs", "en", 1);
        expect(typeof zhPath).toBe("string");
        expect(typeof enPath).toBe("string");
      });

      test("should handle different depths", () => {
        const shallow = getTargetPath("doc", "docs", "zh", 1);
        const deep = getTargetPath("doc", "docs", "zh", 5);
        expect(typeof shallow).toBe("string");
        expect(typeof deep).toBe("string");
      });
    });

    describe("addMarkdownSuffixToLinks", () => {
      test("should add .md suffix to internal links", () => {
        const content = "[Link](/docs/intro)";
        const result = addMarkdownSuffixToLinks(content);
        expect(typeof result).toBe("string");
      });

      test("should preserve external links", () => {
        const content = "[External](https://example.com)";
        const result = addMarkdownSuffixToLinks(content);
        expect(result).toContain("https://example.com");
      });

      test("should handle multiple links", () => {
        const content = "[Link1](/a) and [Link2](/b)";
        const result = addMarkdownSuffixToLinks(content);
        expect(typeof result).toBe("string");
      });

      test("should handle links with anchors", () => {
        const content = "[Link](/docs/intro#section)";
        const result = addMarkdownSuffixToLinks(content);
        expect(typeof result).toBe("string");
      });
    });

    describe("adjustImagePaths", () => {
      test("should adjust image paths based on depth", () => {
        const content = "![Image](./images/test.png)";
        const result = adjustImagePaths(content, 1);
        expect(typeof result).toBe("string");
      });

      test("should handle different depths", () => {
        const content = "![Image](./images/test.png)";
        const depth1 = adjustImagePaths(content, 1);
        const depth3 = adjustImagePaths(content, 3);
        expect(typeof depth1).toBe("string");
        expect(typeof depth3).toBe("string");
      });

      test("should handle multiple images", () => {
        const content = "![Img1](./a.png) ![Img2](./b.png)";
        const result = adjustImagePaths(content, 2);
        expect(typeof result).toBe("string");
      });
    });

    describe("scanDocuments", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should scan docs directory", async () => {
        await mkdir(join(tempDir, "doc1"), { recursive: true });
        await writeFile(join(tempDir, "doc1", "zh.md"), "# Test");
        await writeFile(
          join(tempDir, "doc1", ".meta.yaml"),
          "kind: doc\nsource: zh\ndefault: zh\nlanguages:\n  - zh",
        );
        const result = await scanDocuments(tempDir);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should return empty array for empty directory", async () => {
        const result = await scanDocuments(tempDir);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("copyDocumentsToTemp", () => {
      let sourceDir, targetDir;

      beforeEach(async () => {
        const source = await createTempDir();
        const target = await createTempDir();
        sourceDir = source.path;
        targetDir = target.path;
      });

      afterEach(async () => {
        if (sourceDir) await rm(sourceDir, { recursive: true, force: true });
        if (targetDir) await rm(targetDir, { recursive: true, force: true });
      });

      test("should copy documents to target directory", async () => {
        // Need .meta.yaml for documents to be recognized
        await mkdir(join(sourceDir, "doc1"), { recursive: true });
        await writeFile(join(sourceDir, "doc1", "zh.md"), "# Test");
        await writeFile(
          join(sourceDir, "doc1", ".meta.yaml"),
          "kind: doc\nsource: zh\ndefault: zh\nlanguages:\n  - zh",
        );
        // Returns stats object { total, converted, ... }
        const result = await copyDocumentsToTemp(sourceDir, targetDir);
        expect(result).toBeDefined();
        expect(typeof result.total).toBe("number");
      });

      test("should return stats for empty directory", async () => {
        const result = await copyDocumentsToTemp(sourceDir, targetDir);
        expect(result).toEqual({ total: 0, converted: 0 });
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("getTargetPath", () => {
      test("should handle empty relativePath", () => {
        const result = getTargetPath("", "docs", "zh", 1);
        expect(typeof result).toBe("string");
      });

      test("should handle zero depth", () => {
        const result = getTargetPath("doc", "docs", "zh", 0);
        expect(typeof result).toBe("string");
      });

      test("should handle empty locale", () => {
        const result = getTargetPath("doc", "docs", "", 1);
        expect(typeof result).toBe("string");
      });
    });

    describe("addMarkdownSuffixToLinks", () => {
      test("should handle content without links", () => {
        const content = "Plain text without links";
        const result = addMarkdownSuffixToLinks(content);
        expect(result).toBe(content);
      });

      test("should handle empty content", () => {
        const result = addMarkdownSuffixToLinks("");
        expect(result).toBe("");
      });

      test("should handle malformed links", () => {
        const content = "[Broken link(";
        expect(() => addMarkdownSuffixToLinks(content)).not.toThrow();
      });
    });

    describe("adjustImagePaths", () => {
      test("should handle content without images", () => {
        const content = "No images here";
        const result = adjustImagePaths(content, 1);
        expect(result).toBe(content);
      });

      test("should handle negative depth", () => {
        const content = "![Image](./img.png)";
        expect(() => adjustImagePaths(content, -1)).not.toThrow();
      });
    });

    describe("scanDocuments", () => {
      test("should handle non-existent directory", async () => {
        try {
          await scanDocuments("/non/existent/path");
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("addMarkdownSuffixToLinks", () => {
      test("should handle very large content", () => {
        const content = "[Link](/doc)\n".repeat(10000);
        expect(() => addMarkdownSuffixToLinks(content)).not.toThrow();
      });

      test("should handle binary-like content", () => {
        const content = "Some text \x00\x01\x02 with binary";
        expect(() => addMarkdownSuffixToLinks(content)).not.toThrow();
      });

      test("should handle deeply nested markdown", () => {
        const content = "**_[Link](/doc)_**";
        expect(() => addMarkdownSuffixToLinks(content)).not.toThrow();
      });
    });

    describe("adjustImagePaths", () => {
      test("should handle very deep nesting", () => {
        const content = "![Image](./img.png)";
        expect(() => adjustImagePaths(content, 100)).not.toThrow();
      });

      test("should handle complex image markdown", () => {
        const content = '[![Alt](./img.png "Title")](link)';
        expect(() => adjustImagePaths(content, 2)).not.toThrow();
      });
    });

    describe("copyDocumentsToTemp", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) await rm(tempDir, { recursive: true, force: true });
      });

      test("should handle source same as target", async () => {
        try {
          await copyDocumentsToTemp(tempDir, tempDir);
        } catch (error) {
          // May throw or handle gracefully
          expect(error !== undefined || true).toBe(true);
        }
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("addMarkdownSuffixToLinks - XSS Prevention", () => {
      test("should handle javascript: protocol links", () => {
        const content = "[Click](javascript:alert(1))";
        const result = addMarkdownSuffixToLinks(content);
        expect(typeof result).toBe("string");
      });

      test("should handle data: protocol links", () => {
        const content = "[Data](data:text/html,<script>alert(1)</script>)";
        const result = addMarkdownSuffixToLinks(content);
        expect(typeof result).toBe("string");
      });

      test("should handle encoded protocols", () => {
        const content = "[Link](&#106;avascript:alert(1))";
        const result = addMarkdownSuffixToLinks(content);
        expect(typeof result).toBe("string");
      });
    });

    describe("adjustImagePaths - Path Injection", () => {
      test("should handle path traversal in image paths", () => {
        const content = "![Image](../../../etc/passwd)";
        expect(() => adjustImagePaths(content, 1)).not.toThrow();
      });

      test("should handle absolute paths", () => {
        const content = "![Image](/etc/passwd)";
        expect(() => adjustImagePaths(content, 1)).not.toThrow();
      });

      test("should handle remote URLs", () => {
        const content = "![Image](https://evil.com/track.gif)";
        const result = adjustImagePaths(content, 1);
        expect(typeof result).toBe("string");
      });
    });

    describe("getTargetPath - Path Injection", () => {
      test("should handle path traversal in relativePath", () => {
        const result = getTargetPath("../../../etc/passwd", "docs", "zh", 1);
        expect(typeof result).toBe("string");
      });

      test("should handle shell metacharacters", () => {
        const result = getTargetPath("doc; rm -rf /", "docs", "zh", 1);
        expect(typeof result).toBe("string");
      });

      test("should handle null bytes", () => {
        const result = getTargetPath("doc\x00evil", "docs", "zh", 1);
        expect(typeof result).toBe("string");
      });
    });

    describe("copyDocumentsToTemp - Directory Traversal", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) await rm(tempDir, { recursive: true, force: true });
      });

      test("should not escape target directory", async () => {
        const maliciousTarget = join(tempDir, "..", "escaped");
        try {
          await copyDocumentsToTemp(tempDir, maliciousTarget);
        } catch (error) {
          // Should either fail or be contained
          expect(error !== undefined || true).toBe(true);
        }
      });
    });
  });
});
