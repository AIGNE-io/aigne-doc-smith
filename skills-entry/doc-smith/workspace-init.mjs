import { detectAndInitialize, WORKSPACE_MODES, DOC_SMITH_DIR } from "../../utils/workspace.mjs";

/**
 * Print workspace information to console
 * @param {{ mode: string }} workspace - Workspace info
 */
function printWorkspaceInfo(workspace) {
  console.log(`Project: ${process.cwd()}`);
  const isProject = workspace.mode === WORKSPACE_MODES.PROJECT;
  console.log(`DocSmith workspace: ${isProject ? DOC_SMITH_DIR : "."}`);
  console.log(`Docs output: ${isProject ? `${DOC_SMITH_DIR}/docs` : "./docs"}`);
  console.log("\n🎯 Ready for documentation generation...\n");
}

/**
 * Workspace initialization function agent
 * Detects workspace state and initializes if needed
 */
async function workspaceInit() {
  console.log("\n🚀 Welcome to DocSmith!");

  const workspace = await detectAndInitialize();
  printWorkspaceInfo(workspace);

  return {};
}

workspaceInit.description = "Initialize DocSmith workspace";
workspaceInit.task_render_mode = "hide";

export default workspaceInit;
