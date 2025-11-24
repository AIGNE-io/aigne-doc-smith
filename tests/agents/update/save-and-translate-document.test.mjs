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
      expect(mockOptions.context.invoke).not.toHaveBeenCalled();
      expect(recordUpdateSpy).toHaveBeenCalledWith({
        operation: "document_update",
        feedback: "Good content",
        docPaths: ["/docs/test.md"],
      });

      // Reset mocks for next iteration
      mockOptions.prompts.select.mockClear();
      mockOptions.context.invoke.mockClear();
      recordUpdateSpy.mockClear();
    }
  });

  // SCENARIO 2: USER CHOOSES NOT TO TRANSLATE
  test("should skip translation when user chooses no", async () => {
    const input = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          labels: {},
          feedback: "Update needed",
        },
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          labels: {},
          feedback: "Second feedback",
        },
        {
          path: "/docs/test3.md",
          content: "# Test Document 3",
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
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
    expect(recordUpdateSpy).toHaveBeenCalledWith({
      operation: "document_update",
      feedback: "Update needed",
      docPaths: ["/docs/test1.md", "/docs/test2.md", "/docs/test3.md"],
    });
  });

  // SCENARIO 3: USER CHOOSES TO TRANSLATE
  test("should translate documents when user chooses yes", async () => {
    const input = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          labels: {},
          feedback: "Translation needed",
          title: "Test Document 1",
        },
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          labels: {},
          title: "Test Document 2",
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("yes");
    mockOptions.context.invoke.mockResolvedValue({ mockTranslateResult: true });

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
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(2);

    // Verify feedback is cleared before translation
    expect(input.selectedDocs[0].feedback).toBe("");
    expect(input.selectedDocs[1].feedback).toBe("");

    expect(recordUpdateSpy).toHaveBeenCalledWith({
      operation: "document_update",
      feedback: "Translation needed",
      docPaths: ["/docs/test1.md", "/docs/test2.md"],
    });
  });

  // ERROR HANDLING TESTS
  test("should handle errors gracefully", async () => {
    // Test translateMultilingual error
    const translateErrorInput = {
      selectedDocs: [
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          labels: {},
          title: "Test Document 2",
        },
      ],
      docsDir: "./docs",
      translateLanguages: ["en", "zh"],
      locale: "en",
    };

    mockOptions.prompts.select.mockResolvedValue("yes");
    mockOptions.context.invoke.mockRejectedValue(new Error("Translation failed"));

    const translateErrorResult = await saveAndTranslateDocument(translateErrorInput, mockOptions);

    expect(translateErrorResult).toEqual({});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to translate document /docs/test2.md:",
      "Translation failed",
    );
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(1);
  });

  // EDGE CASES AND INTEGRATION
  test("should handle edge cases and complex scenarios", async () => {
    // Test edge cases with different document properties
    const edgeCaseInput = {
      selectedDocs: [
        {
          path: "/docs/test1.md",
          content: "# Test Document 1",
          labels: {},
          feedback: "", // empty feedback
        },
        {
          path: "/docs/test2.md",
          content: "# Test Document 2",
          labels: {},
          feedback: "   ", // whitespace feedback
        },
        {
          path: "/docs/test3.md",
          content: "# Test Document 3",
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
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
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
    // 5 documents * 1 translate call each = 5 calls
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(5);
  });
});
