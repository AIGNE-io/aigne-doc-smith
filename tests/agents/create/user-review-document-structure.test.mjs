import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import userReviewDocumentStructure from "../../../agents/create/user-review-document-structure.mjs";

import * as preferencesUtils from "../../../utils/preferences-utils.mjs";
import * as historyUtils from "../../../utils/history-utils.mjs";

describe("user-review-document-structure", () => {
  let mockOptions;
  let documentStructure;

  // Spies for internal utils
  let getActiveRulesForScopeSpy;
  let consoleSpy;

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    documentStructure = [
      {
        path: "/getting-started",
        title: "Getting Started",
        description: "Introduction and setup guide",
        parentId: null,
      },
      {
        path: "/getting-started/installation",
        title: "Installation",
        description: "How to install the project",
        parentId: "/getting-started",
      },
      {
        path: "/api",
        title: "API Reference",
        description: "Complete API documentation",
        parentId: null,
      },
    ];

    mockOptions = {
      prompts: {
        select: mock(async () => "no"),
        input: mock(async () => ""),
      },
      context: {
        agents: {
          updateDocumentStructure: {},
          checkFeedbackRefiner: {},
        },
        invoke: mock(async () => {
          mockOptions.context.userContext.currentStructure = documentStructure;
          return { message: "updated" };
        }),
        userContext: {
          currentStructure: [...documentStructure],
        },
      },
    };

    // Set up spies for internal utils
    getActiveRulesForScopeSpy = spyOn(preferencesUtils, "getActiveRulesForScope").mockReturnValue(
      [],
    );

    consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    spyOn(historyUtils, "recordUpdate").mockImplementation(() => {});

    // Clear prompts mock call history
    mockOptions.prompts.select.mockClear();
    mockOptions.prompts.input.mockClear();
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    getActiveRulesForScopeSpy?.mockRestore();
    consoleSpy?.mockRestore();
  });

  test("should return original structure when no documentation structure provided", async () => {
    const result = await userReviewDocumentStructure({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.documentStructure).toBeUndefined();
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No documentation structure was generated to review.");
  });

  test("should return original structure when empty array provided", async () => {
    const result = await userReviewDocumentStructure({ documentStructure: [] }, mockOptions);

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual([]);
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No documentation structure was generated to review.");
  });

  test("should return original structure when user chooses not to review", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "no");

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual(documentStructure);
    expect(mockOptions.prompts.select).toHaveBeenCalled();
    expect(mockOptions.prompts.input).not.toHaveBeenCalled();
  });

  test("should enter review loop when user chooses to review", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input.mockImplementation(async () => ""); // Empty feedback to exit loop

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual(documentStructure);
    expect(mockOptions.prompts.select).toHaveBeenCalled();
    expect(mockOptions.prompts.input).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Current Documentation Structure"),
    );
  });

  test("should process user feedback and call refineDocumentStructure agent", async () => {
    const feedback = "Please add more details to the API section";
    const refinedStructure = [
      ...documentStructure,
      {
        path: "/api/authentication",
        title: "Authentication",
        description: "How to authenticate API requests",
        parentId: "/api",
      },
    ];

    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => ""); // Exit loop on second call

    mockOptions.context.invoke.mockImplementation(async () => {
      // Simulate the agent updating the shared context
      mockOptions.context.userContext.currentStructure = refinedStructure;
      return {
        documentStructure: refinedStructure,
      };
    });

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.updateDocumentStructure,
      expect.objectContaining({
        feedback: feedback,
        documentStructure: documentStructure,
        userPreferences: "",
        dataSourceChunk: "chunk",
      }),
    );
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.checkFeedbackRefiner,
      expect.objectContaining({
        documentStructureFeedback: feedback,
        stage: "structure",
      }),
    );
    expect(result.documentStructure).toEqual(refinedStructure);
  });

  test("should include user preferences in refinement call", async () => {
    const mockRules = [{ rule: "Keep sections concise" }, { rule: "Use clear headings" }];
    const expectedPreferences = "Keep sections concise\n\nUse clear headings";

    getActiveRulesForScopeSpy
      .mockImplementationOnce(() => mockRules) // structure rules
      .mockImplementationOnce(() => []); // global rules

    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => "Add more examples")
      .mockImplementationOnce(async () => "");

    await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("structure", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.updateDocumentStructure,
      expect.objectContaining({
        userPreferences: expectedPreferences,
        dataSourceChunk: "chunk",
      }),
    );
  });

  test("should handle missing updateDocumentStructure agent", async () => {
    mockOptions.context.agents = {}; // No updateDocumentStructure agent
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input.mockImplementation(async () => "Some feedback");

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(documentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unable to process your feedback - the documentation structure update feature is unavailable.",
    );
  });

  test("should handle errors from updateDocumentStructure agent", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => "Some feedback")
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke.mockImplementation(async () => {
      throw new Error("Agent failed");
    });

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(documentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "\nPlease try rephrasing your feedback or continue with the current structure.",
    );
  });

  test("should handle multiple feedback rounds", async () => {
    const firstFeedback = "Add authentication section";
    const secondFeedback = "Reorganize API structure";

    const firstRefinedStructure = [
      ...documentStructure,
      {
        path: "/api/auth",
        title: "Authentication",
        description: "Auth guide",
        parentId: "/api",
      },
    ];

    const finalRefinedStructure = [
      ...firstRefinedStructure,
      {
        path: "/api/endpoints",
        title: "Endpoints",
        description: "API endpoints",
        parentId: "/api",
      },
    ];

    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => firstFeedback)
      .mockImplementationOnce(async () => secondFeedback)
      .mockImplementationOnce(async () => ""); // Exit loop

    let invokeCount = 0;
    mockOptions.context.invoke.mockImplementation(async () => {
      invokeCount++;
      if (invokeCount === 1) {
        // refineDocumentStructure 1st call
        mockOptions.context.userContext.currentStructure = firstRefinedStructure;
        return { documentStructure: firstRefinedStructure };
      } else if (invokeCount === 2) {
        // checkFeedbackRefiner 1st call
        return {};
      } else if (invokeCount === 3) {
        // refineDocumentStructure 2nd call
        mockOptions.context.userContext.currentStructure = finalRefinedStructure;
        return { documentStructure: finalRefinedStructure };
      } else {
        // checkFeedbackRefiner 2nd call
        return {};
      }
    });

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(4); // 2 refine + 2 feedback refiner calls
    expect(result.documentStructure).toEqual(finalRefinedStructure);
  });

  test("should handle missing checkFeedbackRefiner agent gracefully", async () => {
    const feedback = "Some feedback";
    mockOptions.context.agents = { updateDocumentStructure: {} }; // No checkFeedbackRefiner agent

    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(documentStructure);
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(1); // Only refineDocumentStructure called
  });

  test("should handle checkFeedbackRefiner errors gracefully", async () => {
    const feedback = "Some feedback";
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});

    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke
      .mockImplementationOnce(async () => ({ documentStructure })) // refineDocumentStructure
      .mockImplementationOnce(async () => {
        throw new Error("Refiner failed");
      }); // checkFeedbackRefiner

    const result = await userReviewDocumentStructure(
      { documentStructure, dataSources: [{ dataSourceChunk: "chunk" }] },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(documentStructure);
    expect(warnSpy).toHaveBeenCalledWith(
      "Could not save feedback as a user preference:",
      "Refiner failed",
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "Your feedback was applied but not saved as a preference.",
    );

    warnSpy.mockRestore();
  });

  test("should log error in chat mode when structure is unchanged", async () => {
    const feedback = "No changes";
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => feedback)
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke.mockImplementation(async () => {
      // simulate refine agent returning same structure
      mockOptions.context.userContext.currentStructure = documentStructure;
      return { message: "No-op" };
    });

    const errorSpy = spyOn(console, "error").mockImplementation(() => {});

    const result = await userReviewDocumentStructure(
      {
        documentStructure,
        dataSources: [{ dataSourceChunk: "chunk" }],
        isChat: true,
        feedback,
      },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(documentStructure);
    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("Error processing your feedback:");
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("did not modify the existing documentation structure"),
    );

    errorSpy.mockRestore();
  });
});
