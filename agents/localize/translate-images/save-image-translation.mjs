import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { ERROR_CODES } from "../../../utils/agent-constants.mjs";
import { getExtensionFromMimeType } from "../../../utils/image-utils.mjs";

/**
 * Save translated image and update .meta.yaml
 * @param {Object} input - Input parameters
 * @param {string} input.key - Image key
 * @param {string} input.assetDir - Image asset directory
 * @param {string} input.targetLanguage - Target language
 * @param {string} input.sourceHash - Source image hash
 * @param {Array} input.images - Image translation result (from translate-image.yaml)
 * @returns {Promise<Object>} - Operation result
 */
export default async function saveImageTranslation(input) {
  const { key, assetDir, targetLanguage, sourceHash, images } = input;

  try {
    // 1. Validate image data
    // Format: [{ filename, mimeType, type, path }, ...]
    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        success: false,
        key,
        error: "GENERATION_FAILED",
        message: "Translated image data not found",
        suggestion: "Check the output format of the image translation agent, expecting images array",
        availableKeys: Object.keys(input),
      };
    }

    // Use the first image
    const imageInfo = images[0];
    if (!imageInfo.path) {
      return {
        success: false,
        key,
        error: "INVALID_IMAGE_DATA",
        message: "Image data missing path field",
        suggestion: "Check the images format returned by the image translation agent",
      };
    }

    // 2. Determine target file path
    const ext = getExtensionFromMimeType(imageInfo.mimeType);
    const targetImagePath = join(assetDir, "images", `${targetLanguage}.${ext}`);

    // Ensure directory exists
    await mkdir(dirname(targetImagePath), { recursive: true });

    // 3. Copy from temporary file to target location
    await copyFile(imageInfo.path, targetImagePath);

    // 4. Update .meta.yaml
    const metaPath = join(assetDir, ".meta.yaml");
    const metaContent = await readFile(metaPath, "utf8");
    const meta = yamlParse(metaContent);

    // 4.1 Add target language to languages array
    if (!meta.languages || !Array.isArray(meta.languages)) {
      meta.languages = [];
    }
    if (!meta.languages.includes(targetLanguage)) {
      meta.languages.push(targetLanguage);
    }

    // 4.2 Update translations info
    if (!meta.translations) {
      meta.translations = {};
    }
    meta.translations[targetLanguage] = {
      sourceHash,
      translatedAt: new Date().toISOString(),
    };

    // 5. Save updated .meta.yaml
    const updatedMetaContent = yamlStringify(meta);
    await writeFile(metaPath, updatedMetaContent, "utf8");

    return {
      success: true,
      key,
      targetLanguage,
      targetImagePath,
      message: `Image translation saved: ${targetImagePath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.SAVE_ERROR,
      message: `Error saving image translation: ${error.message}`,
      key,
    };
  }
}

// Add description
saveImageTranslation.description =
  "Save translated image to target path and update .meta.yaml file. " +
  "Record source image hash and translation time for determining if re-translation is needed later.";

// Define input schema
saveImageTranslation.input_schema = {
  type: "object",
  required: ["key", "assetDir", "targetLanguage", "sourceHash", "images"],
  properties: {
    key: {
      type: "string",
      description: "Image key",
    },
    assetDir: {
      type: "string",
      description: "Image asset directory path",
    },
    targetLanguage: {
      type: "string",
      description: "Target language code",
    },
    sourceHash: {
      type: "string",
      description: "Source image hash",
    },
    images: {
      type: "array",
      description: "Image list returned by image translation agent",
      items: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Filename" },
          mimeType: { type: "string", description: "MIME type" },
          type: { type: "string", description: "Type (local)" },
          path: { type: "string", description: "Temporary file path" },
        },
      },
    },
  },
};

// Define output schema
saveImageTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    key: {
      type: "string",
      description: "Image key",
    },
    targetLanguage: {
      type: "string",
      description: "Target language code (present on success)",
    },
    targetImagePath: {
      type: "string",
      description: "Saved image path (present on success)",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
    error: {
      type: "string",
      description: "Error code (present on failure)",
    },
  },
};
