import { readFile, access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * Check if image directory exists
 * @param {string} key - Image key
 * @returns {Promise<boolean>}
 */
async function imageDirectoryExists(key) {
  const dirPath = join(PATHS.ASSETS_DIR, key);
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (_error) {
    return false;
  }
}

/**
 * Read image meta information
 * @param {string} key - Image key
 * @returns {Promise<Object|null>} - Meta information or null (if file does not exist)
 */
async function readImageMeta(key) {
  const metaPath = join(PATHS.ASSETS_DIR, key, ".meta.yaml");

  try {
    await access(metaPath, constants.F_OK | constants.R_OK);
    const content = await readFile(metaPath, "utf8");
    return yamlParse(content);
  } catch (_error) {
    return null;
  }
}

/**
 * Check if image file exists
 * @param {string} key - Image key
 * @param {string} locale - Language code
 * @returns {Promise<string|null>} - Image path or null (if not exists)
 */
async function getExistingImagePath(key, locale) {
  const imagePath = join(PATHS.ASSETS_DIR, key, "images", `${locale}.png`);

  try {
    await access(imagePath, constants.F_OK | constants.R_OK);
    return imagePath;
  } catch (_error) {
    return null;
  }
}

/**
 * Determine if document hash has changed
 * @param {Array} currentDocs - Current document list
 * @param {Array} metaDocs - Document list recorded in meta
 * @returns {boolean} - Whether there are changes
 */
function hasDocumentChanges(currentDocs, metaDocs) {
  if (!metaDocs || metaDocs.length === 0) {
    return true;
  }

  // Convert meta documents to map (path -> hash)
  const metaHashMap = new Map(metaDocs.map((doc) => [doc.path, doc.hash]));

  // Check hash of each current document
  for (const doc of currentDocs) {
    const metaHash = metaHashMap.get(doc.path);
    if (!metaHash || metaHash !== doc.hash) {
      return true; // Hash differs or new document
    }
  }

  return false;
}

/**
 * Prepare image generation tasks
 * @param {Object} input - Input parameters
 * @param {string} input.locale - Main language
 * @param {Array} input.slots - Scanned slot list
 * @param {boolean} input.force - Whether to force regeneration
 * @returns {Promise<Object>} - Task list
 */
export default async function prepareGeneration(input) {
  try {
    const { locale, slots, force = false } = input;

    if (!locale) {
      throw new Error(
        "Missing main language parameter, please check if doc-smith workspace has been initialized and files have been generated!",
      );
    }

    if (!slots || slots.length === 0) {
      return {
        success: true,
        locale,
        generationTasks: [],
        message: "No image slots found to generate",
      };
    }

    const generationTasks = [];
    let skippedCount = 0;

    // Check each slot
    for (const slot of slots) {
      const { key, id, desc, documents } = slot;

      // Check if image directory exists
      const dirExists = await imageDirectoryExists(key);

      let needsGeneration = false;
      let isUpdate = false;
      let existingImagePath = null;

      if (force) {
        // Force regeneration
        needsGeneration = true;
        isUpdate = dirExists;
        if (isUpdate) {
          existingImagePath = await getExistingImagePath(key, locale);
        }
      } else if (!dirExists) {
        // Image directory does not exist, needs generation
        needsGeneration = true;
        isUpdate = false;
      } else {
        // Image directory exists, check if hash changed
        const meta = await readImageMeta(key);

        if (!meta) {
          // Meta file does not exist, regenerate
          needsGeneration = true;
          isUpdate = false;
        } else {
          const hasChanges = hasDocumentChanges(documents, meta.documents);

          if (hasChanges) {
            // Document has changes, update image
            needsGeneration = true;
            isUpdate = true;
            existingImagePath = await getExistingImagePath(key, locale);
          } else {
            // No changes, skip
            needsGeneration = false;
            skippedCount++;
          }
        }
      }

      if (needsGeneration) {
        generationTasks.push({
          key,
          id,
          desc,
          documents,
          isUpdate,
          existingImagePath,
        });
      }
    }

    return {
      success: true,
      locale,
      generationTasks,
      totalSlots: slots.length,
      newTasks: generationTasks.filter((t) => !t.isUpdate).length,
      updateTasks: generationTasks.filter((t) => t.isUpdate).length,
      skippedTasks: skippedCount,
      message: `Preparing to generate ${generationTasks.length} images (new: ${generationTasks.filter((t) => !t.isUpdate).length}, update: ${generationTasks.filter((t) => t.isUpdate).length}, skip: ${skippedCount})`,
    };
  } catch (error) {
    throw new Error(`Error preparing image generation tasks: ${error.message}`);
  }
}

// Add description
prepareGeneration.description =
  "Check existing image directories and meta information, compare document hashes, " +
  "determine which images need generation or update, and generate task list.";

// Define input schema
prepareGeneration.input_schema = {
  type: "object",
  properties: {
    locale: {
      type: "string",
      description: "Main language code",
    },
    slots: {
      type: "array",
      description: "Scanned slot list",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          id: { type: "string" },
          desc: { type: "string" },
          documents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                hash: { type: "string" },
                content: { type: "string" },
              },
            },
          },
        },
      },
    },
    force: {
      type: "boolean",
      description: "Whether to force regenerate all images",
      default: false,
    },
  },
  required: ["locale", "slots"],
};

// Define output schema
prepareGeneration.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    locale: {
      type: "string",
      description: "Main language code",
    },
    generationTasks: {
      type: "array",
      description: "List of tasks to generate",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          id: { type: "string" },
          desc: { type: "string" },
          documents: { type: "array" },
          isUpdate: { type: "boolean" },
          existingImagePath: { type: "string", nullable: true },
        },
      },
    },
    totalSlots: {
      type: "number",
      description: "Total slot count",
    },
    newTasks: {
      type: "number",
      description: "Number of new tasks",
    },
    updateTasks: {
      type: "number",
      description: "Number of update tasks",
    },
    skippedTasks: {
      type: "number",
      description: "Number of skipped tasks",
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
