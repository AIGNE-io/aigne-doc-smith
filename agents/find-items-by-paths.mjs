import {
  addFeedbackToItems,
  findItemByPath,
  getActionText,
  getMainLanguageFiles,
  processSelectedFiles,
} from "../utils/docs-finder-utils.mjs";

export default async function selectedDocs(
  { docs, structurePlanResult, boardId, docsDir, isTranslate, feedback, locale },
  options,
) {
  let foundItems = [];
  let selectedFiles = [];

  // If docs is empty or not provided, let user select multiple documents
  if (!docs || docs.length === 0) {
    try {
      // Get all main language .md files in docsDir
      const mainLanguageFiles = await getMainLanguageFiles(docsDir, locale, structurePlanResult);

      if (mainLanguageFiles.length === 0) {
        throw new Error("No documents found in the docs directory");
      }

      // Let user select multiple files
      selectedFiles = await options.prompts.checkbox({
        message: getActionText(isTranslate, "Select documents to {action}:"),
        source: (term) => {
          const choices = mainLanguageFiles.map((file) => ({
            name: file,
            value: file,
          }));

          if (!term) return choices;

          return choices.filter((choice) => choice.name.toLowerCase().includes(term.toLowerCase()));
        },
        validate: (answer) => {
          if (answer.length === 0) {
            return "Please select at least one document";
          }
          return true;
        },
      });

      if (!selectedFiles || selectedFiles.length === 0) {
        throw new Error("No documents selected");
      }

      // Process selected files and convert to found items
      foundItems = await processSelectedFiles(selectedFiles, structurePlanResult, docsDir);
    } catch (error) {
      console.error(error);
      throw new Error(
        getActionText(
          isTranslate,
          "Please provide a docs parameter to specify which documents to {action}",
        ),
      );
    }
  } else {
    // Process the provided docs array
    for (const docPath of docs) {
      const foundItem = await findItemByPath(
        structurePlanResult,
        docPath,
        boardId,
        docsDir,
        locale,
      );

      if (!foundItem) {
        console.warn(`⚠️  Item with path "${docPath}" not found in structurePlanResult`);
        continue;
      }

      foundItems.push({
        ...foundItem,
      });
    }

    if (foundItems.length === 0) {
      throw new Error("None of the specified document paths were found in structurePlanResult");
    }
  }

  // Prompt for feedback if not provided
  let userFeedback = feedback;
  if (!userFeedback) {
    const feedbackMessage = getActionText(
      isTranslate,
      "Please provide feedback for the {action} (press Enter to skip):",
    );

    userFeedback = await options.prompts.input({
      message: feedbackMessage,
    });
  }

  // Add feedback to all results if provided
  foundItems = addFeedbackToItems(foundItems, userFeedback);

  return {
    selectedDocs: foundItems,
    feedback: userFeedback,
    selectedPaths: foundItems.map((item) => item.path),
  };
}
