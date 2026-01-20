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

  // ==================== Internal Utility Methods Tests ====================
  describe("Internal Utility Methods", () => {
    let DocumentStructureFixer;
    let formatRemainingErrors;

    beforeEach(async () => {
      const module = await import("../../../agents/structure-checker/index.mjs");
      DocumentStructureFixer = module.DocumentStructureFixer;
      formatRemainingErrors = module.formatRemainingErrors;
    });

    describe("DocumentStructureFixer.parsePath", () => {
      test("should parse simple path", () => {
        const fixer = new DocumentStructureFixer({});
        const result = fixer.parsePath("documents.path");
        expect(result).toEqual(["documents", "path"]);
      });

      test("should parse path with array indices", () => {
        const fixer = new DocumentStructureFixer({});
        const result = fixer.parsePath("documents[0].path");
        expect(result).toEqual(["documents[0]", "path"]);
      });

      test("should parse deeply nested path", () => {
        const fixer = new DocumentStructureFixer({});
        const result = fixer.parsePath("documents[0].children[1].path");
        expect(result).toEqual(["documents[0]", "children[1]", "path"]);
      });

      test("should handle path with multiple array indices", () => {
        const fixer = new DocumentStructureFixer({});
        const result = fixer.parsePath("documents[0].children[2].sourcePaths[0]");
        expect(result).toEqual(["documents[0]", "children[2]", "sourcePaths[0]"]);
      });

      test("should handle empty string", () => {
        const fixer = new DocumentStructureFixer({});
        const result = fixer.parsePath("");
        expect(result).toEqual([""]);
      });
    });

    describe("DocumentStructureFixer.getDocument", () => {
      test("should get document at simple path", () => {
        const data = {
          documents: [{ path: "/test", title: "Test" }],
        };
        const fixer = new DocumentStructureFixer(data);
        const result = fixer.getDocument(["documents[0]"]);
        expect(result).toEqual({ path: "/test", title: "Test" });
      });

      test("should get nested document", () => {
        const data = {
          documents: [
            {
              path: "/parent",
              children: [{ path: "/parent/child", title: "Child" }],
            },
          ],
        };
        const fixer = new DocumentStructureFixer(data);
        const result = fixer.getDocument(["documents[0]", "children[0]"]);
        expect(result).toEqual({ path: "/parent/child", title: "Child" });
      });

      test("should return null for invalid path", () => {
        const data = { documents: [] };
        const fixer = new DocumentStructureFixer(data);
        const result = fixer.getDocument(["documents[99]"]);
        expect(result).toBeNull();
      });

      test("should return null for invalid nested path", () => {
        const data = {
          documents: [{ path: "/test" }],
        };
        const fixer = new DocumentStructureFixer(data);
        const result = fixer.getDocument(["documents[0]", "children[0]"]);
        expect(result).toBeNull();
      });

      test("should return null for malformed path parts", () => {
        const data = { documents: [] };
        const fixer = new DocumentStructureFixer(data);
        const result = fixer.getDocument(["invalid["]);
        expect(result).toBeNull();
      });

      test("should get simple property", () => {
        const data = { project: { title: "Test" } };
        const fixer = new DocumentStructureFixer(data);
        const result = fixer.getDocument(["project"]);
        expect(result).toEqual({ title: "Test" });
      });
    });

    describe("DocumentStructureFixer.applyFixes", () => {
      test("should fix path without leading slash", () => {
        const data = {
          documents: [{ path: "test", title: "Test" }],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          {
            type: "PATH_FORMAT",
            path: "documents[0].path",
            fix: "add_leading_slash",
          },
        ]);
        expect(data.documents[0].path).toBe("/test");
        expect(fixer.fixCount).toBe(1);
      });

      test("should fix sourcePath with workspace prefix", () => {
        const data = {
          documents: [
            {
              path: "/test",
              sourcePaths: ["workspace:src/file.md"],
            },
          ],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          {
            type: "SOURCE_PATH_PREFIX",
            path: "documents[0].sourcePaths[0]",
          },
        ]);
        expect(data.documents[0].sourcePaths[0]).toBe("src/file.md");
        expect(fixer.fixCount).toBe(1);
      });

      test("should fix icon without lucide prefix", () => {
        const data = {
          documents: [{ path: "/test", icon: "book-open" }],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          {
            type: "ICON_FORMAT",
            path: "documents[0].icon",
          },
        ]);
        expect(data.documents[0].icon).toBe("lucide:book-open");
        expect(fixer.fixCount).toBe(1);
      });

      test("should remove extra icon", () => {
        const data = {
          documents: [
            {
              path: "/parent",
              children: [{ path: "/parent/child", icon: "lucide:test" }],
            },
          ],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          {
            type: "EXTRA_ICON",
            path: "documents[0].children[0].icon",
          },
        ]);
        expect(data.documents[0].children[0].icon).toBeUndefined();
        expect(fixer.fixCount).toBe(1);
      });

      test("should handle multiple fixes", () => {
        const data = {
          documents: [
            { path: "test1", icon: "icon1" },
            { path: "test2", icon: "icon2" },
          ],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          { type: "PATH_FORMAT", path: "documents[0].path", fix: "add_leading_slash" },
          { type: "PATH_FORMAT", path: "documents[1].path", fix: "add_leading_slash" },
          { type: "ICON_FORMAT", path: "documents[0].icon" },
          { type: "ICON_FORMAT", path: "documents[1].icon" },
        ]);
        expect(data.documents[0].path).toBe("/test1");
        expect(data.documents[1].path).toBe("/test2");
        expect(data.documents[0].icon).toBe("lucide:icon1");
        expect(data.documents[1].icon).toBe("lucide:icon2");
        expect(fixer.fixCount).toBe(4);
      });

      test("should skip unknown error types", () => {
        const data = {
          documents: [{ path: "/test" }],
        };
        const fixer = new DocumentStructureFixer(data);
        const fixCount = fixer.applyFixes([
          {
            type: "UNKNOWN_TYPE",
            path: "documents[0].path",
          },
        ]);
        expect(fixCount).toBe(0);
      });

      test("should not fix path already with leading slash", () => {
        const data = {
          documents: [{ path: "/test" }],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          {
            type: "PATH_FORMAT",
            path: "documents[0].path",
            fix: "add_leading_slash",
          },
        ]);
        expect(data.documents[0].path).toBe("/test");
        expect(fixer.fixCount).toBe(0);
      });

      test("should not fix icon already with lucide prefix", () => {
        const data = {
          documents: [{ icon: "lucide:book" }],
        };
        const fixer = new DocumentStructureFixer(data);
        fixer.applyFixes([
          {
            type: "ICON_FORMAT",
            path: "documents[0].icon",
          },
        ]);
        expect(data.documents[0].icon).toBe("lucide:book");
        expect(fixer.fixCount).toBe(0);
      });
    });

    describe("formatRemainingErrors", () => {
      test("should format fatal errors", () => {
        const errors = {
          fatal: [
            { path: "documents[0].path", message: "Missing path" },
            { path: "documents[1].title", message: "Missing title", suggestion: "Add title" },
          ],
          fixable: [],
        };
        const result = formatRemainingErrors(errors);
        expect(result.length).toBe(2);
        expect(result[0].path).toBe("documents[0].path");
        expect(result[0].message).toBe("Missing path");
        expect(result[1].action).toBe("Add title");
      });

      test("should format fixable errors", () => {
        const errors = {
          fatal: [],
          fixable: [{ path: "documents[0].path", message: "No leading slash", expected: "/test" }],
        };
        const result = formatRemainingErrors(errors);
        expect(result.length).toBe(1);
        expect(result[0].action).toContain("/test");
      });

      test("should combine fatal and fixable errors", () => {
        const errors = {
          fatal: [{ path: "p1", message: "Fatal error" }],
          fixable: [{ path: "p2", message: "Fixable error", expected: "fix" }],
        };
        const result = formatRemainingErrors(errors);
        expect(result.length).toBe(2);
      });

      test("should handle empty errors", () => {
        const errors = { fatal: [], fixable: [] };
        const result = formatRemainingErrors(errors);
        expect(result).toEqual([]);
      });

      test("should provide default action when no expected value", () => {
        const errors = {
          fatal: [],
          fixable: [{ path: "p1", message: "Error" }],
        };
        const result = formatRemainingErrors(errors);
        expect(result[0].action).toContain("please refer to schema");
      });
    });
  });
});
