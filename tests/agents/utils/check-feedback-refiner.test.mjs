import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as yaml from "yaml";
import checkFeedbackRefiner from "../../../agents/utils/check-feedback-refiner.mjs";

import * as preferencesUtils from "../../../utils/preferences-utils.mjs";

describe("check-feedback-refiner", () => {
  let mockOptions;

  // Spies for external dependencies
  let yamlStringifySpy;

  // Spies for internal utils
  let readPreferencesSpy;
  let addPreferenceRuleSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    mock.restore();

    mockOptions = {
      context: {
        agents: {
          feedbackRefiner: { mockAgent: true },
        },
        invoke: mock(async () => ({ refined: "feedback" })),
      },
    };

    // Set up spies for internal utils
    readPreferencesSpy = spyOn(preferencesUtils, "readPreferences").mockReturnValue({
      rules: [],
    });
    addPreferenceRuleSpy = spyOn(preferencesUtils, "addPreferenceRule").mockReturnValue({
      id: "pref_123",
    });
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

    // Set up spy for external dependencies
    yamlStringifySpy = spyOn(yaml, "stringify").mockImplementation(() => "mocked yaml");

    // Clear context mock call history
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    yamlStringifySpy?.mockRestore();
    readPreferencesSpy?.mockRestore();
    addPreferenceRuleSpy?.mockRestore();
    consoleErrorSpy?.mockRestore();
  });

  // BASIC FUNCTIONALITY TESTS
  test("should return empty object when no feedback provided", async () => {
    const result = await checkFeedbackRefiner(
      {
        feedback: "",
        structurePlanFeedback: "",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(result).toEqual({});
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
    expect(readPreferencesSpy).not.toHaveBeenCalled();
  });

  test("should return empty object when feedback is null/undefined", async () => {
    const result = await checkFeedbackRefiner(
      {
        feedback: null,
        structurePlanFeedback: undefined,
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(result).toEqual({});
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should process feedback when provided", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      refined: "refined feedback",
      save: false,
    });

    const result = await checkFeedbackRefiner(
      {
        feedback: "User feedback here",
        stage: "structure",
        selectedPaths: ["/doc1", "/doc2"],
      },
      mockOptions,
    );

    expect(readPreferencesSpy).toHaveBeenCalled();
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        feedback: "User feedback here",
        stage: "structure",
        paths: ["/doc1", "/doc2"],
        existingPreferences: "",
      }),
    );
    expect(result).toEqual({
      refined: "refined feedback",
      save: false,
    });
  });

  test("should process structurePlanFeedback when feedback is empty", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      refined: "refined structure feedback",
    });

    const result = await checkFeedbackRefiner(
      {
        feedback: "",
        structurePlanFeedback: "Structure feedback here",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        feedback: "Structure feedback here",
      }),
    );
    expect(result.refined).toBe("refined structure feedback");
  });

  test("should prefer feedback over structurePlanFeedback when both provided", async () => {
    mockOptions.context.invoke.mockResolvedValue({ refined: "result" });

    await checkFeedbackRefiner(
      {
        feedback: "Main feedback",
        structurePlanFeedback: "Structure feedback",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        feedback: "Main feedback",
      }),
    );
  });

  // PREFERENCES HANDLING TESTS
  test("should include existing active preferences in context", async () => {
    readPreferencesSpy.mockReturnValue({
      rules: [
        { id: "rule1", active: true, rule: "Active rule 1" },
        { id: "rule2", active: false, rule: "Inactive rule" },
        { id: "rule3", active: true, rule: "Active rule 2" },
      ],
    });

    yamlStringifySpy.mockReturnValue("yaml_preferences");

    await checkFeedbackRefiner(
      {
        feedback: "Test feedback",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(yamlStringifySpy).toHaveBeenCalledWith(
      {
        rules: [
          { id: "rule1", active: true, rule: "Active rule 1" },
          { id: "rule3", active: true, rule: "Active rule 2" },
        ],
      },
      { indent: 2 },
    );
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        existingPreferences: "yaml_preferences",
      }),
    );
  });

  test("should handle empty preferences gracefully", async () => {
    readPreferencesSpy.mockReturnValue({ rules: [] });

    await checkFeedbackRefiner(
      {
        feedback: "Test feedback",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        existingPreferences: "",
      }),
    );
  });

  test("should handle missing rules property in preferences", async () => {
    readPreferencesSpy.mockReturnValue({});

    await checkFeedbackRefiner(
      {
        feedback: "Test feedback",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        existingPreferences: "",
      }),
    );
  });

  // PREFERENCE SAVING TESTS
  test("should save preference when result indicates save is needed", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      save: true,
      scope: "structure",
      rule: "New preference rule",
    });

    addPreferenceRuleSpy.mockReturnValue({ id: "pref_456" });

    const result = await checkFeedbackRefiner(
      {
        feedback: "Save this feedback",
        stage: "structure",
        selectedPaths: ["/doc1", "/doc2"],
      },
      mockOptions,
    );

    expect(addPreferenceRuleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        save: true,
        scope: "structure",
        rule: "New preference rule",
      }),
      "Save this feedback",
      ["/doc1", "/doc2"],
    );

    expect(result.savedPreference).toEqual({
      id: "pref_456",
      saved: true,
    });
  });

  test("should not save preference when result indicates save is false", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      save: false,
      refined: "Just refined",
    });

    const result = await checkFeedbackRefiner(
      {
        feedback: "Don't save this",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(addPreferenceRuleSpy).not.toHaveBeenCalled();
    expect(result.savedPreference).toBeUndefined();
  });

  test("should not save preference when result has no save property", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      refined: "Just refined",
    });

    const result = await checkFeedbackRefiner(
      {
        feedback: "No save property",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(addPreferenceRuleSpy).not.toHaveBeenCalled();
    expect(result.savedPreference).toBeUndefined();
  });

  test("should handle preference save errors gracefully", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      save: true,
      rule: "Failed save rule",
    });

    addPreferenceRuleSpy.mockImplementation(() => {
      throw new Error("Save failed");
    });

    const result = await checkFeedbackRefiner(
      {
        feedback: "This will fail to save",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to save user preference rule:",
      "Save failed",
      "\nFeedback:",
      "This will fail to save",
    );

    expect(result.savedPreference).toEqual({
      saved: false,
      error: "Save failed",
    });
  });

  test("should use structurePlanFeedback for saving when feedback is empty", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      save: true,
      rule: "Structure rule",
    });

    await checkFeedbackRefiner(
      {
        feedback: "",
        structurePlanFeedback: "Structure feedback to save",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(addPreferenceRuleSpy).toHaveBeenCalledWith(
      expect.anything(),
      "Structure feedback to save",
      ["/doc1"],
    );
  });

  // PARAMETER PASSING TESTS
  test("should pass all parameters correctly to feedbackRefiner", async () => {
    readPreferencesSpy.mockReturnValue({
      rules: [{ id: "rule1", active: true, rule: "Test rule" }],
    });
    yamlStringifySpy.mockReturnValue("test_yaml");

    await checkFeedbackRefiner(
      {
        feedback: "Detailed feedback",
        stage: "detail",
        selectedPaths: ["/api/auth", "/api/users"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      {
        feedback: "Detailed feedback",
        stage: "detail",
        paths: ["/api/auth", "/api/users"],
        existingPreferences: "test_yaml",
      },
    );
  });

  test("should handle undefined selectedPaths", async () => {
    await checkFeedbackRefiner(
      {
        feedback: "Test feedback",
        stage: "structure",
        selectedPaths: undefined,
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        paths: undefined,
      }),
    );
  });

  test("should handle empty selectedPaths array", async () => {
    await checkFeedbackRefiner(
      {
        feedback: "Test feedback",
        stage: "structure",
        selectedPaths: [],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockAgent: true },
      expect.objectContaining({
        paths: [],
      }),
    );
  });

  // EDGE CASES
  test("should handle context invoke errors gracefully", async () => {
    mockOptions.context.invoke.mockRejectedValue(new Error("Context invoke failed"));

    await expect(
      checkFeedbackRefiner(
        {
          feedback: "Test feedback",
          stage: "structure",
          selectedPaths: ["/doc1"],
        },
        mockOptions,
      ),
    ).rejects.toThrow("Context invoke failed");
  });

  test("should preserve result structure when saving preference", async () => {
    mockOptions.context.invoke.mockResolvedValue({
      save: true,
      refined: "refined feedback",
      scope: "structure",
      rule: "New rule",
      customProperty: "custom value",
    });

    addPreferenceRuleSpy.mockReturnValue({ id: "pref_789" });

    const result = await checkFeedbackRefiner(
      {
        feedback: "Test feedback",
        stage: "structure",
        selectedPaths: ["/doc1"],
      },
      mockOptions,
    );

    expect(result).toEqual({
      save: true,
      refined: "refined feedback",
      scope: "structure",
      rule: "New rule",
      customProperty: "custom value",
      savedPreference: {
        id: "pref_789",
        saved: true,
      },
    });
  });
});
