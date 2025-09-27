import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import clearDocumentStructure from "../../../agents/clear/clear-document-structure.mjs";
import * as fileUtils from "../../../utils/file-utils.mjs";

const mockFsPromises = {
  rm: mock(() => Promise.resolve()),
};

const mockPath = {
  join: mock((...paths) => paths.join("/")),
};

describe("clear-document-structure", () => {
  let pathExistsSpy;
  let toDisplayPathSpy;

  beforeEach(() => {
    // Apply module mocks
    mock.module("node:fs/promises", () => mockFsPromises);
    mock.module("node:path", () => mockPath);

    // Set up spies for file utils
    pathExistsSpy = spyOn(fileUtils, "pathExists").mockResolvedValue(true);
    toDisplayPathSpy = spyOn(fileUtils, "toDisplayPath").mockImplementation((path) => path);

    // Reset mocks
    mockFsPromises.rm.mockClear();
    mockPath.join.mockClear();
    pathExistsSpy.mockClear();
    toDisplayPathSpy.mockClear();

    // Set default implementations
    mockFsPromises.rm.mockResolvedValue();
    mockPath.join.mockImplementation((...paths) => paths.join("/"));
    pathExistsSpy.mockResolvedValue(true);
    toDisplayPathSpy.mockImplementation((path) => path);
  });

  afterEach(() => {
    pathExistsSpy?.mockRestore();
    toDisplayPathSpy?.mockRestore();
    mock.restore();
  });

  test("should clear structure plan only when no docsDir provided", async () => {
    pathExistsSpy.mockResolvedValue(true);
    toDisplayPathSpy.mockReturnValue("~/.aigne/doc-smith/output/structure-plan.json");

    const result = await clearDocumentStructure({ workDir: "/test/work" });

    expect(result.message).toContain("Document structure cleared successfully!");
    expect(result.hasError).toBe(false);
    expect(result.clearedCount).toBe(1);
  });

  test("should clear both structure plan and docs directory when docsDir provided", async () => {
    pathExistsSpy.mockResolvedValue(true);
    toDisplayPathSpy
      .mockReturnValueOnce("~/.aigne/doc-smith/output/structure-plan.json")
      .mockReturnValueOnce("~/docs");

    const result = await clearDocumentStructure({ workDir: "/test/work", docsDir: "/test/docs" });

    expect(result.message).toContain("Document structure cleared successfully!");
    expect(result.clearedCount).toBe(2);
  });

  test("should handle non-existent structure plan file", async () => {
    pathExistsSpy.mockImplementation((path) => {
      if (path.includes("structure-plan.json")) return Promise.resolve(false);
      return Promise.resolve(true);
    });
    toDisplayPathSpy.mockReturnValue("~/.aigne/doc-smith/output/structure-plan.json");

    const result = await clearDocumentStructure({ workDir: "/test/work" });

    expect(result.message).toContain("Document structure already empty.");
    expect(result.clearedCount).toBe(0);
  });

  test("should handle structure plan removal errors", async () => {
    mockFsPromises.rm.mockImplementation((path) => {
      if (path.includes("structure-plan.json")) {
        return Promise.reject(new Error("Permission denied"));
      }
      return Promise.resolve();
    });
    toDisplayPathSpy.mockReturnValue("~/.aigne/doc-smith/output/structure-plan.json");

    const result = await clearDocumentStructure({ workDir: "/test/work" });

    expect(result.message).toContain("Document structure cleanup finished with some issues.");
    expect(result.hasError).toBe(true);
  });

  test("should handle both operations successful", async () => {
    pathExistsSpy.mockResolvedValue(true);
    toDisplayPathSpy.mockReturnValueOnce("~/structure-plan.json").mockReturnValueOnce("~/docs");

    const result = await clearDocumentStructure({ workDir: "/test", docsDir: "/test/docs" });

    expect(result.hasError).toBe(false);
    expect(result.clearedCount).toBe(2);
    expect(result.message).toContain("Document structure cleared successfully!");
  });
});
