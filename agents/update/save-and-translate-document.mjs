export default async function saveAndTranslateDocument(input, options) {
  const { selectedDocs, docsDir, translateLanguages, locale } = input;

  if (!Array.isArray(selectedDocs) || selectedDocs.length === 0) {
    return {};
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

  for (let i = 0; i < selectedDocs.length; i += batchSize) {
    const batch = selectedDocs.slice(i, i + batchSize);

    const translatePromises = batch.map(async (doc) => {
      try {
        // Clear feedback to ensure translation is not affected by update feedback
        doc.feedback = "";

        const result = await options.context.invoke(translateAgent, {
          ...input, // context is required
          content: doc.content,
          translates: doc.translates,
          title: doc.title,
        });

        // Save the translated content
        const saveTranslationsAgent = options.context.agents["saveDocTranslations"];
        await options.context.invoke(saveTranslationsAgent, {
          path: doc.path,
          docsDir: docsDir,
          translates: result.translates || doc.translates,
          labels: doc.labels,
        });
      } catch (error) {
        console.error(`❌ Failed to translate document ${doc.path}:`, error.message);
      }
    });

    await Promise.all(translatePromises);
  }

  return {};
}
