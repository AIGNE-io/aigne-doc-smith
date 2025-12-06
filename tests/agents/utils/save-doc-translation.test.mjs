import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import saveDocTranslation from "../../../agents/utils/save-doc-translation.mjs";
import * as utilsModule from "../../../utils/utils.mjs";
import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";
import * as syncDiagramModule from "../../../utils/sync-diagram-to-translations.mjs";
import * as debugModule from "../../../utils/debug.mjs";

describe("save-doc-translation", () => {
  let saveDocTranslationSpy;
  let readFileContentSpy;
  let getFileNameSpy;
  let syncDiagramToTranslationsSpy;
  let debugSpy;

  beforeEach(() => {
    saveDocTranslationSpy = spyOn(utilsModule, "saveDocTranslation").mockResolvedValue({
      path: "/mock/path",
      success: true,
    });
    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue("");
    getFileNameSpy = spyOn(utilsModule, "getFileName").mockReturnValue("guide.md");
    syncDiagramToTranslationsSpy = spyOn(
      syncDiagramModule,
      "syncDiagramToTranslations",
    ).mockResolvedValue({
      updated: 0,
      skipped: 0,
      errors: [],
    });
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    saveDocTranslationSpy?.mockRestore();
    readFileContentSpy?.mockRestore();
    getFileNameSpy?.mockRestore();
    syncDiagramToTranslationsSpy?.mockRestore();
    debugSpy?.mockRestore();
  });

  describe("basic functionality", () => {
    test("should call _saveDocTranslation with correct parameters", async () => {
      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        labels: ["label1", "label2"],
        locale: "en",
      });

      expect(saveDocTranslationSpy).toHaveBeenCalledWith({
        path: "/guide",
        docsDir: "/docs",
        language: "zh",
        translation: "Translated content",
        labels: ["label1", "label2"],
      });
    });

    test("should return empty object when isShowMessage is false", async () => {
      const result = await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(result).toEqual({});
    });

    test("should return success message when isShowMessage is true", async () => {
      const result = await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        isShowMessage: true,
        locale: "en",
      });

      expect(result).toEqual({
        message: "✅ Translation completed successfully.",
      });
    });
  });

  describe("diagram synchronization", () => {
    test("should sync diagrams when path, docsDir, and locale are provided", async () => {
      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      readFileContentSpy.mockResolvedValue(mainContent);
      syncDiagramToTranslationsSpy.mockResolvedValue({
        updated: 2,
        skipped: 0,
        errors: [],
      });

      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(getFileNameSpy).toHaveBeenCalledWith("/guide", "en");
      expect(readFileContentSpy).toHaveBeenCalledWith("/docs", "guide.md");
      expect(syncDiagramToTranslationsSpy).toHaveBeenCalledWith(
        mainContent,
        "/guide",
        "/docs",
        "en",
        "sync",
      );
      expect(debugSpy).toHaveBeenCalledWith(
        "✅ Synced diagram images to 2 translation file(s) after translation",
      );
    });

    test("should not sync when main content is not found", async () => {
      readFileContentSpy.mockResolvedValue(null);

      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(syncDiagramToTranslationsSpy).not.toHaveBeenCalled();
    });

    test("should not sync when main content is empty", async () => {
      readFileContentSpy.mockResolvedValue("");

      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(syncDiagramToTranslationsSpy).not.toHaveBeenCalled();
    });

    test("should not sync when path is missing", async () => {
      await saveDocTranslation({
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(syncDiagramToTranslationsSpy).not.toHaveBeenCalled();
    });

    test("should not sync when docsDir is missing", async () => {
      await saveDocTranslation({
        path: "/guide",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(syncDiagramToTranslationsSpy).not.toHaveBeenCalled();
    });

    test("should not sync when locale is missing", async () => {
      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
      });

      expect(syncDiagramToTranslationsSpy).not.toHaveBeenCalled();
    });

    test("should not log success message when no files were updated", async () => {
      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      readFileContentSpy.mockResolvedValue(mainContent);
      syncDiagramToTranslationsSpy.mockResolvedValue({
        updated: 0,
        skipped: 1,
        errors: [],
      });

      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(debugSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("✅ Synced diagram images"),
      );
    });
  });

  describe("error handling", () => {
    test("should handle sync errors gracefully", async () => {
      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      readFileContentSpy.mockResolvedValue(mainContent);
      syncDiagramToTranslationsSpy.mockRejectedValue(new Error("Sync failed"));

      const result = await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      // Should still return successfully (translation was saved)
      expect(result).toEqual({});
      expect(debugSpy).toHaveBeenCalledWith(
        "⚠️  Failed to sync diagram images after translation: Sync failed",
      );
    });

    test("should handle readFileContent errors gracefully", async () => {
      readFileContentSpy.mockRejectedValue(new Error("Read failed"));

      const result = await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      // Should still return successfully (translation was saved)
      expect(result).toEqual({});
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("⚠️  Failed to sync diagram images after translation"),
      );
    });

    test("should handle getFileName errors gracefully", async () => {
      getFileNameSpy.mockImplementation(() => {
        throw new Error("GetFileName failed");
      });

      const result = await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      // Should still return successfully (translation was saved)
      expect(result).toEqual({});
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("⚠️  Failed to sync diagram images after translation"),
      );
    });
  });

  describe("edge cases", () => {
    test("should handle non-English locale", async () => {
      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      readFileContentSpy.mockResolvedValue(mainContent);
      getFileNameSpy.mockReturnValue("guide.zh.md");

      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "en",
        locale: "zh",
      });

      expect(getFileNameSpy).toHaveBeenCalledWith("/guide", "zh");
      expect(readFileContentSpy).toHaveBeenCalledWith("/docs", "guide.zh.md");
      expect(syncDiagramToTranslationsSpy).toHaveBeenCalledWith(
        mainContent,
        "/guide",
        "/docs",
        "zh",
        "sync",
      );
    });

    test("should handle empty labels array", async () => {
      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        labels: [],
        locale: "en",
      });

      expect(saveDocTranslationSpy).toHaveBeenCalledWith({
        path: "/guide",
        docsDir: "/docs",
        language: "zh",
        translation: "Translated content",
        labels: [],
      });
    });

    test("should handle undefined labels", async () => {
      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "Translated content",
        language: "zh",
        locale: "en",
      });

      expect(saveDocTranslationSpy).toHaveBeenCalledWith({
        path: "/guide",
        docsDir: "/docs",
        language: "zh",
        translation: "Translated content",
        labels: undefined,
      });
    });

    test("should handle empty translation content", async () => {
      await saveDocTranslation({
        path: "/guide",
        docsDir: "/docs",
        translation: "",
        language: "zh",
        locale: "en",
      });

      expect(saveDocTranslationSpy).toHaveBeenCalledWith({
        path: "/guide",
        docsDir: "/docs",
        language: "zh",
        translation: "",
        labels: undefined,
      });
    });
  });
});
