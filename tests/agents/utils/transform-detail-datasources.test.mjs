import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import transformDetailDatasources from "../../../agents/utils/transform-detail-datasources.mjs";
import * as utils from "../../../utils/utils.mjs";

describe("transformDetailDatasources utility", () => {
  let normalizePathSpy;
  let toRelativePathSpy;

  beforeEach(() => {
    // Spy on utility functions
    normalizePathSpy = spyOn(utils, "normalizePath").mockImplementation((path) =>
      path?.replace(/\\/g, "/").replace(/^\.\//, ""),
    );
    toRelativePathSpy = spyOn(utils, "toRelativePath").mockImplementation((path) =>
      path?.startsWith("/") ? path.substring(1) : path,
    );
  });

  afterEach(() => {
    // Restore all spies
    normalizePathSpy?.mockRestore();
    toRelativePathSpy?.mockRestore();
  });

  // BASIC FUNCTIONALITY TESTS
  test("should transform simple datasources correctly", () => {
    const input = {
      sourceIds: ["/docs/guide.md", "/docs/api.md"],
      datasourcesList: [
        { sourceId: "/docs/guide.md", content: "# User Guide\n\nThis is a guide." },
        { sourceId: "/docs/api.md", content: "# API Reference\n\nAPI documentation." },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(normalizePathSpy).toHaveBeenCalledWith("/docs/guide.md");
    expect(normalizePathSpy).toHaveBeenCalledWith("/docs/api.md");
    expect(toRelativePathSpy).toHaveBeenCalledWith("/docs/guide.md");
    expect(toRelativePathSpy).toHaveBeenCalledWith("/docs/api.md");

    expect(result).toEqual({
      detailDataSources:
        "// sourceId: docs/guide.md\n# User Guide\n\nThis is a guide.\n" +
        "// sourceId: docs/api.md\n# API Reference\n\nAPI documentation.\n",
    });
  });

  test("should handle single datasource", () => {
    const input = {
      sourceIds: ["/docs/readme.md"],
      datasourcesList: [
        { sourceId: "/docs/readme.md", content: "# README\n\nProject documentation." },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe(
      "// sourceId: docs/readme.md\n# README\n\nProject documentation.\n",
    );
  });

  test("should maintain order of sourceIds", () => {
    const input = {
      sourceIds: ["/docs/c.md", "/docs/a.md", "/docs/b.md"],
      datasourcesList: [
        { sourceId: "/docs/a.md", content: "Content A" },
        { sourceId: "/docs/b.md", content: "Content B" },
        { sourceId: "/docs/c.md", content: "Content C" },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe(
      "// sourceId: docs/c.md\nContent C\n" +
        "// sourceId: docs/a.md\nContent A\n" +
        "// sourceId: docs/b.md\nContent B\n",
    );
  });

  // PATH NORMALIZATION TESTS
  test("should normalize paths correctly", () => {
    normalizePathSpy.mockImplementation((path) => path?.replace(/\\/g, "/"));

    const input = {
      sourceIds: ["docs\\guide.md", "/docs/api.md"],
      datasourcesList: [
        { sourceId: "docs\\guide.md", content: "Guide content" },
        { sourceId: "/docs/api.md", content: "API content" },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(normalizePathSpy).toHaveBeenCalledWith("docs\\guide.md");
    expect(normalizePathSpy).toHaveBeenCalledWith("/docs/api.md");
    expect(result.detailDataSources).toContain("Guide content");
    expect(result.detailDataSources).toContain("API content");
  });

  test("should handle relative path conversion", () => {
    toRelativePathSpy.mockImplementation((path) => path?.replace(/^\/+/, "").replace(/^\.\//, ""));

    const input = {
      sourceIds: ["/abs/path/file.md", "./rel/path/file.md"],
      datasourcesList: [
        { sourceId: "/abs/path/file.md", content: "Absolute content" },
        { sourceId: "./rel/path/file.md", content: "Relative content" },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(toRelativePathSpy).toHaveBeenCalledWith("/abs/path/file.md");
    expect(toRelativePathSpy).toHaveBeenCalledWith("./rel/path/file.md");
    expect(result.detailDataSources).toContain("abs/path/file.md");
    expect(result.detailDataSources).toContain("rel/path/file.md");
  });

  // MISSING DATA TESTS
  test("should filter out sourceIds not found in datasourcesList", () => {
    const input = {
      sourceIds: ["/docs/guide.md", "/docs/missing.md", "/docs/api.md"],
      datasourcesList: [
        { sourceId: "/docs/guide.md", content: "Guide content" },
        { sourceId: "/docs/api.md", content: "API content" },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("Guide content");
    expect(result.detailDataSources).toContain("API content");
    expect(result.detailDataSources).not.toContain("missing");
    expect(result.detailDataSources.split("// sourceId:")).toHaveLength(3); // Empty first element + 2 sources
  });

  test("should handle empty sourceIds array", () => {
    const input = {
      sourceIds: [],
      datasourcesList: [
        { sourceId: "/docs/guide.md", content: "Guide content" },
        { sourceId: "/docs/api.md", content: "API content" },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  test("should handle empty datasourcesList array", () => {
    const input = {
      sourceIds: ["/docs/guide.md", "/docs/api.md"],
      datasourcesList: [],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  // NULL AND UNDEFINED HANDLING
  test("should handle null sourceIds", () => {
    const input = {
      sourceIds: null,
      datasourcesList: [{ sourceId: "/docs/guide.md", content: "Guide content" }],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  test("should handle undefined sourceIds", () => {
    const input = {
      sourceIds: undefined,
      datasourcesList: [{ sourceId: "/docs/guide.md", content: "Guide content" }],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  test("should handle null datasourcesList", () => {
    const input = {
      sourceIds: ["/docs/guide.md"],
      datasourcesList: null,
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  test("should handle undefined datasourcesList", () => {
    const input = {
      sourceIds: ["/docs/guide.md"],
      datasourcesList: undefined,
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  // CONTENT FORMATTING TESTS
  test("should format content with proper sourceId comments", () => {
    const input = {
      sourceIds: ["/project/src/main.js"],
      datasourcesList: [
        {
          sourceId: "/project/src/main.js",
          content: "console.log('Hello World');\nprocess.exit(0);",
        },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe(
      "// sourceId: project/src/main.js\nconsole.log('Hello World');\nprocess.exit(0);\n",
    );
  });

  test("should handle empty content", () => {
    const input = {
      sourceIds: ["/docs/empty.md"],
      datasourcesList: [{ sourceId: "/docs/empty.md", content: "" }],
    };

    const result = transformDetailDatasources(input);

    // Empty content is falsy, so it gets filtered out
    expect(result.detailDataSources).toBe("");
  });

  test("should handle whitespace-only content", () => {
    const input = {
      sourceIds: ["/docs/whitespace.md"],
      datasourcesList: [{ sourceId: "/docs/whitespace.md", content: "   \n\t  " }],
    };

    const result = transformDetailDatasources(input);

    // Whitespace content is truthy, so it should be included
    expect(result.detailDataSources).toBe("// sourceId: docs/whitespace.md\n   \n\t  \n");
  });

  test("should handle content with special characters", () => {
    const input = {
      sourceIds: ["/docs/特殊字符.md"],
      datasourcesList: [
        {
          sourceId: "/docs/特殊字符.md",
          content: "# 中文标题\n\n这是一个包含特殊字符的文档: @#$%^&*()",
        },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("特殊字符.md");
    expect(result.detailDataSources).toContain("中文标题");
    expect(result.detailDataSources).toContain("@#$%^&*()");
  });

  // LARGE DATA TESTS
  test("should handle multiple large datasources", () => {
    const largeContent = "A".repeat(1000);
    const input = {
      sourceIds: Array.from({ length: 50 }, (_, i) => `/docs/file-${i}.md`),
      datasourcesList: Array.from({ length: 50 }, (_, i) => ({
        sourceId: `/docs/file-${i}.md`,
        content: `${largeContent}-${i}`,
      })),
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources.split("// sourceId:")).toHaveLength(51); // 50 files + empty first
    expect(result.detailDataSources).toContain("file-0.md");
    expect(result.detailDataSources).toContain("file-49.md");
    expect(result.detailDataSources.length).toBeGreaterThan(50000); // Should be quite large
  });

  // DUPLICATE HANDLING TESTS
  test("should handle duplicate sourceIds in list", () => {
    const input = {
      sourceIds: ["/docs/guide.md", "/docs/guide.md"],
      datasourcesList: [{ sourceId: "/docs/guide.md", content: "Guide content" }],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe(
      "// sourceId: docs/guide.md\nGuide content\n" + "// sourceId: docs/guide.md\nGuide content\n",
    );
  });

  test("should handle duplicate entries in datasourcesList", () => {
    const input = {
      sourceIds: ["/docs/guide.md"],
      datasourcesList: [
        { sourceId: "/docs/guide.md", content: "First content" },
        { sourceId: "/docs/guide.md", content: "Second content" },
      ],
    };

    const result = transformDetailDatasources(input);

    // Should use the last entry due to Object.fromEntries behavior
    expect(result.detailDataSources).toBe("// sourceId: docs/guide.md\nSecond content\n");
  });

  // RETURN VALUE STRUCTURE TESTS
  test("should always return object with detailDataSources property", () => {
    const inputs = [
      { sourceIds: [], datasourcesList: [] },
      { sourceIds: null, datasourcesList: null },
      { sourceIds: ["/test"], datasourcesList: [{ sourceId: "/test", content: "test" }] },
    ];

    inputs.forEach((input) => {
      const result = transformDetailDatasources(input);
      expect(result).toHaveProperty("detailDataSources");
      expect(typeof result.detailDataSources).toBe("string");
    });
  });

  // EDGE CASES
  test("should handle sourceId with null or undefined values", () => {
    normalizePathSpy.mockImplementation((path) => path || "");
    toRelativePathSpy.mockImplementation((path) => path || "");

    const input = {
      sourceIds: [null, undefined, "/docs/valid.md"],
      datasourcesList: [{ sourceId: "/docs/valid.md", content: "Valid content" }],
    };

    const result = transformDetailDatasources(input);

    // The toRelativePath spy is returning the original path, let's adjust expectation
    expect(result.detailDataSources).toBe("// sourceId: /docs/valid.md\nValid content\n");
  });

  test("should handle datasource with null sourceId", () => {
    const input = {
      sourceIds: ["/docs/guide.md"],
      datasourcesList: [
        { sourceId: null, content: "Null sourceId content" },
        { sourceId: "/docs/guide.md", content: "Valid content" },
      ],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("// sourceId: docs/guide.md\nValid content\n");
  });
});
