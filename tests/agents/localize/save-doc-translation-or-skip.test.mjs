import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import saveDocTranslationOrSkip from "../../../agents/localize/save-doc-translation-or-skip.mjs";

describe("save-doc-translation-or-skip", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      agents: {
        saveDocTranslation: {
          invoke: async () => ({}),
        },
      },
      invoke: mock(async (agent, input) => {
        if (agent === mockContext.agents.saveDocTranslation) {
          return await agent.invoke(input);
        }
        return {};
      }),
    };
  });

  afterEach(() => {
    // Cleanup if needed
  });

  test("should skip saving when shouldTranslateDiagramsOnly is true", async () => {
    const input = {
      translation: "Translated content",
      shouldTranslateDiagramsOnly: true,
    };

    const result = await saveDocTranslationOrSkip(input, { context: mockContext });

    expect(result).toEqual({});
    // invoke should not be called when shouldTranslateDiagramsOnly is true
    expect(mockContext.invoke.mock.calls.length).toBe(0);
  });

  test("should save translation when shouldTranslateDiagramsOnly is false", async () => {
    const input = {
      translation: "Translated content",
      path: "/test",
      language: "zh",
      shouldTranslateDiagramsOnly: false,
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.saveDocTranslation) {
        return { success: true };
      }
      return {};
    };

    const result = await saveDocTranslationOrSkip(input, { context: mockContext });

    expect(result.success).toBe(true);
  });

  test("should save translation when shouldTranslateDiagramsOnly is undefined", async () => {
    const input = {
      translation: "Translated content",
      path: "/test",
      language: "zh",
    };

    mockContext.invoke = async (agent) => {
      if (agent === mockContext.agents.saveDocTranslation) {
        return { success: true };
      }
      return {};
    };

    const result = await saveDocTranslationOrSkip(input, { context: mockContext });

    expect(result.success).toBe(true);
  });

  test("should return empty object when saveDocTranslation agent is not found", async () => {
    const input = {
      translation: "Translated content",
      shouldTranslateDiagramsOnly: false,
    };

    const contextWithoutAgent = {
      agents: {},
      invoke: async () => {},
    };

    const result = await saveDocTranslationOrSkip(input, { context: contextWithoutAgent });

    expect(result).toEqual({});
  });

  test("should pass all input properties to saveDocTranslation agent", async () => {
    const input = {
      translation: "Translated content",
      path: "/test",
      language: "zh",
      docsDir: "/docs",
      shouldTranslateDiagramsOnly: false,
    };

    let capturedInput = null;
    mockContext.invoke = async (agent, params) => {
      if (agent === mockContext.agents.saveDocTranslation) {
        capturedInput = params;
        return { success: true };
      }
      return {};
    };

    await saveDocTranslationOrSkip(input, { context: mockContext });

    expect(capturedInput.translation).toBe("Translated content");
    expect(capturedInput.path).toBe("/test");
    expect(capturedInput.language).toBe("zh");
    expect(capturedInput.docsDir).toBe("/docs");
  });
});
