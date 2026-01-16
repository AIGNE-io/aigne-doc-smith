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
 * Generate base AFS modules (workspace and sources)
 * @param {string} mode - Workspace mode (project | standalone)
 * @returns {Array} - AFS module configuration array
 */
function generateBaseModules(mode) {
  const modules = [];

  if (mode === WORKSPACE_MODES.PROJECT) {
    // Project mode: workspace is .aigne/doc-smith, sources is CWD
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
    // Standalone mode: workspace is CWD, sources is CWD/sources
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
 * Generate skill module configuration
 * @param {string} skillName - Skill name
 * @param {string} skillPath - Skill relative path
 * @param {string} description - Skill description
 * @returns {Object} - AFS module configuration
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
 * Generate history module configuration
 * @returns {Object} - History module configuration
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
 * Generate complete AFS module configuration
 * @param {Object} options - Configuration options
 * @param {Object} options.workspace - Workspace info { mode, configPath }
 * @param {string} options.skillName - Skill name
 * @param {string} options.skillPath - Skill relative path
 * @param {string} options.skillDescription - Skill description
 * @param {boolean} options.includeHistory - Whether to include history module
 * @returns {Promise<Array>} - AFS module configuration array
 */
export async function generateAfsModules({
  workspace,
  skillName,
  skillPath,
  skillDescription = "Agent skill for document operations",
  includeHistory = false,
} = {}) {
  // Determine workspace mode
  let mode;
  if (workspace) {
    const config = await loadConfig(workspace.configPath);
    mode = config?.mode || workspace.mode;
  } else {
    const detected = await detectWorkspaceMode();
    mode = detected?.mode || WORKSPACE_MODES.STANDALONE;
  }

  const modules = [];

  // Add history module (if needed)
  if (includeHistory) {
    modules.push(generateHistoryModule());
  }

  // Add base modules (workspace and sources)
  modules.push(...generateBaseModules(mode));

  // Add skill module
  if (skillName && skillPath) {
    modules.push(generateSkillModule(skillName, skillPath, skillDescription));
  }

  return modules;
}

/**
 * Generate AFS modules for doc-smith main agent
 * @param {Object} workspace - Workspace info
 * @returns {Promise<Array>} - AFS module configuration array
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
 * Generate AFS modules for doc-smith-docs-detail agent
 * @returns {Promise<Array>} - AFS module configuration array
 */
export async function generateDocsDetailAfsModules() {
  return generateAfsModules({
    skillName: "doc-smith-docs-detail",
    skillPath: "../../skills/doc-smith-docs-detail",
    skillDescription: "Agent skill for document detail generation",
    includeHistory: false,
  });
}
