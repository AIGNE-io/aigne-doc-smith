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
    expect(result).toEqual({
      intentType: null,
      diagramInfo: null,
      generationMode: null,
      changes: [],
    });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is null", async () => {
    const result = await analyzeFeedbackIntent({ feedback: null }, mockOptions);
    expect(result).toEqual({
      intentType: null,
      diagramInfo: null,
      generationMode: null,
      changes: [],
    });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is undefined", async () => {
    const result = await analyzeFeedbackIntent({ feedback: undefined }, mockOptions);
    expect(result).toEqual({
      intentType: null,
      diagramInfo: null,
      generationMode: null,
      changes: [],
    });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is not a string", async () => {
    const result = await analyzeFeedbackIntent({ feedback: 123 }, mockOptions);
    expect(result).toEqual({
      intentType: null,
      diagramInfo: null,
      generationMode: null,
      changes: [],
    });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is empty string", async () => {
    const result = await analyzeFeedbackIntent({ feedback: "" }, mockOptions);
    expect(result).toEqual({
      intentType: null,
      diagramInfo: null,
      generationMode: null,
      changes: [],
    });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should return null when feedback is only whitespace", async () => {
    const result = await analyzeFeedbackIntent({ feedback: "   \n\t  " }, mockOptions);
    expect(result).toEqual({
      intentType: null,
      diagramInfo: null,
      generationMode: null,
      changes: [],
    });
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  // SUCCESSFUL ANALYSIS TESTS
  test("should return addDiagram intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "addDiagram" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Please add a diagram showing the architecture" },
      mockOptions,
    );

    expect(result.intentType).toBe("addDiagram");
    expect(result.generationMode).toBe("add-new");
    expect(result.changes).toEqual([]);
    expect(aiAgentFromSpy).toHaveBeenCalled();
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Please add a diagram showing the architecture", diagramInfo: null },
    );
  });

  test("should return deleteDiagram intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "deleteDiagram" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Remove the diagram on page 3" },
      mockOptions,
    );

    expect(result.intentType).toBe("deleteDiagram");
    expect(result.generationMode).toBe("remove-image");
    expect(result.changes).toEqual([]);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Remove the diagram on page 3", diagramInfo: null },
    );
  });

  test("should return updateDiagram intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDiagram" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Update the flow diagram to show the new process" },
      mockOptions,
    );

    expect(result.intentType).toBe("updateDiagram");
    expect(result.generationMode).toBe("add-new"); // No diagramInfo, so default to add-new
    expect(result.changes).toEqual([]);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update the flow diagram to show the new process", diagramInfo: null },
    );
  });

  test("should return updateDocument intent type", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent(
      { feedback: "Update the introduction section" },
      mockOptions,
    );

    expect(result.intentType).toBe("updateDocument");
    expect(result.generationMode).toBeUndefined(); // updateDocument doesn't set generationMode
    expect(result.changes).toEqual([]);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update the introduction section", diagramInfo: null },
    );
  });

  test("should trim feedback before passing to agent", async () => {
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent(
      { feedback: "  Update the content  \n" },
      mockOptions,
    );

    expect(result.intentType).toBe("updateDocument");
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update the content", diagramInfo: null },
    );
  });

  // ERROR HANDLING TESTS
  test("should return null and log warning when invoke throws an error", async () => {
    const mockError = new Error("Network timeout");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    const result = await analyzeFeedbackIntent({ feedback: "Update the document" }, mockOptions);

    expect(result.intentType).toBe("updateDocument"); // Falls back to updateDocument
    expect(result.changes).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[analyzeFeedbackIntent] Failed to analyze feedback intent: Network timeout",
    );
  });

  test("should return null and log warning when invoke throws a different error", async () => {
    const mockError = new Error("Invalid response format");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    const result = await analyzeFeedbackIntent({ feedback: "Add a new section" }, mockOptions);

    expect(result.intentType).toBe("updateDocument"); // Falls back to updateDocument
    expect(result.changes).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[analyzeFeedbackIntent] Failed to analyze feedback intent: Invalid response format",
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
        instructions: expect.stringContaining("Analyze the user feedback"),
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

    expect(result.intentType).toBe("updateDocument");
    expect(result.changes).toEqual([]);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: "Update with special chars: !@#$%^&*()", diagramInfo: null },
    );
  });

  test("should handle very long feedback", async () => {
    const longFeedback = "A".repeat(1000);
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent({ feedback: longFeedback }, mockOptions);

    expect(result.intentType).toBe("updateDocument");
    expect(result.changes).toEqual([]);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: longFeedback, diagramInfo: null },
    );
  });

  test("should handle feedback with newlines", async () => {
    const feedbackWithNewlines = "Line 1\nLine 2\nLine 3";
    mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

    const result = await analyzeFeedbackIntent({ feedback: feedbackWithNewlines }, mockOptions);

    expect(result.intentType).toBe("updateDocument");
    expect(result.changes).toEqual([]);
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { name: "analyzeUpdateFeedbackIntent" },
      { feedback: feedbackWithNewlines, diagramInfo: null },
    );
  });

  describe("shouldUpdateDiagrams flag", () => {
    test("should return updateDiagram when shouldUpdateDiagrams is true and feedback is empty", async () => {
      const result = await analyzeFeedbackIntent(
        { feedback: "", shouldUpdateDiagrams: true },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
      expect(result.generationMode).toBe("add-new");
      expect(mockOptions.context.invoke).not.toHaveBeenCalled();
    });

    test("should return updateDiagram when shouldUpdateDiagrams is true and feedback is whitespace", async () => {
      const result = await analyzeFeedbackIntent(
        { feedback: "   \n\t  ", shouldUpdateDiagrams: true },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
      expect(result.generationMode).toBe("add-new");
      expect(mockOptions.context.invoke).not.toHaveBeenCalled();
    });

    test("should override intentType to updateDiagram when shouldUpdateDiagrams is true", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update the document", shouldUpdateDiagrams: true },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
    });

    test("should not override deleteDiagram when shouldUpdateDiagrams is true", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: "deleteDiagram" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Delete the diagram", shouldUpdateDiagrams: true },
        mockOptions,
      );

      expect(result.intentType).toBe("deleteDiagram");
    });

    test("should not override addDiagram when shouldUpdateDiagrams is true", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: "addDiagram" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Add a new diagram", shouldUpdateDiagrams: true },
        mockOptions,
      );

      expect(result.intentType).toBe("addDiagram");
    });
  });

  describe("documentContent mode", () => {
    test("should detect existing diagram when documentContent is provided", async () => {
      const documentContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDiagram" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update the diagram", documentContent },
        mockOptions,
      );

      expect(result.diagramInfo).not.toBeNull();
      expect(result.diagramInfo.path).toBe("assets/diagram/test.jpg");
      expect(mockOptions.context.invoke).toHaveBeenCalledWith(
        { name: "analyzeUpdateFeedbackIntent" },
        {
          feedback: "Update the diagram",
          diagramInfo: expect.objectContaining({ path: "assets/diagram/test.jpg" }),
        },
      );
    });

    test("should return null diagramInfo when documentContent has no diagram", async () => {
      const documentContent = "Just text, no diagram";
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update content", documentContent },
        mockOptions,
      );

      expect(result.diagramInfo).toBeNull();
      expect(mockOptions.context.invoke).toHaveBeenCalledWith(
        { name: "analyzeUpdateFeedbackIntent" },
        { feedback: "Update content", diagramInfo: null },
      );
    });

    test("should handle documentContent with whitespace only", async () => {
      const documentContent = "   \n\t  ";
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update", documentContent },
        mockOptions,
      );

      expect(result.diagramInfo).toBeNull();
    });

    test("should handle documentContent that is not a string", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDocument" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update", documentContent: 123 },
        mockOptions,
      );

      expect(result.diagramInfo).toBeNull();
    });
  });

  describe("LLM result handling", () => {
    test("should handle LLM returning null result", async () => {
      mockOptions.context.invoke.mockResolvedValue(null);

      const result = await analyzeFeedbackIntent({ feedback: "Update" }, mockOptions);

      expect(result.intentType).toBe("updateDocument");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    test("should handle LLM returning undefined result", async () => {
      mockOptions.context.invoke.mockResolvedValue(undefined);

      const result = await analyzeFeedbackIntent({ feedback: "Update" }, mockOptions);

      expect(result.intentType).toBe("updateDocument");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    test("should handle LLM returning non-object result", async () => {
      mockOptions.context.invoke.mockResolvedValue("string result");

      const result = await analyzeFeedbackIntent({ feedback: "Update" }, mockOptions);

      expect(result.intentType).toBe("updateDocument");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    test("should infer intentType when LLM returns null intentType", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: null });

      const result = await analyzeFeedbackIntent(
        { feedback: "Add a diagram showing the architecture" },
        mockOptions,
      );

      expect(result.intentType).toBe("addDiagram");
      expect(result.generationMode).toBe("add-new");
    });

    test("should infer updateDiagram when LLM returns null intentType and diagram exists", async () => {
      const documentContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      mockOptions.context.invoke.mockResolvedValue({ intentType: null });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update the diagram", documentContent },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
      expect(result.generationMode).toBe("image-to-image");
    });

    test("should set default generationMode when LLM doesn't provide it", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: "addDiagram" });

      const result = await analyzeFeedbackIntent({ feedback: "Add a diagram" }, mockOptions);

      expect(result.generationMode).toBe("add-new");
    });

    test("should set image-to-image mode for updateDiagram when diagram exists", async () => {
      const documentContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDiagram" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update diagram", documentContent },
        mockOptions,
      );

      expect(result.generationMode).toBe("image-to-image");
    });

    test("should set add-new mode for updateDiagram when no diagram exists", async () => {
      mockOptions.context.invoke.mockResolvedValue({ intentType: "updateDiagram" });

      const result = await analyzeFeedbackIntent(
        { feedback: "Update diagram", documentContent: "No diagram here" },
        mockOptions,
      );

      expect(result.generationMode).toBe("add-new");
    });
  });

  describe("Error fallback scenarios", () => {
    test("should fallback to updateDiagram when error occurs and shouldUpdateDiagrams is true", async () => {
      mockOptions.context.invoke.mockRejectedValue(new Error("Network error"));

      const result = await analyzeFeedbackIntent(
        { feedback: "Update", shouldUpdateDiagrams: true },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
      expect(result.generationMode).toBe("add-new");
    });

    test("should fallback to updateDiagram with image-to-image when error occurs, shouldUpdateDiagrams is true, and diagram exists", async () => {
      const documentContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      mockOptions.context.invoke.mockRejectedValue(new Error("Network error"));

      const result = await analyzeFeedbackIntent(
        { feedback: "Update", shouldUpdateDiagrams: true, documentContent },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
      expect(result.generationMode).toBe("image-to-image");
      expect(result.diagramInfo).not.toBeNull();
    });

    test("should infer intent from feedback when error occurs and shouldUpdateDiagrams is false", async () => {
      mockOptions.context.invoke.mockRejectedValue(new Error("Network error"));

      const result = await analyzeFeedbackIntent(
        { feedback: "Add a new diagram", shouldUpdateDiagrams: false },
        mockOptions,
      );

      expect(result.intentType).toBe("addDiagram");
      expect(result.generationMode).toBe("add-new");
    });

    test("should infer updateDiagram from feedback when error occurs and diagram exists", async () => {
      const documentContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      mockOptions.context.invoke.mockRejectedValue(new Error("Network error"));

      const result = await analyzeFeedbackIntent(
        { feedback: "Update the diagram", shouldUpdateDiagrams: false, documentContent },
        mockOptions,
      );

      expect(result.intentType).toBe("updateDiagram");
      expect(result.generationMode).toBe("image-to-image");
      expect(result.diagramInfo).not.toBeNull();
    });
  });
});
