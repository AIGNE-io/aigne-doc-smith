import { readFile, writeFile } from "node:fs/promises";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { ERROR_CODES } from "../../../../utils/agent-constants.mjs";

/**
 * Save text detection result to .meta.yaml
 * @param {Object} input - Input parameters
 * @param {string} input.key - Image key
 * @param {string} input.metaPath - .meta.yaml file path
 * @param {boolean} input.hasText - Whether contains text (from detect-image-text.yaml output)
 * @returns {Promise<Object>} - Operation result
 */
export default async function saveTextDetection(input) {
  const { key, metaPath, hasText } = input;

  try {
    // Read .meta.yaml
    const metaContent = await readFile(metaPath, "utf8");
    const meta = yamlParse(metaContent);

    // Update generation.shared field
    if (!meta.generation) {
      meta.generation = {};
    }

    // shared = !hasText (no text means shared)
    meta.generation.shared = !hasText;

    // Save updated .meta.yaml
    const updatedMetaContent = yamlStringify(meta);
    await writeFile(metaPath, updatedMetaContent, "utf8");

    return {
      success: true,
      key,
      hasText,
      shared: !hasText,
      message: `Updated shared field: ${key} (hasText=${hasText}, shared=${!hasText})`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.SAVE_ERROR,
      message: `Error saving text detection result: ${error.message}`,
      key,
    };
  }
}

// Add description
saveTextDetection.description =
  "Save image text detection result to .meta.yaml file. " +
  "Update generation.shared field based on detection result: text-free images shared=true, images with text shared=false.";

// Define input schema
saveTextDetection.input_schema = {
  type: "object",
  required: ["key", "metaPath", "hasText"],
  properties: {
    key: {
      type: "string",
      description: "Image key",
    },
    metaPath: {
      type: "string",
      description: ".meta.yaml file path",
    },
    hasText: {
      type: "boolean",
      description: "Whether image contains text (from detect-image-text.yaml output)",
    },
  },
};

// Define output schema
saveTextDetection.output_schema = {
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
    hasText: {
      type: "boolean",
      description: "Whether image contains text (present on success)",
    },
    shared: {
      type: "boolean",
      description: "Whether it is a shared image (present on success)",
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
