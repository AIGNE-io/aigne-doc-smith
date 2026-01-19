import { detectWorkspaceMode, isGitRepo, WORKSPACE_MODES } from "../../utils/workspace.mjs";
import { generateDocSmithAfsModules } from "../../utils/afs-factory.mjs";

// Detect workspace mode at module load time (no initialization side effects)
// If config exists, read mode from it; otherwise infer from git status
let workspace = await detectWorkspaceMode();
if (!workspace) {
  // Not initialized yet, infer mode from git status
  const isGit = await isGitRepo();
  workspace = {
    mode: isGit ? WORKSPACE_MODES.PROJECT : WORKSPACE_MODES.STANDALONE,
    configPath: null,
    workspacePath: isGit ? "./.aigne/doc-smith" : ".",
  };
}

const afsModules = await generateDocSmithAfsModules(workspace);

/**
 * Main agent configuration
 */
export default {
  type: "@aigne/agent-library/agent-skill-manager",
  name: "docsmith",
  task_render_mode: "collapse",
  instructions: {
    url: "./prompt.md",
  },

  model: {
    cache_config: {
      autoBreakpoints: {
        lastMessage: true,
      },
    },
  },

  session: {
    compact: {
      max_tokens: 150000,
    },
  },

  history_config: {
    enabled: true,
  },

  input_key: "message",
  skills: [
    { type: "@aigne/agent-library/ask-user-question" },
    "../../agents/publish/index.yaml",
    "../../agents/localize/index.yaml",
    "../../agents/generate-images/index.yaml",
    "../../agents/bash-executor/index.mjs",
    "../../agents/structure-checker/index.mjs",
    "../../agents/content-checker/index.mjs",
    "../../agents/update-image/index.yaml",
    "../../skills-entry/doc-smith-docs-detail/batch.yaml",
  ],
  afs: {
    modules: afsModules,
  },
};
