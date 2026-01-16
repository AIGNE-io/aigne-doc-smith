import {
  detectWorkspaceMode,
  loadConfig,
  DOC_SMITH_DIR,
  SOURCES_DIR,
  WORKSPACE_MODES,
} from "./workspace.mjs";

// AIGNE framework placeholder for current working directory
const CWD = "$" + "{CWD}";

/**
 * 生成基础 AFS 模块（workspace 和 sources）
 * @param {string} mode - workspace 模式 (project | standalone)
 * @returns {Array} - AFS 模块配置数组
 */
function generateBaseModules(mode) {
  const modules = [];

  if (mode === WORKSPACE_MODES.PROJECT) {
    // Project 模式：workspace 是 .aigne/doc-smith，sources 是 CWD
    modules.push({
      module: "local-fs",
      options: {
        name: "workspace",
        localPath: `${CWD}/${DOC_SMITH_DIR}`,
        description:
          "Doc-smith workspace directory\n" +
          "- Read-write access to documentation files\n" +
          "- Use absolute path for file operations",
      },
    });

    modules.push({
      module: "local-fs",
      options: {
        name: "sources",
        localPath: CWD,
        description:
          "Source code directory (project root)\n" +
          "- Read-only access to source files\n" +
          "- Used for documentation generation",
      },
    });
  } else {
    // Standalone 模式：workspace 是 CWD，sources 是 CWD/sources
    modules.push({
      module: "local-fs",
      options: {
        name: "workspace",
        localPath: CWD,
        description:
          "Doc-smith workspace directory\n" +
          "- Read-write access to documentation files\n" +
          "- Use absolute path for file operations",
      },
    });

    modules.push({
      module: "local-fs",
      options: {
        name: "sources",
        localPath: `${CWD}/${SOURCES_DIR}`,
        description:
          "Source code directory\n" +
          "- Read-only access to source files\n" +
          "- Used for documentation generation",
      },
    });
  }

  return modules;
}

/**
 * 生成 skill 模块配置
 * @param {string} skillName - skill 名称
 * @param {string} skillPath - skill 相对路径
 * @param {string} description - skill 描述
 * @returns {Object} - AFS 模块配置
 */
function generateSkillModule(skillName, skillPath, description) {
  return {
    module: "local-fs",
    options: {
      agentSkills: true,
      name: skillName,
      localPath: skillPath,
      description:
        description +
        "\n- Read-only access to skill definition files\n" +
        "- Do NOT modify files in this directory",
    },
  };
}

/**
 * 生成 history 模块配置
 * @returns {Object} - history 模块配置
 */
function generateHistoryModule() {
  return {
    module: "history",
    options: {
      storage: {
        url: "file:./.aigne/history.db",
      },
    },
  };
}

/**
 * 生成完整的 AFS 模块配置
 * @param {Object} options - 配置选项
 * @param {Object} options.workspace - workspace 信息 { mode, configPath }
 * @param {string} options.skillName - skill 名称
 * @param {string} options.skillPath - skill 相对路径
 * @param {string} options.skillDescription - skill 描述
 * @param {boolean} options.includeHistory - 是否包含 history 模块
 * @returns {Promise<Array>} - AFS 模块配置数组
 */
export async function generateAfsModules({
  workspace,
  skillName,
  skillPath,
  skillDescription = "Agent skill for document operations",
  includeHistory = false,
} = {}) {
  // 确定 workspace 模式
  let mode;
  if (workspace) {
    const config = await loadConfig(workspace.configPath);
    mode = config?.mode || workspace.mode;
  } else {
    const detected = await detectWorkspaceMode();
    mode = detected?.mode || WORKSPACE_MODES.STANDALONE;
  }

  const modules = [];

  // 添加 history 模块（如果需要）
  if (includeHistory) {
    modules.push(generateHistoryModule());
  }

  // 添加基础模块（workspace 和 sources）
  modules.push(...generateBaseModules(mode));

  // 添加 skill 模块
  if (skillName && skillPath) {
    modules.push(generateSkillModule(skillName, skillPath, skillDescription));
  }

  return modules;
}

/**
 * 为 doc-smith 主 agent 生成 AFS 模块
 * @param {Object} workspace - workspace 信息
 * @returns {Promise<Array>} - AFS 模块配置数组
 */
export async function generateDocSmithAfsModules(workspace) {
  return generateAfsModules({
    workspace,
    skillName: "doc-smith",
    skillPath: "../../skills/doc-smith",
    skillDescription: "Agent skill for document operations",
    includeHistory: true,
  });
}

/**
 * 为 doc-smith-docs-detail agent 生成 AFS 模块
 * @returns {Promise<Array>} - AFS 模块配置数组
 */
export async function generateDocsDetailAfsModules() {
  return generateAfsModules({
    skillName: "doc-smith-docs-detail",
    skillPath: "../../skills/doc-smith-docs-detail",
    skillDescription: "Agent skill for document detail generation",
    includeHistory: false,
  });
}
