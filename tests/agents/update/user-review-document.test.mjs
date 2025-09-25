import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as markedModule from "marked";
import userReviewDocument from "../../../agents/update/user-review-document.mjs";
import * as preferencesUtils from "../../../utils/preferences-utils.mjs";

describe("user-review-document", () => {
  let mockOptions;
  let mockContent;

  // Spies for internal utils
  let getActiveRulesForScopeSpy;
  let consoleSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let markedLexerSpy;
  let markedSpy;

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    mockContent = "# Getting Started\n\n## Installation\n\nThis is a test document.\n\n### Prerequisites\n\nSome prerequisites here.";

    mockOptions = {
      prompts: {
        select: mock(async () => "finish"),
        input: mock(async () => ""),
      },
      context: {
        agents: {
          updateDocumentDetail: {},
          checkFeedbackRefiner: {},
        },
        invoke: mock(async () => ({
          updatedContent: "# Updated Content\n\nThis is updated content.",
          operationSummary: "Document updated successfully",
        })),
      },
    };

    // Set up spies for internal utils
    getActiveRulesForScopeSpy = spyOn(preferencesUtils, "getActiveRulesForScope").mockReturnValue([]);
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    // Mock marked library
    markedLexerSpy = spyOn(markedModule.marked, "lexer").mockImplementation(() => [
      { type: "heading", depth: 1, text: "Getting Started" },
      { type: "heading", depth: 2, text: "Installation" },
      { type: "heading", depth: 3, text: "Prerequisites" },
    ]);
    markedSpy = spyOn(markedModule.marked, "setOptions").mockImplementation(() => {});

    // Clear context mock call history
    mockOptions.prompts.select.mockClear();
    mockOptions.prompts.input.mockClear();
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    getActiveRulesForScopeSpy?.mockRestore();
    consoleSpy?.mockRestore();
    consoleErrorSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
    markedLexerSpy?.mockRestore();
    markedSpy?.mockRestore();
  });

  // CONTENT VALIDATION TESTS
  test("should return original content when no content provided", async () => {
    const result = await userReviewDocument({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.content).toBeUndefined();
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No document content was provided to review.");
  });

  test("should return original content when empty content provided", async () => {
    const result = await userReviewDocument({ content: "" }, mockOptions);

    expect(result).toBeDefined();
    expect(result.content).toBe("");
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No document content was provided to review.");
  });

  test("should return original content when only whitespace provided", async () => {
    const result = await userReviewDocument({ content: "   \n\t  " }, mockOptions);

    expect(result).toBeDefined();
    expect(result.content).toBe("   \n\t  ");
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No document content was provided to review.");
  });

  // HEADING EXTRACTION TESTS
  test("should extract markdown headings correctly", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: mockContent, title: "Test Doc" }, mockOptions);

    expect(result).toBeDefined();
    expect(result.content).toBe(mockContent);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Current Document: Test Doc"));
    expect(markedLexerSpy).toHaveBeenCalledWith(mockContent);
  });

  test("should handle markdown parsing errors with fallback", async () => {
    markedLexerSpy.mockImplementation(() => {
      throw new Error("Parsing error");
    });

    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result).toBeDefined();
    expect(result.content).toBe(mockContent);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to parse markdown with marked library, falling back to regex:",
      "Parsing error"
    );
  });

  test("should handle empty content in heading extraction", async () => {
    const emptyContent = "";
    mockOptions.prompts.select.mockImplementation(async () => "finish");

    markedLexerSpy.mockReturnValue([]);

    const result = await userReviewDocument({ content: emptyContent }, mockOptions);

    expect(result.content).toBe(emptyContent);
    expect(consoleSpy).toHaveBeenCalledWith("No document content was provided to review.");
  });

  // USER INTERACTION TESTS
  test("should finish immediately when user selects finish", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(mockOptions.prompts.select).toHaveBeenCalledTimes(1);
    expect(mockOptions.prompts.input).not.toHaveBeenCalled();
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should show document details when user selects view", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "view");
    mockOptions.prompts.input.mockImplementation(async () => ""); // Empty feedback after view

    // Mock the marked function directly
    const markedFunctionSpy = spyOn(markedModule, "marked").mockReturnValue("Rendered markdown content");

    const result = await userReviewDocument({ content: mockContent, title: "Test Doc" }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(mockOptions.prompts.select).toHaveBeenCalledTimes(1);
    expect(mockOptions.prompts.input).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Document: Test Doc"));

    markedFunctionSpy?.mockRestore();
  });

  test("should handle marked-terminal rendering errors gracefully", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "view");
    mockOptions.prompts.input.mockImplementation(async () => ""); // Empty feedback after view

    // Mock the marked function to throw error
    const markedFunctionSpy = spyOn(markedModule, "marked").mockImplementation(() => {
      throw new Error("Rendering error");
    });

    const result = await userReviewDocument({ content: mockContent, title: "Test Doc" }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Falling back to plain text display")
    );

    markedFunctionSpy?.mockRestore();
  });

  // FEEDBACK PROCESSING TESTS
  test("should process user feedback and update content", async () => {
    const feedback = "Please add more examples";
    const updatedContent = "# Updated Content\n\nThis has more examples.";

    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => ""); // Exit loop

    mockOptions.context.invoke.mockImplementation(async () => ({
      updatedContent,
      operationSummary: "Added examples successfully",
    }));

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.updateDocumentDetail,
      expect.objectContaining({
        originalContent: mockContent,
        feedback: feedback,
        userPreferences: "",
      })
    );
    expect(result.content).toBe(updatedContent);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Added examples successfully")
    );
  });

  test("should handle empty feedback by exiting loop", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input.mockImplementation(async () => "");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should handle whitespace-only feedback by exiting loop", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input.mockImplementation(async () => "   \n\t  ");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  // USER PREFERENCES TESTS
  test("should include user preferences in update call", async () => {
    const feedback = "Improve clarity";
    const mockRules = [
      { rule: "Keep sections concise" },
      { rule: "Use clear headings" },
    ];
    const expectedPreferences = "Keep sections concise\n\nUse clear headings";

    getActiveRulesForScopeSpy
      .mockImplementationOnce(() => mockRules) // document rules
      .mockImplementationOnce(() => []); // global rules

    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    await userReviewDocument(
      { content: mockContent, path: "/test-doc" },
      mockOptions
    );

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("document", ["/test-doc"]);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global");
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.updateDocumentDetail,
      expect.objectContaining({
        userPreferences: expectedPreferences,
      })
    );
  });

  test("should combine document and global rules correctly", async () => {
    const feedback = "Add examples";
    const documentRules = [{ rule: "Document rule 1" }];
    const globalRules = [{ rule: "Global rule 1" }, { rule: "Global rule 2" }];
    const expectedPreferences = "Document rule 1\n\nGlobal rule 1\n\nGlobal rule 2";

    getActiveRulesForScopeSpy
      .mockImplementationOnce(() => documentRules)
      .mockImplementationOnce(() => globalRules);

    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    await userReviewDocument(
      { content: mockContent, path: "/test-doc" },
      mockOptions
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.updateDocumentDetail,
      expect.objectContaining({
        userPreferences: expectedPreferences,
      })
    );
  });

  // AGENT ERROR HANDLING TESTS
  test("should handle missing updateDocumentDetail agent", async () => {
    const feedback = "Some feedback";
    mockOptions.context.agents = {}; // No updateDocumentDetail agent

    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input.mockImplementation(async () => feedback);

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unable to process your feedback - the document update feature is unavailable."
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Please try again later or contact support if this continues."
    );
  });

  test("should handle updateDocumentDetail agent errors", async () => {
    const feedback = "Some feedback";
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke.mockImplementation(async () => {
      const error = new Error("Agent failed");
      error.name = "AgentError";
      error.stack = "Stack trace here";
      throw error;
    });

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error processing your feedback:");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Type: AgentError");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Message: Agent failed");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Stack: Stack trace here");
  });

  test("should handle updateDocumentDetail agent returning no content", async () => {
    const feedback = "Some feedback";
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke.mockImplementation(async () => ({})); // No updatedContent

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(consoleSpy).toHaveBeenCalledWith(
      "\n❌ Failed to update the document. Please try rephrasing your feedback.\n"
    );
  });

  // FEEDBACK REFINER TESTS
  test("should call checkFeedbackRefiner agent when available", async () => {
    const feedback = "Improve examples";
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke
      .mockImplementationOnce(async () => ({
        updatedContent: "Updated content",
        operationSummary: "Updated successfully",
      })) // updateDocumentDetail
      .mockImplementationOnce(async () => ({})); // checkFeedbackRefiner

    await userReviewDocument({ content: mockContent }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.checkFeedbackRefiner,
      expect.objectContaining({
        documentContentFeedback: feedback,
        stage: "document_refine",
      })
    );
  });

  test("should handle missing checkFeedbackRefiner agent gracefully", async () => {
    const feedback = "Some feedback";
    mockOptions.context.agents = { updateDocumentDetail: {} }; // No checkFeedbackRefiner

    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(1); // Only updateDocumentDetail called
    expect(result.content).toBe("# Updated Content\n\nThis is updated content.");
  });

  test("should handle checkFeedbackRefiner errors gracefully", async () => {
    const feedback = "Some feedback";
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke
      .mockImplementationOnce(async () => ({
        updatedContent: "Updated content",
        operationSummary: "Updated successfully",
      })) // updateDocumentDetail
      .mockImplementationOnce(async () => {
        throw new Error("Refiner failed");
      }); // checkFeedbackRefiner

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe("Updated content");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Could not save feedback as user preference:",
      "Refiner failed"
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Your feedback was applied but not saved as a preference."
    );
  });

  // MULTIPLE ROUNDS TESTS
  test("should handle multiple feedback rounds", async () => {
    const firstFeedback = "Add more examples";
    const secondFeedback = "Improve clarity";
    const firstUpdate = "# Content with examples";
    const secondUpdate = "# Clear content with examples";

    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => firstFeedback)
      .mockImplementationOnce(async () => secondFeedback)
      .mockImplementationOnce(async () => ""); // Exit loop

    mockOptions.context.invoke
      .mockImplementationOnce(async () => ({
        updatedContent: firstUpdate,
        operationSummary: "Added examples",
      })) // First update
      .mockImplementationOnce(async () => ({})) // First refiner
      .mockImplementationOnce(async () => ({
        updatedContent: secondUpdate,
        operationSummary: "Improved clarity",
      })) // Second update
      .mockImplementationOnce(async () => ({})); // Second refiner

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(4);
    expect(result.content).toBe(secondUpdate);
  });

  test("should stop at maximum iterations to prevent infinite loops", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "feedback");
    mockOptions.prompts.input.mockImplementation(async () => "Keep giving feedback");

    // Mock a long running process
    let callCount = 0;
    mockOptions.context.invoke.mockImplementation(async () => {
      callCount++;
      return {
        updatedContent: `Updated content ${callCount}`,
        operationSummary: `Update ${callCount}`,
      };
    });

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    // Should have stopped due to MAX_ITERATIONS (100)
    expect(mockOptions.prompts.input).toHaveBeenCalledTimes(100);
    expect(result.content).toBeDefined();
  });

  // EDGE CASES
  test("should handle document with no title", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Untitled Document"));
  });

  test("should handle nested tokens in marked parsing", async () => {
    const tokensWithNested = [
      {
        type: "heading",
        depth: 1,
        text: "Main Heading",
      },
      {
        type: "list",
        items: [],
        tokens: [
          {
            type: "heading",
            depth: 2,
            text: "Nested Heading",
          },
        ],
      },
    ];

    markedLexerSpy.mockReturnValue(tokensWithNested);
    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: mockContent }, mockOptions);

    expect(result.content).toBe(mockContent);
    // Should process both the main heading and nested heading
    expect(markedLexerSpy).toHaveBeenCalledWith(mockContent);
  });

  test("should handle non-string content gracefully", async () => {
    const result = await userReviewDocument({ content: null }, mockOptions);

    expect(result.content).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("No document content was provided to review.");
  });

  // FALLBACK HEADING EXTRACTION TESTS
  test("should use fallback regex extraction when marked fails", async () => {
    const contentWithHeadings = "# Title\n## Section\n### Subsection\nContent here.";
    markedLexerSpy.mockImplementation(() => {
      throw new Error("Marked failed");
    });

    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: contentWithHeadings }, mockOptions);

    expect(result.content).toBe(contentWithHeadings);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to parse markdown with marked library, falling back to regex:",
      "Marked failed"
    );
  });

  test("should handle content with no headings", async () => {
    const contentNoHeadings = "Just some plain text content without any headings.";
    markedLexerSpy.mockReturnValue([]);

    mockOptions.prompts.select.mockImplementation(async () => "finish");

    const result = await userReviewDocument({ content: contentNoHeadings }, mockOptions);

    expect(result.content).toBe(contentNoHeadings);
    expect(consoleSpy).toHaveBeenCalledWith("  No headings found in document.");
  });
});