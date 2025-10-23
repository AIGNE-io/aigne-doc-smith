import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import transformDetailDatasources from "../../../agents/utils/transform-detail-datasources.mjs";
import * as utils from "../../../utils/utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("transformDetailDatasources utility", () => {
  let normalizePathSpy;
  let toRelativePathSpy;
  let testDir;

  beforeEach(async () => {
    // Create test directory
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    testDir = path.join(__dirname, `test-transform-${uniqueId}`);
    await mkdir(testDir, { recursive: true });

    // Spy on utility functions
    normalizePathSpy = spyOn(utils, "normalizePath").mockImplementation((path) =>
      path?.replace(/\\/g, "/").replace(/^\.\//, ""),
    );
    toRelativePathSpy = spyOn(utils, "toRelativePath").mockImplementation((path) =>
      path?.startsWith("/") ? path.substring(1) : path,
    );
  });

  afterEach(async () => {
    // Restore all spies
    normalizePathSpy?.mockRestore();
    toRelativePathSpy?.mockRestore();

    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      console.warn(`Warning: Could not clean up test directory: ${testDir}`);
    }
  });

  // BASIC FUNCTIONALITY TESTS
  test("should transform simple datasources correctly", async () => {
    // Create test files
    const guidePath = path.join(testDir, "guide.md");
    const apiPath = path.join(testDir, "api.md");
    await writeFile(guidePath, "# User Guide\n\nThis is a guide.");
    await writeFile(apiPath, "# API Reference\n\nAPI documentation.");

    // Mock normalizePath to return the actual file path
    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [guidePath, apiPath],
    };

    const result = transformDetailDatasources(input);

    expect(normalizePathSpy).toHaveBeenCalledWith(guidePath);
    expect(normalizePathSpy).toHaveBeenCalledWith(apiPath);
    expect(toRelativePathSpy).toHaveBeenCalledWith(guidePath);
    expect(toRelativePathSpy).toHaveBeenCalledWith(apiPath);

    expect(result.detailDataSources).toContain("# User Guide\n\nThis is a guide.");
    expect(result.detailDataSources).toContain("# API Reference\n\nAPI documentation.");
  });

  test("should handle single datasource", async () => {
    // Create test file
    const readmePath = path.join(testDir, "readme.md");
    await writeFile(readmePath, "# README\n\nProject documentation.");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [readmePath],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("# README\n\nProject documentation.");
  });

  test("should maintain order of sourceIds", async () => {
    // Create test files
    const cPath = path.join(testDir, "c.md");
    const aPath = path.join(testDir, "a.md");
    const bPath = path.join(testDir, "b.md");
    await writeFile(cPath, "Content C");
    await writeFile(aPath, "Content A");
    await writeFile(bPath, "Content B");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [cPath, aPath, bPath],
    };

    const result = transformDetailDatasources(input);

    // Check order by finding indices
    const indexC = result.detailDataSources.indexOf("Content C");
    const indexA = result.detailDataSources.indexOf("Content A");
    const indexB = result.detailDataSources.indexOf("Content B");

    expect(indexC).toBeLessThan(indexA);
    expect(indexA).toBeLessThan(indexB);
  });

  // PATH NORMALIZATION TESTS
  test("should normalize paths correctly", async () => {
    // Create test files
    const guidePath = path.join(testDir, "guide.md");
    const apiPath = path.join(testDir, "api.md");
    await writeFile(guidePath, "Guide content");
    await writeFile(apiPath, "API content");

    normalizePathSpy.mockImplementation((p) => p?.replace(/\\/g, "/"));

    const input = {
      sourceIds: [guidePath, apiPath],
    };

    const result = transformDetailDatasources(input);

    expect(normalizePathSpy).toHaveBeenCalledWith(guidePath);
    expect(normalizePathSpy).toHaveBeenCalledWith(apiPath);
    expect(result.detailDataSources).toContain("Guide content");
    expect(result.detailDataSources).toContain("API content");
  });

  test("should handle relative path conversion", async () => {
    // Create test files
    const absPath = path.join(testDir, "abs-file.md");
    const relPath = path.join(testDir, "rel-file.md");
    await writeFile(absPath, "Absolute content");
    await writeFile(relPath, "Relative content");

    normalizePathSpy.mockImplementation((p) => p);
    toRelativePathSpy.mockImplementation((p) => p?.replace(/^\/+/, "").replace(/^\.\//, ""));

    const input = {
      sourceIds: [absPath, relPath],
    };

    const result = transformDetailDatasources(input);

    expect(toRelativePathSpy).toHaveBeenCalledWith(absPath);
    expect(toRelativePathSpy).toHaveBeenCalledWith(relPath);
    expect(result.detailDataSources).toContain("Absolute content");
    expect(result.detailDataSources).toContain("Relative content");
  });

  // MISSING DATA TESTS
  test("should filter out sourceIds for files that don't exist", async () => {
    // Create only some test files
    const guidePath = path.join(testDir, "guide.md");
    const apiPath = path.join(testDir, "api.md");
    const missingPath = path.join(testDir, "missing.md");
    await writeFile(guidePath, "Guide content");
    await writeFile(apiPath, "API content");
    // missingPath intentionally not created

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [guidePath, missingPath, apiPath],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("Guide content");
    expect(result.detailDataSources).toContain("API content");
    expect(result.detailDataSources).not.toContain("missing");
  });

  test("should handle empty sourceIds array", () => {
    const input = {
      sourceIds: [],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  // NULL AND UNDEFINED HANDLING
  test("should handle null sourceIds", () => {
    const input = {
      sourceIds: null,
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  test("should handle undefined sourceIds", () => {
    const input = {
      sourceIds: undefined,
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toBe("");
  });

  // CONTENT FORMATTING TESTS
  test("should format content with proper sourceId comments", async () => {
    const mainPath = path.join(testDir, "main.js");
    await writeFile(mainPath, "console.log('Hello World');\nprocess.exit(0);");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [mainPath],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("console.log('Hello World');\nprocess.exit(0);");
    expect(result.detailDataSources).toContain("// sourceId:");
  });

  test("should handle empty content", async () => {
    const emptyPath = path.join(testDir, "empty.md");
    await writeFile(emptyPath, "");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [emptyPath],
    };

    const result = transformDetailDatasources(input);

    // Empty file content still gets included with sourceId comment
    expect(result.detailDataSources).toContain("// sourceId:");
    expect(result.detailDataSources.trim()).not.toBe("");
  });

  test("should handle whitespace-only content", async () => {
    const whitespacePath = path.join(testDir, "whitespace.md");
    await writeFile(whitespacePath, "   \n\t  ");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [whitespacePath],
    };

    const result = transformDetailDatasources(input);

    // Whitespace content is truthy, so it should be included
    expect(result.detailDataSources).toContain("   \n\t  ");
  });

  test("should handle content with special characters", async () => {
    const specialPath = path.join(testDir, "特殊字符.md");
    await writeFile(specialPath, "# 中文标题\n\n这是一个包含特殊字符的文档: @#$%^&*()");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [specialPath],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("中文标题");
    expect(result.detailDataSources).toContain("@#$%^&*()");
  });

  // DUPLICATE HANDLING TESTS
  test("should handle duplicate sourceIds in list", async () => {
    const guidePath = path.join(testDir, "guide.md");
    await writeFile(guidePath, "Guide content");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [guidePath, guidePath], // Duplicate paths
    };

    const result = transformDetailDatasources(input);

    // Both duplicates should be included
    const matches = result.detailDataSources.match(/Guide content/g);
    expect(matches?.length).toBe(2);
  });

  // RETURN VALUE STRUCTURE TESTS
  test("should always return object with detailDataSources property", async () => {
    const inputs = [{ sourceIds: [] }, { sourceIds: null }];

    for (const input of inputs) {
      const result = transformDetailDatasources(input);
      expect(result).toHaveProperty("detailDataSources");
      expect(typeof result.detailDataSources).toBe("string");
    }
  });

  // EDGE CASES
  test("should handle sourceId with null or undefined values", async () => {
    const validPath = path.join(testDir, "valid.md");
    await writeFile(validPath, "Valid content");

    normalizePathSpy.mockImplementation((p) => p || "");
    toRelativePathSpy.mockImplementation((p) => p || "");

    const input = {
      sourceIds: [null, undefined, validPath],
    };

    const result = transformDetailDatasources(input);

    expect(result.detailDataSources).toContain("Valid content");
  });

  test("should return openAPI spec separately when provided in context", async () => {
    const guidePath = path.join(testDir, "guide.md");
    const openApiPath = path.join(testDir, "openapi.yaml");
    await writeFile(guidePath, "Guide content");
    await writeFile(openApiPath, "openapi: 3.0.0");

    normalizePathSpy.mockImplementation((p) => p);
    toRelativePathSpy.mockImplementation((p) => p);

    const openAPISpec = {
      sourceId: openApiPath,
      content: "openapi: 3.0.0",
    };
    const options = {
      context: {
        userContext: {
          openAPISpec,
        },
      },
    };

    const input = {
      sourceIds: [guidePath, openApiPath],
    };

    const result = transformDetailDatasources(input, options);

    expect(result.detailDataSources).toContain("Guide content");
    expect(result.detailDataSources).not.toContain("openapi: 3.0.0");
    expect(result.openAPISpec).toBe(openAPISpec);
  });

  test("should render remote HTTP sources using cached content", async () => {
    const remoteUrl = "https://example.com/service.json";
    const localPath = path.join(testDir, "local.md");
    await writeFile(localPath, "Local content");

    normalizePathSpy.mockImplementation((p) => p);
    toRelativePathSpy.mockImplementation((p) => p);

    const options = {
      context: {
        userContext: {
          httpFileList: [{ sourceId: remoteUrl, content: '{ "name": "remote" }' }],
        },
      },
    };

    const input = {
      sourceIds: [remoteUrl, localPath],
    };

    const result = transformDetailDatasources(input, options);

    expect(result.detailDataSources).toContain("// sourceId: https://example.com/service.json");
    expect(result.detailDataSources).toContain('"name": "remote"');
    expect(result.detailDataSources).toContain("Local content");
  });
});
