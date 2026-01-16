import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { parse as yamlParse } from "yaml";
import { findImageFile, getImageMimeType } from "../../../../utils/image-utils.mjs";

/**
 * Detect if image contains text and update .meta.yaml shared field
 * @param {Object} input - Input parameters
 * @param {Array} input.slots - Image slot list (from scan-doc-images output)
 * @param {string} input.sourceLanguage - Source language (main language)
 * @returns {Promise<Object>} - Processing result
 */
export default async function detectAndUpdateShared(input) {
  const { slots, sourceLanguage } = input;

  if (!slots || slots.length === 0 || !slots.some((s) => s.exists)) {
    return {
      success: true,
      detectionTasks: [],
      message: "No images to detect",
    };
  }

  const detectionTasks = [];

  for (const slot of slots) {
    const { key, assetDir, metaPath, exists } = slot;

    // If image asset does not exist, skip
    if (!exists) {
      continue;
    }

    // Read .meta.yaml
    let meta;
    try {
      const metaContent = await readFile(metaPath, "utf8");
      meta = yamlParse(metaContent);
    } catch (_error) {
      // Failed to read .meta.yaml, skip
      continue;
    }

    // Check if shared field has already been detected
    if (meta.generation?.shared === true) {
      // Already detected, skip shared images
      continue;
    }

    // Find main language image
    const imagesDir = join(assetDir, "images");
    const sourceImagePath = await findImageFile(imagesDir, sourceLanguage);

    if (!sourceImagePath) {
      // Main language image does not exist, skip
      continue;
    }

    // Add to detection task list
    detectionTasks.push({
      key,
      assetDir,
      metaPath,
      sourceImagePath,
      // Prepare imageFile parameter (mediaFile format)
      imageFile: [
        {
          type: "local",
          path: sourceImagePath,
          filename: basename(sourceImagePath),
          mimeType: getImageMimeType(sourceImagePath),
        },
      ],
    });
  }

  return {
    success: true,
    detectionTasks,
    sourceLanguage,
    message: `${detectionTasks.length} images need text detection`,
  };
}

// Add description
detectAndUpdateShared.description =
  "Detect if images contain text, prepare batch detection tasks. " +
  "Only detect images without generation.shared field set.";

// Define input schema
detectAndUpdateShared.input_schema = {
  type: "object",
  required: ["slots", "sourceLanguage"],
  properties: {
    slots: {
      type: "array",
      description: "Image slot list (from scan-doc-images output)",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          desc: { type: "string" },
          assetDir: { type: "string", nullable: true },
          metaPath: { type: "string", nullable: true },
          exists: { type: "boolean" },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code (main language)",
    },
  },
};

// Define output schema
detectAndUpdateShared.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    detectionTasks: {
      type: "array",
      description: "List of image detection tasks",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "Image key" },
          assetDir: { type: "string", description: "Image asset directory" },
          metaPath: { type: "string", description: ".meta.yaml file path" },
          sourceImagePath: { type: "string", description: "Main language image path" },
          imageFile: { type: "array", description: "imageFile mediaFile object array" },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
  },
};
