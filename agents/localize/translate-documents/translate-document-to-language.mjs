import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { parse as yamlParse } from "yaml";
import { PATHS, ERROR_CODES, FILE_TYPES } from "../../../utils/agent-constants.mjs";
import { calculateContentHash } from "../../../utils/image-utils.mjs";
import saveTranslation from "./save-translation.mjs";

/**
 * Translate a single document to a single target language
 * @param {Object} input - Input parameters
 * @param {string} input.path - Document path
 * @param {string} input.sourceLanguage - Source language code
 * @param {string} input.language - Current iteration target language code (from iterate_on)
 * @param {boolean} input.force - Whether to force re-translation
 * @param {string} input.glossary - Glossary content
 * @param {Object} options - Options parameters
 * @param {Object} options.context - Context object containing invoke method
 * @returns {Promise<Object>} - Translation result
 */
export default async function translateDocumentToLanguage(input, options) {
  try {
    const { path: docPath, sourceLanguage, language, force = false, glossary = "" } = input;

    // When using iterate_on, object properties are spread, directly receiving language field
    const targetLanguage = language;

    // 1. Build file paths
    const docFolder = path.join(PATHS.DOCS_DIR, docPath);
    const sourceFile = path.join(docFolder, `${sourceLanguage}.md`);
    const targetFile = path.join(docFolder, `${targetLanguage}.md`);

    // 2. Read source document
    let content;
    try {
      await access(sourceFile, constants.F_OK | constants.R_OK);
      content = await readFile(sourceFile, "utf8");
    } catch (_error) {
      throw new Error(`Source document does not exist: ${sourceFile}, document path: ${docPath}, please ensure source language document has been created`);
    }

    // 3. Calculate source document hash
    const sourceHash = calculateContentHash(content);

    // 4. Check if translation is needed (unless forced)
    if (!force) {
      const metaPath = path.join(docFolder, FILE_TYPES.META);
      try {
        await access(metaPath, constants.F_OK | constants.R_OK);
        const metaContent = await readFile(metaPath, "utf8");
        const meta = yamlParse(metaContent);

        // Check if translation record exists for this language
        if (meta.translations?.[targetLanguage]) {
          const translationInfo = meta.translations[targetLanguage];

          // If hash is the same, skip translation
          if (translationInfo.sourceHash === sourceHash) {
            return {
              success: true,
              skipped: true,
              reason: "hash_unchanged",
              targetLanguage,
              message: `Source document unchanged, skipping translation: ${docPath} (${sourceLanguage} -> ${targetLanguage})`,
              path: docPath,
            };
          }
        }
      } catch (_error) {
        // .meta.yaml does not exist or failed to read, continue translation
      }
    }

    // 5. Try to read old translation (as reference)
    let previousTranslation = "";
    try {
      await access(targetFile, constants.F_OK | constants.R_OK);
      previousTranslation = await readFile(targetFile, "utf8");
    } catch (_error) {
      // Old translation does not exist, this is normal
    }

    // 6. Call translation agent
    const translateDocumentAgent = options.context?.agents?.["translateDocument"];
    const translateResult = await options.context.invoke(translateDocumentAgent, {
      language: targetLanguage,
      content,
      glossary,
      previousTranslation,
    });

    if (!translateResult || !translateResult.translation) {
      throw new Error(
        `Translation failed: ${docPath} (${sourceLanguage} -> ${targetLanguage}), please try again`,
      );
    }

    // 7. Save translation result
    const saveResult = await saveTranslation({
      path: docPath,
      targetFile,
      targetLanguage,
      sourceHash,
      translation: translateResult.translation,
    });

    return {
      ...saveResult,
      path: docPath,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `Error during translation: ${error.message}`,
      suggestion: "Check file system permissions and translation configuration",
    };
  }
}

// Add description
translateDocumentToLanguage.description =
  "Translate a single document to a single target language. " +
  "Calculate source document hash, check if re-translation is needed (by comparing sourceHash saved in .meta.yaml). " +
  "If source document is unchanged and not in force mode, skip translation. " +
  "Otherwise call translation agent to execute translation and save result and sourceHash.";

// Define input schema
translateDocumentToLanguage.input_schema = {
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
      description: "Target language code (from iterate_on, object properties spread)",
    },
    force: {
      type: "boolean",
      description: "Whether to force re-translation (optional, default false)",
    },
    glossary: {
      type: "string",
      description: "Glossary content (optional)",
    },
  },
};

// Define output schema
translateDocumentToLanguage.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    skipped: {
      type: "boolean",
      description: "Whether translation was skipped (when source document hash unchanged)",
    },
    reason: {
      type: "string",
      description: "Skip reason (present when skipped=true)",
    },
    targetFile: {
      type: "string",
      description: "Target file path (present when succeeded and not skipped)",
    },
    targetLanguage: {
      type: "string",
      description: "Target language code",
    },
    metaUpdated: {
      type: "boolean",
      description: "Whether metadata was updated (present when succeeded and not skipped)",
    },
    languages: {
      type: "array",
      items: { type: "string" },
      description: "Updated language list (present when succeeded and not skipped)",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
    path: {
      type: "string",
      description: "Document path",
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
