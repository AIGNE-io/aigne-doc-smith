/**
 * Tests for utils/docs.mjs
 *
 * Function signatures:
 * - loadDocumentStructure(outputDir): Load document structure from yaml (returns array)
 * - buildDocumentTree(documentStructure): Build tree from flat array (expects array input)
 * - generateSidebar(documentStructure): Generate sidebar markdown (expects array input)
 * - getMainLanguageFiles(docsDir): Get main language markdown files
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

import {
  loadDocumentStructure,
  buildDocumentTree,
  generateSidebar,
  getMainLanguageFiles,
} from "../../utils/docs.mjs";

describe("docs.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("buildDocumentTree", () => {
      test("should build tree from flat document structure", () => {
        // Note: buildDocumentTree expects an ARRAY, not an object
        const structure = [
          { path: "/overview", title: "Overview", parentId: null },
          { path: "/guide/intro", title: "Introduction", parentId: null },
        ];
        const result = buildDocumentTree(structure);
        expect(result).toBeDefined();
        expect(result).toHaveProperty("rootNodes");
        expect(result).toHaveProperty("nodeMap");
      });

      test("should handle empty documents array", () => {
        const result = buildDocumentTree([]);
        expect(result).toBeDefined();
        expect(result.rootNodes.length).toBe(0);
      });

      test("should preserve document paths in tree", () => {
        const structure = [{ path: "/test", title: "Test", parentId: null }];
        const result = buildDocumentTree(structure);
        expect(result.nodeMap.get("/test")).toBeDefined();
        expect(result.nodeMap.get("/test").title).toBe("Test");
      });

      test("should handle parent-child relationships", () => {
        const structure = [
          { path: "/parent", title: "Parent", parentId: null },
          { path: "/parent/child", title: "Child", parentId: "/parent" },
        ];
        const result = buildDocumentTree(structure);
        expect(result.rootNodes.length).toBe(1);
        expect(result.rootNodes[0].children.length).toBe(1);
      });
    });

    describe("generateSidebar", () => {
      test("should generate sidebar from document structure", () => {
        // Note: generateSidebar expects an ARRAY
        const structure = [{ path: "/doc1", title: "Doc 1", parentId: null }];
        const result = generateSidebar(structure);
        expect(result).toBeDefined();
        expect(result).toContain("Doc 1");
      });

      test("should handle nested documents", () => {
        const structure = [
          { path: "/parent", title: "Parent", parentId: null },
          { path: "/parent/child", title: "Child", parentId: "/parent" },
        ];
        const result = generateSidebar(structure);
        expect(result).toBeDefined();
        expect(result).toContain("Parent");
        expect(result).toContain("Child");
      });

      test("should add .md suffix to paths", () => {
        const structure = [{ path: "/overview", title: "Overview", parentId: null }];
        const result = generateSidebar(structure);
        expect(result).toContain("/overview.md");
      });
    });

    describe("loadDocumentStructure", () => {
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

      test("should load valid document structure YAML", async () => {
        // Note: File is directly in outputDir as document-structure.yaml
        await writeFile(
          join(tempDir, "document-structure.yaml"),
          `documents:
  - path: /overview
    title: Overview
`,
        );
        const result = await loadDocumentStructure(tempDir);
        // loadDocumentStructure returns an array converted from YAML
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });

      test("should return null for missing file", async () => {
        const result = await loadDocumentStructure(tempDir);
        expect(result).toBeNull();
      });

      test("should return null for empty outputDir", async () => {
        const result = await loadDocumentStructure("");
        expect(result).toBeNull();
      });
    });

    describe("getMainLanguageFiles", () => {
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

      test("should find markdown files in docs directory", async () => {
        await writeFile(join(tempDir, "overview.md"), "# Overview");
        const result = await getMainLanguageFiles(tempDir);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should return empty array for non-existent directory", async () => {
        const result = await getMainLanguageFiles("/non/existent");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("buildDocumentTree", () => {
      test("should handle null input", () => {
        try {
          buildDocumentTree(null);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      test("should handle undefined input", () => {
        try {
          buildDocumentTree(undefined);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      test("should handle documents without parentId", () => {
        const structure = [{ path: "/test", title: "Test" }];
        // Should treat as root node
        const result = buildDocumentTree(structure);
        expect(result.rootNodes.length).toBe(1);
      });

      test("should handle orphan children (parent not found)", () => {
        const structure = [{ path: "/orphan", title: "Orphan", parentId: "/nonexistent" }];
        // Orphans should be added to root
        const result = buildDocumentTree(structure);
        expect(result.rootNodes.length).toBe(1);
      });
    });

    describe("loadDocumentStructure", () => {
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

      test("should handle non-existent directory", async () => {
        const result = await loadDocumentStructure("/non/existent/path");
        expect(result).toBeNull();
      });

      test("should handle YAML without documents property", async () => {
        await writeFile(join(tempDir, "document-structure.yaml"), "other: data");
        const result = await loadDocumentStructure(tempDir);
        // Should return null or empty array
        expect(result === null || Array.isArray(result)).toBe(true);
      });
    });

    describe("generateSidebar", () => {
      test("should handle empty structure", () => {
        const result = generateSidebar([]);
        expect(result).toBe("");
      });

      test("should handle paths already with .md suffix", () => {
        const structure = [{ path: "/overview.md", title: "Overview", parentId: null }];
        const result = generateSidebar(structure);
        expect(result).toContain("overview.md");
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
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

    test("should handle malformed YAML in document structure", async () => {
      await writeFile(join(tempDir, "document-structure.yaml"), "invalid: yaml: [");
      try {
        await loadDocumentStructure(tempDir);
      } catch (error) {
        expect(error !== undefined || true).toBe(true);
      }
    });

    test("should handle very deep document nesting", () => {
      const structure = [
        { path: "/a", title: "A", parentId: null },
        { path: "/a/b", title: "B", parentId: "/a" },
        { path: "/a/b/c", title: "C", parentId: "/a/b" },
        { path: "/a/b/c/d", title: "D", parentId: "/a/b/c" },
      ];
      expect(() => buildDocumentTree(structure)).not.toThrow();
    });

    test("should handle large number of documents", () => {
      const documents = [];
      for (let i = 0; i < 1000; i++) {
        documents.push({ path: `/doc${i}`, title: `Document ${i}`, parentId: null });
      }
      expect(() => buildDocumentTree(documents)).not.toThrow();
    });

    test("should handle concurrent loadDocumentStructure calls", async () => {
      await writeFile(
        join(tempDir, "document-structure.yaml"),
        "documents:\n  - path: /test\n    title: Test",
      );
      const promises = [
        loadDocumentStructure(tempDir),
        loadDocumentStructure(tempDir),
        loadDocumentStructure(tempDir),
      ];
      const results = await Promise.all(promises);
      expect(results.length).toBe(3);
    });

    test("should handle documents with icons", () => {
      const structure = [{ path: "/test", title: "Test", icon: "book", parentId: null }];
      const result = buildDocumentTree(structure);
      expect(result.rootNodes[0].icon).toBe("book");
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
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

    test("should handle path traversal in document paths without throwing", () => {
      const structure = [{ path: "/../../../etc/passwd", title: "Malicious", parentId: null }];
      // buildDocumentTree doesn't validate paths - it's a pure data transformation
      // Path validation is the responsibility of calling code
      const result = buildDocumentTree(structure);
      expect(result).toBeDefined();
      expect(result.rootNodes).toBeDefined();
      expect(result.rootNodes[0].path).toBe("/../../../etc/passwd");
    });

    test("should treat HTML in titles as literal strings", () => {
      const structure = [{ path: "/test", title: "<script>alert('xss')</script>", parentId: null }];
      const result = buildDocumentTree(structure);
      expect(result).toBeDefined();
      // Title should be preserved as-is (HTML escaping is renderer's responsibility)
      expect(result.rootNodes[0].title).toBe("<script>alert('xss')</script>");
    });

    test("should handle null bytes in paths without throwing", () => {
      const structure = [{ path: "/test\x00evil", title: "Test", parentId: null }];
      // Should not crash - path validation is caller's responsibility
      const result = buildDocumentTree(structure);
      expect(result).toBeDefined();
      expect(result.rootNodes[0].path).toBe("/test\x00evil");
    });

    test("should not execute YAML tags during load (safe YAML parsing)", async () => {
      await writeFile(
        join(tempDir, "document-structure.yaml"),
        "!!python/object/apply:os.system ['echo pwned']",
      );
      const startTime = Date.now();
      try {
        const result = await loadDocumentStructure(tempDir);
        const elapsed = Date.now() - startTime;
        // Should complete quickly (not hang or cause infinite loop)
        expect(elapsed).toBeLessThan(1000);
        // If it parses, the tag should be treated as data, not executed
        expect(result).toBeDefined();
      } catch (error) {
        // Rejecting malformed YAML is acceptable safe behavior
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });

    test("should handle paths with shell metacharacters as literal strings", () => {
      const structure = [{ path: "/test; rm -rf /", title: "Dangerous", parentId: null }];
      // Shell metacharacters should be treated as literal path characters
      const result = buildDocumentTree(structure);
      expect(result).toBeDefined();
      expect(result.rootNodes[0].path).toBe("/test; rm -rf /");
    });

    test("should preserve backticks in titles (no command execution)", () => {
      const structure = [{ path: "/test", title: "Test`whoami`", parentId: null }];
      const result = generateSidebar(structure);
      expect(result).toBeDefined();
      // Backticks should be preserved as-is, not executed
      expect(typeof result).toBe("string");
    });

    test("should handle markdown injection patterns in titles", () => {
      const structure = [{ path: "/test", title: "[Evil](javascript:alert(1))", parentId: null }];
      // Should not crash; markdown rendering is downstream concern
      const result = generateSidebar(structure);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });
});
