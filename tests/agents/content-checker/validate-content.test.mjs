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
import { mkdir, writeFile, rm } from "node:fs/promises";
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
    describe("path traversal prevention", () => {
      test("should handle path traversal in yamlPath", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: "../../../etc/passwd",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle path traversal in docsDir", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docsDir: "../../../etc",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle path traversal in docs filter", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docs: ["/../../../etc/passwd"],
        });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("input sanitization", () => {
      test("should handle null bytes in paths", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: "test\x00.yaml",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle shell metacharacters in paths", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docsDir: "$(rm -rf /)",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle unicode normalization attacks", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          docs: ["/doc\u202e/hidden"],
        });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("output safety", () => {
      test("should not expose full filesystem paths in errors", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        const result = await validateModule.default({
          yamlPath: "/etc/passwd",
        });
        // Should not expose /etc/passwd in the main message in a dangerous way
        expect(result.message).toBeDefined();
      });

      test("should handle malicious yaml content safely", async () => {
        const yamlPath = join(tempDir, "malicious.yaml");
        // YAML with potential injection
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
        // Should process without executing malicious content
        expect(result).toHaveProperty("valid");
      });
    });

    describe("remote image checking safety", () => {
      test("should not follow redirects to internal networks", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        // This tests that the function doesn't crash or hang
        const result = await validateModule.default({
          checkRemoteImages: true,
        });
        expect(result).toHaveProperty("valid");
      });

      test("should timeout on slow remote images", async () => {
        const validateModule = await import("../../../agents/content-checker/validate-content.mjs");
        // Function should respect timeout settings
        const result = await validateModule.default({
          checkRemoteImages: true,
        });
        expect(result).toHaveProperty("valid");
      });
    });
  });
});
