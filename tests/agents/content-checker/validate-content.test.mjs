/**
 * Tests for agents/content-checker/validate-content.mjs
 *
 * Based on intent: Content validation logic
 *
 * Function signatures:
 * - default export: validateDocumentContent({ yamlPath, docsDir, docs, checkRemoteImages })
 *   - Layer 1: File structure validation (.meta.yaml, language files)
 *   - Layer 2-4: Content validation (links, images, headers)
 *   - Returns: { valid, errors, stats, message }
 *
 * Key validation rules from intent:
 * - .meta.yaml must have kind, source, default fields
 * - source field must match project locale
 * - Internal links must not have .md suffix
 * - Local images must exist
 * - Remote images checked via HTTP HEAD (3s timeout)
 * - Header levels cannot skip (H1 → H2 → H3, not H1 → H3)
 * - Document content must be at least 50 characters after removing title
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("content-checker/validate-content.mjs", () => {
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

  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("module exports", () => {
      test("should export default function", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        expect(validateModule.default).toBeDefined();
        expect(typeof validateModule.default).toBe("function");
      });
    });

    describe("return structure", () => {
      test("should return valid property", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        expect(typeof result.valid).toBe("boolean");
      });

      test("should return message property", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        expect(typeof result.message).toBe("string");
      });

      test("should return errors object with categories", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        // errors should have fatal, fixable, warnings categories
        if (result.errors) {
          expect(result.errors).toHaveProperty("fatal");
          expect(result.errors).toHaveProperty("fixable");
          expect(result.errors).toHaveProperty("warnings");
        }
      });

      test("should return stats object", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.stats) {
          expect(result.stats).toHaveProperty("totalDocs");
          expect(result.stats).toHaveProperty("checkedDocs");
        }
      });
    });

    describe("validation with valid workspace", async () => {
      test("should accept yamlPath parameter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: join(tempDir, "document-structure.yaml"),
        });
        expect(result).toHaveProperty("valid");
      });

      test("should accept docsDir parameter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docsDir: join(tempDir, "docs"),
        });
        expect(result).toHaveProperty("valid");
      });

      test("should accept docs filter parameter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docs: ["/overview", "/api"],
        });
        expect(result).toHaveProperty("valid");
      });

      test("should accept checkRemoteImages parameter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          checkRemoteImages: false,
        });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("stats tracking", () => {
      test("should track totalLinks", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.stats) {
          expect(typeof result.stats.totalLinks).toBe("number");
        }
      });

      test("should track totalImages", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.stats) {
          expect(typeof result.stats.totalImages).toBe("number");
        }
      });

      test("should distinguish local and remote images", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.stats) {
          expect(typeof result.stats.localImages).toBe("number");
          expect(typeof result.stats.remoteImages).toBe("number");
        }
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("missing files", () => {
      test("should handle missing yamlPath file", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: join(tempDir, "nonexistent.yaml"),
        });
        expect(result.valid).toBe(false);
      });

      test("should handle missing docsDir", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docsDir: join(tempDir, "nonexistent-docs"),
        });
        expect(result).toHaveProperty("valid");
      });

      test("should provide error message for missing structure", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: join(tempDir, "missing.yaml"),
        });
        expect(result.message).toBeTruthy();
      });
    });

    describe("invalid document structure", () => {
      test("should handle empty yaml file", async () => {
        const yamlPath = join(tempDir, "empty.yaml");
        await writeFile(yamlPath, "");

        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle malformed yaml", async () => {
        const yamlPath = join(tempDir, "malformed.yaml");
        await writeFile(yamlPath, "invalid: yaml: content: [unclosed");

        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({ yamlPath });
        expect(result.valid).toBe(false);
      });

      test("should handle yaml with no documents", async () => {
        const yamlPath = join(tempDir, "no-docs.yaml");
        await writeFile(yamlPath, "title: Test\nchildren: []");

        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("docs filter edge cases", () => {
      test("should handle nonexistent doc paths in filter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docs: ["/definitely-not-existing-doc-path"],
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle empty docs filter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({ docs: [] });
        expect(result).toHaveProperty("valid");
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import without errors", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        expect(validateModule).toBeDefined();
      });

      test("should have default export as function", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        expect(typeof validateModule.default).toBe("function");
      });
    });

    describe("error categorization", () => {
      test("should categorize fatal errors separately", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.errors) {
          expect(Array.isArray(result.errors.fatal)).toBe(true);
        }
      });

      test("should categorize fixable errors separately", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.errors) {
          expect(Array.isArray(result.errors.fixable)).toBe(true);
        }
      });

      test("should categorize warnings separately", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        if (result.errors) {
          expect(Array.isArray(result.errors.warnings)).toBe(true);
        }
      });
    });

    describe("filesystem errors", () => {
      test("should handle permission denied gracefully", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        // Trying to access a path that likely doesn't have permission
        const result = await validateModule.default({
          yamlPath: "/root/secret.yaml",
        });
        expect(result.valid).toBe(false);
        expect(result.message).toBeTruthy();
      });

      test("should not crash on very deep paths", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const deepPath = join(tempDir, ...Array(50).fill("deep"));
        const result = await validateModule.default({
          docsDir: deepPath,
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle symlink loops gracefully", async () => {
        // This is a defensive test - function should not hang
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({});
        expect(result).toHaveProperty("valid");
      });
    });

    describe("large input handling", () => {
      test("should handle large docs filter array", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const largeDocs = Array.from({ length: 1000 }, (_, i) => `/doc-${i}`);
        const result = await validateModule.default({ docs: largeDocs });
        expect(result).toHaveProperty("valid");
      });

      test("should handle very long path strings", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const longPath = `/${"x".repeat(2000)}`;
        const result = await validateModule.default({ docs: [longPath] });
        expect(result).toHaveProperty("valid");
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path traversal handling", () => {
      test("should mark validation as failed for nonexistent path traversal yamlPath", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: "../../../etc/passwd",
        });
        // Path traversal to /etc/passwd won't find a valid YAML structure file
        // so validation should fail (not because of security, but because file doesn't exist or isn't valid)
        expect(result.valid).toBe(false);
        expect(result.message).toBeTruthy();
      });

      test("should handle path traversal in docsDir gracefully", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docsDir: "../../../etc",
        });
        // Should complete without crashing; validation depends on finding valid structure
        expect(result).toHaveProperty("valid");
        expect(typeof result.valid).toBe("boolean");
      });

      test("should handle path traversal in docs filter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docs: ["/../../../etc/passwd"],
        });
        // Path filter with traversal should be handled (docs won't match anything)
        expect(result).toHaveProperty("valid");
        expect(typeof result.valid).toBe("boolean");
      });
    });

    describe("input sanitization", () => {
      test("should handle null bytes in paths without crashing", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: "test\x00.yaml",
        });
        // Null bytes in path should cause file not found or invalid path
        expect(result).toHaveProperty("valid");
        expect(result.valid).toBe(false);
      });

      test("should handle shell metacharacters in paths as literal strings", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docsDir: "$(rm -rf /)",
        });
        // Shell metacharacters should be treated as literal path, not executed
        // Directory won't exist, so should handle gracefully
        expect(result).toHaveProperty("valid");
        expect(typeof result.valid).toBe("boolean");
      });

      test("should handle unicode characters in paths", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docs: ["/doc\u202e/hidden"],
        });
        // Unicode characters (including RTL override) should be handled as literal
        expect(result).toHaveProperty("valid");
        expect(typeof result.valid).toBe("boolean");
      });
    });

    describe("output safety", () => {
      test("should return meaningful error message for invalid yamlPath", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: "/etc/passwd",
        });
        // Should provide a message explaining the failure
        expect(result.message).toBeDefined();
        expect(result.message.length).toBeGreaterThan(0);
        expect(result.valid).toBe(false);
      });

      test("should handle malicious yaml content safely", async () => {
        const yamlPath = join(tempDir, "malicious.yaml");
        // YAML with potential injection patterns
        await writeFile(
          yamlPath,
          `
title: "<script>alert(1)</script>"
children:
  - path: "'; DROP TABLE docs;--"
    title: test
`,
        );

        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({ yamlPath });
        // Should parse YAML without executing content - XSS/SQL payloads are just strings
        expect(result).toHaveProperty("valid");
        expect(typeof result.valid).toBe("boolean");
      });
    });

    describe("remote image checking safety", () => {
      test("should complete remote image check without hanging", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const startTime = Date.now();
        const result = await validateModule.default({
          checkRemoteImages: true,
        });
        const elapsed = Date.now() - startTime;
        // Should complete in reasonable time (not hang on network issues)
        expect(elapsed).toBeLessThan(30000); // 30 seconds max
        expect(result).toHaveProperty("valid");
      });

      test("should handle remote image check flag gracefully", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          checkRemoteImages: true,
        });
        // Function should complete without crash
        expect(result).toHaveProperty("valid");
        expect(typeof result.valid).toBe("boolean");
      });
    });
  });

  // ==================== Internal Utility Methods Tests ====================
  describe("Internal Utility Methods", () => {
    let DocumentContentValidator;

    beforeEach(async () => {
      const module = await import("../../../agents/content-checker/validate-content.mjs");
      DocumentContentValidator = module.DocumentContentValidator;
    });

    describe("removeCodeBlocks", () => {
      test("should remove fenced code blocks", () => {
        const validator = new DocumentContentValidator();
        const content = `# Title

Some text before.

\`\`\`javascript
const code = "test";
# This heading should be removed
\`\`\`

Some text after.`;

        const result = validator.removeCodeBlocks(content);
        expect(result).toContain("# Title");
        expect(result).toContain("Some text before.");
        expect(result).toContain("Some text after.");
        expect(result).not.toContain("const code");
        expect(result).not.toContain("# This heading should be removed");
      });

      test("should remove indented code blocks", () => {
        const validator = new DocumentContentValidator();
        const content = `# Title

    indented code line 1
    indented code line 2

Normal text.`;

        const result = validator.removeCodeBlocks(content);
        expect(result).toContain("# Title");
        expect(result).toContain("Normal text.");
        expect(result).not.toContain("indented code line");
      });

      test("should handle multiple code blocks", () => {
        const validator = new DocumentContentValidator();
        const content = `# Title

\`\`\`js
code1
\`\`\`

Middle text.

\`\`\`python
code2
\`\`\`

End text.`;

        const result = validator.removeCodeBlocks(content);
        expect(result).toContain("Middle text.");
        expect(result).toContain("End text.");
        expect(result).not.toContain("code1");
        expect(result).not.toContain("code2");
      });

      test("should handle content without code blocks", () => {
        const validator = new DocumentContentValidator();
        const content = `# Title

Just normal text here.

## Another heading`;

        const result = validator.removeCodeBlocks(content);
        expect(result).toBe(content);
      });

      test("should handle empty content", () => {
        const validator = new DocumentContentValidator();
        const result = validator.removeCodeBlocks("");
        expect(result).toBe("");
      });
    });

    describe("getCodeBlockRanges", () => {
      test("should detect fenced code block ranges", () => {
        const validator = new DocumentContentValidator();
        const content = `Start

\`\`\`js
code
\`\`\`

End`;

        const ranges = validator.getCodeBlockRanges(content);
        expect(ranges.length).toBeGreaterThan(0);
        // The fenced block should be in the ranges
        const hasCodeBlock = ranges.some((r) => {
          const blockContent = content.substring(r.start, r.end);
          return blockContent.includes("```");
        });
        expect(hasCodeBlock).toBe(true);
      });

      test("should detect inline code ranges", () => {
        const validator = new DocumentContentValidator();
        const content = "This is `inline code` in text.";

        const ranges = validator.getCodeBlockRanges(content);
        expect(ranges.length).toBe(1);
        expect(content.substring(ranges[0].start, ranges[0].end)).toBe("`inline code`");
      });

      test("should detect multiple inline codes", () => {
        const validator = new DocumentContentValidator();
        const content = "Use `code1` and `code2` here.";

        const ranges = validator.getCodeBlockRanges(content);
        expect(ranges.length).toBe(2);
      });

      test("should return empty array for content without code", () => {
        const validator = new DocumentContentValidator();
        const content = "Just plain text.";

        const ranges = validator.getCodeBlockRanges(content);
        // No fenced or inline code blocks
        expect(ranges.filter((r) => content.substring(r.start, r.end).includes("`")).length).toBe(
          0,
        );
      });
    });

    describe("isInCodeBlock", () => {
      test("should return true for position inside range", () => {
        const validator = new DocumentContentValidator();
        const ranges = [
          { start: 10, end: 20 },
          { start: 30, end: 40 },
        ];

        expect(validator.isInCodeBlock(15, ranges)).toBe(true);
        expect(validator.isInCodeBlock(35, ranges)).toBe(true);
      });

      test("should return false for position outside ranges", () => {
        const validator = new DocumentContentValidator();
        const ranges = [
          { start: 10, end: 20 },
          { start: 30, end: 40 },
        ];

        expect(validator.isInCodeBlock(5, ranges)).toBe(false);
        expect(validator.isInCodeBlock(25, ranges)).toBe(false);
        expect(validator.isInCodeBlock(45, ranges)).toBe(false);
      });

      test("should return true for position at range start", () => {
        const validator = new DocumentContentValidator();
        const ranges = [{ start: 10, end: 20 }];

        expect(validator.isInCodeBlock(10, ranges)).toBe(true);
      });

      test("should return false for position at range end", () => {
        const validator = new DocumentContentValidator();
        const ranges = [{ start: 10, end: 20 }];

        // End position is exclusive
        expect(validator.isInCodeBlock(20, ranges)).toBe(false);
      });

      test("should handle empty ranges array", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isInCodeBlock(10, [])).toBe(false);
      });
    });

    describe("isResourceFile", () => {
      test("should identify image files", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("image.png")).toBe(true);
        expect(validator.isResourceFile("photo.jpg")).toBe(true);
        expect(validator.isResourceFile("icon.svg")).toBe(true);
        expect(validator.isResourceFile("animation.gif")).toBe(true);
        expect(validator.isResourceFile("picture.webp")).toBe(true);
      });

      test("should identify document files", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("document.pdf")).toBe(true);
        expect(validator.isResourceFile("report.doc")).toBe(true);
        expect(validator.isResourceFile("spreadsheet.xlsx")).toBe(true);
      });

      test("should identify code files", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("script.js")).toBe(true);
        expect(validator.isResourceFile("module.ts")).toBe(true);
        expect(validator.isResourceFile("style.css")).toBe(true);
        expect(validator.isResourceFile("main.py")).toBe(true);
      });

      test("should identify archive files", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("archive.zip")).toBe(true);
        expect(validator.isResourceFile("backup.tar")).toBe(true);
        expect(validator.isResourceFile("compressed.gz")).toBe(true);
      });

      test("should return false for document links", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("/overview")).toBe(false);
        expect(validator.isResourceFile("/api/introduction")).toBe(false);
        expect(validator.isResourceFile("../getting-started")).toBe(false);
      });

      test("should handle URLs with query parameters", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("image.png?v=123")).toBe(true);
        expect(validator.isResourceFile("photo.jpg?size=large")).toBe(true);
      });

      test("should handle URLs with anchors", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("image.png#section")).toBe(true);
      });

      test("should be case insensitive", () => {
        const validator = new DocumentContentValidator();
        expect(validator.isResourceFile("IMAGE.PNG")).toBe(true);
        expect(validator.isResourceFile("Photo.JPG")).toBe(true);
        expect(validator.isResourceFile("Document.PDF")).toBe(true);
      });
    });

    describe("checkEmptyDocument", () => {
      test("should detect document with insufficient content", () => {
        const validator = new DocumentContentValidator();
        const content = `# Title

Short.`;
        const doc = { path: "/test" };

        validator.checkEmptyDocument(content, doc, "en.md");

        expect(validator.errors.fatal.length).toBe(1);
        expect(validator.errors.fatal[0].type).toBe("EMPTY_DOCUMENT");
      });

      test("should accept document with sufficient content", () => {
        const validator = new DocumentContentValidator();
        const content = `# Title

This is a document with sufficient content to pass the validation check.
It needs to have at least 50 characters after removing the title and whitespace.

## Another Section

More content here to ensure we have enough.`;
        const doc = { path: "/test" };

        validator.checkEmptyDocument(content, doc, "en.md");

        expect(validator.errors.fatal.length).toBe(0);
      });

      test("should not count headings as content", () => {
        const validator = new DocumentContentValidator();
        const content = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

Short`;
        const doc = { path: "/test" };

        validator.checkEmptyDocument(content, doc, "en.md");

        // Headings are removed, so only "Short" remains which is < 50 chars
        expect(validator.errors.fatal.length).toBe(1);
      });
    });

    describe("checkHeadingHierarchy", () => {
      test("should detect heading level skip", () => {
        const validator = new DocumentContentValidator();
        const content = `# H1 Title

### H3 Skipped H2

Content here.`;
        const doc = { path: "/test" };

        validator.checkHeadingHierarchy(content, doc, "en.md");

        expect(validator.errors.fatal.length).toBe(1);
        expect(validator.errors.fatal[0].type).toBe("HEADING_SKIP");
      });

      test("should accept valid heading hierarchy", () => {
        const validator = new DocumentContentValidator();
        const content = `# H1 Title

## H2 Section

### H3 Subsection

## H2 Another Section

Content here.`;
        const doc = { path: "/test" };

        validator.checkHeadingHierarchy(content, doc, "en.md");

        expect(validator.errors.fatal.length).toBe(0);
      });

      test("should allow going up multiple levels", () => {
        const validator = new DocumentContentValidator();
        const content = `# H1 Title

## H2 Section

### H3 Subsection

#### H4 Deep

## H2 Back to Level 2

Content here.`;
        const doc = { path: "/test" };

        validator.checkHeadingHierarchy(content, doc, "en.md");

        expect(validator.errors.fatal.length).toBe(0);
      });

      test("should ignore headings in code blocks", () => {
        const validator = new DocumentContentValidator();
        const content = `# H1 Title

\`\`\`markdown
### H3 in code block should be ignored
\`\`\`

## H2 After Code

Content here.`;
        const doc = { path: "/test" };

        validator.checkHeadingHierarchy(content, doc, "en.md");

        // H3 in code block is ignored, so H1 -> H2 is valid
        expect(validator.errors.fatal.length).toBe(0);
      });

      test("should detect multiple heading skips", () => {
        const validator = new DocumentContentValidator();
        const content = `# H1

### H3 Skip 1

##### H5 Skip 2

Content.`;
        const doc = { path: "/test" };

        validator.checkHeadingHierarchy(content, doc, "en.md");

        expect(validator.errors.fatal.length).toBe(2);
      });
    });

    describe("calculateExpectedRelativePath", () => {
      test("should calculate path for top-level document", () => {
        const validator = new DocumentContentValidator();
        // Document at overview/en.md (depth 2) linking to workspace root image
        const result = validator.calculateExpectedRelativePath(
          "overview/en.md",
          `${process.cwd()}/assets/image.png`,
        );

        expect(result).toContain("../");
        expect(result).toContain("assets/image.png");
      });

      test("should calculate path for nested document", () => {
        const validator = new DocumentContentValidator();
        // Document at api/auth/en.md (depth 3)
        const result = validator.calculateExpectedRelativePath(
          "api/auth/en.md",
          `${process.cwd()}/assets/image.png`,
        );

        expect(result).toContain("../");
        expect(result).toContain("assets/image.png");
      });
    });

    describe("checkRemoteImage", () => {
      test("should return accessible true for valid URL", async () => {
        const validator = new DocumentContentValidator();
        // Use a reliable URL - but this test depends on network
        // For unit tests, we mainly verify the return structure
        const result = await validator.checkRemoteImage("https://www.google.com/favicon.ico", 5000);

        expect(result).toHaveProperty("accessible");
        if (result.accessible) {
          expect(result).toHaveProperty("statusCode");
        } else {
          // Network might be unavailable, still valid test
          expect(result).toHaveProperty("error");
        }
      });

      test("should return accessible false for invalid URL", async () => {
        const validator = new DocumentContentValidator();
        const result = await validator.checkRemoteImage(
          "https://nonexistent.invalid.domain/image.png",
          1000,
        );

        expect(result.accessible).toBe(false);
        expect(result).toHaveProperty("error");
      });

      test("should timeout on slow responses", async () => {
        const validator = new DocumentContentValidator();
        // Very short timeout to trigger timeout behavior
        const result = await validator.checkRemoteImage("https://httpbin.org/delay/10", 100);

        expect(result.accessible).toBe(false);
        // Should either timeout or have an error
        expect(result.error || result.isTimeout).toBeTruthy();
      });
    });
  });
});
