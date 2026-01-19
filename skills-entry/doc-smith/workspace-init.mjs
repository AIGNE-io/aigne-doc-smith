import {
  detectWorkspaceMode,
  isGitRepo,
  initProjectMode,
  initStandaloneMode,
  WORKSPACE_MODES,
  DOC_SMITH_DIR,
} from "../../utils/workspace.mjs";

/**
 * Workspace initialization function agent
 * Detects workspace state and initializes if needed
 */
async function workspaceInit() {
  console.log("\n🚀 Welcome to DocSmith!");

  // Check if already initialized
  const existing = await detectWorkspaceMode();
  if (existing) {
    // Already initialized, print info and skip
    console.log(`Project: ${process.cwd()}`);
    if (existing.mode === WORKSPACE_MODES.PROJECT) {
      console.log(`DocSmith workspace: ${DOC_SMITH_DIR}`);
      console.log(`Docs output: ${DOC_SMITH_DIR}/docs`);
    } else {
      console.log(`DocSmith workspace: .`);
      console.log(`Docs output: ./docs`);
    }
    console.log("\n🎯 Ready for documentation generation...\n");

    return {};
  }

  // Not initialized, determine mode and initialize
  let workspace;
  if (await isGitRepo()) {
    workspace = await initProjectMode();
  } else {
    workspace = await initStandaloneMode();
  }

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

  return {};
}

workspaceInit.description = "Initialize DocSmith workspace";
workspaceInit.task_render_mode = "hide";

export default workspaceInit;
