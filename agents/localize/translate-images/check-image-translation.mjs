import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";
import { calculateFileHash, findImageFile } from "../../../utils/image-utils.mjs";

/**
 * Check if images need translation
 * @param {Object} input - Input parameters
 * @param {Array} input.slots - Image slot list (from scan-doc-images output)
 * @param {string} input.targetLanguage - Target language
 * @param {string} input.sourceLanguage - Source language (main language)
 * @returns {Promise<Object>} - Check result
 */
export default async function checkImageTranslation(input) {
  const { slots, targetLanguage, sourceLanguage } = input;

  if (!slots || slots.length === 0) {
    return {
      success: true,
      translationTasks: [],
      message: "No images to check",
    };
  }

  const translationTasks = [];
  let sharedCount = 0;
  let alreadyTranslatedCount = 0;
  let needUpdateCount = 0;

  for (const slot of slots) {
    const { key, desc, assetDir, metaPath, exists } = slot;

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

    // 1. Check if it's a text-free shared image
    if (meta.generation?.shared === true) {
      sharedCount++;
      continue; // Skip text-free images
    }

    // 2. Check if target language already exists
    const languages = meta.languages || [];
    const alreadyTranslated = languages.includes(targetLanguage);

    // 3. Find source language image
    const imagesDir = join(assetDir, "images");
    const sourceImagePath = await findImageFile(imagesDir, sourceLanguage);
    if (!sourceImagePath) {
      // Source image does not exist, skip
      continue;
    }

    // 4. Calculate source image hash
    const sourceHash = await calculateFileHash(sourceImagePath);

    // 5. Determine if translation is needed
    let needsTranslation = false;
    let reason = "";

    if (!alreadyTranslated) {
      // Target language version does not exist, needs translation
      needsTranslation = true;
      reason = "missing";
    } else {
      // Already translated, check if source image is updated
      const translations = meta.translations || {};
      const translationInfo = translations[targetLanguage];

      if (!translationInfo || !translationInfo.sourceHash) {
        // No source hash recorded, needs re-translation
        needsTranslation = true;
        reason = "no_hash";
      } else if (translationInfo.sourceHash !== sourceHash) {
        // Source image has been updated, needs re-translation
        needsTranslation = true;
        reason = "source_updated";
        needUpdateCount++;
      } else {
        // Already translated and source image unchanged, skip
        alreadyTranslatedCount++;
      }
    }

    if (needsTranslation) {
      // Get image aspect ratio (from meta or default)
      const aspectRatio = meta.generation?.aspectRatio || "4:3";
      const size = meta.generation?.size || "2K";

      translationTasks.push({
        key,
        desc,
        assetDir,
        sourceImagePath,
        sourceHash,
        aspectRatio,
        size,
        reason,
      });
    }
  }

  return {
    success: true,
    translationTasks,
    sourceLanguage,
    targetLanguage,
    stats: {
      total: slots.length,
      shared: sharedCount,
      alreadyTranslated: alreadyTranslatedCount,
      needUpdate: needUpdateCount,
      needTranslation: translationTasks.length,
    },
    message:
      `Checked ${slots.length} images: ` +
      `${sharedCount} text-free shared images, ` +
      `${alreadyTranslatedCount} already translated, ` +
      `${translationTasks.length} need translation` +
      (needUpdateCount > 0 ? ` (${needUpdateCount} need update)` : ""),
  };
}

// Add description
checkImageTranslation.description =
  "Check if images need translation to target language. " +
  "Skip text-free shared images, check source image hash to determine if re-translation is needed. " +
  "Return list of image translation tasks.";

// Define input schema
checkImageTranslation.input_schema = {
  type: "object",
  required: ["slots", "targetLanguage", "sourceLanguage"],
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
    targetLanguage: {
      type: "string",
      description: "Target language code",
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code (main language)",
    },
  },
};

// Define output schema
checkImageTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    translationTasks: {
      type: "array",
      description: "List of image translation tasks",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "Image key" },
          desc: { type: "string", description: "Image description" },
          assetDir: { type: "string", description: "Image asset directory" },
          sourceImagePath: { type: "string", description: "Source image file path" },
          sourceHash: { type: "string", description: "Source image hash" },
          aspectRatio: { type: "string", description: "Aspect ratio" },
          size: { type: "string", description: "Image size" },
          reason: {
            type: "string",
            description: "Translation reason (missing/no_hash/source_updated)",
          },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code",
    },
    targetLanguage: {
      type: "string",
      description: "Target language code",
    },
    stats: {
      type: "object",
      description: "Statistics",
      properties: {
        total: { type: "number", description: "Total image count" },
        shared: { type: "number", description: "Text-free shared image count" },
        alreadyTranslated: { type: "number", description: "Already translated count" },
        needUpdate: { type: "number", description: "Need update count" },
        needTranslation: { type: "number", description: "Need translation count" },
      },
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
  },
};
