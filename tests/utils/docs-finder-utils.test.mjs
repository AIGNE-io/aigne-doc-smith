import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  addFeedbackToItems,
  buildAllowedLinksFromStructure,
  buildChoicesFromTree,
  buildDocumentTree,
  fileNameToFlatPath,
  findItemByFlatName,
  findItemByPath,
  generateFileName,
  getActionText,
  getMainLanguageFiles,
  processSelectedFiles,
  readFileContent,
} from "../../utils/docs-finder-utils.mjs";
import * as fileUtils from "../../utils/file-utils.mjs";

describe("docs-finder-utils", () => {
  let readdirSpy;
  let readFileSpy;
  let accessSpy;
  let joinSpy;
  let consoleWarnSpy;
  let pathExistsSpy;

  beforeEach(() => {
    // Mock file system operations
    readdirSpy = spyOn(fs, "readdir").mockResolvedValue([]);
    readFileSpy = spyOn(fs, "readFile").mockResolvedValue("test content");
    accessSpy = spyOn(fs, "access").mockResolvedValue(undefined);
    joinSpy = spyOn(path, "join").mockImplementation((...paths) => paths.join("/"));
    pathExistsSpy = spyOn(fileUtils, "pathExists").mockResolvedValue(true);

    // Mock console methods
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    readdirSpy?.mockRestore();
    readFileSpy?.mockRestore();
    accessSpy?.mockRestore();
    joinSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
    pathExistsSpy?.mockRestore();
  });

  // UTILITY FUNCTIONS TESTS
  describe("getActionText", () => {
    test("should return 'update' action text", () => {
      const result = getActionText("Please {action} the docs", "update");
      expect(result).toBe("Please update the docs");
    });

    test("should return 'translate' action text", () => {
      const result = getActionText("Please {action} the docs", "translate");
      expect(result).toBe("Please translate the docs");
    });

    test("should handle multiple action placeholders", () => {
      const result = getActionText("{action} docs, then {action} more", "update");
      expect(result).toBe("update docs, then {action} more");
    });

    test("should handle text without action placeholder", () => {
      const result = getActionText("No placeholders here", "translate");
      expect(result).toBe("No placeholders here");
    });

    test("should handle empty text", () => {
      const result = getActionText("", "update");
      expect(result).toBe("");
    });

    test("should handle custom action", () => {
      const result = getActionText("Please {action} the docs", "clear");
      expect(result).toBe("Please clear the docs");
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

    test("should handle empty documentation structure", () => {
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

    test("should sort files by documentation structure order", async () => {
      readdirSpy.mockResolvedValue(["guide.md", "overview.md", "advanced.md"]);

      const documentStructure = [{ path: "/overview" }, { path: "/guide" }, { path: "/advanced" }];

      const result = await getMainLanguageFiles("/docs", "en", documentStructure);

      expect(result).toEqual(["overview.md", "guide.md", "advanced.md"]);
    });

    test("should handle files not in documentation structure", async () => {
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

    test("should warn for files not in documentation structure", async () => {
      readFileSpy.mockResolvedValue("content");

      const selectedFiles = ["unknown.md"];
      const result = await processSelectedFiles(selectedFiles, documentStructure, "/docs");

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️  No documentation structure item found for file: unknown.md",
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
        "⚠️  No documentation structure item found for file: unknown.md",
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

  // ALLOWED LINKS BUILDING TESTS
  describe("buildAllowedLinksFromStructure", () => {
    test("should build allowed links set with original and processed paths", () => {
      const documentStructure = [
        { path: "/getting-started", title: "Getting Started" },
        { path: "/api/overview", title: "API Overview" },
      ];

      const result = buildAllowedLinksFromStructure(documentStructure);

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(4); // 2 original + 2 processed
      expect(result.has("/getting-started")).toBe(true);
      expect(result.has("/api/overview")).toBe(true);
      expect(result.has("./getting-started.md")).toBe(true);
      expect(result.has("./api-overview.md")).toBe(true);
    });

    test("should handle paths starting with dot", () => {
      const documentStructure = [{ path: "./relative-path", title: "Relative" }];

      const result = buildAllowedLinksFromStructure(documentStructure);

      expect(result.size).toBe(2);
      expect(result.has("./relative-path")).toBe(true);
      expect(result.has("./relative-path.md")).toBe(true);
    });

    test("should handle paths without leading slash", () => {
      const documentStructure = [{ path: "no-slash-path", title: "No Slash" }];

      const result = buildAllowedLinksFromStructure(documentStructure);

      expect(result.size).toBe(2);
      expect(result.has("no-slash-path")).toBe(true);
      expect(result.has("./no-slash-path.md")).toBe(true);
    });

    test("should handle nested paths correctly", () => {
      const documentStructure = [
        { path: "/api/auth/oauth", title: "OAuth" },
        { path: "/guides/advanced/patterns", title: "Patterns" },
      ];

      const result = buildAllowedLinksFromStructure(documentStructure);

      expect(result.size).toBe(4);
      expect(result.has("/api/auth/oauth")).toBe(true);
      expect(result.has("./api-auth-oauth.md")).toBe(true);
      expect(result.has("/guides/advanced/patterns")).toBe(true);
      expect(result.has("./guides-advanced-patterns.md")).toBe(true);
    });

    test("should handle empty array", () => {
      const result = buildAllowedLinksFromStructure([]);

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    test("should handle non-array input", () => {
      const result = buildAllowedLinksFromStructure({ path: "/test" });

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    test("should skip items without path property", () => {
      const documentStructure = [
        { path: "/valid", title: "Valid" },
        { title: "No Path" },
        { path: "/another-valid", title: "Another Valid" },
        { path: null, title: "Null Path" },
        { path: undefined, title: "Undefined Path" },
      ];

      const result = buildAllowedLinksFromStructure(documentStructure);

      expect(result.size).toBe(4); // 2 valid items * 2 paths each
      expect(result.has("/valid")).toBe(true);
      expect(result.has("./valid.md")).toBe(true);
      expect(result.has("/another-valid")).toBe(true);
      expect(result.has("./another-valid.md")).toBe(true);
    });
  });

  // TREE STRUCTURE BUILDING TESTS
  describe("buildDocumentTree", () => {
    test("should build tree with single root node", () => {
      const documentStructure = [{ path: "/overview", title: "Overview", parentId: null }];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(1);
      expect(rootNodes[0].path).toBe("/overview");
      expect(rootNodes[0].title).toBe("Overview");
      expect(rootNodes[0].children).toEqual([]);
      expect(nodeMap.size).toBe(1);
      expect(nodeMap.get("/overview")).toBeDefined();
    });

    test("should build tree with multiple root nodes", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: null },
        { path: "/getting-started", title: "Getting Started", parentId: null },
        { path: "/api", title: "API", parentId: null },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(3);
      expect(rootNodes.map((n) => n.path)).toContain("/overview");
      expect(rootNodes.map((n) => n.path)).toContain("/getting-started");
      expect(rootNodes.map((n) => n.path)).toContain("/api");
      rootNodes.forEach((node) => {
        expect(node.children).toEqual([]);
      });
      expect(nodeMap.size).toBe(3);
    });

    test("should build tree with parent-child relationship", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: null },
        { path: "/api/guide", title: "API Guide", parentId: "/api" },
        { path: "/api", title: "API", parentId: null },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(2);
      const apiNode = rootNodes.find((n) => n.path === "/api");
      const overviewNode = rootNodes.find((n) => n.path === "/overview");

      expect(apiNode).toBeDefined();
      expect(apiNode.children).toHaveLength(1);
      expect(apiNode.children[0].path).toBe("/api/guide");
      expect(apiNode.children[0].title).toBe("API Guide");
      expect(overviewNode.children).toEqual([]);

      expect(nodeMap.size).toBe(3);
      expect(nodeMap.get("/api/guide").parentId).toBe("/api");
    });

    test("should build multi-level tree structure", () => {
      const documentStructure = [
        { path: "/guides", title: "Guides", parentId: null },
        { path: "/guides/basics", title: "Basics", parentId: "/guides" },
        { path: "/guides/basics/installation", title: "Installation", parentId: "/guides/basics" },
        { path: "/guides/advanced", title: "Advanced", parentId: "/guides" },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(1);
      const guidesNode = rootNodes[0];
      expect(guidesNode.path).toBe("/guides");
      expect(guidesNode.children).toHaveLength(2);

      const basicsNode = guidesNode.children.find((n) => n.path === "/guides/basics");
      expect(basicsNode).toBeDefined();
      expect(basicsNode.children).toHaveLength(1);
      expect(basicsNode.children[0].path).toBe("/guides/basics/installation");

      const advancedNode = guidesNode.children.find((n) => n.path === "/guides/advanced");
      expect(advancedNode).toBeDefined();
      expect(advancedNode.children).toEqual([]);

      expect(nodeMap.size).toBe(4);
    });

    test("should handle nodes with missing parent (orphan nodes)", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: null },
        { path: "/orphan", title: "Orphan", parentId: "/non-existent" },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(2);
      expect(rootNodes.map((n) => n.path)).toContain("/overview");
      expect(rootNodes.map((n) => n.path)).toContain("/orphan");
      expect(rootNodes.find((n) => n.path === "/orphan").children).toEqual([]);
      expect(nodeMap.size).toBe(2);
    });

    test("should preserve all node properties", () => {
      const documentStructure = [
        {
          path: "/overview",
          title: "Overview",
          description: "Main overview",
          parentId: null,
          sourceIds: ["source1"],
        },
        {
          path: "/api",
          title: "API",
          description: "API documentation",
          parentId: null,
          sourceIds: ["source2"],
        },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(2);
      const overviewNode = rootNodes.find((n) => n.path === "/overview");
      expect(overviewNode.title).toBe("Overview");
      expect(overviewNode.description).toBe("Main overview");
      expect(overviewNode.sourceIds).toEqual(["source1"]);

      const apiNode = nodeMap.get("/api");
      expect(apiNode.title).toBe("API");
      expect(apiNode.description).toBe("API documentation");
      expect(apiNode.sourceIds).toEqual(["source2"]);
    });

    test("should handle empty document structure", () => {
      const { rootNodes, nodeMap } = buildDocumentTree([]);

      expect(rootNodes).toEqual([]);
      expect(nodeMap.size).toBe(0);
    });

    test("should handle complex tree with multiple branches", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: null },
        { path: "/guides", title: "Guides", parentId: null },
        { path: "/guides/basics", title: "Basics", parentId: "/guides" },
        { path: "/guides/advanced", title: "Advanced", parentId: "/guides" },
        { path: "/api", title: "API", parentId: null },
        { path: "/api/reference", title: "Reference", parentId: "/api" },
        { path: "/api/examples", title: "Examples", parentId: "/api" },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      expect(rootNodes).toHaveLength(3);

      const guidesNode = rootNodes.find((n) => n.path === "/guides");
      expect(guidesNode.children).toHaveLength(2);
      expect(guidesNode.children.map((n) => n.path)).toContain("/guides/basics");
      expect(guidesNode.children.map((n) => n.path)).toContain("/guides/advanced");

      const apiNode = rootNodes.find((n) => n.path === "/api");
      expect(apiNode.children).toHaveLength(2);
      expect(apiNode.children.map((n) => n.path)).toContain("/api/reference");
      expect(apiNode.children.map((n) => n.path)).toContain("/api/examples");

      expect(nodeMap.size).toBe(7);
    });

    test("should ensure all nodes have children array", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: null },
        { path: "/api", title: "API", parentId: null },
        { path: "/api/guide", title: "Guide", parentId: "/api" },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      rootNodes.forEach((node) => {
        expect(Array.isArray(node.children)).toBe(true);
      });

      nodeMap.forEach((node) => {
        expect(Array.isArray(node.children)).toBe(true);
      });

      const apiNode = rootNodes.find((n) => n.path === "/api");
      apiNode.children.forEach((child) => {
        expect(Array.isArray(child.children)).toBe(true);
      });
    });

    test("should handle nodes with parentId as null string", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: "null" },
        { path: "/api", title: "API", parentId: null },
      ];

      const { rootNodes } = buildDocumentTree(documentStructure);

      // parentId "null" (string) should be treated as truthy, so it will try to find parent
      // Since "/null" doesn't exist, it should be added to rootNodes
      expect(rootNodes.length).toBeGreaterThanOrEqual(1);
      expect(rootNodes.map((n) => n.path)).toContain("/api");
    });

    test("should maintain node references in nodeMap", () => {
      const documentStructure = [
        { path: "/overview", title: "Overview", parentId: null },
        { path: "/api", title: "API", parentId: null },
        { path: "/api/guide", title: "Guide", parentId: "/api" },
      ];

      const { rootNodes, nodeMap } = buildDocumentTree(documentStructure);

      const apiNode = rootNodes.find((n) => n.path === "/api");
      const apiNodeFromMap = nodeMap.get("/api");

      // Should be the same reference
      expect(apiNode).toBe(apiNodeFromMap);

      // Children should reference the same objects
      expect(apiNode.children[0]).toBe(nodeMap.get("/api/guide"));
    });
  });

  // EDGE CASES AND ERROR HANDLING
  describe("edge cases", () => {
    test("getActionText should handle case-sensitive action placeholder", () => {
      const result = getActionText("Please {ACTION} or {action} the docs", "translate");
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

    test("getMainLanguageFiles should throw non-ENOENT access errors", async () => {
      const permissionError = new Error("Permission denied");
      permissionError.code = "EACCES";
      accessSpy.mockRejectedValue(permissionError);

      await expect(getMainLanguageFiles("/denied", "en")).rejects.toThrow("Permission denied");
    });

    test("processSelectedFiles should handle empty documentation structure", async () => {
      readFileSpy.mockResolvedValue("content");

      const result = await processSelectedFiles(["test.md"], [], "/docs");

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️  No documentation structure item found for file: test.md",
      );
    });

    test("fileNameToFlatPath should handle files with multiple language suffixes", () => {
      expect(fileNameToFlatPath("file.zh-CN.md")).toBe("file");
      expect(fileNameToFlatPath("file.en-US.md")).toBe("file");
      expect(fileNameToFlatPath("file.fr-FR.md")).toBe("file");
    });

    test("generateFileName should handle special characters in flatName", () => {
      expect(generateFileName("api-v1-guide", "en")).toBe("api-v1-guide.md");
      expect(generateFileName("api-v1-guide", "zh")).toBe("api-v1-guide.zh.md");
      expect(generateFileName("test_special-chars", "fr")).toBe("test_special-chars.fr.md");
    });
  });

  // BUILD CHOICES FROM TREE TESTS
  describe("buildChoicesFromTree", () => {
    test("should build choices from three-level nested structure", async () => {
      const threeLevelTree = [
        {
          path: "/guides",
          title: "Guides",
          children: [
            {
              path: "/guides/basics",
              title: "Basics",
              children: [
                {
                  path: "/guides/basics/installation",
                  title: "Installation",
                  children: [],
                },
                {
                  path: "/guides/basics/getting-started",
                  title: "Getting Started",
                  children: [],
                },
              ],
            },
            {
              path: "/guides/advanced",
              title: "Advanced",
              children: [
                {
                  path: "/guides/advanced/patterns",
                  title: "Patterns",
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      pathExistsSpy.mockResolvedValue(true);

      const result = await buildChoicesFromTree(threeLevelTree, "", 0, {
        locale: "en",
        docsDir: "/docs",
      });

      expect(result).toHaveLength(6);
      expect(result[0].value).toBe("/guides");
      expect(result[0].name).toContain("Guides");
      expect(result[0].name).toContain("guides.md");
      expect(result[0].disabled).toBe(false);

      expect(result[1].value).toBe("/guides/basics");
      expect(result[1].name).toContain("Basics");
      expect(result[1].name).toContain("├─");

      expect(result[2].value).toBe("/guides/basics/installation");
      expect(result[2].name).toContain("Installation");
      expect(result[2].name).toContain("│  ├─");

      expect(result[3].value).toBe("/guides/basics/getting-started");
      expect(result[3].name).toContain("Getting Started");
      expect(result[3].name).toContain("│  └─");

      expect(result[4].value).toBe("/guides/advanced");
      expect(result[4].name).toContain("Advanced");
      expect(result[4].name).toContain("└─");

      expect(result[5].value).toBe("/guides/advanced/patterns");
      expect(result[5].name).toContain("Patterns");
      expect(result[5].name).toContain("   └─");
    });

    test("should mark items as disabled when files do not exist", async () => {
      const treeWithMissingFiles = [
        {
          path: "/overview",
          title: "Overview",
          children: [],
        },
        {
          path: "/api",
          title: "API",
          children: [
            {
              path: "/api/guide",
              title: "API Guide",
              children: [],
            },
            {
              path: "/api/reference",
              title: "API Reference",
              children: [],
            },
          ],
        },
        {
          path: "/missing",
          title: "Missing Document",
          children: [],
        },
      ];

      // Mock pathExists to return false for specific files
      pathExistsSpy.mockImplementation((filePath) => {
        if (filePath.includes("missing.md")) {
          return Promise.resolve(false);
        }
        if (filePath.includes("api-reference.md")) {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      });

      const result = await buildChoicesFromTree(treeWithMissingFiles, "", 0, {
        locale: "en",
        docsDir: "/docs",
      });

      expect(result).toHaveLength(5);

      // Overview should be enabled
      const overviewChoice = result.find((c) => c.value === "/overview");
      expect(overviewChoice).toBeDefined();
      expect(overviewChoice.disabled).toBe(false);
      expect(overviewChoice.name).not.toContain("file not found");

      // API should be enabled
      const apiChoice = result.find((c) => c.value === "/api");
      expect(apiChoice).toBeDefined();
      expect(apiChoice.disabled).toBe(false);

      // API Guide should be enabled
      const apiGuideChoice = result.find((c) => c.value === "/api/guide");
      expect(apiGuideChoice).toBeDefined();
      expect(apiGuideChoice.disabled).toBe(false);

      // API Reference should be disabled
      const apiReferenceChoice = result.find((c) => c.value === "/api/reference");
      expect(apiReferenceChoice).toBeDefined();
      expect(apiReferenceChoice.disabled).toBe(true);
      expect(apiReferenceChoice.name).toContain("file not found");

      // Missing document should be disabled
      const missingChoice = result.find((c) => c.value === "/missing");
      expect(missingChoice).toBeDefined();
      expect(missingChoice.disabled).toBe(true);
      expect(missingChoice.name).toContain("file not found");
    });
  });
});
