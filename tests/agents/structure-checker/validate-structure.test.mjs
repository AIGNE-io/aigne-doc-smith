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

  // ==================== Internal Utility Methods Tests ====================
  describe("Internal Utility Methods", () => {
    let DocumentStructureValidator;
    let formatOutput;

    beforeEach(async () => {
      const module = await import("../../../agents/structure-checker/validate-structure.mjs");
      DocumentStructureValidator = module.DocumentStructureValidator;
      formatOutput = module.formatOutput;
    });

    describe("DocumentStructureValidator.validatePath", () => {
      test("should return error for path without leading slash", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validatePath("test/path", "documents[0]");
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("PATH_FORMAT");
        expect(errors[0].fix).toBe("add_leading_slash");
      });

      test("should return no error for valid path", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validatePath("/test/path", "documents[0]");
        expect(errors.length).toBe(0);
      });

      test("should return empty array for non-string path", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validatePath(123, "documents[0]");
        expect(errors).toEqual([]);
      });

      test("should include current and expected values in error", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validatePath("mypath", "loc");
        expect(errors[0].current).toBe("mypath");
        expect(errors[0].expected).toBe("/mypath");
      });
    });

    describe("DocumentStructureValidator.validateSourcePaths", () => {
      test("should return error for non-array sourcePaths", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateSourcePaths("not-array", "documents[0]");
        expect(errors.fixable.length).toBe(1);
        expect(errors.fixable[0].type).toBe("INVALID_TYPE");
      });

      test("should return warning for empty sourcePaths", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateSourcePaths([], "documents[0]");
        expect(errors.warnings.length).toBe(1);
        expect(errors.warnings[0].type).toBe("EMPTY_SOURCES");
      });

      test("should return error for workspace: prefix", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateSourcePaths(["workspace:src/file.md"], "documents[0]");
        expect(errors.fixable.length).toBe(1);
        expect(errors.fixable[0].type).toBe("SOURCE_PATH_PREFIX");
      });

      test("should return error for non-string source path", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateSourcePaths([123], "documents[0]");
        expect(errors.fixable.length).toBe(1);
        expect(errors.fixable[0].type).toBe("INVALID_TYPE");
      });

      test("should accept valid sourcePaths", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateSourcePaths(["src/file.md", "src/other.md"], "documents[0]");
        expect(errors.fixable.length).toBe(0);
        expect(errors.warnings.length).toBe(0);
      });
    });

    describe("DocumentStructureValidator.validateIcon", () => {
      test("should require icon for top-level document", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateIcon(undefined, true, "documents[0]", "Test Doc");
        expect(errors.fatal.length).toBe(1);
        expect(errors.fatal[0].type).toBe("MISSING_ICON");
      });

      test("should return error for icon without lucide prefix at top level", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateIcon("book-open", true, "documents[0]", "Test Doc");
        expect(errors.fixable.length).toBe(1);
        expect(errors.fixable[0].type).toBe("ICON_FORMAT");
      });

      test("should accept valid icon at top level", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateIcon("lucide:book-open", true, "documents[0]", "Test Doc");
        expect(errors.fatal.length).toBe(0);
        expect(errors.fixable.length).toBe(0);
      });

      test("should return error for icon on child document", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateIcon("lucide:test", false, "documents[0].children[0]", "Child");
        expect(errors.fixable.length).toBe(1);
        expect(errors.fixable[0].type).toBe("EXTRA_ICON");
      });

      test("should accept no icon on child document", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateIcon(undefined, false, "documents[0].children[0]", "Child");
        expect(errors.fatal.length).toBe(0);
        expect(errors.fixable.length).toBe(0);
      });

      test("should include suggestion with icon examples in missing icon error", () => {
        const validator = new DocumentStructureValidator("");
        const errors = validator.validateIcon(undefined, true, "documents[0]", "Test");
        expect(errors.fatal[0].suggestion).toContain("lucide:");
      });
    });

    describe("DocumentStructureValidator.getMaxDepth", () => {
      test("should return 1 for flat documents", () => {
        const validator = new DocumentStructureValidator("");
        const docs = [{ path: "/a" }, { path: "/b" }];
        expect(validator.getMaxDepth(docs)).toBe(1);
      });

      test("should return 2 for one level of nesting", () => {
        const validator = new DocumentStructureValidator("");
        const docs = [
          {
            path: "/a",
            children: [{ path: "/a/child" }],
          },
        ];
        expect(validator.getMaxDepth(docs)).toBe(2);
      });

      test("should return 3 for two levels of nesting", () => {
        const validator = new DocumentStructureValidator("");
        const docs = [
          {
            path: "/a",
            children: [
              {
                path: "/a/b",
                children: [{ path: "/a/b/c" }],
              },
            ],
          },
        ];
        expect(validator.getMaxDepth(docs)).toBe(3);
      });

      test("should find deepest branch in tree", () => {
        const validator = new DocumentStructureValidator("");
        const docs = [
          { path: "/shallow" },
          {
            path: "/deep",
            children: [
              {
                path: "/deep/deeper",
                children: [{ path: "/deep/deeper/deepest" }],
              },
            ],
          },
        ];
        expect(validator.getMaxDepth(docs)).toBe(3);
      });

      test("should handle empty array", () => {
        const validator = new DocumentStructureValidator("");
        expect(validator.getMaxDepth([])).toBe(1);
      });

      test("should handle null/undefined", () => {
        const validator = new DocumentStructureValidator("");
        expect(validator.getMaxDepth(null)).toBe(1);
        expect(validator.getMaxDepth(undefined)).toBe(1);
      });

      test("should handle empty children array", () => {
        const validator = new DocumentStructureValidator("");
        const docs = [{ path: "/a", children: [] }];
        expect(validator.getMaxDepth(docs)).toBe(1);
      });
    });

    describe("formatOutput", () => {
      test("should format valid result with checkmark", () => {
        const result = {
          valid: true,
          summary: { totalDocuments: 5, warningCount: 0 },
        };
        const output = formatOutput(result);
        expect(output).toContain("✅");
        expect(output).toContain("PASS");
        expect(output).toContain("5");
      });

      test("should include warnings count in valid result", () => {
        const result = {
          valid: true,
          summary: { totalDocuments: 5, warningCount: 2 },
        };
        const output = formatOutput(result);
        expect(output).toContain("Warnings: 2");
      });

      test("should format invalid result with X mark", () => {
        const result = {
          valid: false,
          summary: {
            totalDocuments: 3,
            fatalCount: 1,
            fixableCount: 2,
            warningCount: 0,
          },
          errors: { fatal: [], fixable: [], warnings: [] },
        };
        const output = formatOutput(result);
        expect(output).toContain("❌");
        expect(output).toContain("FAIL");
      });

      test("should format fatal errors section", () => {
        const result = {
          valid: false,
          summary: {
            totalDocuments: 1,
            fatalCount: 1,
            fixableCount: 0,
            warningCount: 0,
          },
          errors: {
            fatal: [{ type: "MISSING_FIELD", path: "project.title", message: "Missing title" }],
            fixable: [],
            warnings: [],
          },
        };
        const output = formatOutput(result);
        expect(output).toContain("FATAL ERRORS");
        expect(output).toContain("MISSING_FIELD");
        expect(output).toContain("Missing title");
      });

      test("should format fixable errors section", () => {
        const result = {
          valid: false,
          summary: {
            totalDocuments: 1,
            fatalCount: 0,
            fixableCount: 1,
            warningCount: 0,
          },
          errors: {
            fatal: [],
            fixable: [
              {
                type: "PATH_FORMAT",
                path: "documents[0].path",
                message: "No leading slash",
                current: "test",
                expected: "/test",
                fix: "add_leading_slash",
              },
            ],
            warnings: [],
          },
        };
        const output = formatOutput(result);
        expect(output).toContain("FIXABLE ERRORS");
        expect(output).toContain("Current:");
        expect(output).toContain("Expected:");
      });

      test("should format warnings section", () => {
        const result = {
          valid: false,
          summary: {
            totalDocuments: 1,
            fatalCount: 0,
            fixableCount: 0,
            warningCount: 1,
          },
          errors: {
            fatal: [],
            fixable: [],
            warnings: [{ type: "DEEP_NESTING", message: "Document nested 4 levels deep" }],
          },
        };
        const output = formatOutput(result);
        expect(output).toContain("WARNINGS");
        expect(output).toContain("DEEP_NESTING");
      });

      test("should include suggestion when present", () => {
        const result = {
          valid: false,
          summary: {
            totalDocuments: 1,
            fatalCount: 1,
            fixableCount: 0,
            warningCount: 0,
          },
          errors: {
            fatal: [
              {
                type: "MISSING_ICON",
                path: "documents[0].icon",
                message: "Missing icon",
                suggestion: "Add lucide:book-open",
              },
            ],
            fixable: [],
            warnings: [],
          },
        };
        const output = formatOutput(result);
        expect(output).toContain("Suggestion:");
        expect(output).toContain("Add lucide:book-open");
      });
    });
  });
});
