/**
 * This file is kept for backward compatibility, all implementations have been migrated to utils/workspace.mjs
 * Please use exports from utils/workspace.mjs directly
 */

// Re-export all utility functions and constants
export {
  // Constants
  WORKSPACE_MODES,
  AIGNE_DIR,
  DOC_SMITH_DIR,
  SOURCES_DIR,
  WORKSPACE_SUBDIRS,
  // Functions
  pathExists,
  pathExistsSync,
  isGitRepo,
  gitExec,
  detectWorkspaceMode,
  detectWorkspaceModeSync,
  loadConfig,
  generateConfig,
  createDirectoryStructure,
  initProjectMode,
  initStandaloneMode,
  detectAndInitialize,
} from "../../utils/workspace.mjs";
