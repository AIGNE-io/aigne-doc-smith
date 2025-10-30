import { recordUpdate } from "../../utils/history-utils.mjs";

export default function recordTranslationHistory({ selectedPaths, feedback }) {
  // Skip if no feedback provided
  if (!feedback?.trim()) {
    return {};
  }

  if (!Array.isArray(selectedPaths) || selectedPaths.length === 0) {
    return {};
  }

  // Record translation history for this document
  recordUpdate({
    operation: "translation_update",
    feedback: feedback.trim(),
    docPaths: selectedPaths,
  });

  return {};
}

recordTranslationHistory.task_render_mode = "hide";
