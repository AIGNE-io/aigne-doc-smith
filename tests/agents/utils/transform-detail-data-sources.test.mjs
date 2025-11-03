import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import transformDetailDataSource from "../../../agents/utils/transform-detail-data-sources.mjs";
import * as utils from "../../../utils/utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("transformDetailDataSource utility", () => {
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
  test("should transform simple dataSources correctly", async () => {
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

    const result = transformDetailDataSource(input);

    expect(normalizePathSpy).toHaveBeenCalledWith(guidePath);
    expect(normalizePathSpy).toHaveBeenCalledWith(apiPath);
    expect(toRelativePathSpy).toHaveBeenCalledWith(guidePath);
    expect(toRelativePathSpy).toHaveBeenCalledWith(apiPath);

    expect(result.detailDataSource).toContain("# User Guide\n\nThis is a guide.");
    expect(result.detailDataSource).toContain("# API Reference\n\nAPI documentation.");
  });

  test("should handle single datasource", async () => {
    // Create test file
    const readmePath = path.join(testDir, "readme.md");
    await writeFile(readmePath, "# README\n\nProject documentation.");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [readmePath],
    };

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toContain("# README\n\nProject documentation.");
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

    const result = transformDetailDataSource(input);

    // Check order by finding indices
    const indexC = result.detailDataSource.indexOf("Content C");
    const indexA = result.detailDataSource.indexOf("Content A");
    const indexB = result.detailDataSource.indexOf("Content B");

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

    const result = transformDetailDataSource(input);

    expect(normalizePathSpy).toHaveBeenCalledWith(guidePath);
    expect(normalizePathSpy).toHaveBeenCalledWith(apiPath);
    expect(result.detailDataSource).toContain("Guide content");
    expect(result.detailDataSource).toContain("API content");
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

    const result = transformDetailDataSource(input);

    expect(toRelativePathSpy).toHaveBeenCalledWith(absPath);
    expect(toRelativePathSpy).toHaveBeenCalledWith(relPath);
    expect(result.detailDataSource).toContain("Absolute content");
    expect(result.detailDataSource).toContain("Relative content");
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

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toContain("Guide content");
    expect(result.detailDataSource).toContain("API content");
    expect(result.detailDataSource).not.toContain("missing");
  });

  test("should handle empty sourceIds array", () => {
    const input = {
      sourceIds: [],
    };

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toBe("");
  });

  // NULL AND UNDEFINED HANDLING
  test("should handle null sourceIds", () => {
    const input = {
      sourceIds: null,
    };

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toBe("");
  });

  test("should handle undefined sourceIds", () => {
    const input = {
      sourceIds: undefined,
    };

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toBe("");
  });

  // CONTENT FORMATTING TESTS
  test("should format content with proper sourceId comments", async () => {
    const mainPath = path.join(testDir, "main.js");
    await writeFile(mainPath, "console.log('Hello World');\nprocess.exit(0);");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [mainPath],
    };

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toContain("console.log('Hello World');\nprocess.exit(0);");
    expect(result.detailDataSource).toContain("// sourceId:");
  });

  test("should handle empty content", async () => {
    const emptyPath = path.join(testDir, "empty.md");
    await writeFile(emptyPath, "");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [emptyPath],
    };

    const result = transformDetailDataSource(input);

    // Empty file content still gets included with sourceId comment
    expect(result.detailDataSource).toContain("// sourceId:");
    expect(result.detailDataSource.trim()).not.toBe("");
  });

  test("should handle whitespace-only content", async () => {
    const whitespacePath = path.join(testDir, "whitespace.md");
    await writeFile(whitespacePath, "   \n\t  ");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [whitespacePath],
    };

    const result = transformDetailDataSource(input);

    // Whitespace content is truthy, so it should be included
    expect(result.detailDataSource).toContain("   \n\t  ");
  });

  test("should handle content with special characters", async () => {
    const specialPath = path.join(testDir, "特殊字符.md");
    await writeFile(specialPath, "# 中文标题\n\n这是一个包含特殊字符的文档: @#$%^&*()");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [specialPath],
    };

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toContain("中文标题");
    expect(result.detailDataSource).toContain("@#$%^&*()");
  });

  // DUPLICATE HANDLING TESTS
  test("should handle duplicate sourceIds in list", async () => {
    const guidePath = path.join(testDir, "guide.md");
    await writeFile(guidePath, "Guide content");

    normalizePathSpy.mockImplementation((p) => p);

    const input = {
      sourceIds: [guidePath, guidePath], // Duplicate paths
    };

    const result = transformDetailDataSource(input);

    // Both duplicates should be included
    const matches = result.detailDataSource.match(/Guide content/g);
    expect(matches?.length).toBe(2);
  });

  // RETURN VALUE STRUCTURE TESTS
  test("should always return object with detailDataSource property", async () => {
    const inputs = [{ sourceIds: [] }, { sourceIds: null }];

    for (const input of inputs) {
      const result = transformDetailDataSource(input);
      expect(result).toHaveProperty("detailDataSource");
      expect(typeof result.detailDataSource).toBe("string");
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

    const result = transformDetailDataSource(input);

    expect(result.detailDataSource).toContain("Valid content");
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

    const result = transformDetailDataSource(input, options);

    expect(result.detailDataSource).toContain("Guide content");
    expect(result.detailDataSource).not.toContain("openapi: 3.0.0");
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

    const result = transformDetailDataSource(input, options);

    expect(result.detailDataSource).toContain("// sourceId: https://example.com/service.json");
    expect(result.detailDataSource).toContain('"name": "remote"');
    expect(result.detailDataSource).toContain("Local content");
  });
});
