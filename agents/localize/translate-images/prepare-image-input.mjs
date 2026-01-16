import { basename } from "node:path";
import { ERROR_CODES } from "../../../utils/agent-constants.mjs";

/**
 * Prepare input parameters for image translation
 * @param {Object} input - Input parameters (single task from translationTasks)
 * @param {string} input.key - Image key
 * @param {string} input.desc - Image description
 * @param {string} input.assetDir - Image asset directory
 * @param {string} input.sourceImagePath - Source image path
 * @param {string} input.sourceHash - Source image hash
 * @param {string} input.aspectRatio - Aspect ratio
 * @param {string} input.size - Image size
 * @param {string} input.sourceLanguage - Source language (from parent)
 * @param {string} input.targetLanguage - Target language (from parent)
 * @returns {Promise<Object>} - Prepared input parameters
 */
export default async function prepareImageInput(input) {
  const {
    key,
    desc,
    assetDir,
    sourceImagePath,
    sourceHash,
    aspectRatio,
    size,
    sourceLanguage,
    targetLanguage,
  } = input;

  try {
    // Prepare existingImage parameter (mediaFile format)
    const existingImage = [
      {
        type: "local",
        path: sourceImagePath,
        filename: basename(sourceImagePath),
        mimeType: sourceImagePath.endsWith(".png") ? "image/png" : "image/jpeg",
      },
    ];

    return {
      success: true,
      // Parameters for translate-image.yaml
      existingImage,
      desc,
      sourceLanguage,
      targetLocale: targetLanguage,
      ratio: aspectRatio,
      size,
      // Parameters for save-image-translation.mjs
      key,
      assetDir,
      targetLanguage,
      sourceHash,
      message: `Preparing image translation: ${key} (${sourceLanguage} → ${targetLanguage})`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `Error preparing image translation input: ${error.message}`,
      key,
    };
  }
}

// Add description
prepareImageInput.description =
  "Prepare input parameters for image translation, converting translation tasks to the format required by translate-image.yaml. " +
  "Build sourceImage mediaFile object array and pass necessary parameters.";

// Define input schema
prepareImageInput.input_schema = {
  type: "object",
  required: [
    "key",
    "desc",
    "assetDir",
    "sourceImagePath",
    "sourceHash",
    "aspectRatio",
    "size",
    "sourceLanguage",
    "targetLanguage",
  ],
  properties: {
    key: { type: "string", description: "Image key" },
    desc: { type: "string", description: "Image description" },
    assetDir: { type: "string", description: "Image asset directory" },
    sourceImagePath: { type: "string", description: "Source image path" },
    sourceHash: { type: "string", description: "Source image hash" },
    aspectRatio: { type: "string", description: "Aspect ratio" },
    size: { type: "string", description: "Image size" },
    sourceLanguage: { type: "string", description: "Source language code" },
    targetLanguage: { type: "string", description: "Target language code" },
    reason: { type: "string", description: "Translation reason" },
  },
};

// Define output schema
prepareImageInput.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: { type: "boolean", description: "Whether operation succeeded" },
    existingImage: {
      type: "array",
      description: "Source image mediaFile object array",
      items: { type: "object" },
    },
    desc: { type: "string", description: "Image description" },
    sourceLanguage: { type: "string", description: "Source language code" },
    targetLocale: { type: "string", description: "Target language code" },
    ratio: { type: "string", description: "Aspect ratio" },
    size: { type: "string", description: "Image size" },
    key: { type: "string", description: "Image key" },
    assetDir: { type: "string", description: "Image asset directory" },
    targetLanguage: { type: "string", description: "Target language code" },
    sourceHash: { type: "string", description: "Source image hash" },
    message: { type: "string", description: "Operation result description" },
    error: { type: "string", description: "Error code (present on failure)" },
  },
};
