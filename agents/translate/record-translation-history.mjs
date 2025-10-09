import { recordUpdate } from "../../utils/history-utils.mjs";

export default function recordTranslationHistory({ feedback, path }) {
  // Skip if no feedback provided
  if (!feedback?.trim()) {
    return {};
  }

  // Record translation history for this document
  recordUpdate({
    operation: "translation_update",
    feedback: feedback.trim(),
    documentPath: path,
  });

  return {};
}

recordTranslationHistory.task_render_mode = "hide";
