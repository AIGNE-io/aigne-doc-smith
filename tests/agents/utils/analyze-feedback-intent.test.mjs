import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as aigneCore from "@aigne/core";
import analyzeFeedbackIntent from "../../../agents/utils/analyze-feedback-intent.mjs";

describe("analyze-feedback-intent", () => {
  let mockOptions;
  let aiAgentFromSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    // Mock AIAgent.from
    aiAgentFromSpy = spyOn(aigneCore.AIAgent, "from").mockReturnValue({
      name: "analyzeUpdateFeedbackIntent",
    });

    // Mock console.warn
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

    mockOptions = {
      context: {
        invoke: mock(async () => ({ intentType: "updateDocument" })),
      },
    };

    // Clear mock call history
    mockOptions.context.invoke.mockClear();
    aiAgentFromSpy.mockClear();
  });

  afterEach(() => {
    aiAgentFromSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
  });

  // INPUT VALIDATION TESTS
  test("should return null when feedback is not provided", async () => {
    const result = await analyzeFeedbackIntent({}, mockOptions);
    expect(result).toEqual({ intentType: null });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is null", async () => {
    const result = await analyzeFeedbackIntent({ feedback: null }, mockOptions);
    expect(result).toEqual({ intentType: null });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is undefined", async () => {
    const result = await analyzeFeedbackIntent({ feedback: undefined }, mockOptions);
    expect(result).toEqual({ intentType: null });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is not a string", async () => {
    const result = await analyzeFeedbackIntent({ feedback: 123 }, mockOptions);
    expect(result).toEqual({ intentType: null });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is empty string", async () => {
    const result = await analyzeFeedbackIntent({ feedback: "" }, mockOptions);
    expect(result).toEqual({ intentType: null });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is only whitespace", async () => {
    const result = await analyzeFeedbackIntent({ feedback: "   \n\t  " }, mockOptions);
    expect(result).toEqual({ intentType: null });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  // SUCCESSFUL ANALYSIS TESTS
  test("should return addDiagram intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "addDiagram" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Please add a diagram showing the architecture" },
      mockOptions,
    );

    expect(result).toEqual({ intentType: "addDiagram" });
    expect(aiAgentFromSpy).toHaveBeenCalled();
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Please add a diagram showing the architecture" },
    );
  });

  test("should return deleteDiagram intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "deleteDiagram" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Remove the diagram on page 3" },
      mockOptions,
    );

    expect(result).toEqual({ intentType: "deleteDiagram" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Remove the diagram on page 3" },
    );
  });

  test("should return updateDiagram intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDiagram" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Update the flow diagram to show the new process" },
      mockOptions,
    );

    expect(result).toEqual({ intentType: "updateDiagram" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update the flow diagram to show the new process" },
    );
  });

  test("should return updateDocument intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Update the introduction section" },
      mockOptions,
    );

    expect(result).toEqual({ intentType: "updateDocument" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update the introduction section" },
    );
  });

  test("should trim feedback before passing to agent", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent(
      { feedback: "  Update the content  \n" },
      mockOptions,
    );

    expect(result).toEqual({ intentType: "updateDocument" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update the content" },
    );
  });

  // ERROR HANDLING TESTS
  test("should return null and log warning when invoke throws an error", async () => {
    const mockError = new Error("Network timeout");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    const result = await analyzeFeedbackIntent({ feedback: "Update the document" }, mockOptions);

    expect(result).toEqual({ intentType: null });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to analyze feedback intent: Network timeout",
    );
  });

  test("should return null and log warning when invoke throws a different error", async () => {
    const mockError = new Error("Invalid response format");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    const result = await analyzeFeedbackIntent({ feedback: "Add a new section" }, mockOptions);

    expect(result).toEqual({ intentType: null });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to analyze feedback intent: Invalid response format",
    );
  });

  // AIAGENT CONFIGURATION TESTS
  test("should create AIAgent with correct configuration", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    await analyzeFeedbackIntent({ feedback: "Test feedback" }, mockOptions);

    expect(aiAgentFromSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "analyzeUpdateFeedbackIntent",
        description: expect.stringContaining("Analyze user feedback"),
        task_render_mode: "hide",
        instructions: expect.stringContaining("You are a feedback intent analyzer"),
      }),
    );
  });

  test("should create AIAgent with correct input schema", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    await analyzeFeedbackIntent({ feedback: "Test feedback" }, mockOptions);

    const callArgs = aiAgentFromSpy.mock.calls[0][0];
    expect(callArgs.inputSchema).toBeDefined();
    // Verify inputSchema is a zod object (it should have _def property)
    expect(callArgs.inputSchema._def).toBeDefined();
  });

  test("should create AIAgent with correct output schema", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    await analyzeFeedbackIntent({ feedback: "Test feedback" }, mockOptions);

    const callArgs = aiAgentFromSpy.mock.calls[0][0];
    expect(callArgs.outputSchema).toBeDefined();
    // Verify outputSchema is a zod object with enum
    expect(callArgs.outputSchema._def).toBeDefined();
  });

  // EDGE CASES
  test("should handle feedback with special characters", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Update with special chars: !@#$%^&*()" },
      mockOptions,
    );

    expect(result).toEqual({ intentType: "updateDocument" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update with special chars: !@#$%^&*()" },
    );
  });

  test("should handle very long feedback", async () => {
    const longFeedback = "A".repeat(1000);
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent({ feedback: longFeedback }, mockOptions);

    expect(result).toEqual({ intentType: "updateDocument" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: longFeedback },
    );
  });

  test("should handle feedback with newlines", async () => {
    const feedbackWithNewlines = "Line 1\nLine 2\nLine 3";
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent({ feedback: feedbackWithNewlines }, mockOptions);

    expect(result).toEqual({ intentType: "updateDocument" });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: feedbackWithNewlines },
    );
  });
});
