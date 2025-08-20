import { shutdownMermaidWorkerPool } from "../utils/mermaid-worker-pool.mjs";

export default async function actionSuccess({ action }) {
  // Shutdown mermaid worker pool to ensure clean exit
  try {
    await shutdownMermaidWorkerPool();
  } catch (error) {
    console.warn("Failed to shutdown mermaid worker pool:", error.message);
  }

  return {
    message: `✅ ${action} successfully`,
  };
}

actionSuccess.task_render_mode = "hide";
