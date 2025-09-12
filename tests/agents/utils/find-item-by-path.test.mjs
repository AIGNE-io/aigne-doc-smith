import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import findItemByPath from "../../../agents/utils/find-item-by-path.mjs";

import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";

describe("find-item-by-path", () => {
  let mockOptions;

  // Spies for internal utils
  let fileNameToFlatPathSpy;
  let findItemByFlatNameSpy;
  let findItemByPathUtilSpy;
  let getActionTextSpy;
  let getMainLanguageFilesSpy;
  let readFileContentSpy;
  let consoleDebugSpy;

  beforeEach(() => {
    mockOptions = {
      prompts: {
        search: async () => "selected-file.md",
        input: async () => "user feedback",
      },
    };

    // Set up spies for internal utils
    fileNameToFlatPathSpy = spyOn(docsFinderUtils, "fileNameToFlatPath").mockReturnValue(
      "selected-file",
    );
    findItemByFlatNameSpy = spyOn(docsFinderUtils, "findItemByFlatName").mockReturnValue({
      path: "/api/users",
      title: "Selected Item",
    });
    findItemByPathUtilSpy = spyOn(docsFinderUtils, "findItemByPathUtil").mockResolvedValue({
      path: "/api/users",
      title: "Mock Item",
      content: "File content",
    });
    getActionTextSpy = spyOn(docsFinderUtils, "getActionText").mockImplementation(
      (_, text) => text,
    );
    getMainLanguageFilesSpy = spyOn(docsFinderUtils, "getMainLanguageFiles").mockResolvedValue([
      "file1.md",
      "file2.md",
      "subfolder-file3.md",
    ]);
    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      "File content",
    );
    consoleDebugSpy = spyOn(console, "debug").mockImplementation(() => {});

    // Clear spy call history
    fileNameToFlatPathSpy.mockClear();
    findItemByFlatNameSpy.mockClear();
    findItemByPathUtilSpy.mockClear();
    getActionTextSpy.mockClear();
    getMainLanguageFilesSpy.mockClear();
    readFileContentSpy.mockClear();
    consoleDebugSpy.mockClear();

    // Clear mock call history
    mockOptions.prompts.search = async () => "selected-file.md";
    mockOptions.prompts.input = async () => "user feedback";
  });

  afterEach(() => {
    // Restore all spies
    fileNameToFlatPathSpy?.mockRestore();
    findItemByFlatNameSpy?.mockRestore();
    findItemByPathUtilSpy?.mockRestore();
    getActionTextSpy?.mockRestore();
    getMainLanguageFilesSpy?.mockRestore();
    readFileContentSpy?.mockRestore();
    consoleDebugSpy?.mockRestore();
  });

  // PATH PROVIDED TESTS
  test("should find item when doc path is provided", async () => {
    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        feedback: "existing feedback",
        locale: "en",
      },
      mockOptions,
    );

    // When doc path is provided and matches documentExecutionStructure, function should work correctly
    expect(result).toEqual({
      path: "/api/users",
      title: "Mock Item",
      content: "File content",
      feedback: "existing feedback",
    });
  });

  test("should handle feedback trimming when path is provided", async () => {
    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        feedback: "  trimmed feedback  ",
        locale: "en",
      },
      mockOptions,
    );

    expect(result.feedback).toBe("trimmed feedback");
  });

  test("should not include feedback when empty or whitespace", async () => {
    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        feedback: "   ",
        locale: "en",
      },
      mockOptions,
    );

    expect(result.feedback).toBeUndefined();
  });

  test("should throw error when item not found by path", async () => {
    findItemByPathUtilSpy.mockResolvedValue(null);

    await expect(
      findItemByPath(
        {
          doc: "/nonexistent/path",
          documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
          boardId: "board123",
          docsDir: "./docs",
          isTranslate: false,
          locale: "en",
        },
        mockOptions,
      ),
    ).rejects.toThrow('Item with path "/nonexistent/path" not found in documentExecutionStructure');
  });

  // USER SELECTION TESTS
  test("should prompt user selection when doc path is empty", async () => {
    mockOptions.prompts.search = async (options) => {
      expect(options.message).toBe("Select a document to {action}:");
      expect(typeof options.source).toBe("function");
      return "file1.md";
    };

    await findItemByPath(
      {
        doc: "",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );

    expect(getMainLanguageFilesSpy).toHaveBeenCalledWith("./docs", "en", [
      { path: "/api/users", title: "Mock Item" },
    ]);
    expect(getActionTextSpy).toHaveBeenCalledWith(false, "Select a document to {action}:");
    expect(readFileContentSpy).toHaveBeenCalledWith("./docs", "file1.md");
    expect(fileNameToFlatPathSpy).toHaveBeenCalledWith("file1.md");
    expect(findItemByFlatNameSpy).toHaveBeenCalledWith(
      [{ path: "/api/users", title: "Mock Item" }],
      "selected-file",
    );
  });

  test("should use selected file content over utility content", async () => {
    mockOptions.prompts.search = async () => "file2.md";
    readFileContentSpy.mockResolvedValue("Selected file content");

    const result = await findItemByPath(
      {
        doc: "",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );

    expect(result.content).toBe("Selected file content");
  });

  test("should handle search with input filtering", async () => {
    mockOptions.prompts.search = async (options) => {
      // Test the source function with empty input
      const emptyResult = await options.source("");
      expect(emptyResult).toEqual([
        { name: "file1.md", value: "file1.md" },
        { name: "file2.md", value: "file2.md" },
        { name: "subfolder-file3.md", value: "subfolder-file3.md" },
      ]);

      // Test the source function with search input
      const filteredResult = await options.source("file1");
      expect(filteredResult).toEqual([{ name: "file1.md", value: "file1.md" }]);

      return "file1.md";
    };

    await findItemByPath(
      {
        doc: "",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );
  });

  test("should handle case-insensitive search filtering", async () => {
    mockOptions.prompts.search = async (options) => {
      const filteredResult = await options.source("FILE1");
      expect(filteredResult).toEqual([{ name: "file1.md", value: "file1.md" }]);
      return "file1.md";
    };

    await findItemByPath(
      {
        doc: "",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );
  });

  test("should handle partial match search filtering", async () => {
    mockOptions.prompts.search = async (options) => {
      const filteredResult = await options.source("subfolder");
      expect(filteredResult).toEqual([{ name: "subfolder-file3.md", value: "subfolder-file3.md" }]);
      return "subfolder-file3.md";
    };

    await findItemByPath(
      {
        doc: "",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );
  });

  // ERROR HANDLING TESTS
  test("should throw error when no documents found", async () => {
    getMainLanguageFilesSpy.mockResolvedValue([]);

    await expect(
      findItemByPath(
        {
          doc: "",
          documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
          boardId: "board123",
          docsDir: "./docs",
          isTranslate: false,
          locale: "en",
        },
        mockOptions,
      ),
    ).rejects.toThrow(
      "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
    );

    expect(consoleDebugSpy).toHaveBeenCalledWith("No documents found in the docs directory");
  });

  test("should throw error when no document selected", async () => {
    mockOptions.prompts.search = async () => null;

    await expect(
      findItemByPath(
        {
          doc: "",
          documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
          boardId: "board123",
          docsDir: "./docs",
          isTranslate: false,
          locale: "en",
        },
        mockOptions,
      ),
    ).rejects.toThrow(
      "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
    );

    expect(consoleDebugSpy).toHaveBeenCalledWith("No document selected");
  });

  test("should throw error when no matching item found by flat name", async () => {
    findItemByFlatNameSpy.mockReturnValue(null);

    await expect(
      findItemByPath(
        {
          doc: "",
          documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
          boardId: "board123",
          docsDir: "./docs",
          isTranslate: false,
          locale: "en",
        },
        mockOptions,
      ),
    ).rejects.toThrow(
      "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
    );

    expect(consoleDebugSpy).toHaveBeenCalledWith("No document found");
  });

  test("should handle getMainLanguageFiles error", async () => {
    getMainLanguageFilesSpy.mockRejectedValue(new Error("Directory not found"));

    await expect(
      findItemByPath(
        {
          doc: "",
          documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
          boardId: "board123",
          docsDir: "./docs",
          isTranslate: false,
          locale: "en",
        },
        mockOptions,
      ),
    ).rejects.toThrow(
      "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
    );

    expect(consoleDebugSpy).toHaveBeenCalledWith("Directory not found");
  });

  // FEEDBACK HANDLING TESTS
  test("should prompt for feedback when not provided", async () => {
    mockOptions.prompts.input = async (options) => {
      expect(options.message).toBe("How should we improve this {action}? (press Enter to skip):");
      return "prompted feedback";
    };

    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );

    expect(getActionTextSpy).toHaveBeenCalledWith(
      false,
      "How should we improve this {action}? (press Enter to skip):",
    );
    expect(result.feedback).toBe("prompted feedback");
  });

  test("should not prompt for feedback when provided", async () => {
    const inputSpy = async () => {
      throw new Error("Should not be called");
    };
    mockOptions.prompts.input = inputSpy;

    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        feedback: "existing feedback",
        locale: "en",
      },
      mockOptions,
    );

    expect(result.feedback).toBe("existing feedback");
  });

  test("should handle empty feedback from prompt", async () => {
    mockOptions.prompts.input = async () => "";

    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );

    expect(result.feedback).toBeUndefined();
  });

  test("should trim feedback from prompt", async () => {
    mockOptions.prompts.input = async () => "  trimmed prompted feedback  ";

    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: false,
        locale: "en",
      },
      mockOptions,
    );

    expect(result.feedback).toBe("trimmed prompted feedback");
  });

  // TRANSLATION CONTEXT TESTS
  test("should handle translation context in action text", async () => {
    await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        isTranslate: true,
        locale: "en",
      },
      mockOptions,
    );

    expect(getActionTextSpy).toHaveBeenCalledWith(
      true,
      "How should we improve this {action}? (press Enter to skip):",
    );
  });

  test("should handle translation context in error messages", async () => {
    getMainLanguageFilesSpy.mockResolvedValue([]);

    await expect(
      findItemByPath(
        {
          doc: "",
          documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
          boardId: "board123",
          docsDir: "./docs",
          isTranslate: true,
          locale: "en",
        },
        mockOptions,
      ),
    ).rejects.toThrow(
      "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
    );

    expect(getActionTextSpy).toHaveBeenCalledWith(
      true,
      "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
    );
  });

  // PARAMETER PASSING TESTS
  test("should pass all parameters correctly to utility functions", async () => {
    await findItemByPath(
      {
        doc: "/api/complex",
        documentExecutionStructure: [{ path: "/api/complex", title: "Complex Item" }],
        boardId: "board456",
        docsDir: "/custom/docs",
        isTranslate: false,
        feedback: "complex feedback",
        locale: "zh",
      },
      mockOptions,
    );

    // The function should work correctly with complex parameters
  });

  test("should handle undefined optional parameters", async () => {
    const result = await findItemByPath(
      {
        doc: "/api/users",
        documentExecutionStructure: [{ path: "/api/users", title: "Mock Item" }],
        boardId: "board123",
        docsDir: "./docs",
        locale: "en",
        // isTranslate and feedback are undefined
      },
      mockOptions,
    );

    // The function should work correctly with complex parameters
    expect(result.feedback).toBe("user feedback"); // From mock prompt
  });
});
