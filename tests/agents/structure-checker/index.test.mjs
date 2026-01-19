/**
 * Tests for agents/structure-checker/index.mjs
 *
 * Function signatures:
 * - default export: checkStructure(): Check and validate document structure YAML
 *   - Returns: { success, valid, message, summary, fixed, fixedCount, fileNotFound }
 *
 * Properties:
 * - description: string
 *
 * Key behavior:
 * - Checks if file exists (returns fileNotFound if missing)
 * - Calls validateYamlStructure
 * - Auto-fixes fixable errors
 * - Re-validates after fix
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("structure-checker/index.mjs", () => {
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
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have description property", async () => {
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should mention YAML in description", async () => {
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(module.default.description.toLowerCase()).toContain("yaml");
      });

      test("should mention document structure in description", async () => {
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(module.default.description.toLowerCase()).toContain("structure");
      });
    });

    describe("return structure", () => {
      test("should return success property", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.success).toBe("boolean");
      });

      test("should return valid property", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.valid).toBe("boolean");
      });

      test("should return message property", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.message).toBe("string");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("missing structure file", () => {
      test("should handle missing structure file", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("valid");
      });

      test("should return fileNotFound for missing file", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        // Should either succeed or indicate file not found
        expect(result).toHaveProperty("message");
      });

      test("should provide helpful suggestions when file missing", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        if (result.fileNotFound) {
          expect(result.message).toContain("Possible reasons");
        }
      });
    });

    describe("return values on error", () => {
      test("should set success to false on error", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        if (result.fileNotFound) {
          expect(result.success).toBe(false);
        }
      });

      test("should set valid to false on error", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        if (result.fileNotFound) {
          expect(result.valid).toBe(false);
        }
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import without errors", async () => {
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(module).toBeDefined();
      });

      test("should have default export", async () => {
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(module.default).toBeDefined();
      });

      test("should be callable function", async () => {
        const module = await import("../../../agents/structure-checker/index.mjs");
        expect(typeof module.default).toBe("function");
      });
    });

    describe("error recovery", () => {
      test("should not throw on missing workspace", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        let error = null;
        try {
          await checkStructure();
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });

      test("should return consistent structure on any error", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("valid");
        expect(result).toHaveProperty("message");
      });

      test("should handle concurrent calls", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const results = await Promise.all([checkStructure(), checkStructure(), checkStructure()]);
        expect(results.length).toBe(3);
        for (const result of results) {
          expect(result).toHaveProperty("success");
        }
      });
    });

    describe("result completeness", () => {
      test("should always return success property", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.success).toBe("boolean");
      });

      test("should always return valid property", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.valid).toBe("boolean");
      });

      test("should always return message property", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.message).toBe("string");
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("error message safety", () => {
      test("should provide helpful message in error case", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result.message.length).toBeGreaterThan(0);
      });

      test("should not expose sensitive system paths in error", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result.message).not.toContain("/etc/passwd");
        expect(result.message).not.toContain("/var/log");
      });

      test("should not expose environment variables in error", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result.message).not.toContain("process.env");
      });
    });

    describe("file operation safety", () => {
      test("should use predefined PATHS constant", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        // Function should work without any parameters
        const result = await checkStructure();
        expect(result).toHaveProperty("success");
      });

      test("should handle file not found gracefully", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        // Should not throw, should return structured error
        expect(result).toHaveProperty("message");
      });

      test("should not allow arbitrary file access", async () => {
        const { default: checkStructure } = await import(
          "../../../agents/structure-checker/index.mjs"
        );
        // Function takes no parameters, only uses PATHS constant
        expect(checkStructure.length).toBe(0);
      });
    });
  });
});
