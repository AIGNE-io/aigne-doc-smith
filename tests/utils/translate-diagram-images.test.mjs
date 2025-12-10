import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { translateDiagramImages } from "../../utils/translate-diagram-images.mjs";
import * as debugModule from "../../utils/debug.mjs";
import fs from "fs-extra";

describe("translateDiagramImages", () => {
  let debugSpy;
  let readdirSpy;
  let mockContext;

  beforeEach(() => {
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
    readdirSpy = spyOn(fs, "readdir").mockResolvedValue([]);

    mockContext = {
      agents: {
        translateDiagram: {
          invoke: async () => ({
            images: [
              {
                path: "/mock/generated.jpg",
                filename: "generated.jpg",
                mimeType: "image/jpeg",
                type: "local",
              },
            ],
          }),
        },
      },
      invoke: async (agent, input) => {
        if (agent === mockContext.agents.translateDiagram) {
          return await agent.invoke(input);
        }
        return {};
      },
    };
  });

  afterEach(() => {
    debugSpy?.mockRestore();
    readdirSpy?.mockRestore();
  });

  test("should skip when no translation files found", async () => {
    readdirSpy.mockResolvedValue(["test.md"]); // Only main file, no translations

    const result = await translateDiagramImages(
      "Main content",
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(debugSpy).toHaveBeenCalledWith(
      "ℹ️  No translation files found, skipping image translation",
    );
  });

  test("should return result structure", async () => {
    readdirSpy.mockResolvedValue(["test.md"]);

    const result = await translateDiagramImages(
      "Main content",
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result).toBeDefined();
    expect(result.updated).toBeDefined();
    expect(result.skipped).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
