import { shutdownMermaidWorkerPool } from "../../utils/mermaid-worker-pool.mjs";
import { saveDocTranslations as _saveDocTranslations } from "../../utils/utils.mjs";

export default async function saveDocTranslations({
  path,
  docsDir,
  translates,
  labels,
  isShowMessage = false,
}) {
  await _saveDocTranslations({
    path,
    docsDir,
    translates,
    labels,
  });

  if (isShowMessage) {
    // Shutdown mermaid worker pool to ensure clean exit
    try {
      await shutdownMermaidWorkerPool();
    } catch (error) {
      console.warn("Failed to shutdown mermaid worker pool:", error.message);
    }

    const message = `✅ Translation completed successfully.`;
    return { message };
  }

  return {};
}

saveDocTranslations.task_render_mode = "hide";
