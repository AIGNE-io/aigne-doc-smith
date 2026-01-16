import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { stringify as yamlStringify } from "yaml";
import path from "node:path";
import {
  normalizePath,
  loadDocumentPaths,
  isValidDocumentPath,
} from "../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES, FILE_TYPES, DOC_META_DEFAULTS } from "../../utils/agent-constants.mjs";
import { loadLocale } from "../../utils/config.mjs";

/**
 * Create document folder and files
 * @param {string} filePath - File path (without slash)
 * @param {string} language - Language code
 * @param {string} content - Document content
 * @returns {Promise<Object>} - Created file paths
 */
async function createDocumentFiles(filePath, language, content) {
  const docFolder = path.join(PATHS.DOCS_DIR, filePath);

  // 1. Create folder (recursive creation, ignore if already exists)
  await mkdir(docFolder, { recursive: true });

  // 2. Generate .meta.yaml
  const metaContent = yamlStringify({
    kind: DOC_META_DEFAULTS.KIND,
    source: language,
    default: language,
  });
  const metaPath = path.join(docFolder, FILE_TYPES.META);
  await writeFile(metaPath, metaContent, "utf8");

  // 3. Save language file
  const langFile = `${language}${FILE_TYPES.MARKDOWN}`;
  const langPath = path.join(docFolder, langFile);
  await writeFile(langPath, content, "utf8");

  return {
    folder: docFolder,
    metaFile: metaPath,
    contentFile: langPath,
  };
}

/**
 * Save document to docs directory
 * @param {Object} params - Parameters
 * @param {string} params.path - Document path (with or without slash)
 * @param {string} params.content - Document content (Markdown format)
 * @param {Object} params.options - Options
 * @param {string} params.options.language - Language code (e.g., zh, en, ja)
 * @returns {Promise<Object>} - Operation result
 */
export default async function saveDocument({ path: rawPath, content, options = {} }) {
  try {
    // 1. Parameter validation: content
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return {
        success: false,
        error: ERROR_CODES.EMPTY_CONTENT,
        message: "Document content cannot be empty",
        suggestion: "Please provide valid document content",
      };
    }

    // 2. Parameter validation: language
    const language = options.language;
    if (!language || typeof language !== "string") {
      return {
        success: false,
        error: ERROR_CODES.INVALID_LANGUAGE,
        message: `Invalid language code: ${language}`,
        suggestion: "Please provide a valid language code (e.g., zh, en, ja)",
      };
    }

    // Validate language code format (e.g., zh, en, zh-CN, en-US)
    const languagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!languagePattern.test(language)) {
      return {
        success: false,
        error: ERROR_CODES.INVALID_LANGUAGE,
        message: `Invalid language code format: ${language}`,
        suggestion: "Language code should follow format: zh, en, ja or zh-CN, en-US, etc.",
      };
    }

    // 3. Parameter validation: path
    if (!rawPath || typeof rawPath !== "string") {
      return {
        success: false,
        error: ERROR_CODES.INVALID_PATH,
        message: "Invalid document path",
        suggestion: "Please provide a valid document path",
      };
    }

    // 4. Normalize path
    const { filePath, displayPath } = normalizePath(rawPath);

    // 5. Load and validate document structure
    let validPaths;
    try {
      validPaths = await loadDocumentPaths({ includeBothFormats: true });
    } catch (error) {
      if (error.message === ERROR_CODES.MISSING_STRUCTURE_FILE) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_STRUCTURE_FILE,
          message: `Document structure file not found: ${PATHS.DOCUMENT_STRUCTURE}`,
          suggestion: "Please generate the document structure file first",
        };
      }
      throw error;
    }

    // 6. Validate path exists in document structure
    if (!isValidDocumentPath(rawPath, validPaths)) {
      return {
        success: false,
        error: ERROR_CODES.PATH_NOT_IN_STRUCTURE,
        message: `Document path ${displayPath} does not exist in document structure`,
        suggestion: `Please add this path to ${PATHS.DOCUMENT_STRUCTURE} first, or check if the path is correct`,
      };
    }

    // 7. Check that language must equal project locale when creating new document
    const docFolder = path.join(PATHS.DOCS_DIR, filePath);
    const metaPath = path.join(docFolder, FILE_TYPES.META);
    const isNewDocument = !existsSync(metaPath);

    if (isNewDocument) {
      let projectLocale;
      try {
        projectLocale = await loadLocale();
      } catch (_error) {
        return {
          success: false,
          error: ERROR_CODES.MISSING_CONFIG_FILE,
          message: "Cannot read project configuration file",
          suggestion: "Please ensure config.yaml exists and contains the locale field",
        };
      }

      if (language !== projectLocale) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_LANGUAGE,
          message: `New documents must use project main language: ${projectLocale}, provided: ${language}`,
          suggestion: `Please change language parameter to "${projectLocale}" (project locale), generate main language version first`,
        };
      }
    }

    // 8. Create folder and files
    const files = await createDocumentFiles(filePath, language, content);

    // 9. Return success response
    return {
      success: true,
      path: displayPath,
      folder: files.folder,
      files: {
        meta: files.metaFile,
        content: files.contentFile,
      },
      message: `Document saved successfully: ${displayPath} (${language})`,
    };
  } catch (error) {
    // Catch unexpected errors
    return {
      success: false,
      error: ERROR_CODES.FILE_OPERATION_ERROR,
      message: `File operation failed: ${error.message}`,
      suggestion: "Check file system permissions or if path is correct",
    };
  }
}

// Add description
saveDocument.description =
  `Save document to ${PATHS.DOCS_DIR} directory, automatically create folder structure, meta info file and language version file. ` +
  "[Important restriction] This tool is only for creating new documents. When editing existing documents, use the Edit tool to modify the corresponding language file directly. " +
  `Must ensure ${PATHS.DOCUMENT_STRUCTURE} exists and contains the target document path before use. ` +
  "[Mandatory requirement] When creating new documents, language must equal project locale (locale field in config.yaml), the system will auto-validate.";

// Define input schema
saveDocument.input_schema = {
  type: "object",
  required: ["path", "content", "options"],
  properties: {
    path: {
      type: "string",
      description: "Document path, must exist in planning/document-structure.yaml",
    },
    content: {
      type: "string",
      description: "Document content (Markdown format), cannot be empty",
    },
    options: {
      type: "object",
      required: ["language"],
      properties: {
        language: {
          type: "string",
          description: "Language code (e.g., zh, en, ja), must be read from locale field in config.yaml",
        },
      },
    },
  },
};

// Define output schema
saveDocument.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    path: {
      type: "string",
      description: "Normalized document path (present on success)",
    },
    folder: {
      type: "string",
      description: "Created folder path (present on success)",
    },
    files: {
      type: "object",
      description: "Created file paths (present on success)",
      properties: {
        meta: {
          type: "string",
          description: "Meta info file path",
        },
        content: {
          type: "string",
          description: "Language file path",
        },
      },
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
