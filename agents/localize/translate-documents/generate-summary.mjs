/**
 * Generate final summary report for translation tasks
 * @param {Object} input - Input parameters
 * @param {Array} input.translationTasks - Translation task list
 * @param {string} input.sourceLanguage - Source language code
 * @param {Array} input.targetLanguages - Target language list
 * @param {number} input.totalDocs - Total document count
 * @param {boolean} input.skipped - Whether translation was skipped
 * @returns {Object} - Object containing formatted message and statistics
 */
export default function generateSummary(input) {
  const { translationTasks, sourceLanguage, targetLanguages, totalDocs, skipped } = input;

  // If translation was skipped
  if (skipped) {
    return {
      message: `⏭️  Translation skipped: All target languages are the same as source language (${sourceLanguage})`,
      summary: {
        skipped: true,
        sourceLanguage,
        totalDocs: 0,
        totalLanguages: 0,
        totalTranslations: 0,
      },
    };
  }

  // Calculate statistics
  const totalLanguages = targetLanguages.length;
  const totalTranslations = totalDocs * totalLanguages;

  // Generate document path list (show at most 5)
  const docPaths = translationTasks.map((task) => task.path);
  const displayDocs =
    docPaths.length > 5
      ? [...docPaths.slice(0, 5), `... and ${docPaths.length - 5} more documents`]
      : docPaths;

  // Generate formatted message
  const message = `
✅ Translation tasks completed

📊 **Translation Statistics**:
   - Source language: ${sourceLanguage}
   - Target languages: ${targetLanguages.join(", ")} (${totalLanguages} languages)
   - Document count: ${totalDocs}
   - Total translations: ${totalTranslations}

📄 **Translated Documents**:
${displayDocs.map((doc) => `   - ${doc}`).join("\n")}

💡 **Tips**:
   - Translation files saved to docs/{path}/{language}.md
   - Document .meta.yaml languages field has been automatically updated
   - Check the corresponding language files to view translation results
  `.trim();

  return {
    message,
    summary: {
      skipped: false,
      sourceLanguage,
      targetLanguages,
      totalDocs,
      totalLanguages,
      totalTranslations,
      documentPaths: docPaths,
    },
  };
}

// Add description
generateSummary.description =
  "Generate final summary report for translation tasks. " +
  "Summarize translation statistics (source language, target languages, document count, etc.) and generate readable formatted message. " +
  "If translation was skipped, generate corresponding skip notice.";

// Define input schema
generateSummary.input_schema = {
  type: "object",
  properties: {
    translationTasks: {
      type: "array",
      description: "Translation task list",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          sourceLanguage: { type: "string" },
          targetLanguages: {
            type: "array",
            items: { type: "object", properties: { language: { type: "string" } } },
          },
        },
      },
    },
    sourceLanguage: {
      type: "string",
      description: "Source language code",
    },
    targetLanguages: {
      type: "array",
      items: { type: "string" },
      description: "Target language list",
    },
    totalDocs: {
      type: "number",
      description: "Total document count",
    },
    skipped: {
      type: "boolean",
      description: "Whether translation was skipped",
    },
  },
};

// Define output schema
generateSummary.output_schema = {
  type: "object",
  required: ["message", "summary"],
  properties: {
    message: {
      type: "string",
      description: "Formatted summary message containing translation statistics and tips",
    },
    summary: {
      type: "object",
      description: "Structured statistics data",
      properties: {
        skipped: {
          type: "boolean",
          description: "Whether translation was skipped",
        },
        sourceLanguage: {
          type: "string",
          description: "Source language code",
        },
        targetLanguages: {
          type: "array",
          items: { type: "string" },
          description: "Target language list",
        },
        totalDocs: {
          type: "number",
          description: "Total document count",
        },
        totalLanguages: {
          type: "number",
          description: "Total target language count",
        },
        totalTranslations: {
          type: "number",
          description: "Total translation count (documents × languages)",
        },
        documentPaths: {
          type: "array",
          items: { type: "string" },
          description: "List of all translated document paths",
        },
      },
    },
  },
};
