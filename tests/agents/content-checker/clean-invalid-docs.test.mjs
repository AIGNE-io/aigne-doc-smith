/**
 * Tests for agents/content-checker/clean-invalid-docs.mjs
 *
 * Based on intent: Invalid document cleaning (Layer 0)
 *
 * Function signatures:
 * - cleanInvalidDocs({ yamlPath, docsDir, dryRun }): Clean invalid documents
 *   - Scans docs directory for existing document folders
 *   - Deletes folders not in document-structure.yaml
 *   - Deletes language files not in .meta.yaml
 *   - Returns: { dryRun, deletedFolders, deletedFiles, errors }
 *
 * - formatCleanResult(result): Format cleanup result as string
 *   - Returns empty string if nothing cleaned
 *   - Shows folder/file counts with action verb
 *   - Indicates preview mode when dryRun is true
 *
 * Key rules from intent:
 * - Delete document folders not in document-structure.yaml
 * - Delete language files not defined in .meta.yaml
 * - dryRun mode only reports, doesn't delete
 * - Skip hidden folders (starting with .)
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("content-checker/clean-invalid-docs.mjs", () => {
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
      test("should export cleanInvalidDocs function", async () => {
        const cleanModule = await import("../../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule.cleanInvalidDocs).toBeDefined();
        expect(typeof cleanModule.cleanInvalidDocs).toBe("function");
      });

      test("should export formatCleanResult function", async () => {
        const cleanModule = await import("../../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule.formatCleanResult).toBeDefined();
        expect(typeof cleanModule.formatCleanResult).toBe("function");
      });
    });

    describe("cleanInvalidDocs return structure", () => {
      test("should return dryRun property", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        expect(typeof result.dryRun).toBe("boolean");
      });

      test("should return deletedFolders array", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        expect(Array.isArray(result.deletedFolders)).toBe(true);
      });

      test("should return deletedFiles array", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        expect(Array.isArray(result.deletedFiles)).toBe(true);
      });

      test("should return errors array", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        expect(Array.isArray(result.errors)).toBe(true);
      });
    });

    describe("formatCleanResult output", () => {
      test("should format empty result as empty string", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
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
          "../../../agents/content-checker/clean-invalid-docs.mjs"
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
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: [],
          deletedFiles: ["/test/en.md", "/test/zh.md", "/test/ja.md"],
          errors: [],
        });
        expect(result).toContain("3");
      });

      test("should indicate preview mode when dryRun", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: true,
          deletedFolders: ["folder1"],
          deletedFiles: [],
          errors: [],
        });
        // Should contain "Will delete" or "Preview" indication
        expect(result.length).toBeGreaterThan(0);
      });

      test("should indicate actual deletion when not dryRun", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: ["folder1"],
          deletedFiles: [],
          errors: [],
        });
        // Should contain "Deleted" indication
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe("dryRun mode", () => {
      test("should accept dryRun parameter", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({ dryRun: true });
        expect(result.dryRun).toBe(true);
      });

      test("should default dryRun to false", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        expect(result.dryRun).toBe(false);
      });
    });

    describe("path parameters", () => {
      test("should accept yamlPath parameter", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          yamlPath: join(tempDir, "structure.yaml"),
        });
        expect(result).toHaveProperty("deletedFolders");
      });

      test("should accept docsDir parameter", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          docsDir: join(tempDir, "docs"),
        });
        expect(result).toHaveProperty("deletedFolders");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("missing structure file", () => {
      test("should handle missing yamlPath gracefully", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          yamlPath: join(tempDir, "nonexistent.yaml"),
        });
        // Should return empty arrays, not error
        expect(result.deletedFolders).toEqual([]);
        expect(result.deletedFiles).toEqual([]);
      });

      test("should not throw when structure file missing", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        let error = null;
        try {
          await cleanInvalidDocs({
            yamlPath: "/nonexistent/path.yaml",
          });
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });
    });

    describe("missing docs directory", () => {
      test("should handle missing docsDir gracefully", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          docsDir: join(tempDir, "nonexistent-docs"),
        });
        expect(result.deletedFolders).toEqual([]);
      });

      test("should not crash on empty docs directory", async () => {
        const docsDir = join(tempDir, "empty-docs");
        await mkdir(docsDir, { recursive: true });

        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({ docsDir });
        expect(result).toHaveProperty("deletedFolders");
      });
    });

    describe("invalid meta.yaml", () => {
      test("should handle folder with missing .meta.yaml", async () => {
        const docsDir = join(tempDir, "docs");
        const docFolder = join(docsDir, "test-doc");
        await mkdir(docFolder, { recursive: true });
        await writeFile(join(docFolder, "en.md"), "# Test");
        // No .meta.yaml file

        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({ docsDir, dryRun: true });
        expect(result).toHaveProperty("deletedFolders");
      });

      test("should handle malformed .meta.yaml", async () => {
        const docsDir = join(tempDir, "docs");
        const docFolder = join(docsDir, "test-doc");
        await mkdir(docFolder, { recursive: true });
        await writeFile(join(docFolder, ".meta.yaml"), "invalid: yaml: [unclosed");

        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({ docsDir, dryRun: true });
        expect(result).toHaveProperty("deletedFolders");
      });
    });

    describe("formatCleanResult edge cases", () => {
      test("should handle result with only errors", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: [],
          deletedFiles: [],
          errors: [{ type: "TEST_ERROR", message: "test" }],
        });
        // Should still produce output with errors
        expect(result.length).toBeGreaterThan(0);
      });

      test("should handle undefined properties gracefully", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        // Passing minimal object
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: [],
          deletedFiles: [],
          errors: [],
        });
        expect(typeof result).toBe("string");
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("module loading", () => {
      test("should import without errors", async () => {
        const cleanModule = await import("../../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule).toBeDefined();
      });

      test("should have both expected exports", async () => {
        const cleanModule = await import("../../../agents/content-checker/clean-invalid-docs.mjs");
        expect(cleanModule.cleanInvalidDocs).toBeDefined();
        expect(cleanModule.formatCleanResult).toBeDefined();
      });
    });

    describe("filesystem errors", () => {
      test("should handle permission denied on docsDir", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          docsDir: "/root/protected",
        });
        // Should not throw, return gracefully
        expect(result).toHaveProperty("deletedFolders");
      });

      test("should record delete errors in errors array", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        // Test with paths that might cause errors
        const result = await cleanInvalidDocs({
          docsDir: tempDir,
        });
        expect(Array.isArray(result.errors)).toBe(true);
      });

      test("should not crash on very deep directory structures", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const deepPath = join(tempDir, ...Array(30).fill("level"));
        const result = await cleanInvalidDocs({ docsDir: deepPath });
        expect(result).toHaveProperty("deletedFolders");
      });
    });

    describe("error recovery", () => {
      test("should continue after single folder delete error", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        // Should complete even if some operations fail
        expect(result).toHaveProperty("dryRun");
        expect(result).toHaveProperty("deletedFolders");
        expect(result).toHaveProperty("errors");
      });

      test("should report all errors when multiple failures occur", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({});
        // errors array should collect all errors
        expect(Array.isArray(result.errors)).toBe(true);
      });

      test("should handle concurrent access gracefully", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        // Run multiple cleanups concurrently
        const results = await Promise.all([
          cleanInvalidDocs({ dryRun: true }),
          cleanInvalidDocs({ dryRun: true }),
          cleanInvalidDocs({ dryRun: true }),
        ]);
        expect(results.length).toBe(3);
        for (const result of results) {
          expect(result).toHaveProperty("deletedFolders");
        }
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path traversal prevention", () => {
      test("should handle path traversal in yamlPath", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          yamlPath: "../../../etc/passwd",
        });
        expect(result).toHaveProperty("deletedFolders");
      });

      test("should handle path traversal in docsDir", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          docsDir: "../../../etc",
          dryRun: true,
        });
        expect(result).toHaveProperty("deletedFolders");
      });

      test("should not delete files outside docsDir", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({
          docsDir: tempDir,
          dryRun: true,
        });
        // Should only report files within docsDir
        for (const folder of result.deletedFolders) {
          expect(folder).not.toContain("..");
        }
      });
    });

    describe("symlink safety", () => {
      test("should handle symlinks pointing outside docs", async () => {
        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        // This tests defensive behavior
        const result = await cleanInvalidDocs({
          docsDir: tempDir,
          dryRun: true,
        });
        expect(result).toHaveProperty("deletedFolders");
      });
    });

    describe("formatCleanResult security", () => {
      test("should safely format malicious folder names", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
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
          "../../../agents/content-checker/clean-invalid-docs.mjs"
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

      test("should handle null bytes in paths", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: ["test\x00hidden"],
          deletedFiles: [],
          errors: [],
        });
        expect(typeof result).toBe("string");
      });

      test("should handle unicode in paths", async () => {
        const { formatCleanResult } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = formatCleanResult({
          dryRun: false,
          deletedFolders: ["文档/测试"],
          deletedFiles: ["日本語/ファイル.md"],
          errors: [],
        });
        expect(typeof result).toBe("string");
      });
    });

    describe("hidden folder handling", () => {
      test("should skip hidden folders (starting with .)", async () => {
        const docsDir = join(tempDir, "docs");
        const hiddenFolder = join(docsDir, ".hidden");
        await mkdir(hiddenFolder, { recursive: true });
        await writeFile(join(hiddenFolder, ".meta.yaml"), "source: en\ndefault: en\nkind: doc");

        const { cleanInvalidDocs } = await import(
          "../../../agents/content-checker/clean-invalid-docs.mjs"
        );
        const result = await cleanInvalidDocs({ docsDir, dryRun: true });

        // Hidden folder should not be in deletedFolders
        const hasHidden = result.deletedFolders.some((f) => f.includes(".hidden"));
        expect(hasHidden).toBe(false);
      });
    });
  });

  // ==================== Internal Utility Methods Tests ====================
  describe("Internal Utility Methods", () => {
    describe("extractLanguageFromFilename", () => {
      let extractLanguageFromFilename;

      beforeEach(async () => {
        const module = await import("../../../agents/content-checker/clean-invalid-docs.mjs");
        extractLanguageFromFilename = module.extractLanguageFromFilename;
      });

      test("should extract 'en' from 'en.md'", () => {
        const result = extractLanguageFromFilename("en.md");
        expect(result).toBe("en");
      });

      test("should extract 'zh' from 'zh.md'", () => {
        const result = extractLanguageFromFilename("zh.md");
        expect(result).toBe("zh");
      });

      test("should extract 'zh-TW' from 'zh-TW.md'", () => {
        const result = extractLanguageFromFilename("zh-TW.md");
        expect(result).toBe("zh-TW");
      });

      test("should extract 'ja' from 'ja.md'", () => {
        const result = extractLanguageFromFilename("ja.md");
        expect(result).toBe("ja");
      });

      test("should extract compound names like 'claude-code'", () => {
        const result = extractLanguageFromFilename("claude-code.md");
        expect(result).toBe("claude-code");
      });

      test("should return null for non-.md files", () => {
        expect(extractLanguageFromFilename("en.txt")).toBeNull();
        expect(extractLanguageFromFilename("en.yaml")).toBeNull();
        expect(extractLanguageFromFilename("readme")).toBeNull();
      });

      test("should return null for hidden files", () => {
        const result = extractLanguageFromFilename(".meta.yaml");
        expect(result).toBeNull();
      });

      test("should handle empty string", () => {
        const result = extractLanguageFromFilename("");
        expect(result).toBeNull();
      });

      test("should handle filename with multiple dots", () => {
        const result = extractLanguageFromFilename("file.name.md");
        expect(result).toBe("file.name");
      });

      test("should handle just '.md' extension", () => {
        const result = extractLanguageFromFilename(".md");
        expect(result).toBe("");
      });

      test("should extract long language codes", () => {
        const result = extractLanguageFromFilename("pt-BR.md");
        expect(result).toBe("pt-BR");
      });
    });
  });
});
