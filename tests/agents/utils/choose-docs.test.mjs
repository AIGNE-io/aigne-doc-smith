import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import chooseDocs from "../../../agents/utils/choose-docs.mjs";
import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";
import * as debugModule from "../../../utils/debug.mjs";
import * as checkDiagramModule from "../../../utils/check-document-has-diagram.mjs";

describe("chooseDocs utility", () => {
  let getMainLanguageFilesSpy;
  let processSelectedFilesSpy;
  let findItemByPathSpy;
  let getActionTextSpy;
  let addFeedbackToItemsSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let debugSpy;
  let hasBananaImagesSpy;
  let hasDiagramContentSpy;
  let getDiagramTypeLabelsSpy;
  let formatDiagramTypeSuffixSpy;
  let readFileContentSpy;
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
      (baseText, action) => baseText.replace("{action}", action),
    );
    addFeedbackToItemsSpy = spyOn(docsFinderUtils, "addFeedbackToItems").mockImplementation(
      (items, feedback) => items.map((item) => ({ ...item, feedback })),
    );

    // Spy on console methods
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    // Spy on debug function
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});

    // Spy on diagram checking functions
    hasBananaImagesSpy = spyOn(checkDiagramModule, "hasBananaImages").mockReturnValue(false);
    hasDiagramContentSpy = spyOn(checkDiagramModule, "hasDiagramContent").mockReturnValue(false);
    getDiagramTypeLabelsSpy = spyOn(checkDiagramModule, "getDiagramTypeLabels").mockReturnValue([]);
    formatDiagramTypeSuffixSpy = spyOn(
      checkDiagramModule,
      "formatDiagramTypeSuffix",
    ).mockReturnValue("");
    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue("");

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
    debugSpy?.mockRestore();
    hasBananaImagesSpy?.mockRestore();
    hasDiagramContentSpy?.mockRestore();
    getDiagramTypeLabelsSpy?.mockRestore();
    formatDiagramTypeSuffixSpy?.mockRestore();
    readFileContentSpy?.mockRestore();
  });

  // DOCS PROVIDED TESTS
  test("should process provided docs array successfully", async () => {
    const input = {
      docs: ["/docs/guide.md", "/docs/api.md"],
      documentStructure: [{ path: "/docs/guide.md" }],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Update these docs",
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(findItemByPathSpy).toHaveBeenCalledTimes(2);
    expect(findItemByPathSpy).toHaveBeenCalledWith(
      input.documentStructure,
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
      documentStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(debugSpy).toHaveBeenCalledWith(
      '⚠️  Item with path "/docs/missing.md" not found in documentStructure',
    );
    expect(result.selectedDocs).toHaveLength(2); // Only found items
  });

  test("should throw error when none of provided docs are found", async () => {
    findItemByPathSpy.mockResolvedValue(null);

    const input = {
      docs: ["/docs/missing1.md", "/docs/missing2.md"],
      documentStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    await expect(chooseDocs(input, mockOptions)).rejects.toThrow(
      "None of the specified document paths were found in documentStructure",
    );
  });

  // INTERACTIVE SELECTION TESTS
  test("should handle interactive document selection when docs not provided", async () => {
    const input = {
      docs: [],
      documentStructure: [{ path: "/docs/guide.md" }],
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(getMainLanguageFilesSpy).toHaveBeenCalledWith(
      "/project/docs",
      "en",
      input.documentStructure,
    );
    expect(mockOptions.prompts.checkbox).toHaveBeenCalled();
    expect(processSelectedFilesSpy).toHaveBeenCalledWith(
      ["/docs/guide.md", "/docs/api.md"],
      input.documentStructure,
      "/project/docs",
    );
    expect(result.selectedDocs).toBeDefined();
  });

  test("should handle interactive selection when docs is null", async () => {
    const input = {
      docs: null,
      documentStructure: [],
      docsDir: "/project/docs",
      isTranslate: true,
      locale: "zh",
    };

    await chooseDocs(input, mockOptions);

    expect(getMainLanguageFilesSpy).toHaveBeenCalled();
    expect(getActionTextSpy).toHaveBeenCalledWith("Select documents to {action}:", "translate");
  });

  test("should handle no main language files found by exiting gracefully", async () => {
    getMainLanguageFilesSpy.mockResolvedValue([]);

    const input = {
      docs: [],
      documentStructure: [],
      docsDir: "/empty/docs",
      isTranslate: false,
      locale: "en",
    };

    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    try {
      await chooseDocs(input, mockOptions);
    } catch (err) {
      expect(err?.message).toBe("process.exit called");
    }

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(debugSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
  });

  test("should handle no documents selected interactively by exiting gracefully", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue([]);

    const input = {
      docs: [],
      documentStructure: [],
      docsDir: "/project/docs",
      isTranslate: false,
      locale: "en",
    };

    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    try {
      await chooseDocs(input, mockOptions);
    } catch (err) {
      expect(err?.message).toBe("process.exit called");
    }

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(debugSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
  });

  // CHECKBOX VALIDATION TESTS
  test("should validate checkbox selection requires at least one document", async () => {
    const input = {
      docs: [],
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
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
      documentStructure: [],
      boardId: "board-123",
      docsDir: "/project/docs",
      isTranslate: false,
      feedback: "Special chars test",
      locale: "zh",
    };

    const result = await chooseDocs(input, mockOptions);

    expect(result.selectedPaths).toEqual(specialPaths);
  });

  // DIAGRAM UPDATE FLAG TESTS
  describe("shouldUpdateDiagrams flag", () => {
    test("should filter documents with diagram content when shouldUpdateDiagrams is true", async () => {
      getMainLanguageFilesSpy.mockResolvedValue(["guide.md", "api.md", "tutorial.md"]);
      readFileContentSpy
        .mockResolvedValueOnce("content with diagram") // guide.md
        .mockResolvedValueOnce("content without") // api.md
        .mockResolvedValueOnce("content with diagram"); // tutorial.md
      hasDiagramContentSpy
        .mockReturnValueOnce(true) // guide.md
        .mockReturnValueOnce(false) // api.md
        .mockReturnValueOnce(true); // tutorial.md
      getDiagramTypeLabelsSpy.mockReturnValue(["⛔️ D2"]);
      formatDiagramTypeSuffixSpy.mockReturnValue(" [⛔️ D2]");
      processSelectedFilesSpy.mockResolvedValue([
        { path: "/guide", content: "content", title: "Guide" },
        { path: "/tutorial", content: "content", title: "Tutorial" },
      ]);

      const input = {
        docs: [],
        documentStructure: [],
        docsDir: "/project/docs",
        isTranslate: false,
        locale: "en",
        shouldUpdateDiagrams: true,
        shouldAutoSelectDiagrams: false,
      };

      mockOptions.prompts.checkbox.mockResolvedValue(["guide.md", "tutorial.md"]);

      const result = await chooseDocs(input, mockOptions);

      expect(readFileContentSpy).toHaveBeenCalled();
      expect(hasDiagramContentSpy).toHaveBeenCalledTimes(3);
      expect(mockOptions.prompts.checkbox).toHaveBeenCalled();
      expect(result.selectedDocs).toBeDefined();
      expect(debugSpy).toHaveBeenCalledWith("🔄 Filtering documents with diagram content...");
    });

    test("should auto-select all when shouldAutoSelectDiagrams is true", async () => {
      getMainLanguageFilesSpy.mockResolvedValue(["guide.md", "api.md"]);
      readFileContentSpy.mockResolvedValue("content with diagram");
      hasDiagramContentSpy.mockReturnValue(true);
      getDiagramTypeLabelsSpy.mockReturnValue(["⛔️ D2", "🍌 Image"]);
      formatDiagramTypeSuffixSpy.mockReturnValue(" [⛔️ D2, 🍌 Image]");
      processSelectedFilesSpy.mockResolvedValue([
        { path: "/guide", content: "content", title: "Guide" },
        { path: "/api", content: "content", title: "API" },
      ]);

      const input = {
        docs: [],
        documentStructure: [],
        docsDir: "/project/docs",
        isTranslate: false,
        locale: "en",
        shouldUpdateDiagrams: true,
        shouldAutoSelectDiagrams: true,
      };

      const result = await chooseDocs(input, mockOptions);

      expect(result.selectedDocs).toHaveLength(2);
      expect(mockOptions.prompts.checkbox).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith("📋 Auto-selecting all documents with diagrams...");
    });

    test("should return empty when no documents have diagram content", async () => {
      getMainLanguageFilesSpy.mockResolvedValue(["guide.md", "api.md"]);
      hasDiagramContentSpy.mockReturnValue(false);

      const input = {
        docs: [],
        documentStructure: [],
        docsDir: "/project/docs",
        isTranslate: false,
        locale: "en",
        shouldUpdateDiagrams: true,
      };

      const result = await chooseDocs(input, mockOptions);

      expect(result.selectedDocs).toEqual([]);
      expect(result.feedback).toBe("");
      expect(result.selectedPaths).toEqual([]);
      expect(debugSpy).toHaveBeenCalledWith(
        "ℹ️  No documents found with diagram content (d2 code blocks, placeholders, or diagram images).",
      );
    });

    test("should show diagram type labels in checkbox choices", async () => {
      getMainLanguageFilesSpy.mockResolvedValue(["guide.md"]);
      readFileContentSpy.mockResolvedValue("content with diagram");
      hasDiagramContentSpy.mockReturnValue(true);
      getDiagramTypeLabelsSpy.mockReturnValue(["⛔️ D2", "🍌 Image"]);
      formatDiagramTypeSuffixSpy.mockReturnValue(" [⛔️ D2, 🍌 Image]");
      processSelectedFilesSpy.mockResolvedValue([
        { path: "/guide", content: "content", title: "Guide" },
      ]);

      const input = {
        docs: [],
        documentStructure: [{ path: "/guide", title: "Guide" }],
        docsDir: "/project/docs",
        isTranslate: false,
        locale: "en",
        shouldUpdateDiagrams: true,
        shouldAutoSelectDiagrams: false,
      };

      mockOptions.prompts.checkbox.mockResolvedValue(["guide.md"]);

      await chooseDocs(input, mockOptions);

      const checkboxCall = mockOptions.prompts.checkbox.mock.calls[0][0];
      const choices = await checkboxCall.source();
      expect(choices[0].name).toContain("[⛔️ D2, 🍌 Image]");
    });

    test("should filter choices by search term", async () => {
      getMainLanguageFilesSpy.mockResolvedValue(["guide.md", "api-guide.md"]);
      readFileContentSpy.mockResolvedValue("content with diagram");
      hasDiagramContentSpy.mockReturnValue(true);
      getDiagramTypeLabelsSpy.mockReturnValue([]);
      formatDiagramTypeSuffixSpy.mockReturnValue("");
      processSelectedFilesSpy.mockResolvedValue([
        { path: "/guide", content: "content", title: "Guide" },
      ]);

      const input = {
        docs: [],
        documentStructure: [],
        docsDir: "/project/docs",
        isTranslate: false,
        locale: "en",
        shouldUpdateDiagrams: true,
        shouldAutoSelectDiagrams: false,
      };

      mockOptions.prompts.checkbox.mockResolvedValue(["guide.md"]);

      await chooseDocs(input, mockOptions);

      const checkboxCall = mockOptions.prompts.checkbox.mock.calls[0][0];
      const allChoices = await checkboxCall.source();
      const filteredChoices = await checkboxCall.source("api");
      expect(filteredChoices.length).toBeLessThan(allChoices.length);
      expect(filteredChoices[0].name).toContain("api");
    });

    test("should skip feedback prompt when shouldUpdateDiagrams is true", async () => {
      getMainLanguageFilesSpy.mockResolvedValue(["guide.md"]);
      hasDiagramContentSpy.mockReturnValue(true);
      getDiagramTypeLabelsSpy.mockReturnValue([]);
      formatDiagramTypeSuffixSpy.mockReturnValue("");

      const input = {
        docs: [],
        documentStructure: [],
        docsDir: "/project/docs",
        isTranslate: false,
        locale: "en",
        shouldUpdateDiagrams: true,
        shouldAutoSelectDiagrams: true,
        requiredFeedback: true,
      };

      const result = await chooseDocs(input, mockOptions);

      expect(mockOptions.prompts.input).not.toHaveBeenCalled();
      expect(result.feedback).toBe("");
    });
  });
});
