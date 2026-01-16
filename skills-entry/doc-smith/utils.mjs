/**
 * 此文件为向后兼容保留，所有实现已迁移到 utils/workspace.mjs
 * 请直接使用 utils/workspace.mjs 中的导出
 */

// 重新导出所有工具函数和常量
export {
  // 常量
  WORKSPACE_MODES,
  AIGNE_DIR,
  DOC_SMITH_DIR,
  SOURCES_DIR,
  WORKSPACE_SUBDIRS,
  // 函数
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
