import { shutdownMermaidWorkerPool } from "../../utils/mermaid-worker-pool.mjs";
import { saveDoc as _saveDoc } from "../../utils/utils.mjs";

export default async function saveDoc({
  path,
  content,
  docsDir,
  labels,
  locale,
  feedback,
  isShowMessage = false,
  intentType,
  originalContent,
  ...rest
}) {
  await _saveDoc({
    path,
    content,
    docsDir,
    labels,
    locale,
  });

  // Note: Diagram image translation is handled separately during translate operation
  // In update/add operations, we only update the main document with timestamp
  // Translation documents will be updated during translate operation when timestamps differ

  if (isShowMessage) {
    // Shutdown mermaid worker pool to ensure clean exit
    try {
      await shutdownMermaidWorkerPool();
    } catch (error) {
      console.warn("Failed to shutdown mermaid worker pool:", error.message);
    }

    const message = `✅ Document updated successfully.`;
    return { message };
  }

  return {
    path,
    content,
    docsDir,
    labels,
    locale,
    feedback,
    isShowMessage,
    intentType,
    originalContent,
    ...rest,
  };
}

saveDoc.task_render_mode = "hide";
