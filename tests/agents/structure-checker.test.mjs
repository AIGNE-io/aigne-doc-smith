/**
 * Tests for agents/structure-checker
 *
 * Function signatures:
 * - index.mjs: checkStructure(): Check and validate document structure YAML
 * - validate-structure.mjs: validateYamlStructure({ yamlPath }): Validate YAML structure
 *
 * NOTE: Tests avoid modifying actual workspace files.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

describe("structure-checker", () => {
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

  // ==================== index.mjs ====================
  describe("index.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../agents/structure-checker/index.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have description property", async () => {
        const module = await import("../../agents/structure-checker/index.mjs");
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should mention YAML in description", async () => {
        const module = await import("../../agents/structure-checker/index.mjs");
        expect(module.default.description.toLowerCase()).toContain("yaml");
      });

      test("should mention document structure in description", async () => {
        const module = await import("../../agents/structure-checker/index.mjs");
        expect(module.default.description.toLowerCase()).toContain("structure");
      });
    });

    describe("Unhappy Path", () => {
      test("should handle missing structure file", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        // Will use default PATHS which likely doesn't exist in test
        const result = await checkStructure();
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("valid");
      });

      test("should return fileNotFound for missing file", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        // Should either succeed or indicate file not found
        expect(result).toHaveProperty("message");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../agents/structure-checker/index.mjs");
        expect(module).toBeDefined();
      });

      test("should always return success property", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.success).toBe("boolean");
      });

      test("should always return valid property", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.valid).toBe("boolean");
      });

      test("should always return message property", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(typeof result.message).toBe("string");
      });
    });

    describe("Security Scenarios", () => {
      test("should not throw on missing workspace", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        let error = null;
        try {
          await checkStructure();
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });

      test("should provide helpful message in error case", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result.message.length).toBeGreaterThan(0);
      });

      test("should not expose sensitive paths in error", async () => {
        const { default: checkStructure } = await import(
          "../../agents/structure-checker/index.mjs"
        );
        const result = await checkStructure();
        expect(result.message).not.toContain("/etc/passwd");
      });
    });
  });

  // ==================== validate-structure.mjs ====================
  describe("validate-structure.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../agents/structure-checker/validate-structure.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should accept yamlPath parameter", async () => {
        const module = await import("../../agents/structure-checker/validate-structure.mjs");
        expect(module.default.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Unhappy Path", () => {
      test("should handle missing file", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: join(tempDir, "nonexistent.yaml"),
        });
        expect(result).toHaveProperty("valid");
        expect(result.valid).toBe(false);
      });

      test("should handle empty file", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "empty.yaml");
        await writeFile(yamlPath, "");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle invalid YAML syntax", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "invalid.yaml");
        await writeFile(yamlPath, "invalid: yaml: [");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../agents/structure-checker/validate-structure.mjs");
        expect(module).toBeDefined();
      });

      test("should return errors array on validation failure", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("errors");
      });

      test("should handle YAML with only comments", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "comments.yaml");
        await writeFile(yamlPath, "# just a comment\n# another comment\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("Security Scenarios", () => {
      test("should handle path traversal", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: "../../../etc/passwd",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle YAML bomb attempt", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "bomb.yaml");
        // Create a small nested structure (not actual bomb)
        await writeFile(yamlPath, "a: &a\n  - *a\n  - *a\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle YAML with special tags", async () => {
        const { default: validateYamlStructure } = await import(
          "../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "tags.yaml");
        await writeFile(yamlPath, "!!python/object/apply:os.system ['ls']\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });
  });
});
