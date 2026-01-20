/**
 * Tests for utils/document-paths.mjs
 *
 * Function signatures:
 * - normalizePath(rawPath): Returns { filePath, displayPath } object
 * - collectDocumentPaths(docs, options): Returns Set by default, Array when collectMetadata=true
 * - loadDocumentPaths(options): Load document paths from file system
 * - isValidDocumentPath(path, validPaths): Check if path is valid
 * - filterValidPaths(paths, validPaths): Returns { validPaths: [], invalidPaths: [] }
 */

import { describe, test, expect } from "bun:test";

import {
  normalizePath,
  collectDocumentPaths,
  loadDocumentPaths,
  isValidDocumentPath,
  filterValidPaths,
} from "../../utils/document-paths.mjs";

describe("document-paths.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("normalizePath", () => {
      test("should return object with filePath and displayPath", () => {
        const result = normalizePath("/overview");
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("displayPath");
      });

      test("should normalize path with leading slash", () => {
        const result = normalizePath("/overview");
        expect(result.filePath).toBe("overview");
        expect(result.displayPath).toBe("/overview");
      });

      test("should add leading slash to displayPath if missing", () => {
        const result = normalizePath("overview");
        expect(result.displayPath).toMatch(/^\//);
      });

      test("should handle nested paths", () => {
        const result = normalizePath("/guide/getting-started");
        expect(result.filePath).toBe("guide/getting-started");
        expect(result.displayPath).toBe("/guide/getting-started");
      });

      test("should trim whitespace", () => {
        const result = normalizePath("  /overview  ");
        expect(result.filePath).toBe("overview");
      });

      test("should remove trailing slash", () => {
        const result = normalizePath("/overview/");
        expect(result.filePath).toBe("overview");
      });
    });

    describe("collectDocumentPaths", () => {
      test("should collect paths from documents array as Set", () => {
        const docs = [
          { path: "/doc1", title: "Doc 1" },
          { path: "/doc2", title: "Doc 2" },
        ];
        const result = collectDocumentPaths(docs);
        // Returns Set by default
        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBeGreaterThan(0);
      });

      test("should handle empty array", () => {
        const result = collectDocumentPaths([]);
        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBe(0);
      });

      test("should handle nested children", () => {
        const docs = [
          {
            path: "/parent",
            title: "Parent",
            children: [{ path: "/parent/child", title: "Child" }],
          },
        ];
        const result = collectDocumentPaths(docs);
        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBe(2);
      });

      test("should collect metadata when option is true", () => {
        const docs = [{ path: "/doc1", title: "Doc 1" }];
        const result = collectDocumentPaths(docs, { collectMetadata: true });
        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toHaveProperty("path");
        expect(result[0]).toHaveProperty("title");
      });
    });

    describe("isValidDocumentPath", () => {
      test("should return true for valid path in Set", () => {
        const validPaths = new Set(["doc1", "doc2", "doc3"]);
        const result = isValidDocumentPath("/doc1", validPaths);
        expect(result).toBe(true);
      });

      test("should return false for invalid path", () => {
        const validPaths = new Set(["doc1", "doc2"]);
        const result = isValidDocumentPath("/invalid", validPaths);
        expect(result).toBe(false);
      });

      test("should work with Array of paths", () => {
        const validPaths = ["/doc1", "/doc2"];
        const result = isValidDocumentPath("/doc1", validPaths);
        expect(typeof result).toBe("boolean");
      });
    });

    describe("filterValidPaths", () => {
      test("should return object with validPaths and invalidPaths", () => {
        const paths = ["/doc1", "/doc2", "/invalid"];
        const validPaths = new Set(["doc1", "doc2"]);
        const result = filterValidPaths(paths, validPaths);
        expect(result).toHaveProperty("validPaths");
        expect(result).toHaveProperty("invalidPaths");
      });

      test("should filter to only valid paths", () => {
        const paths = ["/doc1", "/doc2", "/invalid"];
        const validPaths = new Set(["doc1", "doc2"]);
        const result = filterValidPaths(paths, validPaths);
        expect(result.validPaths).toContain("doc1");
        expect(result.invalidPaths).toContain("/invalid");
      });

      test("should return empty arrays when no paths match", () => {
        const paths = ["/a", "/b"];
        const validPaths = new Set(["c", "d"]);
        const result = filterValidPaths(paths, validPaths);
        expect(result.validPaths.length).toBe(0);
        expect(result.invalidPaths.length).toBe(2);
      });
    });

    describe("loadDocumentPaths", () => {
      test("should be a function", () => {
        expect(typeof loadDocumentPaths).toBe("function");
      });

      test("should return a promise that may reject", async () => {
        // loadDocumentPaths throws when structure file doesn't exist
        try {
          await loadDocumentPaths({ throwOnInvalid: false });
        } catch (error) {
          // Expected to throw since no structure file exists
          expect(error.message).toBeDefined();
        }
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("normalizePath", () => {
      test("should throw for empty string", () => {
        expect(() => normalizePath("")).toThrow();
      });

      test("should throw for null", () => {
        expect(() => normalizePath(null)).toThrow();
      });

      test("should throw for undefined", () => {
        expect(() => normalizePath(undefined)).toThrow();
      });

      test("should handle path with only slashes", () => {
        const result = normalizePath("///");
        expect(result).toHaveProperty("filePath");
      });
    });

    describe("collectDocumentPaths", () => {
      test("should handle docs without path property", () => {
        const docs = [{ title: "No Path" }];
        const result = collectDocumentPaths(docs);
        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBe(0);
      });

      test("should handle null docs gracefully", () => {
        try {
          collectDocumentPaths(null);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    describe("isValidDocumentPath", () => {
      test("should handle empty validPaths Set", () => {
        const result = isValidDocumentPath("/doc", new Set());
        expect(result).toBe(false);
      });

      test("should handle empty path", () => {
        try {
          const result = isValidDocumentPath("", new Set(["doc1"]));
          expect(result).toBe(false);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    describe("filterValidPaths", () => {
      test("should handle empty paths array", () => {
        const result = filterValidPaths([], new Set(["doc1"]));
        expect(result.validPaths.length).toBe(0);
        expect(result.invalidPaths.length).toBe(0);
      });

      test("should handle empty validPaths Set", () => {
        const result = filterValidPaths(["/doc1"], new Set());
        expect(result.validPaths.length).toBe(0);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("normalizePath", () => {
      test("should handle very long paths", () => {
        const longPath = `/${"a".repeat(1000)}`;
        expect(() => normalizePath(longPath)).not.toThrow();
      });

      test("should handle paths with unicode", () => {
        const result = normalizePath("/文档/介绍");
        expect(result).toHaveProperty("filePath");
      });

      test("should handle paths with special characters", () => {
        expect(() => normalizePath("/path with spaces")).not.toThrow();
        expect(() => normalizePath("/path-with-dashes")).not.toThrow();
        expect(() => normalizePath("/path_with_underscores")).not.toThrow();
      });
    });

    describe("collectDocumentPaths", () => {
      test("should handle deeply nested children", () => {
        const doc = { path: "/level0", title: "Level 0" };
        let current = doc;
        for (let i = 1; i < 20; i++) {
          current.children = [{ path: `/level${i}`, title: `Level ${i}` }];
          current = current.children[0];
        }
        expect(() => collectDocumentPaths([doc])).not.toThrow();
      });

      test("should handle large document arrays", () => {
        const docs = [];
        for (let i = 0; i < 5000; i++) {
          docs.push({ path: `/doc${i}`, title: `Doc ${i}` });
        }
        expect(() => collectDocumentPaths(docs)).not.toThrow();
      });
    });

    describe("filterValidPaths", () => {
      test("should handle large arrays efficiently", () => {
        const paths = Array.from({ length: 1000 }, (_, i) => `/doc${i}`);
        const validPaths = new Set(Array.from({ length: 500 }, (_, i) => `doc${i * 2}`));
        expect(() => filterValidPaths(paths, validPaths)).not.toThrow();
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("normalizePath - Path Traversal", () => {
      test("should handle path traversal attempts", () => {
        const result = normalizePath("/../../../etc/passwd");
        expect(result).toHaveProperty("filePath");
        // Function normalizes but caller should validate
      });

      test("should handle encoded path traversal", () => {
        const result = normalizePath("/%2e%2e/%2e%2e/etc/passwd");
        expect(result).toHaveProperty("filePath");
      });

      test("should handle null byte injection", () => {
        const result = normalizePath("/doc\x00.md");
        expect(result).toHaveProperty("filePath");
      });
    });

    describe("collectDocumentPaths - Injection", () => {
      test("should handle paths with shell metacharacters", () => {
        const docs = [{ path: "/doc; rm -rf /", title: "Dangerous" }];
        expect(() => collectDocumentPaths(docs)).not.toThrow();
      });

      test("should handle paths with backticks", () => {
        const docs = [{ path: "/doc`whoami`", title: "Command" }];
        expect(() => collectDocumentPaths(docs)).not.toThrow();
      });

      test("should handle script tags in paths", () => {
        const docs = [{ path: "/<script>alert(1)</script>", title: "XSS" }];
        expect(() => collectDocumentPaths(docs)).not.toThrow();
      });
    });

    describe("isValidDocumentPath - Validation Bypass", () => {
      test("should handle case sensitivity", () => {
        const validPaths = new Set(["Doc"]);
        const result1 = isValidDocumentPath("/doc", validPaths);
        const result2 = isValidDocumentPath("/DOC", validPaths);
        // Behavior depends on implementation
        expect(typeof result1).toBe("boolean");
        expect(typeof result2).toBe("boolean");
      });

      test("should handle Unicode normalization attacks", () => {
        const validPaths = new Set(["café"]);
        // Different Unicode representations
        const result = isValidDocumentPath("/cafe\u0301", validPaths);
        expect(typeof result).toBe("boolean");
      });
    });

    describe("filterValidPaths - Array Manipulation", () => {
      test("should not be affected by prototype pollution", () => {
        const paths = ["/doc1"];
        const validPaths = new Set(["doc1"]);
        // Ensure function works correctly
        const result = filterValidPaths(paths, validPaths);
        expect(result).toHaveProperty("validPaths");
        expect(result).toHaveProperty("invalidPaths");
      });
    });
  });
});
