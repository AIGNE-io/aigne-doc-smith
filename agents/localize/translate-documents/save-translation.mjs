import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import path from "node:path";
import {
  PATHS,
  ERROR_CODES,
  FILE_TYPES,
  DOC_META_DEFAULTS,
} from "../../../utils/agent-constants.mjs";

/**
 * Save translation result and update .meta.yaml
 * @param {Object} input - Input parameters
 * @param {string} input.path - Document path
 * @param {string} input.targetFile - Target file path
 * @param {string} input.targetLanguage - Target language code
 * @param {string} input.sourceHash - Source document hash
 * @param {string} input.translation - Translation content
 * @returns {Promise<Object>} - Operation result
 */
export default async function saveTranslation(input) {
  const { path: docPath, targetFile, targetLanguage, sourceHash, translation } = input;
  try {
    // 1. Save translation file
    await writeFile(targetFile, translation, "utf8");

    // 2. Update .meta.yaml
    const docFolder = path.join(PATHS.DOCS_DIR, docPath);
    const metaPath = path.join(docFolder, FILE_TYPES.META);

    let meta = {};
    let metaExists = false;

    // Try to read existing .meta.yaml
    try {
      await access(metaPath, constants.F_OK | constants.R_OK);
      const metaContent = await readFile(metaPath, "utf8");
      meta = yamlParse(metaContent);
      metaExists = true;
    } catch (_error) {
      // .meta.yaml does not exist, use defaults
      meta = {
        kind: DOC_META_DEFAULTS.KIND,
        source: targetLanguage,
        default: targetLanguage,
      };
    }

    // 3. Initialize or update languages array
    if (!meta.languages || !Array.isArray(meta.languages)) {
      // Initialize languages array, including source language
      meta.languages = meta.source ? [meta.source] : [];
    }

    // 4. Add target language (avoid duplicates)
    if (!meta.languages.includes(targetLanguage)) {
      meta.languages.push(targetLanguage);
    }

    // 5. Initialize or update translations object
    if (!meta.translations || typeof meta.translations !== "object") {
      meta.translations = {};
    }

    // 6. Record translation info (sourceHash and translation time)
    meta.translations[targetLanguage] = {
      sourceHash,
      translatedAt: new Date().toISOString(),
    };

    // 7. Save updated .meta.yaml
    const updatedMetaContent = yamlStringify(meta);
    await writeFile(metaPath, updatedMetaContent, "utf8");

    return {
      success: true,
      targetFile,
      targetLanguage,
      metaUpdated: true,
      languages: meta.languages,
      message: metaExists
        ? `Translation saved and metadata updated: ${targetFile}`
        : `Translation saved and metadata created: ${targetFile}`,
      path: docPath,
    };
  } catch (error) {
    return {
      path: docPath,
      success: false,
      error: ERROR_CODES.SAVE_ERROR,
      message: `Error saving translation: ${error.message}`,
      suggestion: "Check file system permissions",
    };
  }
}

// Add description
saveTranslation.description =
  "Save translation result to target file and update document's .meta.yaml file. " +
  "Automatically add target language to languages array, " +
  "record source document hash and translation time to translations object for determining if re-translation is needed later.";

// Define input schema
saveTranslation.input_schema = {
  type: "object",
  required: ["path", "targetFile", "targetLanguage", "sourceHash", "translation"],
  properties: {
    path: {
      type: "string",
      description: "Document path",
    },
    targetFile: {
      type: "string",
      description: "Target file path",
    },
    targetLanguage: {
      type: "string",
      description: "Target language code",
    },
    sourceHash: {
      type: "string",
      description: "Source document SHA256 hash",
    },
    translation: {
      type: "string",
      description: "Translation content",
    },
  },
};

// Define output schema
saveTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    targetFile: {
      type: "string",
      description: "Target file path (present on success)",
    },
    targetLanguage: {
      type: "string",
      description: "Target language code (present on success)",
    },
    metaUpdated: {
      type: "boolean",
      description: "Whether metadata was updated (present on success)",
    },
    languages: {
      type: "array",
      items: { type: "string" },
      description: "Updated language list (present on success)",
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
