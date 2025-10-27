import { shutdownMermaidWorkerPool } from "../../utils/mermaid-worker-pool.mjs";
import { saveDoc as _saveDoc } from "../../utils/utils.mjs";

export default async function saveDoc({
  path,
  content,
  docsDir,
  labels,
  locale,
  isShowMessage = false,
}) {
  await _saveDoc({
    path,
    content,
    docsDir,
    labels,
    locale,
  });

  if (isShowMessage) {
    // Shutdown mermaid worker pool to ensure clean exit
    try {
      await shutdownMermaidWorkerPool();
    } catch (error) {
      console.warn("Failed to shutdown mermaid worker pool:", error.message);
    }

    const message = `✅ Document updated successfully`;
    return { message };
  }

  return {
    content,
  };
}

saveDoc.task_render_mode = "hide";
