import { shutdownMermaidWorkerPool } from "../../utils/mermaid-worker-pool.mjs";
import { saveDoc as _saveDoc } from "../../utils/utils.mjs";
import { debug } from "../../utils/debug.mjs";

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

  // Sync diagram changes to translation documents if needed
  // Only sync for diagram-related operations (addDiagram, updateDiagram, deleteDiagram)
  if (
    docsDir &&
    path &&
    intentType &&
    ["addDiagram", "updateDiagram", "deleteDiagram"].includes(intentType)
  ) {
    try {
      const { syncDiagramToTranslations } = await import(
        "../../utils/sync-diagram-to-translations.mjs"
      );

      // Determine operation type for sync
      // deleteDiagram -> "delete" (process even if 0 diagrams)
      // addDiagram/updateDiagram -> "update" (skip if 0 diagrams)
      const operationType = intentType === "deleteDiagram" ? "delete" : "update";

      const syncResult = await syncDiagramToTranslations(
        content,
        path,
        docsDir,
        locale || "en",
        operationType,
      );

      if (syncResult.updated > 0) {
        debug(
          `✅ Synced diagram changes to ${syncResult.updated} translation file(s) for ${intentType}`,
        );
      }
    } catch (error) {
      // Don't fail the operation if sync fails
      debug(`⚠️  Failed to sync diagram to translations: ${error.message}`);
    }
  }

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
