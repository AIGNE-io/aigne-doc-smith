import chalk from "chalk";
import {
  addFeedbackToItems,
  findItemByPath,
  getActionText,
  getMainLanguageFiles,
  processSelectedFiles,
} from "../../utils/docs-finder-utils.mjs";
import { DOC_ACTION } from "../../utils/constants/index.mjs";

function getFeedbackMessage(action) {
  if (action === DOC_ACTION.translate) {
    return "Any specific translation preferences or instructions? (Press Enter to skip):";
  }
  return "How would you like to improve this document? (Press Enter to skip)";
}

export default async function chooseDocs(
  {
    docs,
    documentStructure,
    boardId,
    docsDir,
    isTranslate,
    feedback,
    locale,
    reset = false,
    requiredFeedback = true,
    action,
  },
  options,
) {
  let foundItems = [];
  let selectedFiles = [];
  const docAction = action || (isTranslate ? DOC_ACTION.translate : DOC_ACTION.update);

  // If docs is empty or not provided, let user select multiple documents
  if (!docs || docs.length === 0) {
    try {
      // Get all main language .md files in docsDir
      const mainLanguageFiles = await getMainLanguageFiles(docsDir, locale, documentStructure);

      if (mainLanguageFiles.length === 0) {
        throw new Error(
          `No documents found in the docs directory. You can generate them with ${chalk.yellow(
            "`aigne doc create`",
          )}`,
        );
      }

      // Convert files to choices with titles
      const choices = mainLanguageFiles.map((file) => {
        // Convert filename to flat path to find corresponding documentation structure item
        const flatName = file.replace(/\.md$/, "").replace(/\.\w+(-\w+)?$/, "");
        const docItem = documentStructure.find((item) => {
          const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
          return itemFlattenedPath === flatName;
        });

        // Use title if available, otherwise fall back to filename
        let displayName = docItem?.title;
        if (displayName) {
          displayName = `${displayName} (${file})`;
        } else {
          displayName = file;
        }

        return {
          name: displayName,
          value: file,
        };
      });

      // Let user select multiple files
      selectedFiles = await options.prompts.checkbox({
        message: getActionText("Select documents to {action}:", docAction),
        source: (term) => {
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
      foundItems = await processSelectedFiles(selectedFiles, documentStructure, docsDir);
    } catch (error) {
      console.log(
        getActionText(`\nFailed to select documents to {action}: ${error.message}`, docAction),
      );
      process.exit(0);
    }
  } else {
    // Process the provided docs array
    for (const docPath of docs) {
      const foundItem = await findItemByPath(documentStructure, docPath, boardId, docsDir, locale);

      if (!foundItem) {
        console.warn(`⚠️  Item with path "${docPath}" not found in documentStructure`);
        continue;
      }

      foundItems.push({
        ...foundItem,
      });
    }

    if (foundItems.length === 0) {
      throw new Error("None of the specified document paths were found in documentStructure");
    }
  }

  // Prompt for feedback if not provided
  let userFeedback = feedback;
  if (!userFeedback && (requiredFeedback || foundItems?.length > 1)) {
    const feedbackMessage = getFeedbackMessage(docAction);

    userFeedback = await options.prompts.input({
      message: feedbackMessage,
    });
  }

  // Add feedback to all results if provided
  foundItems = addFeedbackToItems(foundItems, userFeedback);

  // if reset is true, set content to null for all items
  if (reset) {
    foundItems = foundItems.map((item) => ({
      ...item,
      content: null,
    }));
  }

  return {
    selectedDocs: foundItems,
    feedback: userFeedback,
    selectedPaths: foundItems.map((item) => item.path),
  };
}
