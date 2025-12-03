import pMap from "p-map";
import { recordUpdate } from "../../utils/history-utils.mjs";

export default async function saveAndTranslateDocument(input, options) {
  const { selectedDocs, docsDir, translateLanguages, locale } = input;

  if (!Array.isArray(selectedDocs) || selectedDocs.length === 0) {
    return {};
  }

  // Record history if feedback is provided
  const doc = selectedDocs[0];
  if (doc.feedback?.trim()) {
    recordUpdate({
      operation: "document_update",
      feedback: doc.feedback.trim(),
      docPaths: selectedDocs.map((v) => v.path),
    });
  }

  // Only prompt user if translation is actually needed
  let shouldTranslate = false;
  if (
    Array.isArray(translateLanguages) &&
    translateLanguages.filter((lang) => lang !== locale).length > 0
  ) {
    const choice = await options.prompts.select({
      message: "Document update completed. Would you like to translate these documents now?",
      choices: [
        {
          name: "Review documents first, translate later",
          value: "no",
        },
        {
          name: "Translate now",
          value: "yes",
        },
      ],
    });
    shouldTranslate = choice === "yes";
  }

  // Save documents in batches
  const batchSize = 3;

  // Return results if user chose to skip translation
  if (!shouldTranslate) {
    return {};
  }

  // Translate documents in batches
  const translateAgent = options.context.agents["translateMultilingual"];

  await pMap(
    selectedDocs,
    async (doc) => {
      try {
        // Clear feedback to ensure translation is not affected by update feedback
        doc.feedback = "";

        await options.context.invoke(translateAgent, {
          ...input, // context is required
          content: doc.content,
          title: doc.title,
          path: doc.path,
          docsDir,
        });
      } catch (error) {
        console.error(`❌ Failed to translate document ${doc.path}:`, error.message);
      }
    },
    { concurrency: batchSize },
  );

  return {};
}
