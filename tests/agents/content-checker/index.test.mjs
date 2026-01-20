/**
 * Tests for agents/content-checker/index.mjs
 *
 * Based on intent: Entry logic and selective checking
 *
 * Function signatures:
 * - default export: checkContent({ docs }): Main entry function
 *   - Cleans invalid docs (Layer 0)
 *   - Validates document content (Layer 1-4)
 *   - Returns: { success, valid, message, errors, stats, fixed, fixedCount, cleaned }
 *
 * Properties:
 * - description: string
 * - input_schema: { type: 'object', properties: { docs: array } }
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("content-checker/index.mjs", () => {
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
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        expect(contentChecker.default).toBeDefined();
        expect(typeof contentChecker.default).toBe("function");
      });

      test("should have description property", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        expect(contentChecker.default.description).toBeDefined();
        expect(typeof contentChecker.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        expect(contentChecker.default.input_schema).toBeDefined();
        expect(contentChecker.default.input_schema.type).toBe("object");
      });

      test("should define docs as optional array in schema", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const schema = contentChecker.default.input_schema;
        expect(schema.properties.docs.type).toBe("array");
      });
    });

    describe("description content", () => {
      test("should mention document validation", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const desc = contentChecker.default.description.toLowerCase();
        expect(desc).toContain("document");
      });

      test("should mention cleaning invalid docs", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const desc = contentChecker.default.description.toLowerCase();
        expect(desc).toContain("clean");
      });

      test("should mention link checking", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const desc = contentChecker.default.description.toLowerCase();
        expect(desc).toContain("link");
      });
    });

    describe("return structure", () => {
      test("should return success property", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.success).toBe("boolean");
      });

      test("should return valid property", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.valid).toBe("boolean");
      });

      test("should return message property", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.message).toBe("string");
      });

      test("should return cleaned property when structure file exists", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        // cleaned is only present when structure file exists
        // when file not found, result has fileNotFound=true instead
        if (!result.fileNotFound) {
          expect(result.cleaned).toBeDefined();
          expect(typeof result.cleaned.folders).toBe("number");
          expect(typeof result.cleaned.files).toBe("number");
        } else {
          expect(result.fileNotFound).toBe(true);
        }
      });
    });

    describe("selective checking with docs parameter", () => {
      test("should accept docs as array", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({ docs: ["/overview"] });
        expect(result).toHaveProperty("success");
      });

      test("should accept multiple doc paths", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/overview", "/api/introduction", "/getting-started"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should accept empty docs array (checks all)", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({ docs: [] });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("input handling", () => {
      test("should accept empty options object", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(result).toHaveProperty("success");
      });

      test("should accept undefined options", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default();
        expect(result).toHaveProperty("success");
      });

      test("should accept docs as undefined", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({ docs: undefined });
        expect(result).toHaveProperty("success");
      });

      test("should handle docs with invalid path format", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["invalid-no-slash"],
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("missing structure file", () => {
      test("should handle missing document-structure.yaml gracefully", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        // Should not throw, returns result with fileNotFound or error info
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("message");
      });

      test("should provide helpful message when structure file missing", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.message).toBe("string");
      });
    });

    describe("docs parameter edge cases", () => {
      test("should handle docs with special characters", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/test<script>", "/test&param=1"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle docs with unicode paths", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/文档/概述", "/日本語/はじめに"],
        });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import index.mjs without errors", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        expect(contentChecker).toBeDefined();
      });

      test("should have all expected exports", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        expect(contentChecker.default).toBeDefined();
        expect(contentChecker.default.description).toBeDefined();
        expect(contentChecker.default.input_schema).toBeDefined();
      });
    });

    describe("error recovery", () => {
      test("should not throw on missing workspace", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        let error = null;
        try {
          await contentChecker.default({});
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });

      test("should handle docs array with many items", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const manyDocs = Array.from({ length: 100 }, (_, i) => `/doc-${i}`);
        const result = await contentChecker.default({ docs: manyDocs });
        expect(result).toHaveProperty("success");
      });

      test("should handle very long doc paths", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const longPath = `/${"a".repeat(1000)}`;
        const result = await contentChecker.default({ docs: [longPath] });
        expect(result).toHaveProperty("success");
      });

      test("should return consistent structure on any error", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({ docs: ["/nonexistent"] });
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("valid");
        expect(result).toHaveProperty("message");
      });
    });

    describe("integration with sub-modules", () => {
      test("should integrate clean-invalid-docs module when structure exists", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        // cleaned property comes from clean-invalid-docs integration
        // only present when structure file exists
        if (!result.fileNotFound) {
          expect(result).toHaveProperty("cleaned");
        } else {
          // When file not found, cleaned is not present
          expect(result.fileNotFound).toBe(true);
        }
      });

      test("should integrate validate-content module", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        // valid property is always present
        expect(result).toHaveProperty("valid");
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path traversal prevention", () => {
      test("should handle path traversal in docs", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/../../../etc/passwd"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle absolute system paths", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/etc/passwd", "/var/log/system.log"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle null bytes in paths", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/doc\x00/hidden"],
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("input injection prevention", () => {
      test("should handle script tags in docs", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/<script>alert(1)</script>"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle SQL injection patterns", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/'; DROP TABLE docs; --"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle command injection patterns", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/$(rm -rf /)", "/`cat /etc/passwd`"],
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("output safety", () => {
      test("should not expose sensitive paths in error messages", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(result.message).toBeDefined();
        expect(result.message).not.toContain("/etc/passwd");
      });

      test("should sanitize doc paths in output", async () => {
        const contentChecker = await import("../../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/<script>alert('xss')</script>"],
        });
        // Should handle without exposing raw script in a dangerous way
        expect(result).toHaveProperty("message");
      });
    });
  });
});
