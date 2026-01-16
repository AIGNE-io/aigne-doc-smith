import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse } from "yaml";
import { PATHS, ERROR_CODES } from "./agent-constants.mjs";

/**
 * Normalize path
 * @param {string} rawPath - Raw path (may or may not have leading slash)
 * @returns {Object} - { filePath: path without slash, displayPath: path with slash }
 */
export function normalizePath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  let normalized = rawPath.trim();

  // Remove leading slash
  if (normalized.startsWith("/")) {
    normalized = normalized.slice(1);
  }

  // Remove trailing slash
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return {
    filePath: normalized, // "overview" or "api/authentication"
    displayPath: `/${normalized}`, // "/overview" or "/api/authentication"
  };
}

/**
 * Recursively collect document paths
 * @param {Array} docs - Document array
 * @param {Object} options - Collection options
 * @param {boolean} options.includeBothFormats - Whether to include both formats with and without leading slash
 * @param {boolean} options.collectMetadata - Whether to collect additional metadata
 * @returns {Set|Array} - Path set or path object array
 */
export function collectDocumentPaths(docs, options = {}) {
  const { includeBothFormats = false, collectMetadata = false } = options;

  const paths = collectMetadata ? [] : new Set();

  function collect(documents) {
    for (const doc of documents) {
      if (doc.path) {
        // Normalize path
        const normalized = doc.path.startsWith("/") ? doc.path.slice(1) : doc.path;

        if (collectMetadata) {
          // Collect path and metadata
          paths.push({
            path: normalized,
            displayPath: `/${normalized}`,
            title: doc.title || "",
            description: doc.description || "",
          });
        } else {
          // Only collect paths
          paths.add(normalized);
          if (includeBothFormats) {
            paths.add(`/${normalized}`);
          }
        }
      }

      // Recursively process child documents
      if (doc.children && Array.isArray(doc.children)) {
        collect(doc.children);
      }
    }
  }

  collect(docs);
  return paths;
}

/**
 * Load all paths from document structure
 * @param {Object} options - Loading options
 * @param {string} options.yamlPath - YAML file path
 * @param {boolean} options.includeBothFormats - Whether to include both formats with and without leading slash
 * @param {boolean} options.collectMetadata - Whether to collect additional metadata
 * @param {boolean} options.throwOnInvalid - Whether to throw error when document format is invalid
 * @returns {Promise<Set|Array>} - Set of all valid paths or path object array
 */
export async function loadDocumentPaths(options = {}) {
  const {
    yamlPath = PATHS.DOCUMENT_STRUCTURE,
    includeBothFormats = false,
    collectMetadata = false,
    throwOnInvalid = true,
  } = options;

  // Check if file exists
  try {
    await access(yamlPath, constants.F_OK | constants.R_OK);
  } catch (_error) {
    throw new Error(ERROR_CODES.MISSING_STRUCTURE_FILE);
  }

  // Read and parse YAML
  const content = await readFile(yamlPath, "utf8");
  const data = yamlParse(content);

  if (!data.documents || !Array.isArray(data.documents)) {
    if (throwOnInvalid) {
      throw new Error(ERROR_CODES.INVALID_STRUCTURE_FILE);
    } else {
      throw new Error(ERROR_CODES.MISSING_STRUCTURE_FILE);
    }
  }

  // Recursively collect all paths
  return collectDocumentPaths(data.documents, {
    includeBothFormats,
    collectMetadata,
  });
}

/**
 * Validate whether a path exists in the document structure
 * @param {string} path - The path to validate
 * @param {Set|Array} validPaths - Set of valid paths
 * @returns {boolean} - Whether the path is valid
 */
export function isValidDocumentPath(path, validPaths) {
  if (!path) return false;

  const { filePath, displayPath } = normalizePath(path);

  if (validPaths instanceof Set) {
    return validPaths.has(filePath) || validPaths.has(displayPath);
  }

  if (Array.isArray(validPaths)) {
    return validPaths.some((p) => {
      const pathValue = typeof p === "string" ? p : p.path;
      return pathValue === filePath || pathValue === displayPath;
    });
  }

  return false;
}

/**
 * Filter valid paths from a path array
 * @param {string[]} paths - Array of paths to validate
 * @param {Set|Array} validPaths - Set of valid paths
 * @returns {Object} - { validPaths: [], invalidPaths: [] }
 */
export function filterValidPaths(paths, validPaths) {
  const result = {
    validPaths: [],
    invalidPaths: [],
  };

  for (const path of paths) {
    const { filePath } = normalizePath(path);

    if (isValidDocumentPath(path, validPaths)) {
      result.validPaths.push(filePath);
    } else {
      result.invalidPaths.push(path);
    }
  }

  return result;
}
