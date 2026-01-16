import { detectAndInitialize, DOC_SMITH_DIR, WORKSPACE_MODES } from "../../utils/workspace.mjs";
import { generateDocSmithAfsModules } from "../../utils/afs-factory.mjs";

// Initialize workspace and generate config at module load time
console.log("\n🚀 Welcome to DocSmith!");

const workspace = await detectAndInitialize();
const afsModules = await generateDocSmithAfsModules(workspace);

// Print workspace info
console.log(`Project: ${process.cwd()}`);
if (workspace.mode === WORKSPACE_MODES.PROJECT) {
  console.log(`DocSmith workspace: ${DOC_SMITH_DIR}`);
  console.log(`Docs output: ${DOC_SMITH_DIR}/docs`);
} else {
  console.log(`DocSmith workspace: .`);
  console.log(`Docs output: ./docs`);
}

console.log("\n🎯 Ready for documentation generation...\n");

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
