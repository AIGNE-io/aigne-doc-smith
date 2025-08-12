import { saveDocWithTranslations } from "../utils/utils.mjs";
import { shutdownMermaidWorkerPool } from "../utils/mermaid-worker-pool.mjs";

export default async function saveSingleDoc({
  path,
  content,
  docsDir,
  translates,
  labels,
  locale,
  isTranslate = false,
  isShowMessage = false,
}) {
  const results = await saveDocWithTranslations({
    path,
    content,
    docsDir,
    translates,
    labels,
    locale,
    isTranslate,
  });

  if (isShowMessage) {
    // Shutdown mermaid worker pool to ensure clean exit
    try {
      await shutdownMermaidWorkerPool();
    } catch (error) {
      console.warn("Failed to shutdown mermaid worker pool:", error.message);
    }

    const message = isTranslate
      ? `✅ Translation completed successfully`
      : `✅ Document updated successfully`;
    return { message };
  }

  return {};
}
