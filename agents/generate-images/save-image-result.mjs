import { writeFile, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { stringify as yamlStringify } from "yaml";
import { PATHS, ERROR_CODES } from "../../utils/agent-constants.mjs";
import { getExtensionFromMimeType } from "../../utils/image-utils.mjs";

/**
 * Save image file
 * @param {string} key - Image key
 * @param {string} locale - Language code
 * @param {Object} imageInfo - Image information { path, mimeType, ... }
 * @returns {Promise<string>} - Saved image path
 */
async function saveImage(key, locale, imageInfo) {
  const ext = getExtensionFromMimeType(imageInfo.mimeType);
  const imagePath = join(PATHS.ASSETS_DIR, key, "images", `${locale}.${ext}`);

  // Ensure directory exists
  await mkdir(dirname(imagePath), { recursive: true });

  // Copy from temporary file to target location
  await copyFile(imageInfo.path, imagePath);

  return imagePath;
}

/**
 * Generate or update .meta.yaml
 * @param {string} key - Image key
 * @param {string} id - Slot id
 * @param {string} desc - Slot description
 * @param {Array} documents - Associated document list
 * @param {string} locale - Main language
 * @param {string} model - Model used
 * @returns {Promise<void>}
 */
async function saveMeta(key, id, desc, documents, locale, model) {
  const metaPath = join(PATHS.ASSETS_DIR, key, ".meta.yaml");

  const meta = {
    kind: "image",
    slot: {
      id,
      key,
      desc,
    },
    generation: {
      model,
      createdAt: new Date().toISOString(),
      shared: false, // Default false, determined by LLM during translation
    },
    documents: documents.map((doc) => ({
      path: doc.path,
      hash: doc.hash,
    })),
    languages: [locale],
  };

  // Ensure directory exists
  await mkdir(dirname(metaPath), { recursive: true });

  // Save meta
  await writeFile(metaPath, yamlStringify(meta), "utf8");
}

/**
 * Save image generation result
 * @param {Object} input - Input parameters (containing generation result)
 * @returns {Promise<Object>} - Save result
 */
export default async function saveImageResult(input) {
  try {
    const { key, id, desc, documents, locale, isUpdate, imageGenParams } = input;

    // Validate parameters
    if (!key || !id || !desc || !documents || !locale) {
      return {
        success: false,
        key,
        error: "MISSING_PARAMETERS",
        message: "Missing required parameters",
        suggestion: "Please ensure key, id, desc, documents, locale are provided",
      };
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return {
        success: false,
        key,
        error: "INVALID_DOCUMENTS",
        message: "documents parameter is invalid or empty",
        suggestion: "Please ensure at least one associated document exists",
      };
    }

    // Get generation result from input.images
    // Format: [{ filename, mimeType, type, path }, ...]
    const images = input.images;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        success: false,
        key,
        error: "GENERATION_FAILED",
        message: "Generated image data not found",
        suggestion: "Please check the image generation agent output format, expecting images array",
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
        suggestion: "Please check the images format returned by the image generation agent",
      };
    }

    const model = imageGenParams?.model;

    // Save image (copy from temporary path to assets directory)
    const imagePath = await saveImage(key, locale, imageInfo);

    // Save or update meta
    await saveMeta(key, id, desc, documents, locale, model);

    return {
      success: true,
      key,
      imagePath,
      isUpdate,
      message: `Successfully ${isUpdate ? "updated" : "generated"} image: ${imagePath}`,
    };
  } catch (error) {
    return {
      success: false,
      key: input.key,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `Error saving image: ${error.message}`,
      suggestion: "Please check file system permissions and image generation agent configuration",
      stack: error.stack,
    };
  }
}

// Add description
saveImageResult.description =
  "Save image generation agent results to assets directory, " +
  "including image file and .meta.yaml metadata file.";

// Define input schema
saveImageResult.input_schema = {
  type: "object",
  properties: {
    key: {
      type: "string",
      description: "Image key (directory name)",
    },
    id: {
      type: "string",
      description: "Slot id",
    },
    desc: {
      type: "string",
      description: "Slot description",
    },
    documents: {
      type: "array",
      description: "Associated document list",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          hash: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    locale: {
      type: "string",
      description: "Main language code",
    },
    isUpdate: {
      type: "boolean",
      description: "Whether in update mode",
    },
    imageGenParams: {
      type: "object",
      description: "Parameters passed to image generation agent",
    },
    // Following fields are returned by image generation agent
    images: {
      type: "array",
      description: "Image list returned by image generation agent",
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
  required: ["key", "id", "desc", "documents", "locale"],
};

// Define output schema
saveImageResult.output_schema = {
  type: "object",
  required: ["success", "key"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    key: {
      type: "string",
      description: "Image key",
    },
    imagePath: {
      type: "string",
      description: "Generated image path",
    },
    isUpdate: {
      type: "boolean",
      description: "Whether this is an update operation",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
    error: {
      type: "string",
      description: "Error code (present on failure)",
    },
    suggestion: {
      type: "string",
      description: "Suggested action (present on failure)",
    },
  },
};
