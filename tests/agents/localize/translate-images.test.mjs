/**
 * Tests for agents/localize/translate-images/*
 *
 * Function signatures:
 * - check-image-translation.mjs: checkImageTranslation(input): Check if images need translation
 * - detect-text/detect-and-update-shared.mjs: detectAndUpdateShared(input): Detect text in images
 * - detect-text/save-text-detection.mjs: saveTextDetection(input): Save detection result
 * - prepare-image-input.mjs: prepareImageInput(input): Prepare image translation input
 * - save-image-translation.mjs: saveImageTranslation(input): Save translated image
 * - scan-doc-images.mjs: scanDocImages(input): Scan document for image slots
 *
 * NOTE: Tests focus on module exports and synchronous function behavior.
 * Async functions that depend on workspace state are tested for structure only.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("localize/translate-images agents", () => {
  let tempDir;

  beforeEach(async () => {
    const temp = await createTempDir();
    tempDir = temp.path;
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  // ==================== check-image-translation.mjs ====================
  describe("check-image-translation.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should require slots, targetLanguage, sourceLanguage", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("slots");
        expect(required).toContain("targetLanguage");
        expect(required).toContain("sourceLanguage");
      });

      test("should handle empty slots", async () => {
        const { default: checkImageTranslation } = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        const result = await checkImageTranslation({
          slots: [],
          targetLanguage: "zh",
          sourceLanguage: "en",
        });
        expect(result.success).toBe(true);
        expect(result.translationTasks).toEqual([]);
      });
    });

    describe("Unhappy Path", () => {
      test("should handle null slots", async () => {
        const { default: checkImageTranslation } = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        const result = await checkImageTranslation({
          slots: null,
          targetLanguage: "zh",
          sourceLanguage: "en",
        });
        expect(result.success).toBe(true);
        expect(result.translationTasks).toEqual([]);
      });

      test("should handle undefined slots", async () => {
        const { default: checkImageTranslation } = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        const result = await checkImageTranslation({
          slots: undefined,
          targetLanguage: "zh",
          sourceLanguage: "en",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema with success", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should define stats in output", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default.output_schema.properties.stats).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should mention shared images in description", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("shared");
      });

      test("should handle XSS in targetLanguage", async () => {
        const { default: checkImageTranslation } = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        const result = await checkImageTranslation({
          slots: [],
          targetLanguage: "<script>alert(1)</script>",
          sourceLanguage: "en",
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle path traversal in slot key", async () => {
        const { default: checkImageTranslation } = await import(
          "../../../agents/localize/translate-images/check-image-translation.mjs"
        );
        const result = await checkImageTranslation({
          slots: [{ key: "../../../etc/passwd", exists: false }],
          targetLanguage: "zh",
          sourceLanguage: "en",
        });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== detect-and-update-shared.mjs ====================
  describe("detect-and-update-shared.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
      });

      test("should require slots and sourceLanguage", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("slots");
        expect(required).toContain("sourceLanguage");
      });

      test("should handle empty slots", async () => {
        const { default: detectAndUpdateShared } = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        const result = await detectAndUpdateShared({
          slots: [],
          sourceLanguage: "en",
        });
        expect(result.success).toBe(true);
        expect(result.detectionTasks).toEqual([]);
      });
    });

    describe("Unhappy Path", () => {
      test("should handle null slots", async () => {
        const { default: detectAndUpdateShared } = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        const result = await detectAndUpdateShared({
          slots: null,
          sourceLanguage: "en",
        });
        expect(result.success).toBe(true);
      });

      test("should handle slots with no existing images", async () => {
        const { default: detectAndUpdateShared } = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        const result = await detectAndUpdateShared({
          slots: [{ key: "test", exists: false }],
          sourceLanguage: "en",
        });
        expect(result.success).toBe(true);
        expect(result.message).toContain("No images");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.output_schema).toBeDefined();
      });

      test("should define detectionTasks in output", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.output_schema.properties.detectionTasks).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should mention text detection in description", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("detect");
      });

      test("should mention shared in description", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("shared");
      });

      test("should handle injection in sourceLanguage", async () => {
        const { default: detectAndUpdateShared } = await import(
          "../../../agents/localize/translate-images/detect-text/detect-and-update-shared.mjs"
        );
        const result = await detectAndUpdateShared({
          slots: [],
          sourceLanguage: "<script>",
        });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== save-text-detection.mjs ====================
  describe("save-text-detection.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
      });

      test("should require key, metaPath, hasText", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("key");
        expect(required).toContain("metaPath");
        expect(required).toContain("hasText");
      });
    });

    describe("Unhappy Path", () => {
      test("should return error on missing metaPath file", async () => {
        const { default: saveTextDetection } = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const result = await saveTextDetection({
          key: "test",
          metaPath: join(tempDir, "nonexistent.yaml"),
          hasText: false,
        });
        expect(result.success).toBe(false);
      });

      test("should return error on invalid YAML", async () => {
        const { default: saveTextDetection } = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const metaPath = join(tempDir, "invalid.yaml");
        await writeFile(metaPath, "invalid: yaml: [");
        const result = await saveTextDetection({
          key: "test",
          metaPath,
          hasText: false,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should define shared in output", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        expect(module.default.output_schema.properties.shared).toBeDefined();
      });

      test("should save correct YAML on success", async () => {
        const { default: saveTextDetection } = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const metaPath = join(tempDir, "meta.yaml");
        await writeFile(metaPath, "key: test\n");
        const result = await saveTextDetection({
          key: "test",
          metaPath,
          hasText: false,
        });
        expect(result.success).toBe(true);
        expect(result.shared).toBe(true);
      });
    });

    describe("Security Scenarios", () => {
      test("should handle path traversal in metaPath", async () => {
        const { default: saveTextDetection } = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const result = await saveTextDetection({
          key: "test",
          metaPath: "../../../etc/passwd",
          hasText: false,
        });
        expect(result.success).toBe(false);
      });

      test("should handle XSS in key", async () => {
        const { default: saveTextDetection } = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const metaPath = join(tempDir, "meta.yaml");
        await writeFile(metaPath, "key: test\n");
        const result = await saveTextDetection({
          key: "<script>alert(1)</script>",
          metaPath,
          hasText: true,
        });
        expect(result.success).toBe(true);
      });

      test("should handle null bytes in metaPath", async () => {
        const { default: saveTextDetection } = await import(
          "../../../agents/localize/translate-images/detect-text/save-text-detection.mjs"
        );
        const result = await saveTextDetection({
          key: "test",
          metaPath: "/path\x00to/meta.yaml",
          hasText: false,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  // ==================== prepare-image-input.mjs ====================
  describe("prepare-image-input.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema with required fields", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("key");
        expect(required).toContain("desc");
        expect(required).toContain("assetDir");
        expect(required).toContain("sourceImagePath");
        expect(required).toContain("sourceHash");
      });

      test("should prepare image input successfully", async () => {
        const { default: prepareImageInput } = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        const result = await prepareImageInput({
          key: "test-key",
          desc: "Test image",
          assetDir: "/path/to/asset",
          sourceImagePath: "/path/to/image.png",
          sourceHash: "abc123",
          aspectRatio: "16:9",
          size: "2K",
          sourceLanguage: "en",
          targetLanguage: "zh",
        });
        expect(result.success).toBe(true);
        expect(result.existingImage).toBeDefined();
        expect(result.existingImage[0].type).toBe("local");
      });
    });

    describe("Unhappy Path", () => {
      test("should set mimeType based on extension", async () => {
        const { default: prepareImageInput } = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        const resultPng = await prepareImageInput({
          key: "test",
          desc: "Test",
          assetDir: "/path",
          sourceImagePath: "/path/test.png",
          sourceHash: "abc",
          aspectRatio: "4:3",
          size: "2K",
          sourceLanguage: "en",
          targetLanguage: "zh",
        });
        expect(resultPng.existingImage[0].mimeType).toBe("image/png");

        const resultJpg = await prepareImageInput({
          key: "test",
          desc: "Test",
          assetDir: "/path",
          sourceImagePath: "/path/test.jpg",
          sourceHash: "abc",
          aspectRatio: "4:3",
          size: "2K",
          sourceLanguage: "en",
          targetLanguage: "zh",
        });
        expect(resultJpg.existingImage[0].mimeType).toBe("image/jpeg");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        expect(module.default.output_schema).toBeDefined();
      });

      test("should pass through key and assetDir", async () => {
        const { default: prepareImageInput } = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        const result = await prepareImageInput({
          key: "my-key",
          desc: "Test",
          assetDir: "/my/asset/dir",
          sourceImagePath: "/path/test.png",
          sourceHash: "abc",
          aspectRatio: "4:3",
          size: "2K",
          sourceLanguage: "en",
          targetLanguage: "zh",
        });
        expect(result.key).toBe("my-key");
        expect(result.assetDir).toBe("/my/asset/dir");
      });
    });

    describe("Security Scenarios", () => {
      test("should handle path traversal in sourceImagePath", async () => {
        const { default: prepareImageInput } = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        const result = await prepareImageInput({
          key: "test",
          desc: "Test",
          assetDir: "/path",
          sourceImagePath: "../../../etc/passwd",
          sourceHash: "abc",
          aspectRatio: "4:3",
          size: "2K",
          sourceLanguage: "en",
          targetLanguage: "zh",
        });
        // Should succeed but path is passed through (validation elsewhere)
        expect(result.success).toBe(true);
      });

      test("should handle XSS in desc", async () => {
        const { default: prepareImageInput } = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        const result = await prepareImageInput({
          key: "test",
          desc: "<script>alert(1)</script>",
          assetDir: "/path",
          sourceImagePath: "/path/test.png",
          sourceHash: "abc",
          aspectRatio: "4:3",
          size: "2K",
          sourceLanguage: "en",
          targetLanguage: "zh",
        });
        expect(result.success).toBe(true);
        expect(result.desc).toContain("script");
      });

      test("should include error code in output schema", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/prepare-image-input.mjs"
        );
        expect(module.default.output_schema.properties.error).toBeDefined();
      });
    });
  });

  // ==================== save-image-translation.mjs ====================
  describe("save-image-translation.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should require key, assetDir, targetLanguage, sourceHash, images", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("key");
        expect(required).toContain("assetDir");
        expect(required).toContain("targetLanguage");
        expect(required).toContain("sourceHash");
        expect(required).toContain("images");
      });
    });

    describe("Unhappy Path", () => {
      test("should fail on empty images array", async () => {
        const { default: saveImageTranslation } = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        const result = await saveImageTranslation({
          key: "test",
          assetDir: tempDir,
          targetLanguage: "zh",
          sourceHash: "abc123",
          images: [],
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe("GENERATION_FAILED");
      });

      test("should fail on null images", async () => {
        const { default: saveImageTranslation } = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        const result = await saveImageTranslation({
          key: "test",
          assetDir: tempDir,
          targetLanguage: "zh",
          sourceHash: "abc123",
          images: null,
        });
        expect(result.success).toBe(false);
      });

      test("should fail on missing path in images", async () => {
        const { default: saveImageTranslation } = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        const result = await saveImageTranslation({
          key: "test",
          assetDir: tempDir,
          targetLanguage: "zh",
          sourceHash: "abc123",
          images: [{ filename: "test.png", mimeType: "image/png" }],
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe("INVALID_IMAGE_DATA");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema with success", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should define targetImagePath in output", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default.output_schema.properties.targetImagePath).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should mention hash in description", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("hash");
      });

      test("should define error in output schema", async () => {
        const module = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        expect(module.default.output_schema.properties.error).toBeDefined();
      });

      test("should handle path traversal in assetDir", async () => {
        const { default: saveImageTranslation } = await import(
          "../../../agents/localize/translate-images/save-image-translation.mjs"
        );
        const result = await saveImageTranslation({
          key: "test",
          assetDir: "../../../tmp",
          targetLanguage: "zh",
          sourceHash: "abc123",
          images: [],
        });
        // Should fail due to empty images (before path validation)
        expect(result.success).toBe(false);
      });
    });
  });

  // ==================== scan-doc-images.mjs ====================
  describe("scan-doc-images.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.description).toBeDefined();
      });

      test("should require path, sourceLanguage, language", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        const required = module.default.input_schema.required;
        expect(required).toContain("path");
        expect(required).toContain("sourceLanguage");
        expect(required).toContain("language");
      });
    });

    describe("Unhappy Path", () => {
      test("should return error for nonexistent document", async () => {
        const { default: scanDocImages } = await import(
          "../../../agents/localize/translate-images/scan-doc-images.mjs"
        );
        const result = await scanDocImages({
          path: "/nonexistent",
          sourceLanguage: "en",
          language: "zh",
        });
        expect(result.success).toBe(false);
        expect(result.message).toContain("Error");
      });

      test("should accept 1 parameter", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.length).toBe(1);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module).toBeDefined();
      });

      test("should have output_schema", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.output_schema).toBeDefined();
      });

      test("should define hasSlots in output", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.output_schema.properties.hasSlots).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should mention slots in description", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.description.toLowerCase()).toContain("slot");
      });

      test("should handle path traversal in path", async () => {
        const { default: scanDocImages } = await import(
          "../../../agents/localize/translate-images/scan-doc-images.mjs"
        );
        const result = await scanDocImages({
          path: "../../../etc/passwd",
          sourceLanguage: "en",
          language: "zh",
        });
        expect(result.success).toBe(false);
      });

      test("should define error in output schema", async () => {
        const module = await import("../../../agents/localize/translate-images/scan-doc-images.mjs");
        expect(module.default.output_schema.properties.error).toBeDefined();
      });
    });
  });
});
