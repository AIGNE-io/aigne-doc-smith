import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import translateDiagramImagesAgent from "../../../utils/translate-diagram-images.mjs";
import * as translateDiagramImagesModule from "../../../utils/translate-diagram-images.mjs";
import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";
import * as debugModule from "../../../utils/debug.mjs";
import * as utilsModule from "../../../utils/utils.mjs";
import * as fileUtils from "../../../utils/file-utils.mjs";

describe("translate-diagram-images agent", () => {
  let readFileContentSpy;
  let cacheDiagramImagesForTranslationSpy;
  let debugSpy;
  let getFileNameSpy;
  let pathExistsSpy;

  beforeEach(() => {
    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent");
    cacheDiagramImagesForTranslationSpy = spyOn(
      translateDiagramImagesModule,
      "cacheDiagramImagesForTranslation",
    );
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
    getFileNameSpy = spyOn(utilsModule, "getFileName");
    // Mock pathExists to return true by default (file exists)
    pathExistsSpy = spyOn(fileUtils, "pathExists").mockResolvedValue(true);
  });

  afterEach(() => {
    readFileContentSpy?.mockRestore();
    cacheDiagramImagesForTranslationSpy?.mockRestore();
    debugSpy?.mockRestore();
    getFileNameSpy?.mockRestore();
    pathExistsSpy?.mockRestore();
  });

  test("should return cached images when main document has images", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = "";
    const mockCachedImages = [
      {
        originalMatch: null,
        translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
        index: 0,
        mainImageIndex: 0,
      },
    ];

    getFileNameSpy.mockReturnValue("test.md");
    readFileContentSpy.mockResolvedValueOnce(mainContent).mockResolvedValueOnce(translationContent);
    cacheDiagramImagesForTranslationSpy.mockResolvedValue(mockCachedImages);

    const result = await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
        language: "zh",
        shouldTranslateDiagramsOnly: false,
      },
      { context: {} },
    );

    expect(result.cachedDiagramImages).toEqual(mockCachedImages);
    expect(cacheDiagramImagesForTranslationSpy).toHaveBeenCalledWith(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: {} },
      false,
    );
  });

  test("should return null when main document has no images", async () => {
    const mainContent = "Just text, no images";
    const translationContent = "";

    getFileNameSpy.mockReturnValue("test.md");
    readFileContentSpy.mockResolvedValueOnce(mainContent).mockResolvedValueOnce(translationContent);
    cacheDiagramImagesForTranslationSpy.mockResolvedValue(null);

    const result = await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
        language: "zh",
        shouldTranslateDiagramsOnly: false,
      },
      { context: {} },
    );

    expect(result.cachedDiagramImages).toBeNull();
  });

  test("should return null when main document cannot be read", async () => {
    getFileNameSpy.mockReturnValue("test.md");
    readFileContentSpy.mockResolvedValueOnce(null);

    const result = await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
        language: "zh",
        shouldTranslateDiagramsOnly: false,
      },
      { context: {} },
    );

    expect(result.cachedDiagramImages).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith("⚠️  Could not read main document: test.md");
  });

  test("should handle translation file that does not exist", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const mockCachedImages = [
      {
        originalMatch: null,
        translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
        index: 0,
        mainImageIndex: 0,
      },
    ];

    getFileNameSpy
      .mockReturnValueOnce("test.md") // Main file
      .mockReturnValueOnce("test.zh.md"); // Translation file
    readFileContentSpy.mockResolvedValueOnce(mainContent);
    // Mock pathExists to return false (translation file does not exist)
    pathExistsSpy.mockResolvedValue(false);
    cacheDiagramImagesForTranslationSpy.mockResolvedValue(mockCachedImages);

    const result = await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
        language: "zh",
        shouldTranslateDiagramsOnly: false,
      },
      { context: {} },
    );

    expect(result.cachedDiagramImages).toEqual(mockCachedImages);
    // Verify readFileContent was not called for translation file (since it doesn't exist)
    expect(readFileContentSpy).toHaveBeenCalledTimes(1); // Only called for main file
    // Verify cacheDiagramImagesForTranslation was called with empty translation content
    expect(cacheDiagramImagesForTranslationSpy).toHaveBeenCalledWith(
      mainContent,
      "", // Empty string when translation file doesn't exist
      "/test",
      "/docs",
      "en",
      "zh",
      { context: {} },
      false,
    );
  });

  test("should return null when missing required parameters", async () => {
    const result1 = await translateDiagramImagesAgent(
      {
        docsDir: "/docs",
        locale: "en",
        language: "zh",
      },
      { context: {} },
    );

    expect(result1.cachedDiagramImages).toBeNull();

    const result2 = await translateDiagramImagesAgent(
      {
        path: "/test",
        locale: "en",
        language: "zh",
      },
      { context: {} },
    );

    expect(result2.cachedDiagramImages).toBeNull();

    const result3 = await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
      },
      { context: {} },
    );

    expect(result3.cachedDiagramImages).toBeNull();
  });

  test("should pass shouldTranslateDiagramsOnly flag correctly", async () => {
    const mainContent = `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
    const translationContent = "";

    getFileNameSpy.mockReturnValue("test.md");
    readFileContentSpy.mockResolvedValueOnce(mainContent).mockResolvedValueOnce(translationContent);
    cacheDiagramImagesForTranslationSpy.mockResolvedValue([]);

    await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
        language: "zh",
        shouldTranslateDiagramsOnly: true,
      },
      { context: {} },
    );

    expect(cacheDiagramImagesForTranslationSpy).toHaveBeenCalledWith(
      mainContent,
      translationContent,
      "/test",
      "/docs",
      "en",
      "zh",
      { context: {} },
      true,
    );
  });

  test("should handle errors gracefully", async () => {
    getFileNameSpy.mockReturnValue("test.md");
    readFileContentSpy.mockRejectedValue(new Error("File read error"));

    const result = await translateDiagramImagesAgent(
      {
        path: "/test",
        docsDir: "/docs",
        locale: "en",
        language: "zh",
        shouldTranslateDiagramsOnly: false,
      },
      { context: {} },
    );

    expect(result.cachedDiagramImages).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to cache diagram images"),
    );
  });

  test("should preserve input properties in result", async () => {
    const mainContent = "Just text";
    const input = {
      path: "/test",
      docsDir: "/docs",
      locale: "en",
      language: "zh",
      shouldTranslateDiagramsOnly: false,
      customProperty: "customValue",
    };

    getFileNameSpy.mockReturnValue("test.md");
    readFileContentSpy.mockResolvedValueOnce(mainContent).mockResolvedValueOnce("");
    cacheDiagramImagesForTranslationSpy.mockResolvedValue(null);

    const result = await translateDiagramImagesAgent(input, { context: {} });

    expect(result.customProperty).toBe("customValue");
    expect(result.path).toBe("/test");
    expect(result.docsDir).toBe("/docs");
  });
});
