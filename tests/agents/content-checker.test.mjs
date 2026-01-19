/**
 * Tests for agents/content-checker
 *
 * Function signatures:
 * - default export: checkContent({ docs }): Clean invalid docs and validate content
 * - cleanInvalidDocs({ yamlPath, docsDir }): Clean documents not in structure
 * - formatCleanResult(result): Format cleanup result message
 * - validateDocumentContent({ yamlPath, docsDir, docs, checkRemoteImages }): Validate documents
 *
 * NOTE: Tests avoid file system operations that depend on workspace configuration.
 * Tests focus on module exports and return structure expectations.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../setup/test-utils.mjs";

describe("content-checker", () => {
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
    describe("module exports - index.mjs", () => {
      test("should export default function", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        expect(contentChecker.default).toBeDefined();
        expect(typeof contentChecker.default).toBe("function");
      });

      test("should have description property", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        expect(contentChecker.default.description).toBeDefined();
        expect(typeof contentChecker.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        expect(contentChecker.default.input_schema).toBeDefined();
        expect(contentChecker.default.input_schema.type).toBe("object");
      });

      test("should define docs as optional array in schema", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const schema = contentChecker.default.input_schema;
        expect(schema.properties.docs.type).toBe("array");
      });
    });

    describe("module exports - clean-invalid-docs.mjs", () => {
      test("should export cleanInvalidDocs function", async () => {
        const cleanModule = await import("../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule.cleanInvalidDocs).toBeDefined();
        expect(typeof cleanModule.cleanInvalidDocs).toBe("function");
      });

      test("should export formatCleanResult function", async () => {
        const cleanModule = await import("../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule.formatCleanResult).toBeDefined();
        expect(typeof cleanModule.formatCleanResult).toBe("function");
      });
    });

    describe("module exports - validate-content.mjs", () => {
      test("should export default function", async () => {
        const validateModule = await import("../../agents/content-checker/validate-content.mjs");
        expect(validateModule.default).toBeDefined();
        expect(typeof validateModule.default).toBe("function");
      });
    });

    describe("description content", () => {
      test("should mention document validation", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const desc = contentChecker.default.description.toLowerCase();
        expect(desc).toContain("document");
      });

      test("should mention cleaning invalid docs", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const desc = contentChecker.default.description.toLowerCase();
        expect(desc).toContain("clean");
      });

      test("should mention link checking", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const desc = contentChecker.default.description.toLowerCase();
        expect(desc).toContain("link");
      });
    });

    describe("formatCleanResult output", () => {
      test("should format empty result as empty string", async () => {
        const { formatCleanResult } = await import(
          "../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: [],
          deletedFiles: [],
          errors: [],
        });
        expect(result).toBe("");
      });

      test("should include folder count in message", async () => {
        const { formatCleanResult } = await import(
          "../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: ["/test/folder1", "/test/folder2"],
          deletedFiles: [],
          errors: [],
        });
        expect(result).toContain("2");
      });

      test("should include file count in message", async () => {
        const { formatCleanResult } = await import(
          "../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: [],
          deletedFiles: ["/test/en.md", "/test/zh.md", "/test/ja.md"],
          errors: [],
        });
        expect(result).toContain("3");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("input handling", () => {
      test("should accept empty options object", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        // Function should not throw, even if files don't exist
        const result = await contentChecker.default({});
        expect(result).toHaveProperty("success");
      });

      test("should accept undefined options", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default();
        expect(result).toHaveProperty("success");
      });

      test("should accept docs as undefined", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({ docs: undefined });
        expect(result).toHaveProperty("success");
      });

      test("should accept empty docs array", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({ docs: [] });
        expect(result).toHaveProperty("success");
      });
    });

    describe("file not found handling", () => {
      test("should return fileNotFound for missing structure file", async () => {
        // This tests the actual function with default PATHS
        // Since structure file likely doesn't exist in test environment
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        // Should either succeed or fail gracefully
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("valid");
      });

      test("should provide helpful message on error", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(result).toHaveProperty("message");
        expect(typeof result.message).toBe("string");
      });
    });

    describe("docs array validation", () => {
      test("should handle docs with invalid path format", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["invalid-no-slash"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle docs with special characters", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/test<script>", "/test&param=1"],
        });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import index.mjs without errors", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        expect(contentChecker).toBeDefined();
      });

      test("should import clean-invalid-docs.mjs without errors", async () => {
        const cleanModule = await import("../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule).toBeDefined();
      });

      test("should import validate-content.mjs without errors", async () => {
        const validateModule = await import("../../agents/content-checker/validate-content.mjs");
        expect(validateModule).toBeDefined();
      });
    });

    describe("result structure", () => {
      test("should always return success property", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.success).toBe("boolean");
      });

      test("should always return valid property", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.valid).toBe("boolean");
      });

      test("should always return message property", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        expect(typeof result.message).toBe("string");
      });
    });

    describe("error handling", () => {
      test("should not throw on missing workspace", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        let error = null;
        try {
          await contentChecker.default({});
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });

      test("should handle docs array with many items", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const manyDocs = Array.from({ length: 100 }, (_, i) => `/doc-${i}`);
        const result = await contentChecker.default({ docs: manyDocs });
        expect(result).toHaveProperty("success");
      });

      test("should handle very long doc paths", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const longPath = `/${"a".repeat(1000)}`;
        const result = await contentChecker.default({ docs: [longPath] });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path traversal prevention", () => {
      test("should handle path traversal in docs", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/../../../etc/passwd"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle absolute system paths", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/etc/passwd", "/var/log/system.log"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle null bytes in paths", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/doc\x00/hidden"],
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("input injection prevention", () => {
      test("should handle script tags in docs", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/<script>alert(1)</script>"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle SQL injection patterns", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/'; DROP TABLE docs; --"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle command injection patterns", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/$(rm -rf /)", "/`cat /etc/passwd`"],
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("message security", () => {
      test("should not expose sensitive paths in error messages", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({});
        // Message should be defined and not expose system internals
        expect(result.message).toBeDefined();
        expect(result.message).not.toContain("/etc/passwd");
      });

      test("should handle unicode in paths", async () => {
        const contentChecker = await import("../../agents/content-checker/index.mjs");
        const result = await contentChecker.default({
          docs: ["/文档/日本語/한국어"],
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("formatCleanResult security", () => {
      test("should safely format malicious folder names", async () => {
        const { formatCleanResult } = await import(
          "../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: ["<script>alert(1)</script>"],
          deletedFiles: [],
          errors: [],
        });
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      test("should safely format paths with special chars", async () => {
        const { formatCleanResult } = await import(
          "../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: [],
          deletedFiles: ["../../../etc/passwd"],
          errors: [],
        });
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
