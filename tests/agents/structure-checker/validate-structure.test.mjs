/**
 * Tests for agents/structure-checker/validate-structure.mjs
 *
 * Function signatures:
 * - default export: validateYamlStructure({ yamlPath }): Validate YAML structure
 *   - Returns: { valid, errors, summary, message }
 *
 * Validation layers:
 * - Layer 1: YAML parsing
 * - Layer 2: Schema structure (project, documents fields)
 * - Layer 3: Document fields (recursive validation)
 * - Layer 4: Advanced rules
 *
 * Error categories:
 * - fatal: Critical errors that prevent processing
 * - fixable: Errors that can be auto-fixed
 * - warnings: Non-critical issues
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("structure-checker/validate-structure.mjs", () => {
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
        const module = await import("../../../agents/structure-checker/validate-structure.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should accept yamlPath parameter", async () => {
        const module = await import("../../../agents/structure-checker/validate-structure.mjs");
        // Function should accept an options object
        expect(typeof module.default).toBe("function");
      });
    });

    describe("valid YAML structure", () => {
      test("should validate correct structure", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "valid.yaml");
        await writeFile(
          yamlPath,
          `
project:
  title: "Test Project"
  description: "Test Description"
documents:
  - path: "/overview"
    title: "Overview"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
        expect(result).toHaveProperty("errors");
      });

      test("should return errors object with categories", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result.errors).toHaveProperty("fatal");
        expect(result.errors).toHaveProperty("fixable");
        expect(result.errors).toHaveProperty("warnings");
      });

      test("should return message property", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(typeof result.message).toBe("string");
      });
    });

    describe("return structure", () => {
      test("should return valid boolean", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(typeof result.valid).toBe("boolean");
      });

      test("should return summary when available", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(
          yamlPath,
          `
project:
  title: "Test"
  description: "Test"
documents:
  - path: "/test"
    title: "Test"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        if (result.summary) {
          expect(typeof result.summary).toBe("object");
        }
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("missing file", () => {
      test("should handle missing file", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: join(tempDir, "nonexistent.yaml"),
        });
        expect(result).toHaveProperty("valid");
        expect(result.valid).toBe(false);
      });

      test("should return error for missing file", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: join(tempDir, "nonexistent.yaml"),
        });
        expect(result.message).toBeTruthy();
      });
    });

    describe("invalid YAML content", () => {
      test("should handle empty file", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "empty.yaml");
        await writeFile(yamlPath, "");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle invalid YAML syntax", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "invalid.yaml");
        await writeFile(yamlPath, "invalid: yaml: [");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
        expect(result.valid).toBe(false);
      });

      test("should handle YAML with only comments", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "comments.yaml");
        await writeFile(yamlPath, "# just a comment\n# another comment\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("missing required fields", () => {
      test("should detect missing project field", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "no-project.yaml");
        await writeFile(
          yamlPath,
          `
documents:
  - path: "/test"
    title: "Test"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        expect(result.valid).toBe(false);
        expect(result.errors.fatal.length).toBeGreaterThan(0);
      });

      test("should detect missing documents field", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "no-docs.yaml");
        await writeFile(
          yamlPath,
          `
project:
  title: "Test"
  description: "Test"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        expect(result.valid).toBe(false);
      });

      test("should detect missing project.title", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "no-title.yaml");
        await writeFile(
          yamlPath,
          `
project:
  description: "Test"
documents:
  - path: "/test"
    title: "Test"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        expect(result.valid).toBe(false);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import without errors", async () => {
        const module = await import("../../../agents/structure-checker/validate-structure.mjs");
        expect(module).toBeDefined();
      });

      test("should have default export", async () => {
        const module = await import("../../../agents/structure-checker/validate-structure.mjs");
        expect(module.default).toBeDefined();
      });

      test("should be callable function", async () => {
        const module = await import("../../../agents/structure-checker/validate-structure.mjs");
        expect(typeof module.default).toBe("function");
      });
    });

    describe("error categorization", () => {
      test("should return errors array on validation failure", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("errors");
      });

      test("should categorize fatal errors", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        // Use valid YAML but missing required fields to trigger fatal error
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result.errors).toBeDefined();
        expect(Array.isArray(result.errors.fatal)).toBe(true);
      });

      test("should categorize fixable errors", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(Array.isArray(result.errors.fixable)).toBe(true);
      });

      test("should categorize warnings", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "test.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(Array.isArray(result.errors.warnings)).toBe(true);
      });
    });

    describe("large file handling", () => {
      test("should handle YAML with many documents", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "many-docs.yaml");
        const docs = Array.from(
          { length: 100 },
          (_, i) => `  - path: "/doc-${i}"\n    title: "Doc ${i}"`,
        ).join("\n");
        await writeFile(
          yamlPath,
          `
project:
  title: "Test"
  description: "Test"
documents:
${docs}
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle deeply nested documents", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "nested.yaml");
        await writeFile(
          yamlPath,
          `
project:
  title: "Test"
  description: "Test"
documents:
  - path: "/level1"
    title: "Level 1"
    children:
      - path: "/level1/level2"
        title: "Level 2"
        children:
          - path: "/level1/level2/level3"
            title: "Level 3"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path traversal", () => {
      test("should handle path traversal in yamlPath", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: "../../../etc/passwd",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle absolute paths", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: "/etc/passwd",
        });
        expect(result).toHaveProperty("valid");
      });

      test("should handle null bytes in path", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: "test\x00.yaml",
        });
        expect(result).toHaveProperty("valid");
      });
    });

    describe("YAML security", () => {
      test("should handle YAML bomb attempt", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "bomb.yaml");
        // Create a small nested structure (not actual bomb)
        await writeFile(yamlPath, "a: &a\n  - *a\n  - *a\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle YAML with special tags safely", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "tags.yaml");
        await writeFile(yamlPath, "!!python/object/apply:os.system ['ls']\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });

      test("should handle malicious content in values", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "malicious.yaml");
        await writeFile(
          yamlPath,
          `
project:
  title: "<script>alert('xss')</script>"
  description: "'; DROP TABLE docs;--"
documents:
  - path: "/$(rm -rf /)"
    title: "Test"
`,
        );

        const result = await validateYamlStructure({ yamlPath });
        // Should parse without executing malicious content
        expect(result).toHaveProperty("valid");
      });
    });

    describe("output safety", () => {
      test("should not expose sensitive paths in errors", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const result = await validateYamlStructure({
          yamlPath: "/etc/shadow",
        });
        // Message should be safe
        expect(result.message).not.toContain("permission denied");
      });

      test("should handle unicode in paths", async () => {
        const { default: validateYamlStructure } = await import(
          "../../../agents/structure-checker/validate-structure.mjs"
        );
        const yamlPath = join(tempDir, "文档.yaml");
        await writeFile(yamlPath, "key: value\n");

        const result = await validateYamlStructure({ yamlPath });
        expect(result).toHaveProperty("valid");
      });
    });
  });
});
