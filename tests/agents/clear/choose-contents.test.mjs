import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import chooseContents from "../../../agents/clear/choose-contents.mjs";

describe("choose-contents", () => {
  let mockOptions;
  let mockContext;
  let mockClearAgents;

  beforeEach(() => {
    // Create mock clear agents
    mockClearAgents = {
      clearGeneratedDocs: mock(async () => ({
        message: "Generated docs cleared",
        cleared: true,
        path: "/test/docs",
      })),
      clearDocumentStructure: mock(async () => ({
        message: "Documentation Structure cleared",
        cleared: true,
        path: "/test/structure.json",
      })),
      clearDocumentConfig: mock(async () => ({
        message: "Document config cleared",
        cleared: true,
        path: "/test/config.yaml",
        suggestions: ["Run `aigne doc init` to generate a fresh configuration file."],
      })),
      clearAuthTokens: mock(async () => ({
        message: "Auth tokens cleared",
        clearedCount: 2,
        clearedSites: ["example.com", "test.com"],
      })),
    };

    mockContext = {
      agents: mockClearAgents,
      invoke: mock(async (agent, input) => {
        return await agent(input);
      }),
    };

    mockOptions = {
      prompts: {
        checkbox: mock(async () => ["generatedDocs", "documentConfig"]),
      },
      context: mockContext,
    };

    // Clear mock call history
    mockOptions.prompts.checkbox.mockClear();
    mockContext.invoke.mockClear();
    Object.values(mockClearAgents).forEach((agent) => {
      agent.mockClear();
    });
  });

  afterEach(() => {
    // Note: Not using mock.restore() to avoid affecting other tests
  });

  test("should process provided targets correctly", async () => {
    const result = await chooseContents(
      { targets: ["generatedDocs", "documentConfig"] },
      mockOptions,
    );

    expect(mockContext.invoke).toHaveBeenCalledTimes(2);
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalled();
    expect(mockClearAgents.clearDocumentConfig).toHaveBeenCalled();
    expect(result.message).toContain("Cleanup completed successfully!");
  });

  test("should normalize target names case-insensitively", async () => {
    const result = await chooseContents(
      { targets: ["GeneratedDocs", "DOCUMENTCONFIG"] },
      mockOptions,
    );

    expect(mockContext.invoke).toHaveBeenCalledTimes(2);
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalled();
    expect(mockClearAgents.clearDocumentConfig).toHaveBeenCalled();
    expect(result.message).toContain("Cleanup completed successfully!");
  });

  test("should prompt user when no targets provided", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue(["generatedDocs"]);

    await chooseContents({ docsDir: "/test/docs", workDir: "/test" }, mockOptions);

    expect(mockOptions.prompts.checkbox).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Please select the items you'd like to clear:",
        validate: expect.any(Function),
      }),
    );
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalled();
  });

  test("should handle empty selection from prompts", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue([]);

    const result = await chooseContents({ docsDir: "/test/docs", workDir: "/test" }, mockOptions);

    expect(result.message).toContain("You haven't selected any items to clear.");
    expect(mockContext.invoke).not.toHaveBeenCalled();
  });

  test("should return available options when no prompts available", async () => {
    const optionsWithoutPrompts = { context: mockContext };

    const result = await chooseContents(
      { docsDir: "/test/docs", workDir: "/test" },
      optionsWithoutPrompts,
    );

    expect(result.message).toBe(
      "Available options to clear: generatedDocs, documentStructure, documentConfig, authTokens, deploymentConfig, mediaDescription",
    );
    expect(result.availableTargets).toEqual([
      "generatedDocs",
      "documentStructure",
      "documentConfig",
      "authTokens",
      "deploymentConfig",
      "mediaDescription",
    ]);
  });

  test("should handle agent errors gracefully", async () => {
    mockClearAgents.clearGeneratedDocs.mockResolvedValue({
      error: true,
      message: "Failed to clear docs",
    });

    const result = await chooseContents({ targets: ["generatedDocs"] }, mockOptions);

    expect(result.message).toContain("Cleanup finished with some issues.");
    expect(result.message).toContain("Failed to clear docs");
  });

  test("should collect suggestions from agents", async () => {
    const result = await chooseContents({ targets: ["documentConfig"] }, mockOptions);

    expect(result.message).toContain(
      "Run `aigne doc init` to generate a fresh configuration file.",
    );
  });

  test("should handle all valid targets", async () => {
    const result = await chooseContents(
      { targets: ["generatedDocs", "documentStructure", "documentConfig", "authTokens"] },
      mockOptions,
    );

    expect(mockContext.invoke).toHaveBeenCalledTimes(4);
    expect(result.message).toContain("Cleanup completed successfully!");
  });

  test("should have correct input schema", () => {
    expect(chooseContents.input_schema).toBeDefined();
    expect(chooseContents.input_schema.type).toBe("object");
    expect(chooseContents.input_schema.properties.targets.type).toBe("array");
  });

  test("should have correct task metadata", () => {
    expect(chooseContents.taskTitle).toBe("Select and clear project contents");
    expect(chooseContents.description).toBe(
      "Select and clear project contents, such as generated documents, configuration, and authorization tokens.",
    );
  });

  test("should handle unknown targets by filtering them out", async () => {
    // Test that unknown targets are filtered out and valid ones are processed
    // Mix unknown targets with valid ones
    const result = await chooseContents(
      { targets: ["unknownTarget1", "generatedDocs", "invalidTarget", "documentConfig"] },
      mockOptions,
    );

    // Should process only the valid targets and succeed
    expect(result.message).toContain("Cleanup completed successfully!");
    expect(mockContext.invoke).toHaveBeenCalledTimes(2); // Only valid targets processed
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalled();
    expect(mockClearAgents.clearDocumentConfig).toHaveBeenCalled();
  });

  test("should handle missing clear agent in context", async () => {
    const optionsWithoutAgent = {
      context: {
        agents: {},
        invoke: mockContext.invoke,
      },
    };

    const result = await chooseContents({ targets: ["generatedDocs"] }, optionsWithoutAgent);

    expect(result.message).toContain("Cleanup finished with some issues.");
    expect(result.message).toContain("The clear agent 'clearGeneratedDocs' was not found.");
  });

  test("should handle agent execution errors", async () => {
    const errorContext = {
      agents: mockClearAgents,
      invoke: mock(async () => {
        throw new Error("Agent execution failed");
      }),
    };

    const optionsWithError = {
      context: errorContext,
    };

    const result = await chooseContents({ targets: ["generatedDocs"] }, optionsWithError);

    expect(result.message).toContain("Cleanup finished with some issues.");
    expect(result.message).toContain("Failed to clear Generated Documents: Agent execution failed");
  });

  test("should handle duplicate targets", async () => {
    await chooseContents(
      { targets: ["generatedDocs", "generatedDocs", "documentConfig"] },
      mockOptions,
    );

    // Should only invoke each agent once due to deduplication
    expect(mockContext.invoke).toHaveBeenCalledTimes(2);
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalledTimes(1);
    expect(mockClearAgents.clearDocumentConfig).toHaveBeenCalledTimes(1);
  });

  test("should handle empty and whitespace targets", async () => {
    await chooseContents({ targets: ["", "  ", "generatedDocs", null, undefined] }, mockOptions);

    // Should only process the valid target
    expect(mockContext.invoke).toHaveBeenCalledTimes(1);
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalled();
  });

  test("should add default suggestion when config is cleared", async () => {
    // Mock clearDocumentConfig to return cleared: true but no suggestions
    mockClearAgents.clearDocumentConfig.mockResolvedValue({
      message: "Document config cleared",
      cleared: true,
      path: "/test/config.yaml",
    });

    const result = await chooseContents({ targets: ["documentConfig"] }, mockOptions);

    expect(result.message).toContain(
      "Run `aigne doc init` to generate a fresh configuration file.",
    );
  });

  test("should not duplicate default suggestion when already present", async () => {
    // Mock clearDocumentConfig to return the default suggestion
    mockClearAgents.clearDocumentConfig.mockResolvedValue({
      message: "Document config cleared",
      cleared: true,
      path: "/test/config.yaml",
      suggestions: ["Run `aigne doc init` to generate a fresh configuration file."],
    });

    const result = await chooseContents({ targets: ["documentConfig"] }, mockOptions);

    // Should only appear once in the message
    const suggestionCount = (result.message.match(/Run `aigne doc init`/g) || []).length;
    expect(suggestionCount).toBe(1);
  });

  test("should handle agents that return no cleared status", async () => {
    mockClearAgents.clearGeneratedDocs.mockResolvedValue({
      message: "No docs to clear",
      // No cleared property
    });

    const result = await chooseContents({ targets: ["generatedDocs"] }, mockOptions);

    expect(result.message).toContain("Cleanup completed successfully!");
    expect(result.message).toContain("No docs to clear");
  });
});
