import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import translateDiagramImagesAgent from "../../../agents/localize/translate-diagram-images.mjs";
import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";
import * as translateDiagramImagesUtils from "../../../utils/translate-diagram-images.mjs";
import * as debugModule from "../../../utils/debug.mjs";
import { getFileName } from "../../../utils/utils.mjs";

describe("translate-diagram-images agent", () => {
  let readFileContentSpy;
  let cacheDiagramImagesForTranslationSpy;
  let debugSpy;
  let getFileNameSpy;

  beforeEach(() => {
    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent");
    cacheDiagramImagesForTranslationSpy = spyOn(
      translateDiagramImagesUtils,
      "cacheDiagramImagesForTranslation",
    );
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
    getFileNameSpy = spyOn({ getFileName }, "getFileName");
  });

  afterEach(() => {
    readFileContentSpy?.mockRestore();
    cacheDiagramImagesForTranslationSpy?.mockRestore();
    debugSpy?.mockRestore();
    getFileNameSpy?.mockRestore();
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
