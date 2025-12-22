import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { translateDiagramImages } from "../../utils/translate-diagram-images.mjs";
import * as debugModule from "../../utils/debug.mjs";
import * as imageCompressModule from "../../utils/image-compress.mjs";
import * as diagramVersionUtils from "../../utils/diagram-version-utils.mjs";
import * as docsFinderUtils from "../../utils/docs-finder-utils.mjs";
import * as utilsModule from "../../utils/utils.mjs";
import * as fileUtils from "../../utils/file-utils.mjs";
import fs from "fs-extra";

describe("translateDiagramImages", () => {
  let debugSpy;
  let readdirSpy;
  let writeFileSpy;
  let ensureDirSpy;
  let pathExistsSpy;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used in afterEach
  let fsPathExistsSpy;
  let compressImageSpy;
  let calculateImageTimestampSpy;
  let copyFileMock;
  let readFileContentSpy;
  let getFileNameSpy;
  let mockContext;

  beforeEach(() => {
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
    readdirSpy = spyOn(fs, "readdir").mockResolvedValue([]);
    writeFileSpy = spyOn(fs, "writeFile").mockResolvedValue();
    ensureDirSpy = spyOn(fs, "ensureDir").mockResolvedValue();
    // Mock pathExists from file-utils.mjs (used in translate-diagram-images.mjs for translation files)
    pathExistsSpy = spyOn(fileUtils, "pathExists").mockResolvedValue(true);
    // Also mock fs.pathExists (used in convertDiagramInfoToMediaFile)
    fsPathExistsSpy = spyOn(fs, "pathExists").mockResolvedValue(true);
    compressImageSpy = spyOn(imageCompressModule, "compressImage").mockResolvedValue(
      "/mock/compressed.jpg",
    );
    calculateImageTimestampSpy = spyOn(
      diagramVersionUtils,
      "calculateImageTimestamp",
    ).mockResolvedValue("1234567890");

    copyFileMock = mock(() => Promise.resolve());
    mock.module("node:fs/promises", () => ({
      copyFile: copyFileMock,
    }));

    // Track spies for docsFinderUtils and utilsModule to restore them later
    readFileContentSpy = null;
    getFileNameSpy = null;

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
    writeFileSpy?.mockRestore();
    ensureDirSpy?.mockRestore();
    pathExistsSpy?.mockRestore();
    fsPathExistsSpy?.mockRestore(); // Restore fs.pathExists to avoid affecting other tests
    compressImageSpy?.mockRestore();
    calculateImageTimestampSpy?.mockRestore();
    readFileContentSpy?.mockRestore();
    getFileNameSpy?.mockRestore();
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

  test("should update main document when images lack timestamps", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      "Translation content",
    );
    getFileNameSpy = spyOn(utilsModule, "getFileName").mockReturnValue("test.md");

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.mainContentUpdated).toBeDefined();
    expect(result.mainContentUpdated).toContain(":1234567890");
    expect(writeFileSpy).toHaveBeenCalled();
  });

  test("should translate image when timestamp differs", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.updated).toBeGreaterThan(0);
    expect(writeFileSpy).toHaveBeenCalled();
  });

  test("should handle image result with imageUrl instead of images array", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    mockContext.agents.translateDiagram.invoke = async () => ({
      imageUrl: "/mock/generated.jpg",
      mimeType: "image/jpeg",
    });

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.updated).toBeGreaterThan(0);
  });

  test("should handle image result with path instead of images array", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    mockContext.agents.translateDiagram.invoke = async () => ({
      path: "/mock/generated.jpg",
    });

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.updated).toBeGreaterThan(0);
  });

  test("should handle error when no image is generated", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    mockContext.agents.translateDiagram.invoke = async () => ({}); // No image returned

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].error).toBe("No image generated from agent");
  });

  test("should insert image when translation has no image", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      "Translation content without image",
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.updated).toBeGreaterThan(0);
    expect(writeFileSpy).toHaveBeenCalled();
  });

  test("should handle error during translation and continue", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    mockContext.agents.translateDiagram.invoke = async () => {
      throw new Error("Translation failed");
    };

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].error).toContain("Translation failed");
  });

  test("should handle error reading translation file", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockRejectedValue(
      new Error("File read error"),
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("should skip translation when translation file content is null", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(null);

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.skipped).toBeGreaterThan(0);
  });

  test("should skip when image already has language suffix and timestamp matches", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    expect(result.skipped).toBeGreaterThan(0);
    expect(result.updated).toBe(0);
  });

  test("should handle timestamp with colon correctly (remove leading colon)", async () => {
    // Test that timestamp format with colon (:timestamp) is correctly parsed
    // The regex captures :timestamp, and the code removes the leading colon
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1765450843 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    readdirSpy.mockResolvedValue(["test.md", "test.zh.md"]);

    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue(
      `<!-- DIAGRAM_IMAGE_START:architecture:16:9:9876543210 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
    );
    getFileNameSpy = spyOn(utilsModule, "getFileName").mockReturnValue("test.md");

    const result = await translateDiagramImages(
      mainContent,
      "/test",
      "/docs",
      "en",
      { context: mockContext },
      ["zh"],
    );

    // Should process without errors
    expect(result.errors.length).toBe(0);
    // The generated markdown should have correct format (single colon before timestamp)
    expect(result.updated).toBeGreaterThan(0);
    // Verify the written content has correct format
    const writeCall = writeFileSpy.mock.calls.find((call) => call[0].endsWith("test.zh.md"));
    if (writeCall) {
      const writtenContent = writeCall[1];
      expect(writtenContent).toContain(":1765450843");
      expect(writtenContent).not.toContain("::1765450843");
    }
  });
});
