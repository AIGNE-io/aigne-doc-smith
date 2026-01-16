import { resolve } from "node:path";
import { detectWorkspaceModeSync } from "./workspace.mjs";

// Use unified workspace detection logic
const { workspaceBase: WORKSPACE_BASE } = detectWorkspaceModeSync();

/**
 * Path constants definition
 * All paths are absolute paths based on workspace
 */
export const PATHS = {
  // Workspace root directory
  WORKSPACE_BASE,

  // Temp directory
  TMP_DIR: resolve(WORKSPACE_BASE, ".tmp"),

  // Cache directory
  CACHE: resolve(WORKSPACE_BASE, "cache"),

  // Document structure file
  DOCUMENT_STRUCTURE: resolve(WORKSPACE_BASE, "planning/document-structure.yaml"),

  // Documents directory
  DOCS_DIR: resolve(WORKSPACE_BASE, "docs"),

  // Assets directory (images, etc.)
  ASSETS_DIR: resolve(WORKSPACE_BASE, "assets"),

  // Config file
  CONFIG: resolve(WORKSPACE_BASE, "config.yaml"),

  // Glossary
  GLOSSARY: resolve(WORKSPACE_BASE, "intent/GLOSSARY.md"),

  // Planning directory
  PLANNING_DIR: resolve(WORKSPACE_BASE, "planning"),
};

/**
 * Error code constants
 * Unified management of error types
 */
export const ERROR_CODES = {
  // File system related
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_READ_ERROR: "FILE_READ_ERROR",
  FILE_WRITE_ERROR: "FILE_WRITE_ERROR",
  FILE_OPERATION_ERROR: "FILE_OPERATION_ERROR",

  // Document structure related
  MISSING_STRUCTURE_FILE: "MISSING_STRUCTURE_FILE",
  INVALID_STRUCTURE_FILE: "INVALID_STRUCTURE_FILE",

  // Config related
  MISSING_CONFIG_FILE: "MISSING_CONFIG_FILE",
  MISSING_LOCALE: "MISSING_LOCALE",

  // Content related
  EMPTY_CONTENT: "EMPTY_CONTENT",
  INVALID_CONTENT: "INVALID_CONTENT",

  // Path related
  INVALID_PATH: "INVALID_PATH",
  PATH_NOT_IN_STRUCTURE: "PATH_NOT_IN_STRUCTURE",
  INVALID_DOC_PATHS: "INVALID_DOC_PATHS",

  // Language related
  INVALID_LANGUAGE: "INVALID_LANGUAGE",
  MISSING_LANGS: "MISSING_LANGS",
  MISSING_SOURCE_FILE: "MISSING_SOURCE_FILE",

  // Content validation related
  SOURCE_LOCALE_MISMATCH: "SOURCE_LOCALE_MISMATCH",
  MISSING_TRANSLATE_LANGUAGE: "MISSING_TRANSLATE_LANGUAGE",
  INVALID_LINK_FORMAT: "INVALID_LINK_FORMAT",

  // Other
  SAVE_ERROR: "SAVE_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
};

/**
 * File type constants
 */
export const FILE_TYPES = {
  META: ".meta.yaml",
  MARKDOWN: ".md",
  YAML: ".yaml",
};

/**
 * Document metadata defaults
 */
export const DOC_META_DEFAULTS = {
  KIND: "doc",
};
