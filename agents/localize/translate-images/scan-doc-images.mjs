import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { parseSlots } from "../../../utils/image-slots.mjs";
import { PATHS, ERROR_CODES } from "../../../utils/agent-constants.mjs";

/**
 * Scan image slots in document
 * @param {Object} input - Input parameters
 * @param {string} input.path - Document path
 * @param {string} input.sourceLanguage - Source language code
 * @param {string} input.language - Target language
 * @returns {Promise<Object>} - Scan result
 */
export default async function scanDocImages(input) {
  const { path: docPath, sourceLanguage, language } = input;
  const targetLanguage = language;

  try {
    // 1. Build source document file path
    const docFolder = path.join(PATHS.DOCS_DIR, docPath);
    const sourceFile = path.join(docFolder, `${sourceLanguage}.md`);

    // 2. Read source document content
    let content;
    try {
      await access(sourceFile, constants.F_OK | constants.R_OK);
      content = await readFile(sourceFile, "utf-8");
    } catch (_error) {
      throw new Error(`Source document does not exist: ${sourceFile}, document path: ${docPath}`);
    }

    // 3. Parse slots in document
    const slots = parseSlots(content, docPath);

    if (slots.length === 0) {
      return {
        success: true,
        hasSlots: false,
        slots: [],
        targetLanguage,
        path: docPath,
        message: `No image slots in document`,
      };
    }

    // 4. Check source image info for each slot
    const slotsWithInfo = [];
    for (const slot of slots) {
      const { key, desc } = slot;

      // Check if image directory exists
      const assetDir = path.join(PATHS.ASSETS_DIR, key);
      const metaPath = path.join(assetDir, ".meta.yaml");

      try {
        await access(metaPath, constants.F_OK | constants.R_OK);

        slotsWithInfo.push({
          key,
          desc,
          assetDir,
          metaPath,
          exists: true,
        });
      } catch (_error) {
        // Image asset does not exist, skip
        slotsWithInfo.push({
          key,
          desc,
          assetDir: null,
          metaPath: null,
          exists: false,
        });
      }
    }

    return {
      success: true,
      hasSlots: true,
      slots: slotsWithInfo,
      targetLanguage,
      path: docPath,
      message: `Found ${slots.length} image slots in document, ${slotsWithInfo.filter((s) => s.exists).length} have source images`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `Error scanning document images: ${error.message}`,
      path: docPath,
    };
  }
}

// Add description
scanDocImages.description =
  "Scan main language document content, extract AFS image slots, and check if corresponding image assets exist. " +
  "Return list of images that need translation status check.";

// Define input schema
scanDocImages.input_schema = {
  type: "object",
  required: ["path", "sourceLanguage", "language"],
  properties: {
    path: {
      type: "string",
      description: "Document path",
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code",
    },
    language: {
      type: "string",
      description: "Target language code",
    },
  },
};

// Define output schema
scanDocImages.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    hasSlots: {
      type: "boolean",
      description: "Whether document contains image slots",
    },
    slots: {
      type: "array",
      description: "Image slot list",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "Image key" },
          desc: { type: "string", description: "Image description" },
          assetDir: { type: "string", description: "Image asset directory path", nullable: true },
          metaPath: { type: "string", description: ".meta.yaml file path", nullable: true },
          exists: { type: "boolean", description: "Whether image asset exists" },
        },
      },
    },
    targetLanguage: {
      type: "string",
      description: "Target language code",
    },
    path: {
      type: "string",
      description: "Document path",
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
