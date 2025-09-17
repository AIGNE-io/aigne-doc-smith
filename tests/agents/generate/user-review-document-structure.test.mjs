import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import userReviewDocumentStructure from "../../../agents/generate/user-review-document-structure.mjs";

import * as preferencesUtils from "../../../utils/preferences-utils.mjs";

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
          refineDocumentStructure: {},
        },
        invoke: mock(async () => ({
          documentStructure: documentStructure,
        })),
      },
    };

    // Set up spies for internal utils
    getActiveRulesForScopeSpy = spyOn(preferencesUtils, "getActiveRulesForScope").mockReturnValue(
      [],
    );

    consoleSpy = spyOn(console, "log").mockImplementation(() => {});

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

  test("should return original structure when no document structure provided", async () => {
    const result = await userReviewDocumentStructure({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.documentStructure).toBeUndefined();
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No document structure was generated to review.");
  });

  test("should return original structure when empty array provided", async () => {
    const result = await userReviewDocumentStructure({ documentStructure: [] }, mockOptions);

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual([]);
    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("No document structure was generated to review.");
  });

  test("should return original structure when user chooses not to review", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "no");

    const result = await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual(documentStructure);
    expect(mockOptions.prompts.select).toHaveBeenCalledWith({
      message:
        "Review the current document structure?\n  You can modify titles, adjust organization, add/remove sections, or refine content outlines.",
      choices: [
        {
          name: "Looks good, proceed with current structure",
          value: "no",
        },
        {
          name: "I want to review and provide feedback",
          value: "yes",
        },
      ],
    });
    expect(mockOptions.prompts.input).not.toHaveBeenCalled();
  });

  test("should enter review loop when user chooses to review", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input.mockImplementation(async () => ""); // Empty feedback to exit loop

    const result = await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual(documentStructure);
    expect(mockOptions.prompts.select).toHaveBeenCalled();
    expect(mockOptions.prompts.input).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Current Document Structure"));
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

    mockOptions.context.invoke.mockImplementation(async () => ({
      documentStructure: refinedStructure,
    }));

    const result = await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.refineDocumentStructure,
      expect.objectContaining({
        feedback: feedback,
        originalDocumentStructure: documentStructure,
        userPreferences: "",
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

    await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("structure", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.refineDocumentStructure,
      expect.objectContaining({
        userPreferences: expectedPreferences,
      }),
    );
  });

  test("should handle missing refineDocumentStructure agent", async () => {
    mockOptions.context.agents = {}; // No refineDocumentStructure agent
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input.mockImplementation(async () => "Some feedback");

    const result = await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(result.documentStructure).toEqual(documentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Unable to process your feedback - the structure refinement feature is not available.",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Please try again later or contact support if this issue persists.",
    );
  });

  test("should handle errors from refineDocumentStructure agent", async () => {
    mockOptions.prompts.select.mockImplementation(async () => "yes");
    mockOptions.prompts.input
      .mockImplementationOnce(async () => "Some feedback")
      .mockImplementationOnce(async () => "");

    mockOptions.context.invoke.mockImplementation(async () => {
      throw new Error("Agent failed");
    });

    const result = await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(result.documentStructure).toEqual(documentStructure);
    expect(consoleSpy).toHaveBeenCalledWith("Something went wrong while processing your feedback.");
    expect(consoleSpy).toHaveBeenCalledWith("Error details: Agent failed");
    expect(consoleSpy).toHaveBeenCalledWith(
      "You can try providing different feedback or continue with the current structure.",
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

    mockOptions.context.invoke
      .mockImplementationOnce(async () => ({ documentStructure: firstRefinedStructure }))
      .mockImplementationOnce(async () => ({ documentStructure: finalRefinedStructure }));

    const result = await userReviewDocumentStructure({ documentStructure }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalledTimes(2);
    expect(result.documentStructure).toEqual(finalRefinedStructure);
  });
});
