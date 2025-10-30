import { recordUpdate } from "../../utils/history-utils.mjs";

export default function recordTranslationHistory({ selectedDocs, feedback }) {
  // Skip if no feedback provided
  if (!feedback?.trim()) {
    return {};
  }

  if (!Array.isArray(selectedDocs) || selectedDocs.length === 0) {
    return {};
  }

  // Record translation history for this document
  recordUpdate({
    operation: "translation_update",
    feedback: feedback.trim(),
    docPaths: selectedDocs.map((v) => v.path),
  });

  return {};
}

recordTranslationHistory.task_render_mode = "hide";
