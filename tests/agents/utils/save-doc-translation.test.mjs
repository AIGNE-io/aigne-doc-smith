import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import saveDocTranslation from "../../../agents/utils/save-doc-translation.mjs";
import * as utilsModule from "../../../utils/utils.mjs";

describe("save-doc-translation", () => {
  let saveDocTranslationSpy;

  beforeEach(() => {
    saveDocTranslationSpy = spyOn(utilsModule, "saveDocTranslation").mockResolvedValue({
      path: "/mock/path",
      success: true,
    });
  });

  afterEach(() => {
    saveDocTranslationSpy?.mockRestore();
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

  describe("edge cases", () => {

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
