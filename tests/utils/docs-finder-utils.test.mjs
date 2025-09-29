import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  addFeedbackToItems,
  fileNameToFlatPath,
  findItemByFlatName,
  findItemByPath,
  getActionText,
  getMainLanguageFiles,
  processSelectedFiles,
  readFileContent,
} from "../../utils/docs-finder-utils.mjs";

describe("docs-finder-utils", () => {
  let readdirSpy;
  let readFileSpy;
  let accessSpy;
  let joinSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    // Mock file system operations
    readdirSpy = spyOn(fs, "readdir").mockResolvedValue([]);
    readFileSpy = spyOn(fs, "readFile").mockResolvedValue("test content");
    accessSpy = spyOn(fs, "access").mockResolvedValue(undefined);
    joinSpy = spyOn(path, "join").mockImplementation((...paths) => paths.join("/"));

    // Mock console methods
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    readdirSpy?.mockRestore();
    readFileSpy?.mockRestore();
    accessSpy?.mockRestore();
    joinSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
  });

  // UTILITY FUNCTIONS TESTS
  describe("getActionText", () => {
    test("should return 'update' action for non-translate", () => {
      const result = getActionText(false, "Please {action} the docs");
      expect(result).toBe("Please update the docs");
    });

    test("should return 'translate' action for translate", () => {
      const result = getActionText(true, "Please {action} the docs");
      expect(result).toBe("Please translate the docs");
    });

    test("should handle multiple action placeholders", () => {
      const result = getActionText(false, "{action} docs, then {action} more");
      expect(result).toBe("update docs, then {action} more");
    });

    test("should handle text without action placeholder", () => {
      const result = getActionText(true, "No placeholders here");
      expect(result).toBe("No placeholders here");
    });

    test("should handle empty text", () => {
      const result = getActionText(false, "");
      expect(result).toBe("");
    });
  });

  describe("fileNameToFlatPath", () => {
    test("should remove .md extension", () => {
      const result = fileNameToFlatPath("overview.md");
      expect(result).toBe("overview");
    });

    test("should remove language suffix and .md extension", () => {
      const result = fileNameToFlatPath("overview.zh.md");
      expect(result).toBe("overview");
    });

    test("should remove complex language suffix", () => {
      const result = fileNameToFlatPath("overview.zh-CN.md");
      expect(result).toBe("overview");
    });

    test("should handle files without language suffix", () => {
      const result = fileNameToFlatPath("getting-started.md");
      expect(result).toBe("getting-started");
    });

    test("should handle multiple dots in filename", () => {
      const result = fileNameToFlatPath("api.v1.guide.fr.md");
      expect(result).toBe("api.v1.guide");
    });

    test("should handle files without .md extension", () => {
      const result = fileNameToFlatPath("overview");
      expect(result).toBe("overview");
    });
  });

  describe("findItemByFlatName", () => {
    const documentStructure = [
      { path: "/getting-started", title: "Getting Started" },
      { path: "/api/overview", title: "API Overview" },
      { path: "/guides/advanced", title: "Advanced Guide" },
    ];

    test("should find item by exact flat name match", () => {
      const result = findItemByFlatName(documentStructure, "getting-started");
      expect(result).toEqual({ path: "/getting-started", title: "Getting Started" });
    });

    test("should find item with nested path", () => {
      const result = findItemByFlatName(documentStructure, "api-overview");
      expect(result).toEqual({ path: "/api/overview", title: "API Overview" });
    });

    test("should find item with deep nested path", () => {
      const result = findItemByFlatName(documentStructure, "guides-advanced");
      expect(result).toEqual({ path: "/guides/advanced", title: "Advanced Guide" });
    });

    test("should return undefined for non-existent item", () => {
      const result = findItemByFlatName(documentStructure, "non-existent");
      expect(result).toBeUndefined();
    });

    test("should handle empty document structure", () => {
      const result = findItemByFlatName([], "any-name");
      expect(result).toBeUndefined();
    });
  });

  describe("addFeedbackToItems", () => {
    const items = [
      { path: "/guide1", title: "Guide 1" },
      { path: "/guide2", title: "Guide 2" },
    ];

    test("should add feedback to all items", () => {
      const result = addFeedbackToItems(items, "Please improve");
      expect(result).toEqual([
        { path: "/guide1", title: "Guide 1", feedback: "Please improve" },
        { path: "/guide2", title: "Guide 2", feedback: "Please improve" },
      ]);
    });

    test("should trim feedback text", () => {
      const result = addFeedbackToItems(items, "  Please improve  ");
      expect(result).toEqual([
        { path: "/guide1", title: "Guide 1", feedback: "Please improve" },
        { path: "/guide2", title: "Guide 2", feedback: "Please improve" },
      ]);
    });

    test("should return original items for empty feedback", () => {
      const result = addFeedbackToItems(items, "");
      expect(result).toEqual(items);
    });

    test("should return original items for whitespace-only feedback", () => {
      const result = addFeedbackToItems(items, "   ");
      expect(result).toEqual(items);
    });

    test("should return original items for null feedback", () => {
      const result = addFeedbackToItems(items, null);
      expect(result).toEqual(items);
    });

    test("should return original items for undefined feedback", () => {
      const result = addFeedbackToItems(items, undefined);
      expect(result).toEqual(items);
    });

    test("should handle empty items array", () => {
      const result = addFeedbackToItems([], "feedback");
      expect(result).toEqual([]);
    });
  });

  // FILE OPERATIONS TESTS
  describe("readFileContent", () => {
    test("should read file content successfully", async () => {
      readFileSpy.mockResolvedValue("file content");

      const result = await readFileContent("/docs", "test.md");

      expect(result).toBe("file content");
      expect(joinSpy).toHaveBeenCalledWith("/docs", "test.md");
      expect(readFileSpy).toHaveBeenCalledWith("/docs/test.md", "utf-8");
    });

    test("should return null and warn on read error", async () => {
      readFileSpy.mockRejectedValue(new Error("File not found"));

      const result = await readFileContent("/docs", "missing.md");

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️  Could not read content from missing.md:",
        "File not found",
      );
    });

    test("should handle different file paths", async () => {
      readFileSpy.mockResolvedValue("content");

      await readFileContent("/path/to/docs", "nested/file.md");

      expect(joinSpy).toHaveBeenCalledWith("/path/to/docs", "nested/file.md");
    });
  });

  describe("getMainLanguageFiles", () => {
    test("should filter English files correctly", async () => {
      readdirSpy.mockResolvedValue([
        "overview.md",
        "overview.zh.md",
        "guide.md",
        "guide.fr.md",
        "_sidebar.md",
        "README.txt",
      ]);

      const result = await getMainLanguageFiles("/docs", "en");

      expect(result).toEqual(["guide.md", "overview.md"]);
    });

    test("should filter non-English files correctly", async () => {
      readdirSpy.mockResolvedValue([
        "overview.md",
        "overview.zh.md",
        "guide.md",
        "guide.zh.md",
        "intro.fr.md",
        "_sidebar.md",
      ]);

      const result = await getMainLanguageFiles("/docs", "zh");

      expect(result).toEqual(["guide.zh.md", "overview.zh.md"]);
    });

    test("should sort files by document structure order", async () => {
      readdirSpy.mockResolvedValue(["guide.md", "overview.md", "advanced.md"]);

      const documentStructure = [{ path: "/overview" }, { path: "/guide" }, { path: "/advanced" }];

      const result = await getMainLanguageFiles("/docs", "en", documentStructure);

      expect(result).toEqual(["overview.md", "guide.md", "advanced.md"]);
    });

    test("should handle files not in document structure", async () => {
      readdirSpy.mockResolvedValue(["guide.md", "extra.md", "overview.md"]);

      const documentStructure = [{ path: "/overview" }, { path: "/guide" }];

      const result = await getMainLanguageFiles("/docs", "en", documentStructure);

      expect(result).toEqual(["overview.md", "guide.md", "extra.md"]);
    });

    test("should handle complex language suffixes", async () => {
      readdirSpy.mockResolvedValue(["overview.zh-CN.md", "guide.zh-TW.md", "intro.zh.md"]);

      const result = await getMainLanguageFiles("/docs", "zh");

      expect(result).toEqual(["intro.zh.md"]);
    });

    test("should exclude _sidebar.md files", async () => {
      readdirSpy.mockResolvedValue(["_sidebar.md", "_sidebar.zh.md", "overview.md"]);

      const result = await getMainLanguageFiles("/docs", "en");

      expect(result).toEqual(["overview.md"]);
    });
  });

  // COMPLEX ITEM FINDING TESTS
  describe("findItemByPath", () => {
    const documentStructure = [
      { path: "/getting-started", title: "Getting Started", description: "Intro" },
      { path: "/api/overview", title: "API Overview", category: "API" },
      { path: "/guides/advanced", title: "Advanced Guide", tags: ["advanced"] },
    ];

    test("should find item by direct path match", async () => {
      const result = await findItemByPath(documentStructure, "/getting-started", null, null);

      expect(result).toEqual({
        path: "/getting-started",
        title: "Getting Started",
        description: "Intro",
      });
    });

    test("should find item by .md filename", async () => {
      readFileSpy.mockResolvedValue("file content");

      const result = await findItemByPath(
        documentStructure,
        "api-overview.md",
        null,
        "/docs",
        "en",
      );

      expect(result).toEqual({
        path: "/api/overview",
        title: "API Overview",
        category: "API",
        content: "file content",
      });
      expect(readFileSpy).toHaveBeenCalledWith("/docs/api-overview.md", "utf-8");
    });

    test("should find item by boardId-flattened format", async () => {
      const result = await findItemByPath(
        documentStructure,
        "board123-guides-advanced",
        "board123",
        null,
      );

      expect(result).toEqual({
        path: "/guides/advanced",
        title: "Advanced Guide",
        tags: ["advanced"],
      });
    });

    test("should handle non-English locale for filename generation", async () => {
      readFileSpy.mockResolvedValue("Chinese content");

      const result = await findItemByPath(
        documentStructure,
        "/getting-started",
        null,
        "/docs",
        "zh",
      );

      expect(result).toEqual({
        path: "/getting-started",
        title: "Getting Started",
        description: "Intro",
        content: "Chinese content",
      });
      expect(readFileSpy).toHaveBeenCalledWith("/docs/getting-started.zh.md", "utf-8");
    });

    test("should return null for non-existent path", async () => {
      const result = await findItemByPath(documentStructure, "/non-existent", null, null);
      expect(result).toBeNull();
    });

    test("should return null for invalid boardId format", async () => {
      const result = await findItemByPath(documentStructure, "invalid-format", "board123", null);
      expect(result).toBeNull();
    });

    test("should handle file read errors gracefully", async () => {
      readFileSpy.mockRejectedValue(new Error("File not found"));

      const result = await findItemByPath(documentStructure, "/getting-started", null, "/docs");

      expect(result).toEqual({
        path: "/getting-started",
        title: "Getting Started",
        description: "Intro",
      });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    test("should not read content when docsDir is not provided", async () => {
      const result = await findItemByPath(documentStructure, "/getting-started", null, null);

      expect(result).toEqual({
        path: "/getting-started",
        title: "Getting Started",
        description: "Intro",
      });
      expect(readFileSpy).not.toHaveBeenCalled();
    });

    test("should handle .md filename with language suffix", async () => {
      readFileSpy.mockResolvedValue("localized content");

      const result = await findItemByPath(
        documentStructure,
        "getting-started.zh.md",
        null,
        "/docs",
      );

      expect(result).toEqual({
        path: "/getting-started",
        title: "Getting Started",
        description: "Intro",
        content: "localized content",
      });
    });

    test("should handle boardId with special characters", async () => {
      const specialStructure = [{ path: "/test-guide", title: "Test Guide" }];

      const result = await findItemByPath(
        specialStructure,
        "special-board_123-test-guide",
        "special-board_123",
        null,
      );

      expect(result).toEqual({
        path: "/test-guide",
        title: "Test Guide",
      });
    });
  });

  describe("processSelectedFiles", () => {
    const documentStructure = [
      { path: "/overview", title: "Overview" },
      { path: "/api/guide", title: "API Guide" },
      { path: "/advanced", title: "Advanced" },
    ];

    test("should process selected files successfully", async () => {
      readFileSpy
        .mockResolvedValueOnce("overview content")
        .mockResolvedValueOnce("api guide content");

      const selectedFiles = ["overview.md", "api-guide.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([
        {
          path: "/overview",
          title: "Overview",
          content: "overview content",
        },
        {
          path: "/api/guide",
          title: "API Guide",
          content: "api guide content",
        },
      ]);
    });

    test("should handle files with language suffixes", async () => {
      readFileSpy.mockResolvedValue("localized content");

      const selectedFiles = ["overview.zh.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([
        {
          path: "/overview",
          title: "Overview",
          content: "localized content",
        },
      ]);
    });

    test("should handle files without content", async () => {
      readFileSpy.mockResolvedValue(null);

      const selectedFiles = ["overview.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([
        {
          path: "/overview",
          title: "Overview",
        },
      ]);
    });

    test("should warn for files not in document structure", async () => {
      readFileSpy.mockResolvedValue("content");

      const selectedFiles = ["unknown.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️  No document structure item found for file: unknown.md",
      );
    });

    test("should handle mixed valid and invalid files", async () => {
      readFileSpy
        .mockResolvedValueOnce("overview content")
        .mockResolvedValueOnce("unknown content");

      const selectedFiles = ["overview.md", "unknown.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([
        {
          path: "/overview",
          title: "Overview",
          content: "overview content",
        },
      ]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️  No document structure item found for file: unknown.md",
      );
    });

    test("should handle empty selected files array", async () => {
      const result = await processSelectedFiles([], documentStructure, "/docs");
      expect(result).toEqual([]);
    });

    test("should handle file read errors", async () => {
      readFileSpy.mockRejectedValue(new Error("Read error"));

      const selectedFiles = ["overview.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([
        {
          path: "/overview",
          title: "Overview",
        },
      ]);
    });

    test("should preserve item properties", async () => {
      const complexStructure = [
        {
          path: "/overview",
          title: "Overview",
          description: "Main overview",
          category: "intro",
          tags: ["getting-started"],
          order: 1,
        },
      ];

      readFileSpy.mockResolvedValue("content");

      const selectedFiles = ["overview.md"];
      const result = await processSelectedFiles(selectedFiles, complexStructure, "/docs");

      expect(result).toEqual([
        {
          path: "/overview",
          title: "Overview",
          description: "Main overview",
          category: "intro",
          tags: ["getting-started"],
          order: 1,
          content: "content",
        },
      ]);
    });
  });

  // EDGE CASES AND ERROR HANDLING
  describe("edge cases", () => {
    test("getActionText should handle case-sensitive action placeholder", () => {
      const result = getActionText(true, "Please {ACTION} or {action} the docs");
      expect(result).toBe("Please {ACTION} or translate the docs");
    });

    test("fileNameToFlatPath should handle edge case filenames", () => {
      expect(fileNameToFlatPath("")).toBe("");
      expect(fileNameToFlatPath("file.with.many.dots.md")).toBe("file.with.many"); // removes last .dots as language suffix
      expect(fileNameToFlatPath("file-without-extension")).toBe("file-without-extension");
      expect(fileNameToFlatPath(".hidden.md")).toBe(""); // .hidden is treated as language suffix and removed
    });

    test("findItemByFlatName should handle paths with leading/trailing slashes", () => {
      const documentStructure = [
        { path: "no-leading-slash", title: "No Leading" },
        { path: "/normal-path", title: "Normal" },
        { path: "/trailing-slash/", title: "Trailing" },
      ];

      const result1 = findItemByFlatName(documentStructure, "no-leading-slash");
      const result2 = findItemByFlatName(documentStructure, "normal-path");
      const result3 = findItemByFlatName(documentStructure, "trailing-slash");

      expect(result1).toEqual({ path: "no-leading-slash", title: "No Leading" });
      expect(result2).toEqual({ path: "/normal-path", title: "Normal" });
      expect(result3).toBeUndefined(); // trailing slash breaks the flattening
    });

    test("addFeedbackToItems should handle items with existing feedback", () => {
      const itemsWithFeedback = [{ path: "/guide", title: "Guide", feedback: "Old feedback" }];

      const result = addFeedbackToItems(itemsWithFeedback, "New feedback");

      expect(result).toEqual([{ path: "/guide", title: "Guide", feedback: "New feedback" }]);
    });

    test("getMainLanguageFiles should handle empty directory", async () => {
      readdirSpy.mockResolvedValue([]);

      const result = await getMainLanguageFiles("/empty", "en");

      expect(result).toEqual([]);
    });

    test("getMainLanguageFiles should handle readdir errors", async () => {
      accessSpy.mockResolvedValue(undefined); // Directory exists
      readdirSpy.mockRejectedValue(new Error("Permission denied"));

      await expect(getMainLanguageFiles("/denied", "en")).rejects.toThrow("Permission denied");
    });

    test("processSelectedFiles should handle empty document structure", async () => {
      readFileSpy.mockResolvedValue("content");

      const result = await processSelectedFiles(["test.md"], [], "/docs");

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️  No document structure item found for file: test.md",
      );
    });
  });
});
