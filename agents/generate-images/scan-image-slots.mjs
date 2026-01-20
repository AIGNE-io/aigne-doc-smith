import { readFile, access, constants } from "node:fs/promises";
import { join } from "node:path";
import { loadDocumentPaths, filterValidPaths } from "../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES } from "../../utils/agent-constants.mjs";
import { parseSlots } from "../../utils/image-slots.mjs";
import { calculateContentHash } from "../../utils/image-utils.mjs";
import { loadLocale } from "../../utils/config.mjs";

/**
 * Scan slots in a single document
 * @param {string} docPath - Document path
 * @param {string} locale - Main language
 * @returns {Promise<Object|null>} - { path, hash, content, slots } or null (if file does not exist)
 */
async function scanDocument(docPath, locale) {
  // Build document file path: docs/{path}/{locale}.md
  const normalizedPath = docPath.startsWith("/") ? docPath.slice(1) : docPath;
  const filePath = join(PATHS.DOCS_DIR, normalizedPath, `${locale}.md`);

  // Check if file exists
  try {
    await access(filePath, constants.F_OK | constants.R_OK);
  } catch (_error) {
    // File does not exist, skip (may be a document not yet generated)
    return null;
  }

  // Read document content
  const content = await readFile(filePath, "utf8");

  // Calculate hash
  const hash = calculateContentHash(content);

  // Parse slots
  const slots = parseSlots(content, docPath);

  return {
    path: docPath,
    hash,
    content,
    slots,
  };
}

/**
 * Group slots by key
 * @param {Array} scanResults - Scan results array
 * @returns {Map} - key -> { key, id, desc, documents }
 */
export function groupSlotsByKey(scanResults) {
  const slotMap = new Map();

  for (const result of scanResults) {
    if (!result || result.slots.length === 0) {
      continue;
    }

    for (const slot of result.slots) {
      const { key, id, desc } = slot;

      if (!slotMap.has(key)) {
        slotMap.set(key, {
          key,
          id,
          desc,
          documents: [],
        });
      }

      // If the same key is used multiple times, use the last id and desc
      const existing = slotMap.get(key);
      existing.id = id;
      existing.desc = desc;

      // Add document reference
      existing.documents.push({
        path: result.path,
        hash: result.hash,
        content: result.content,
      });
    }
  }

  return slotMap;
}

/**
 * Scan AFS image slots in documents
 * @param {Object} input - Input parameters
 * @param {string[]} input.docs - Document path list to scan (optional)
 * @returns {Promise<Object>} - Scan result
 */
export default async function scanImageSlots(input) {
  try {
    const { docs } = input;

    // 1. Read main language
    let locale;
    try {
      locale = await loadLocale();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_CONFIG_FILE) {
        throw new Error(
          `Config file does not exist: ${PATHS.CONFIG}, please ensure executing this command in doc-smith project root directory`,
        );
      }
      if (error.message === ERROR_CODES.MISSING_LOCALE) {
        throw new Error(
          `Missing locale field in ${PATHS.CONFIG}, please ask the user for the main language for image generation, add the locale field to ${PATHS.CONFIG}, then try executing the command again`,
        );
      }
      throw error;
    }

    // 2. Load document structure
    let validPaths;
    try {
      validPaths = await loadDocumentPaths();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_STRUCTURE_FILE) {
        throw new Error(
          `Document structure file does not exist: ${PATHS.DOCUMENT_STRUCTURE}, please generate documents using doc-smith skill first`,
        );
      }
      if (error.message === ERROR_CODES.INVALID_STRUCTURE_FILE) {
        throw new Error(
          `Invalid document structure file format, please ensure ${PATHS.DOCUMENT_STRUCTURE} contains a valid documents array, otherwise cannot scan image slots in documents, please refer to references/document-structure-schema.md for file structure`,
        );
      }
      throw error;
    }

    // 3. Collect or validate document paths
    let docPaths;
    if (!docs || docs.length === 0) {
      // Scan all documents
      docPaths = Array.from(validPaths);
    } else {
      // Validate specified document paths
      const { validPaths: validDocPaths, invalidPaths } = filterValidPaths(docs, validPaths);

      if (invalidPaths.length > 0) {
        throw new Error(
          `The following document paths do not exist in document structure: ${invalidPaths.join(", ")}, please check if document paths are correct`,
        );
      }

      docPaths = validDocPaths;
    }

    // 4. Scan all documents
    const scanResults = await Promise.all(docPaths.map((path) => scanDocument(path, locale)));

    // 5. Group by key
    const slotMap = groupSlotsByKey(scanResults);
    const slots = Array.from(slotMap.values());

    // 6. Return result
    return {
      success: true,
      locale,
      slots,
      totalDocs: docPaths.length,
      totalSlots: slots.length,
      message: `Scanned ${docPaths.length} documents, found ${slots.length} image slots`,
    };
  } catch (error) {
    throw new Error(`Error scanning image slots: ${error.message}`);
  }
}

// Add description
scanImageSlots.description =
  "Scan AFS image slots in main language documents, parse id, key, desc, " +
  "calculate document content hash, group by key and return all slot information.";

// Define input schema
scanImageSlots.input_schema = {
  type: "object",
  properties: {
    docs: {
      type: "array",
      items: { type: "string" },
      description: "Document path list to scan (optional, scans all documents if not provided)",
    },
  },
};

// Define output schema
scanImageSlots.output_schema = {
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
    slots: {
      type: "array",
      description: "Slot list grouped by key",
      items: {
        type: "object",
        properties: {
          key: { type: "string", description: "Image directory name" },
          id: { type: "string", description: "Slot id of the last usage of this key" },
          desc: { type: "string", description: "Slot description" },
          documents: {
            type: "array",
            description: "Document list referencing this key",
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
    totalDocs: {
      type: "number",
      description: "Total documents scanned",
    },
    totalSlots: {
      type: "number",
      description: "Total slots found",
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
