import { loadDocumentPaths, filterValidPaths } from "../../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES } from "../../../utils/agent-constants.mjs";
import { loadLocale, loadConfigFromFile, saveValueToConfig } from "../../../utils/config.mjs";

/**
 * Prepare translation tasks
 * @param {Object} input - Input parameters
 * @param {string[]} input.docs - Document paths to translate (optional)
 * @param {string[]} input.langs - Target language list (required)
 * @param {boolean} input.force - Whether to force re-translation (optional, default false)
 * @returns {Promise<Object>} - Translation task list or error message
 */
export default async function prepareTranslation(input) {
  try {
    // 1. Validate langs parameter
    const { docs, langs, force = false } = input;

    if (!langs || !Array.isArray(langs) || langs.length === 0) {
      return {
        success: false,
        error: ERROR_CODES.MISSING_LANGS,
        message: "Target language list cannot be empty",
        suggestion: 'Please provide at least one target language (e.g., ["en", "ja"])',
      };
    }

    // 2. Read source language
    let sourceLanguage;
    try {
      sourceLanguage = await loadLocale();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_CONFIG_FILE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_CONFIG_FILE,
          message: `Config file does not exist: ${PATHS.CONFIG}`,
          suggestion:
            "Please ensure you are executing this command in the document project root directory",
        };
      }
      if (error.message === ERROR_CODES.MISSING_LOCALE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_LOCALE,
          message: `Missing locale field in ${PATHS.CONFIG}`,
          suggestion: `Please add locale field to ${PATHS.CONFIG}`,
        };
      }
      throw error;
    }

    // 3. Filter out languages same as source language
    const targetLanguages = langs.filter((lang) => lang !== sourceLanguage);

    if (targetLanguages.length === 0) {
      return {
        success: true,
        skipped: true,
        translationTasks: [],
        sourceLanguage,
        message: `All target languages are the same as source language (${sourceLanguage}), skipping translation`,
      };
    }

    // 4. Load document structure
    let validPaths;
    try {
      validPaths = await loadDocumentPaths();
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_STRUCTURE_FILE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_STRUCTURE_FILE,
          message: `Document structure file does not exist: ${PATHS.DOCUMENT_STRUCTURE}`,
          suggestion: "Please generate document structure file first",
        };
      }
      if (error.message === ERROR_CODES.INVALID_STRUCTURE_FILE) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_STRUCTURE_FILE,
          message: "Invalid document structure file format",
          suggestion: `Please ensure ${PATHS.DOCUMENT_STRUCTURE} contains a valid documents array`,
        };
      }
      throw error;
    }

    // 5. Collect or validate document paths
    let docPaths;
    if (!docs || docs.length === 0) {
      // Translate all documents
      docPaths = Array.from(validPaths);
    } else {
      // Validate specified document paths
      const { validPaths: validDocPaths, invalidPaths } = filterValidPaths(docs, validPaths);

      if (invalidPaths.length > 0) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_DOC_PATHS,
          message: `The following document paths do not exist in document structure: ${invalidPaths.join(", ")}`,
          suggestion: `Please check if document paths are correct, or add these paths to ${PATHS.DOCUMENT_STRUCTURE}`,
          invalidPaths,
        };
      }

      docPaths = validDocPaths;
    }

    // 6. Update translateLanguages in config.yaml (only handle additions)
    try {
      const config = await loadConfigFromFile();
      const existingLanguages = config?.translateLanguages || [];

      // Find new languages (in targetLanguages but not in existingLanguages)
      const newLanguages = targetLanguages.filter((lang) => !existingLanguages.includes(lang));

      // If there are new languages, update config
      if (newLanguages.length > 0) {
        const updatedLanguages = [...existingLanguages, ...newLanguages];
        await saveValueToConfig(
          "translateLanguages",
          updatedLanguages,
          "A list of languages to translate the documentation to",
        );
      }
    } catch (error) {
      // If update fails, log warning but don't affect main flow
      console.warn(`Failed to update translateLanguages in config.yaml: ${error.message}`);
    }

    // 7. Generate translation tasks
    // Convert targetLanguages to object array so iterate_on can use
    const translationTasks = docPaths.map((path) => ({
      path,
      sourceLanguage,
      force,
      targetLanguages: targetLanguages.map((lang) => ({ language: lang })),
    }));

    return {
      success: true,
      translationTasks,
      sourceLanguage,
      targetLanguages,
      totalDocs: docPaths.length,
      message: `Preparing to translate ${docPaths.length} documents to ${targetLanguages.length} languages (${targetLanguages.join(", ")})`,
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_CODES.UNEXPECTED_ERROR,
      message: `Error preparing translation tasks: ${error.message}`,
      suggestion: "Check file system permissions and file formats",
    };
  }
}

// Add description
prepareTranslation.description =
  "Check translation parameters, filter target languages, collect document paths, prepare for batch translation. " +
  "Automatically read source language from config.yaml, filter target languages same as source language, " +
  "validate document paths exist in planning/document-structure.yaml.";

// Define input schema
prepareTranslation.input_schema = {
  type: "object",
  properties: {
    docs: {
      type: "array",
      items: { type: "string" },
      description:
        "Document paths to translate (optional, translates all documents if not provided)",
    },
    langs: {
      type: "array",
      items: { type: "string" },
      description: "Target language list (required, at least one)",
    },
    force: {
      type: "boolean",
      description:
        "Whether to force re-translation (optional, default false. When true, re-translate even if source document unchanged)",
    },
  },
  required: ["langs"],
};

// Define output schema
prepareTranslation.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    translationTasks: {
      type: "array",
      description: "Translation task list (present on success)",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          sourceLanguage: { type: "string" },
          targetLanguages: {
            type: "array",
            items: { type: "object", properties: { language: { type: "string" } } },
          },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code",
    },
    targetLanguages: {
      type: "array",
      items: { type: "string" },
      description: "Filtered target language list",
    },
    totalDocs: {
      type: "number",
      description: "Total document count",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
    skipped: {
      type: "boolean",
      description: "Whether translation was skipped",
    },
    error: {
      type: "string",
      description: "Error code (present on failure)",
    },
    suggestion: {
      type: "string",
      description: "Suggested action (present on failure)",
    },
    invalidPaths: {
      type: "array",
      items: { type: "string" },
      description: "Invalid document paths list (present on failure)",
    },
  },
};
