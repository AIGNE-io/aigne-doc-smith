import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import checkUpdateIsSingle from "../../../agents/update/check-update-is-single.mjs";

describe("check-update-is-single", () => {
  let mockOptions;
  let consoleSpy;

  beforeEach(() => {
    mockOptions = {
      context: {
        agents: {
          updateSingleDocument: { mockSingleAgent: true },
          batchUpdateDocument: { mockBatchAgent: true },
        },
        invoke: mock(async () => ({ mockResult: true })),
      },
    };

    consoleSpy = spyOn(console, "error").mockImplementation(() => {});

    // Clear context mock call history
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  // INPUT VALIDATION TESTS
  test("should throw error when selectedDocs is not provided", async () => {
    await expect(checkUpdateIsSingle({}, mockOptions)).rejects.toThrow(
      "selectedDocs must be provided as an array",
    );
  });

  test("should throw error when selectedDocs is not an array", async () => {
    await expect(checkUpdateIsSingle({ selectedDocs: "not-array" }, mockOptions)).rejects.toThrow(
      "selectedDocs must be provided as an array",
    );
  });

  test("should throw error when selectedDocs is empty", async () => {
    await expect(checkUpdateIsSingle({ selectedDocs: [] }, mockOptions)).rejects.toThrow(
      "selectedDocs cannot be empty",
    );
  });

  test("should throw error when selectedDocs is null", async () => {
    await expect(checkUpdateIsSingle({ selectedDocs: null }, mockOptions)).rejects.toThrow(
      "selectedDocs must be provided as an array",
    );
  });

  test("should throw error when selectedDocs is undefined", async () => {
    await expect(checkUpdateIsSingle({ selectedDocs: undefined }, mockOptions)).rejects.toThrow(
      "selectedDocs must be provided as an array",
    );
  });

  // AGENT AVAILABILITY TESTS
  test("should throw error when updateSingleDocument agent is not available", async () => {
    const optionsWithoutSingleAgent = {
      context: {
        agents: {
          batchUpdateDocument: { mockBatchAgent: true },
        },
        invoke: mock(),
      },
    };

    await expect(
      checkUpdateIsSingle({ selectedDocs: ["doc1"] }, optionsWithoutSingleAgent),
    ).rejects.toThrow('Agent "updateSingleDocument" is not available');
  });

  test("should throw error when batchUpdateDocument agent is not available", async () => {
    const optionsWithoutBatchAgent = {
      context: {
        agents: {
          updateSingleDocument: { mockSingleAgent: true },
        },
        invoke: mock(),
      },
    };

    await expect(
      checkUpdateIsSingle({ selectedDocs: ["doc1", "doc2"] }, optionsWithoutBatchAgent),
    ).rejects.toThrow('Agent "batchUpdateDocument" is not available');
  });

  test("should throw error when no agents are available", async () => {
    const optionsWithoutAgents = {
      context: {
        agents: {},
        invoke: mock(),
      },
    };

    await expect(
      checkUpdateIsSingle({ selectedDocs: ["doc1"] }, optionsWithoutAgents),
    ).rejects.toThrow('Agent "updateSingleDocument" is not available');
  });

  // SINGLE DOCUMENT ROUTING TESTS
  test("should route to updateSingleDocument when selectedDocs has one item", async () => {
    const result = await checkUpdateIsSingle(
      {
        selectedDocs: ["doc1"],
        customParam: "test",
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockSingleAgent: true },
      {
        selectedDocs: ["doc1"],
        customParam: "test",
      },
    );
    expect(result).toEqual({ mockResult: true });
  });

  test("should pass through all parameters to single document agent", async () => {
    await checkUpdateIsSingle(
      {
        selectedDocs: [{ path: "/doc1", content: "content" }],
        docsDir: "./docs",
        forceRegenerate: true,
        customData: { key: "value" },
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockSingleAgent: true },
      {
        selectedDocs: [{ path: "/doc1", content: "content" }],
        docsDir: "./docs",
        forceRegenerate: true,
        customData: { key: "value" },
      },
    );
  });

  // BATCH DOCUMENT ROUTING TESTS
  test("should route to batchUpdateDocument when selectedDocs has multiple items", async () => {
    const result = await checkUpdateIsSingle(
      {
        selectedDocs: ["doc1", "doc2"],
        customParam: "test",
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockBatchAgent: true },
      {
        selectedDocs: ["doc1", "doc2"],
        customParam: "test",
      },
    );
    expect(result).toEqual({ mockResult: true });
  });

  test("should route to batchUpdateDocument when selectedDocs has three items", async () => {
    await checkUpdateIsSingle(
      {
        selectedDocs: ["doc1", "doc2", "doc3"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockBatchAgent: true },
      {
        selectedDocs: ["doc1", "doc2", "doc3"],
      },
    );
  });

  test("should pass through all parameters to batch document agent", async () => {
    await checkUpdateIsSingle(
      {
        selectedDocs: [
          { path: "/doc1", content: "content1" },
          { path: "/doc2", content: "content2" },
        ],
        docsDir: "./docs",
        forceRegenerate: false,
        batchSize: 10,
        customSettings: { parallel: true },
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockBatchAgent: true },
      {
        selectedDocs: [
          { path: "/doc1", content: "content1" },
          { path: "/doc2", content: "content2" },
        ],
        docsDir: "./docs",
        forceRegenerate: false,
        batchSize: 10,
        customSettings: { parallel: true },
      },
    );
  });

  // ERROR HANDLING TESTS
  test("should handle and re-throw agent invocation errors for single document", async () => {
    const mockError = new Error("Agent execution failed");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    await expect(checkUpdateIsSingle({ selectedDocs: ["doc1"] }, mockOptions)).rejects.toThrow(
      "Agent execution failed",
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error invoking updateSingleDocument:",
      "Agent execution failed",
    );
  });

  test("should handle and re-throw agent invocation errors for batch documents", async () => {
    const mockError = new Error("Batch processing failed");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    await expect(
      checkUpdateIsSingle({ selectedDocs: ["doc1", "doc2"] }, mockOptions),
    ).rejects.toThrow("Batch processing failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error invoking batchUpdateDocument:",
      "Batch processing failed",
    );
  });

  test("should log specific error message for single document failures", async () => {
    const mockError = new Error("Network timeout");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    try {
      await checkUpdateIsSingle({ selectedDocs: ["doc1"] }, mockOptions);
    } catch {
      // Expected to throw
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error invoking updateSingleDocument:",
      "Network timeout",
    );
  });

  test("should log specific error message for batch document failures", async () => {
    const mockError = new Error("Memory limit exceeded");
    mockOptions.context.invoke.mockRejectedValue(mockError);

    try {
      await checkUpdateIsSingle({ selectedDocs: ["doc1", "doc2", "doc3"] }, mockOptions);
    } catch {
      // Expected to throw
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error invoking batchUpdateDocument:",
      "Memory limit exceeded",
    );
  });

  // RESULT PASSING TESTS
  test("should return result from single document agent unchanged", async () => {
    const mockResult = {
      success: true,
      processedDocs: ["doc1"],
      metadata: { timestamp: "2023-01-01" },
    };
    mockOptions.context.invoke.mockResolvedValue(mockResult);

    const result = await checkUpdateIsSingle({ selectedDocs: ["doc1"] }, mockOptions);

    expect(result).toEqual(mockResult);
  });

  test("should return result from batch document agent unchanged", async () => {
    const mockResult = {
      success: true,
      processedDocs: ["doc1", "doc2"],
      errors: [],
      summary: "All documents processed successfully",
    };
    mockOptions.context.invoke.mockResolvedValue(mockResult);

    const result = await checkUpdateIsSingle({ selectedDocs: ["doc1", "doc2"] }, mockOptions);

    expect(result).toEqual(mockResult);
  });
});
