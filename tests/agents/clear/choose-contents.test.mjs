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
        message: "Document structure cleared",
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
    Object.values(mockClearAgents).forEach((agent) => agent.mockClear());
  });

  afterEach(() => {
    mock.restore();
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

    await chooseContents({}, mockOptions);

    expect(mockOptions.prompts.checkbox).toHaveBeenCalledWith({
      message: "Select items to clear:",
      choices: expect.arrayContaining([
        expect.objectContaining({
          name: "generated documents",
          value: "generatedDocs",
        }),
      ]),
      validate: expect.any(Function),
    });
    expect(mockClearAgents.clearGeneratedDocs).toHaveBeenCalled();
  });

  test("should handle empty selection from prompts", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue([]);

    const result = await chooseContents({}, mockOptions);

    expect(result.message).toBe("No items selected to clear.");
    expect(mockContext.invoke).not.toHaveBeenCalled();
  });

  test("should return available options when no prompts available", async () => {
    const optionsWithoutPrompts = { context: mockContext };

    const result = await chooseContents({}, optionsWithoutPrompts);

    expect(result.message).toBe(
      "Available options to clear: generatedDocs, documentStructure, documentConfig, authTokens",
    );
    expect(result.availableTargets).toEqual([
      "generatedDocs",
      "documentStructure",
      "documentConfig",
      "authTokens",
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
});
