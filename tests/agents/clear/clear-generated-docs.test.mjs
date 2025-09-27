import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import clearGeneratedDocs from "../../../agents/clear/clear-generated-docs.mjs";
import * as fileUtils from "../../../utils/file-utils.mjs";

const mockFsPromises = {
  rm: mock(() => Promise.resolve()),
};

describe("clear-generated-docs", () => {
  let pathExistsSpy;
  let resolveToAbsoluteSpy;
  let toDisplayPathSpy;

  beforeEach(() => {
    // Apply module mocks
    mock.module("node:fs/promises", () => mockFsPromises);

    // Set up spies for file utils
    pathExistsSpy = spyOn(fileUtils, "pathExists").mockResolvedValue(true);
    resolveToAbsoluteSpy = spyOn(fileUtils, "resolveToAbsolute").mockImplementation(
      (path) => `/absolute${path}`,
    );
    toDisplayPathSpy = spyOn(fileUtils, "toDisplayPath").mockImplementation((path) => path);

    // Reset mocks
    mockFsPromises.rm.mockClear();
    pathExistsSpy.mockClear();
    resolveToAbsoluteSpy.mockClear();
    toDisplayPathSpy.mockClear();

    // Set default implementations
    mockFsPromises.rm.mockResolvedValue();
    pathExistsSpy.mockResolvedValue(true);
    resolveToAbsoluteSpy.mockImplementation((path) => `/absolute${path}`);
    toDisplayPathSpy.mockImplementation((path) => path);
  });

  afterEach(() => {
    pathExistsSpy?.mockRestore();
    resolveToAbsoluteSpy?.mockRestore();
    toDisplayPathSpy?.mockRestore();
    mock.restore();
  });

  test("should clear existing generated documents successfully", async () => {
    pathExistsSpy.mockResolvedValue(true);
    resolveToAbsoluteSpy.mockReturnValue("/absolute/path/to/docs");
    toDisplayPathSpy.mockReturnValue("~/docs");

    const result = await clearGeneratedDocs({ docsDir: "./docs" });

    expect(result.message).toBe("Cleared generated documents (~/docs)");
    expect(result.cleared).toBe(true);
    expect(result.path).toBe("~/docs");
  });

  test("should handle non-existent documents directory", async () => {
    pathExistsSpy.mockResolvedValue(false);
    resolveToAbsoluteSpy.mockReturnValue("/absolute/path/to/docs");
    toDisplayPathSpy.mockReturnValue("~/docs");

    const result = await clearGeneratedDocs({ docsDir: "./docs" });

    expect(result.message).toBe("Generated documents already empty (~/docs)");
    expect(result.cleared).toBe(false);
    expect(result.path).toBe("~/docs");
  });

  test("should return error message when no docsDir provided", async () => {
    const result = await clearGeneratedDocs({});

    expect(result.message).toBe("No generated documents directory specified");
  });

  test("should handle null docsDir", async () => {
    const result = await clearGeneratedDocs({ docsDir: null });

    expect(result.message).toBe("No generated documents directory specified");
  });

  test("should handle empty string docsDir", async () => {
    const result = await clearGeneratedDocs({ docsDir: "" });

    expect(result.message).toBe("No generated documents directory specified");
  });

  test("should handle rm operation failures", async () => {
    mockFsPromises.rm.mockRejectedValue(new Error("Permission denied"));
    resolveToAbsoluteSpy.mockReturnValue("/absolute/docs");
    toDisplayPathSpy.mockReturnValue("~/docs");

    const result = await clearGeneratedDocs({ docsDir: "./docs" });

    expect(result.message).toBe("Failed to clear generated documents: Permission denied");
    expect(result.error).toBe(true);
  });

  test("should handle pathExists check failures", async () => {
    pathExistsSpy.mockRejectedValue(new Error("Access denied"));
    resolveToAbsoluteSpy.mockReturnValue("/absolute/docs");
    toDisplayPathSpy.mockReturnValue("~/docs");

    const result = await clearGeneratedDocs({ docsDir: "./docs" });

    expect(result.message).toBe("Failed to clear generated documents: Access denied");
    expect(result.error).toBe(true);
  });

  test("should return correct structure for successful clearing", async () => {
    pathExistsSpy.mockResolvedValue(true);
    resolveToAbsoluteSpy.mockReturnValue("/absolute/docs");
    toDisplayPathSpy.mockReturnValue("~/docs");

    const result = await clearGeneratedDocs({ docsDir: "./docs" });

    expect(result).toEqual({
      message: "Cleared generated documents (~/docs)",
      cleared: true,
      path: "~/docs",
    });
  });
});
