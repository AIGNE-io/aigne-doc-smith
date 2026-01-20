/**
 * Tests for agents/save-document
 *
 * Function signatures:
 * - saveDocument({ path, content, options }): Save document to docs directory
 *
 * NOTE: Tests focus on module exports and input validation.
 * Actual file saving depends on workspace configuration.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("save-document", () => {
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
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have description property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should have output_schema property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.output_schema).toBeDefined();
        expect(module.default.output_schema.type).toBe("object");
      });
    });

    describe("input_schema structure", () => {
      test("should require path property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.input_schema.required).toContain("path");
      });

      test("should require content property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.input_schema.required).toContain("content");
      });

      test("should require options property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.input_schema.required).toContain("options");
      });

      test("should define options.language as required", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        const optionsSchema = module.default.input_schema.properties.options;
        expect(optionsSchema.required).toContain("language");
      });
    });

    describe("output_schema structure", () => {
      test("should require success property", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should define path in output", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.output_schema.properties.path).toBeDefined();
      });

      test("should define files in output", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.output_schema.properties.files).toBeDefined();
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("content validation", () => {
      test("should reject empty content", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "",
          options: { language: "en" },
        });
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      test("should reject null content", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: null,
          options: { language: "en" },
        });
        expect(result.success).toBe(false);
      });

      test("should reject undefined content", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: undefined,
          options: { language: "en" },
        });
        expect(result.success).toBe(false);
      });

      test("should reject whitespace-only content", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "   \n\t  ",
          options: { language: "en" },
        });
        expect(result.success).toBe(false);
      });
    });

    describe("language validation", () => {
      test("should reject missing language", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test",
          options: {},
        });
        expect(result.success).toBe(false);
      });

      test("should reject invalid language format", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test",
          options: { language: "invalid-lang-format" },
        });
        expect(result.success).toBe(false);
      });

      test("should reject empty language", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test",
          options: { language: "" },
        });
        expect(result.success).toBe(false);
      });
    });

    describe("path validation", () => {
      test("should reject missing path", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          content: "# Test",
          options: { language: "en" },
        });
        expect(result.success).toBe(false);
      });

      test("should reject empty path", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "",
          content: "# Test",
          options: { language: "en" },
        });
        expect(result.success).toBe(false);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import without errors", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module).toBeDefined();
      });
    });

    describe("result structure", () => {
      test("should always return success property", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "",
          options: { language: "en" },
        });
        expect(typeof result.success).toBe("boolean");
      });

      test("should return error code on failure", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "",
          options: { language: "en" },
        });
        expect(result.error).toBeDefined();
      });

      test("should return suggestion on failure", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "",
          options: { language: "en" },
        });
        expect(result.suggestion).toBeDefined();
      });

      test("should return message on failure", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "",
          options: { language: "en" },
        });
        expect(result.message).toBeDefined();
      });
    });

    describe("language code formats", () => {
      test("should accept valid two-letter language code", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        // May fail due to missing structure file, but not due to language format
        const result = await saveDocument({
          path: "/test",
          content: "# Test content",
          options: { language: "en" },
        });
        // Should not fail due to language format
        if (!result.success) {
          expect(result.error).not.toBe("INVALID_LANGUAGE");
        }
      });

      test("should accept valid language-region code", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test content",
          options: { language: "en-US" },
        });
        // Should not fail due to language format
        if (!result.success) {
          expect(result.error).not.toBe("INVALID_LANGUAGE");
        }
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path traversal prevention", () => {
      test("should handle path traversal in path", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/../../../etc/passwd",
          content: "# Test",
          options: { language: "en" },
        });
        // Should fail but not throw
        expect(result).toHaveProperty("success");
      });

      test("should handle absolute system path", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/etc/passwd",
          content: "# Test",
          options: { language: "en" },
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("content injection prevention", () => {
      test("should accept content with script tags", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test\n<script>alert(1)</script>",
          options: { language: "en" },
        });
        // Markdown can contain HTML, so this is valid content
        expect(result).toHaveProperty("success");
      });

      test("should accept content with SQL injection patterns", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test\n'; DROP TABLE docs; --",
          options: { language: "en" },
        });
        expect(result).toHaveProperty("success");
      });
    });

    describe("language code injection", () => {
      test("should reject language with path traversal", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test",
          options: { language: "../../../etc" },
        });
        expect(result.success).toBe(false);
      });

      test("should reject language with special characters", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test",
          options: { language: "<script>" },
        });
        expect(result.success).toBe(false);
      });

      test("should reject language with null bytes", async () => {
        const { default: saveDocument } = await import("../../../agents/save-document/index.mjs");
        const result = await saveDocument({
          path: "/test",
          content: "# Test",
          options: { language: "en\x00zh" },
        });
        expect(result.success).toBe(false);
      });
    });

    describe("description security", () => {
      test("should mention important restrictions", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.description).toContain("Important restriction");
      });

      test("should mention mandatory requirement", async () => {
        const module = await import("../../../agents/save-document/index.mjs");
        expect(module.default.description).toContain("Mandatory requirement");
      });
    });
  });
});
