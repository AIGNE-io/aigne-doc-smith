import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import saveAndTranslateDocument from "../../../agents/update/save-and-translate-document.mjs";
import * as historyUtils from "../../../utils/history-utils.mjs";

describe("save-and-translate-document", () => {
  let mockOptions;
  let consoleErrorSpy;
  let recordUpdateSpy;

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    mockOptions = {
      prompts: {
        select: mock(async () => "no"),
      },
      context: {
        agents: {
          saveSingleDoc: { mockSaveAgent: true },
          translateMultilingual: { mockTranslateAgent: true },
        },
        invoke: mock(async () => ({ mockResult: true })),
      },
    };

    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    recordUpdateSpy = spyOn(historyUtils, "recordUpdate").mockImplementation(() => {});

    // Clear context mock call history
    mockOptions.prompts.select.mockClear();
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    recordUpdateSpy?.mockRestore();
  });

  // INPUT VALIDATION TESTS
  test("should handle empty or invalid selectedDocs", async () => {
    const testCases = [
      { selectedDocs: [], description: "empty array" },
      { selectedDocs: null, description: "null" },
      { selectedDocs: undefined, description: "undefined" },
      { selectedDocs: "not-array", description: "non-array" },
    ];

    for (const testCase of testCases) {
      const input = {
        selectedDocs: testCase.selectedDocs,
        docsDir: "./docs",
        translateLanguages: ["en", "zh"],
        locale: "en",
      };

      const result = await saveAndTranslateDocument(input, mockOptions);

      expect(result).toEqual({});
      expect(mockOptions.context.invoke).not.toHaveBeenCalled();
      expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    }
  });

  // SCENARIO 1: NO TRANSLATION CONFIGURATION
  test("should skip translation when no translation languages configured", async () => {
    const testCases = [
      { translateLanguages: null, description: "null" },
      { translateLanguages: undefined, description: "undefined" },
      { translateLanguages: [], description: "empty array" },
      { translateLanguages: ["en"], description: "only current locale" },
    ];

    for (const testCase of testCases) {
      const input = {
        selectedDocs: [
          {
            path: "/docs/test.md",
            content: "# Test Document",
            translates: {},
            labels: {},
            feedback: "Good content",
          },
        ],
        docsDir: "./docs",
        translateLanguages: testCase.translateLanguages,
        locale: "en",
      };

      const result = await saveAndTranslateDocument(input, mockOptions);

      expect(result).toEqual({});
      expect(mockOptions.prompts.select).not.toHaveBeenCalled();
      expect(mockOptions.context.invoke).toHaveBeenCalledTimes(1);
      expect(recordUpdateSpy).toHaveBeenCalledWith({
        operation: "document_update",
        feedback: "Good content",
        documentPath: "/docs/test.md",
      });

      // Reset mocks for next iteration
      mockOptions.prompts.select.mockClear();
      mockOptions.context.invoke.mockClear();
      recordUpdateSpy.mockClear();
    }
  });

  // SCENARIO 2: USER CHOOSES NOT TO TRANSLATE
  test("should save documents and skip translation when user chooses no", async () => {
    const input = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          translates: {},
          labels: {},
          feedback: "Update needed",
        },
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          translates: {},
          labels: {},
          feedback: "Second feedback",
        },
        {
          path: "/docs/test3.md",
          content: "# Test Document 3",
          translates: {},
          labels: {},
          feedback: "   ", // Whitespace only
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh", "ja"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("no");

    const result = await saveAndTranslateDocument(input, mockOptions);

    expect(result).toEqual({});
    expect(mockOptions.prompts.select).toHaveBeenCalledWith({
      message: "Document update completed. Would you like to translate these documents now?",
      choices: [
        {
          name: "Review documents first, translate later",
          value: "no",
        },
        {
          name: "Translate now",
          value: "yes",
        },
      ],
    });
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(3); // Only saveDocument calls
    expect(recordUpdateSpy).toHaveBeenCalledTimes(2); // Only documents with non-empty feedback
    expect(recordUpdateSpy).toHaveBeenCalledWith({
      operation: "document_update",
      feedback: "Update needed",
      documentPath: "/docs/test1.md",
    });
    expect(recordUpdateSpy).toHaveBeenCalledWith({
      operation: "document_update",
      feedback: "Second feedback",
      documentPath: "/docs/test2.md",
    });
  });

  // SCENARIO 3: USER CHOOSES TO TRANSLATE
  test("should save and translate documents when user chooses yes", async () => {
    const input = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          translates: {},
          labels: {},
          feedback: "Translation needed",
          title: "Test Document 1",
        },
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          translates: {},
          labels: {},
          title: "Test Document 2",
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("yes");
    mockOptions.context.invoke
      .mockResolvedValueOnce({ mockSaveResult: true }) // saveDocument 1
      .mockResolvedValueOnce({ mockSaveResult: true }) // saveDocument 2
      .mockResolvedValueOnce({ translates: { zh: "# 测试文档 1" } }) // translateMultilingual 1
      .mockResolvedValueOnce({ translates: { zh: "# 测试文档 2" } }) // translateMultilingual 2
      .mockResolvedValueOnce({ mockSaveResult: true }) // saveDocument with translation 1
      .mockResolvedValueOnce({ mockSaveResult: true }); // saveDocument with translation 2

    const result = await saveAndTranslateDocument(input, mockOptions);

    expect(result).toEqual({});
    expect(mockOptions.prompts.select).toHaveBeenCalledWith({
      message: "Document update completed. Would you like to translate these documents now?",
      choices: [
        {
          name: "Review documents first, translate later",
          value: "no",
        },
        {
          name: "Translate now",
          value: "yes",
        },
      ],
    });
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(6);

    // Verify feedback is cleared before translation
    expect(input.selectedDocs[0].feedback).toBe("");
    expect(input.selectedDocs[1].feedback).toBe("");

    expect(recordUpdateSpy).toHaveBeenCalledWith({
      operation: "document_update",
      feedback: "Translation needed",
      documentPath: "/docs/test1.md",
    });
  });

  // ERROR HANDLING TESTS
  test("should handle errors gracefully", async () => {
    // Test saveDocument error
    const saveErrorInput = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          translates: {},
          labels: {},
          feedback: "Error test",
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("no");
    mockOptions.context.invoke.mockRejectedValue(new Error("Save failed"));

    const saveErrorResult = await saveAndTranslateDocument(saveErrorInput, mockOptions);

    expect(saveErrorResult).toEqual({});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to save document /docs/test1.md:",
      "Save failed",
    );
    expect(recordUpdateSpy).not.toHaveBeenCalled(); // Should not record if save failed

    // Reset mocks
    mockOptions.prompts.select.mockClear();
    mockOptions.context.invoke.mockClear();
    consoleErrorSpy.mockClear();
    recordUpdateSpy.mockClear();

    // Test translateMultilingual error
    const translateErrorInput = {
      selectedDocs: [
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          translates: {},
          labels: {},
          title: "Test Document 2",
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("yes");
    mockOptions.context.invoke
      .mockResolvedValueOnce({ mockSaveResult: true }) // saveDocument succeeds
      .mockRejectedValueOnce(new Error("Translation failed")); // translateMultilingual fails

    const translateErrorResult = await saveAndTranslateDocument(translateErrorInput, mockOptions);

    expect(translateErrorResult).toEqual({});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to translate document /docs/test2.md:",
      "Translation failed",
    );
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(2);
  });

  // EDGE CASES AND INTEGRATION
  test("should handle edge cases and complex scenarios", async () => {
    // Test edge cases with different document properties
    const edgeCaseInput = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          translates: null, // null translates
          labels: {},
          feedback: "", // empty feedback
        },
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          translates: undefined, // undefined translates
          labels: {},
          feedback: "   ", // whitespace feedback
        },
        {
          path: "/docs/test3.md",
          content: "# Test Document 3",
          translates: {},
          labels: {},
          // no title
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("no");

    const edgeCaseResult = await saveAndTranslateDocument(edgeCaseInput, mockOptions);

    expect(edgeCaseResult).toEqual({});
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(3);
    expect(recordUpdateSpy).not.toHaveBeenCalled(); // No valid feedback

    // Reset mocks
    mockOptions.prompts.select.mockClear();
    mockOptions.context.invoke.mockClear();
    recordUpdateSpy.mockClear();

    // Test batch processing with multiple documents
    const batchInput = {
      selectedDocs: Array.from({ length: 5 }, (_, i) => ({
        path: `/docs/batch${i + 1}.md`,
        content: `# Batch Document ${i + 1}`,
        translates: {},
        labels: {},
        title: `Batch Document ${i + 1}`,
      })),
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("yes");
    mockOptions.context.invoke.mockResolvedValue({ mockResult: true });

    const batchResult = await saveAndTranslateDocument(batchInput, mockOptions);

    expect(batchResult).toEqual({});
    // 5 documents * 3 calls each (save, translate, save) = 15 calls
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(15);
  });
});
