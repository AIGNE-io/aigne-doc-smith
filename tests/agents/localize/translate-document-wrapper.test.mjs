import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import translateDocumentWrapper from "../../../agents/localize/translate-document-wrapper.mjs";

describe("translate-document-wrapper", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      agents: {
        translateDocument: {
          invoke: async () => ({
            translation: "Translated content",
          }),
        },
      },
      invoke: mock(async (agent, input) => {
        if (agent === mockContext.agents.translateDocument) {
          return await agent.invoke(input);
        }
        return {};
      }),
    };
  });

  afterEach(() => {
    // Cleanup if needed
  });

  test("should skip translation when translation is already set and isApproved is true", async () => {
    const input = {
      content: "Original content",
      translation: "Already translated",
      isApproved: true,
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.translation).toBe("Already translated");
    expect(result.isApproved).toBe(true);
    // invoke should not be called when translation is already set and isApproved is true
    expect(mockContext.invoke.mock.calls.length).toBe(0);
  });

  test("should call translateDocument when translation is not set", async () => {
    const input = {
      content: "Original content",
      path: "/test",
      language: "zh",
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.translateDocument) {
        return { translation: "Translated content" };
      }
      return {};
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.translation).toBe("Translated content");
    expect(result.path).toBe("/test");
    expect(result.language).toBe("zh");
  });

  test("should call translateDocument when isApproved is false", async () => {
    const input = {
      content: "Original content",
      translation: "Some translation",
      isApproved: false,
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.translateDocument) {
        return { translation: "New translated content" };
      }
      return {};
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.translation).toBe("New translated content");
  });

  test("should call translateDocument when translation is null", async () => {
    const input = {
      content: "Original content",
      translation: null,
      isApproved: false,
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.translateDocument) {
        return { translation: "Translated content" };
      }
      return {};
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.translation).toBe("Translated content");
  });

  test("should handle result without translation property", async () => {
    const input = {
      content: "Original content",
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.translateDocument) {
        return "Direct string result";
      }
      return {};
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.translation).toBe("Direct string result");
  });

  test("should preserve all input properties", async () => {
    const input = {
      content: "Original content",
      path: "/test",
      locale: "en",
      language: "zh",
      customProperty: "customValue",
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.translateDocument) {
        return { translation: "Translated content" };
      }
      return {};
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.path).toBe("/test");
    expect(result.locale).toBe("en");
    expect(result.language).toBe("zh");
    expect(result.customProperty).toBe("customValue");
  });

  test("should throw error when translateDocument agent is not found", async () => {
    const input = {
      content: "Original content",
    };

    const contextWithoutAgent = {
      agents: {},
      invoke: async () => {},
    };

    await expect(translateDocumentWrapper(input, { context: contextWithoutAgent })).rejects.toThrow(
      "translateDocument agent not found",
    );
  });

  test("should throw error when agent invocation fails", async () => {
    const input = {
      content: "Original content",
    };

    const contextWithError = {
      agents: {
        translateDocument: {},
      },
      invoke: async () => {
        throw new Error("Invocation failed");
      },
    };

    await expect(translateDocumentWrapper(input, { context: contextWithError })).rejects.toThrow(
      "Failed to invoke translateDocument agent",
    );
  });

  test("should handle result with additional properties", async () => {
    const input = {
      content: "Original content",
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.translateDocument) {
        return {
          translation: "Translated content",
          additionalProperty: "additionalValue",
        };
      }
      return {};
    };

    const result = await translateDocumentWrapper(input, { context: mockContext });

    expect(result.translation).toBe("Translated content");
    expect(result.additionalProperty).toBe("additionalValue");
  });
});
