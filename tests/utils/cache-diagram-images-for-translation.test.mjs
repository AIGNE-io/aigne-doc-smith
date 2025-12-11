import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { cacheDiagramImagesForTranslation } from "../../utils/translate-diagram-images.mjs";
import * as debugModule from "../../utils/debug.mjs";
import * as imageCompressModule from "../../utils/image-compress.mjs";
import * as diagramVersionUtils from "../../utils/diagram-version-utils.mjs";
import fs from "fs-extra";

describe("cacheDiagramImagesForTranslation", () => {
  let debugSpy;
  let writeFileSpy;
  let ensureDirSpy;
  let compressImageSpy;
  let pathExistsSpy;
  let calculateImageTimestampSpy;
  let mockContext;
  let copyFileMock;

  beforeEach(() => {
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
    writeFileSpy = spyOn(fs, "writeFile").mockResolvedValue();
    ensureDirSpy = spyOn(fs, "ensureDir").mockResolvedValue();
    compressImageSpy = spyOn(imageCompressModule, "compressImage").mockResolvedValue(
      "/mock/compressed.jpg",
    );
    pathExistsSpy = spyOn(fs, "pathExists").mockResolvedValue(true);
    calculateImageTimestampSpy = spyOn(
      diagramVersionUtils,
      "calculateImageTimestamp",
    ).mockResolvedValue("1234567890");

    copyFileMock = mock(() => Promise.resolve());
    mock.module("node:fs/promises", () => ({
      copyFile: copyFileMock,
    }));

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
      invoke: async (agent, params) => {
        if (agent === mockContext.agents.translateDiagram) {
          return agent.invoke(params);
        }
        return {};
      },
    };
  });

  afterEach(() => {
    debugSpy?.mockRestore();
    writeFileSpy?.mockRestore();
    ensureDirSpy?.mockRestore();
    compressImageSpy?.mockRestore();
    pathExistsSpy?.mockRestore();
    calculateImageTimestampSpy?.mockRestore();
  });

  test("should return null when main content has no images", async () => {
    const result = await cacheDiagramImagesForTranslation(
      "Just text, no images",
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith("ℹ️  No diagram images in main content");
  });

  test("should generate timestamp and update main document when timestamp is missing", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(writeFileSpy).toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Updated main document with timestamps"),
    );
  });

  test("should cache image when translation is needed", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = "";

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("translatedMarkdown");
    expect(result[0]).toHaveProperty("mainImageIndex");
    expect(result[0].translatedMarkdown).toContain("test.zh.jpg");
    expect(result[0].translatedMarkdown).toContain("1234567890");
  });

  test("should cache existing image when translation is not needed (timestamp matches)", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    // Should cache existing image even though translation is not needed
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].originalMatch).toBeTruthy();
    expect(result[0].translatedMarkdown).toBe(result[0].originalMatch); // Should keep existing markdown
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("Cached existing diagram image"));
  });

  test("should cache image when timestamps don't match", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  test("should always translate when shouldTranslateDiagramsOnly is true", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      true,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  test("should use same timestamp as main image in cached markdown", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(result[0].translatedMarkdown).toContain("1234567890");
  });

  test("should handle missing translateDiagram agent gracefully", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const contextWithoutAgent = {
      agents: {},
      invoke: async () => {},
    };

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: contextWithoutAgent },
      false,
    );

    expect(result).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(
      "⚠️  translateDiagram agent not found, skipping translation",
    );
  });

  test("should handle image generation failure gracefully", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const contextWithFailedAgent = {
      agents: {
        translateDiagram: {
          invoke: async () => ({}), // No images returned
        },
      },
      invoke: async (agent, params) => {
        if (agent === contextWithFailedAgent.agents.translateDiagram) {
          return agent.invoke(params);
        }
        return {};
      },
    };

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: contextWithFailedAgent },
      false,
    );

    expect(result).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("No image generated"));
  });

  test("should skip translation when image file does not exist", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    pathExistsSpy.mockResolvedValue(false); // Make file not exist

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("Main image not found"));
  });

  test("should cache image when translation image path points to main document (no language suffix)", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    // Translation document has image pointing to main document (copied during translation)
    const translationContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].translatedMarkdown).toContain("test.zh.jpg");
  });

  test("should handle compression failure and fallback to copy", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    // Make compression return the same path (indicating failure)
    compressImageSpy.mockResolvedValue("/mock/generated.jpg");

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(copyFileMock).toHaveBeenCalled();
  });

  test("should handle image result with image property instead of images array", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const contextWithImageProperty = {
      agents: {
        translateDiagram: {
          invoke: async () => ({
            image: "/mock/generated.jpg",
            mimeType: "image/jpeg",
          }),
        },
      },
      invoke: async (agent, params) => {
        if (agent === contextWithImageProperty.agents.translateDiagram) {
          return agent.invoke(params);
        }
        return {};
      },
    };

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: contextWithImageProperty },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  test("should handle image result with imageUrl property", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const contextWithImageUrl = {
      agents: {
        translateDiagram: {
          invoke: async () => ({
            imageUrl: "/mock/generated.jpg",
            mimeType: "image/png",
          }),
        },
      },
      invoke: async (agent, params) => {
        if (agent === contextWithImageUrl.agents.translateDiagram) {
          return agent.invoke(params);
        }
        return {};
      },
    };

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: contextWithImageUrl },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  test("should handle image result with path property", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const contextWithPath = {
      agents: {
        translateDiagram: {
          invoke: async () => ({
            path: "/mock/generated.jpg",
            mimeType: "image/jpeg",
          }),
        },
      },
      invoke: async (agent, params) => {
        if (agent === contextWithPath.agents.translateDiagram) {
          return agent.invoke(params);
        }
        return {};
      },
    };

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: contextWithPath },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  test("should handle translation image without timestamp", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    // Translation has image but without timestamp (old format)
    const translationContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  test("should handle compression error and fallback to copy", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    // Make compression throw an error
    compressImageSpy.mockRejectedValue(new Error("Compression failed"));

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(copyFileMock).toHaveBeenCalled();
  });

  test("should handle translation agent invocation error gracefully", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const contextWithError = {
      agents: {
        translateDiagram: {
          invoke: async () => {
            throw new Error("Agent invocation failed");
          },
        },
      },
      invoke: async (agent, params) => {
        if (agent === contextWithError.agents.translateDiagram) {
          return agent.invoke(params);
        }
        return {};
      },
    };

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      "",
      "/test",
      "/docs",
      "en",
      "zh",
      { context: contextWithError },
      false,
    );

    expect(result).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(
      "❌ Error translating diagram image test.zh.md for zh",
      expect.any(Error),
    );
  });

  test("should cache image with correct structure including originalMatch", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Old Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

    const result = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: mockContext },
      false,
    );

    expect(result).not.toBeNull();
    expect(result[0]).toHaveProperty("originalMatch");
    expect(result[0]).toHaveProperty("translatedMarkdown");
    expect(result[0]).toHaveProperty("index");
    expect(result[0]).toHaveProperty("mainImageIndex");
    expect(result[0].originalMatch).toBeTruthy();
  });
});
