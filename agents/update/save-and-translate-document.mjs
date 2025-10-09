import { recordUpdate } from "../../utils/history-utils.mjs";

export default async function saveAndTranslateDocument(input, options) {
  const { selectedDocs, docsDir, translateLanguages, locale } = input;

  // Saves a document with optional translation data
  const saveDocument = async (doc, translates = null, isTranslate = false) => {
    const saveAgent = options.context.agents["saveSingleDoc"];

    return await options.context.invoke(saveAgent, {
      path: doc.path,
      content: doc.content,
      docsDir: docsDir,
      locale: locale,
      translates: translates || doc.translates,
      labels: doc.labels,
      isTranslate: isTranslate,
    });
  };

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

  // Process documents in batches for better performance
  const batchSize = 3;
  for (let i = 0; i < selectedDocs.length; i += batchSize) {
    const batch = selectedDocs.slice(i, i + batchSize);

    const savePromises = batch.map(async (doc) => {
      try {
        await saveDocument(doc);

        // Record history for each document if feedback is provided
        if (doc.feedback?.trim()) {
          recordUpdate({
            operation: "document_update",
            feedback: doc.feedback.trim(),
            documentPath: doc.path,
          });
          // clear feedback
          doc.feedback = "";
        }
      } catch (error) {
        console.error(`❌ Failed to save document ${doc.path}:`, error.message);
      }
    });

    await Promise.all(savePromises);
  }

  // Return results if user chose to skip translation
  if (!shouldTranslate) {
    return {};
  }

  // Translate documents in batches
  const translateAgent = options.context.agents["translateMultilingual"];

  for (let i = 0; i < selectedDocs.length; i += batchSize) {
    const batch = selectedDocs.slice(i, i + batchSize);

    const translatePromises = batch.map(async (doc) => {
      try {
        const result = await options.context.invoke(translateAgent, {
          ...input, // Pass context for translation
          content: doc.content,
          translates: doc.translates,
          title: doc.title,
        });

        // Save the translated content
        await saveDocument(doc, result.translates, true);
      } catch (error) {
        console.error(`❌ Failed to translate document ${doc.path}:`, error.message);
      }
    });

    await Promise.all(translatePromises);
  }

  return {};
}
