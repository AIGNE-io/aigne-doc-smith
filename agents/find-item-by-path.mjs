import {
  fileNameToFlatPath,
  findItemByFlatName,
  findItemByPath as findItemByPathUtil,
  getActionText,
  getMainLanguageFiles,
  readFileContent,
} from "../utils/docs-finder-utils.mjs";

export default async function findItemByPath(
  { doc, structurePlanResult, boardId, docsDir, isTranslate, feedback, locale },
  options,
) {
  let foundItem = null;
  let selectedFileContent = null;
  let docPath = doc;

  // If docPath is empty, let user select from available documents
  if (!docPath) {
    try {
      // Get all main language .md files in docsDir
      const mainLanguageFiles = await getMainLanguageFiles(docsDir, locale, structurePlanResult);

      if (mainLanguageFiles.length === 0) {
        throw new Error("No documents found in the docs directory");
      }

      // Let user select a file
      const selectedFile = await options.prompts.search({
        message: getActionText(isTranslate, "Select a document to {action}:"),
        source: async (input) => {
          if (!input || input.trim() === "") {
            return mainLanguageFiles.map((file) => ({
              name: file,
              value: file,
            }));
          }

          const searchTerm = input.trim().toLowerCase();
          const filteredFiles = mainLanguageFiles.filter((file) =>
            file.toLowerCase().includes(searchTerm),
          );

          return filteredFiles.map((file) => ({
            name: file,
            value: file,
          }));
        },
      });

      if (!selectedFile) {
        throw new Error("No document selected");
      }

      // Read the selected .md file content
      selectedFileContent = await readFileContent(docsDir, selectedFile);

      // Convert filename back to path
      const flatName = fileNameToFlatPath(selectedFile);

      // Try to find matching item by comparing flattened paths
      const foundItemByFile = findItemByFlatName(structurePlanResult, flatName);

      if (!foundItemByFile) {
        throw new Error("No document found");
      }

      docPath = foundItemByFile.path;
    } catch (error) {
      console.debug(error?.message);
      throw new Error(
        getActionText(
          isTranslate,
          "Please run 'aigne doc generate' first to generate documents, then select which document to {action}",
        ),
      );
    }
  }

  // Use the utility function to find item and read content
  foundItem = await findItemByPathUtil(structurePlanResult, docPath, boardId, docsDir, locale);

  if (!foundItem) {
    throw new Error(`Item with path "${docPath}" not found in structurePlanResult`);
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

  // Merge the found item and ensure content is available
  const result = {
    ...foundItem,
  };

  // Add content if we read it from user selection (takes precedence over utility method content)
  if (selectedFileContent !== null) {
    result.content = selectedFileContent;
  }

  // Add feedback to result if provided
  if (userFeedback?.trim()) {
    result.feedback = userFeedback.trim();
  }

  return result;
}
