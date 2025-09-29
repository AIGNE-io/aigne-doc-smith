import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import chooseDocs from "../../../agents/utils/choose-docs.mjs";
import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";

describe("chooseDocs utility", () => {
  let getMainLanguageFilesSpy;
  let processSelectedFilesSpy;
  let findItemByPathSpy;
  let getActionTextSpy;
  let addFeedbackToItemsSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let mockOptions;

  beforeEach(() => {
    // Spy on utility functions
    getMainLanguageFilesSpy = spyOn(docsFinderUtils, "getMainLanguageFiles").mockResolvedValue([
      "/docs/guide.md",
      "/docs/api.md",
      "/docs/tutorial.md",
    ]);
    processSelectedFilesSpy = spyOn(docsFinderUtils, "processSelectedFiles").mockResolvedValue([
      { path: "/docs/guide.md", content: "# Guide", title: "Guide" },
      { path: "/docs/api.md", content: "# API", title: "API" },
    ]);
    findItemByPathSpy = spyOn(docsFinderUtils, "findItemByPath").mockResolvedValue({
      path: "/docs/guide.md",
      content: "# Guide",
      title: "Guide",
    });
    getActionTextSpy = spyOn(docsFinderUtils, "getActionText").mockImplementation(
      (isTranslate, template) => template.replace("{action}", isTranslate ? "translate" : "update"),
    );
    addFeedbackToItemsSpy = spyOn(docsFinderUtils, "addFeedbackToItems").mockImplementation(
      (items, feedback) => items.map((item) => ({ ...item, feedback })),
    );

    // Spy on console methods
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    // Mock options with prompts
    mockOptions = {
      prompts: {
        checkbox: mock().mockResolvedValue(["/docs/guide.md", "/docs/api.md"]),
        input: mock().mockResolvedValue("Test feedback"),
      },
    };
  });

  afterEach(() => {
    // Restore all spies
    getMainLanguageFilesSpy?.mockRestore();
    processSelectedFilesSpy?.mockRestore();
    findItemByPathSpy?.mockRestore();
    getActionTextSpy?.mockRestore();
    addFeedbackToItemsSpy?.mockRestore();
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
  });

  // DOCS PROVIDED TESTS
  test("should process provided docs array successfully", async () => {
    const input = {
      docs: ["/docs/guide.md", "/docs/api.md"],
      documentExecutionStructure: [{ path: "/docs/guide.md" }],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Update these docs",
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(findItemByPathSpy).toHaveBeenCalledTimes(2);
    expect(findItemByPathSpy).toHaveBeenCalledWith(
      input.documentExecutionStructure,
      "/docs/guide.md",
      "board-123",
      "/project/docs",
      "en",
    );
    expect(addFeedbackToItemsSpy).toHaveBeenCalledWith(expect.any(Array), "Update these docs");
    expect(result).toEqual({
      selectedDocs: expect.any(Array),
      feedback: "Update these docs",
      selectedPaths: expect.any(Array),
    });
  });

  test("should handle docs with some items not found", async () => {
    findItemByPathSpy.mockImplementation((_, path) => {
      if (path === "/docs/missing.md") {
        return null;
      }
      return { path, content: `Content for ${path}`, title: path };
    });

    const input = {
      docs: ["/docs/guide.md", "/docs/missing.md", "/docs/api.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '⚠️  Item with path "/docs/missing.md" not found in documentExecutionStructure',
    );
    expect(result.selectedDocs).toHaveLength(2); // Only found items
  });

  test("should throw error when none of provided docs are found", async () => {
    findItemByPathSpy.mockResolvedValue(null);

    const input = {
      docs: ["/docs/missing1.md", "/docs/missing2.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    await expect(chooseDocs(input, mockOptions)).rejects.toThrow(
      "None of the specified document paths were found in documentExecutionStructure",
    );
  });

  // INTERACTIVE SELECTION TESTS
  test("should handle interactive document selection when docs not provided", async () => {
    const input = {
      docs: [],
      documentExecutionStructure: [{ path: "/docs/guide.md" }],
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(getMainLanguageFilesSpy).toHaveBeenCalledWith(
      "/project/docs",
      "en",
      input.documentExecutionStructure,
    );
    expect(mockOptions.prompts.checkbox).toHaveBeenCalled();
    expect(processSelectedFilesSpy).toHaveBeenCalledWith(
      ["/docs/guide.md", "/docs/api.md"],
      input.documentExecutionStructure,
      "/project/docs",
    );
    expect(result.selectedDocs).toBeDefined();
  });

  test("should handle interactive selection when docs is null", async () => {
    const input = {
      docs: null,
      documentExecutionStructure: [],
      docsDir: "/project/docs",
      isTranslate: true,
      locale: "zh",
    };

    await chooseDocs(input, mockOptions);

    expect(getMainLanguageFilesSpy).toHaveBeenCalled();
    expect(getActionTextSpy).toHaveBeenCalledWith(true, "Select documents to {action}:");
  });

  test("should throw error when no main language files found", async () => {
    getMainLanguageFilesSpy.mockResolvedValue([]);

    const input = {
      docs: [],
      documentExecutionStructure: [],
      docsDir: "/empty/docs",
      isTranslate: false,
      locale: "en",
    };

    await expect(chooseDocs(input, mockOptions)).rejects.toThrow();
  });

  test("should throw error when no documents selected interactively", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue([]);

    const input = {
      docs: [],
      documentExecutionStructure: [],
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    await expect(chooseDocs(input, mockOptions)).rejects.toThrow();
  });

  // CHECKBOX VALIDATION TESTS
  test("should validate checkbox selection requires at least one document", async () => {
    const input = {
      docs: [],
      documentExecutionStructure: [],
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    await chooseDocs(input, mockOptions);

    const checkboxCall = mockOptions.prompts.checkbox.mock.calls[0][0];
    expect(checkboxCall.validate([])).toBe("Please select at least one document");
    expect(checkboxCall.validate(["/docs/guide.md"])).toBe(true);
  });

  test("should filter choices based on search term", async () => {
    const input = {
      docs: [],
      documentExecutionStructure: [],
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    await chooseDocs(input, mockOptions);

    const checkboxCall = mockOptions.prompts.checkbox.mock.calls[0][0];
    const choices = checkboxCall.source();
    expect(choices).toHaveLength(3);

    const filteredChoices = checkboxCall.source("api");
    expect(filteredChoices).toHaveLength(1);
    expect(filteredChoices[0].value).toBe("/docs/api.md");
  });

  // FEEDBACK HANDLING TESTS
  test("should prompt for feedback when not provided", async () => {
    const input = {
      docs: ["/docs/guide.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: true,
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(mockOptions.prompts.input).toHaveBeenCalled();
    expect(result.feedback).toBe("Test feedback");
  });

  test("should use provided feedback without prompting", async () => {
    const input = {
      docs: ["/docs/guide.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Provided feedback",
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(mockOptions.prompts.input).not.toHaveBeenCalled();
    expect(result.feedback).toBe("Provided feedback");
  });

  test("should handle empty feedback gracefully", async () => {
    mockOptions.prompts.input.mockResolvedValue("");

    const input = {
      docs: ["/docs/guide.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result.feedback).toBe("");
    expect(addFeedbackToItemsSpy).toHaveBeenCalledWith(expect.any(Array), "");
  });

  // RESET FUNCTIONALITY TESTS
  test("should reset content to null when reset is true", async () => {
    const input = {
      docs: ["/docs/guide.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Reset test",
      locale: "en",
      reset: true,
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result.selectedDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: null,
        }),
      ]),
    );
  });

  test("should preserve content when reset is false", async () => {
    const input = {
      docs: ["/docs/guide.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "No reset test",
      locale: "en",
      reset: false,
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result.selectedDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.any(String),
        }),
      ]),
    );
  });

  // RETURN VALUE STRUCTURE TESTS
  test("should return correct structure with all required fields", async () => {
    const input = {
      docs: ["/docs/guide.md", "/docs/api.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Structure test",
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result).toHaveProperty("selectedDocs");
    expect(result).toHaveProperty("feedback");
    expect(result).toHaveProperty("selectedPaths");
    expect(Array.isArray(result.selectedDocs)).toBe(true);
    expect(Array.isArray(result.selectedPaths)).toBe(true);
    expect(typeof result.feedback).toBe("string");
  });

  test("should map selectedPaths correctly from selectedDocs", async () => {
    findItemByPathSpy.mockImplementation((_, path) => ({
      path,
      content: `Content for ${path}`,
      title: path,
    }));

    const input = {
      docs: ["/docs/guide.md", "/docs/api.md"],
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Path mapping test",
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result.selectedPaths).toEqual(["/docs/guide.md", "/docs/api.md"]);
  });

  // EDGE CASES
  test("should handle special characters in file paths", async () => {
    const specialPaths = ["/docs/中文文档.md", "/docs/file with spaces.md"];
    findItemByPathSpy.mockImplementation((_, path) => ({
      path,
      content: `Content for ${path}`,
      title: path,
    }));

    const input = {
      docs: specialPaths,
      documentExecutionStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Special chars test",
      locale: "zh",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result.selectedPaths).toEqual(specialPaths);
  });
});
