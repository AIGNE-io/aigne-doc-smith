import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Helper function to get action-specific text based on isTranslate flag
function getActionText(isTranslate, baseText) {
  const action = isTranslate ? "retranslate" : "update";
  return baseText.replace("{action}", action);
}

export default async function findItemByPath(
  { docPath, structurePlanResult, boardId, docsDir, isTranslate, feedback },
  options,
) {
  let foundItem = null;
  let selectedFileContent = null;

  // If docPath is empty, let user select from available documents
  if (!docPath) {
    try {
      // Get all .md files in docsDir
      const files = await readdir(docsDir);

      // Filter for main language .md files (exclude _sidebar.md and language-specific files)
      const mainLanguageFiles = files.filter(
        (file) =>
          file.endsWith(".md") && file !== "_sidebar.md" && !file.match(/\.\w+(-\w+)?\.md$/), // Exclude language-specific files like .en.md, .zh-CN.md, etc.
      );

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
      try {
        const selectedFilePath = join(docsDir, selectedFile);
        selectedFileContent = await readFile(selectedFilePath, "utf-8");
      } catch (readError) {
        console.warn(`⚠️  Could not read content from ${selectedFile}:`, readError.message);
        selectedFileContent = null;
      }

      // Convert filename back to path
      // Remove .md extension
      const flatName = selectedFile.replace(/\.md$/, "");

      // Try to find matching item by comparing flattened paths
      let foundItemByFile = null;

      // First try without boardId prefix
      foundItemByFile = structurePlanResult.find((item) => {
        const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
        return itemFlattenedPath === flatName;
      });
      if (!foundItemByFile) {
        throw new Error("No document found");
      }

      docPath = foundItemByFile.path;
    } catch (error) {
      console.error(error);
      throw new Error(
        getActionText(
          isTranslate,
          "Please provide a doc-path parameter to specify which document to {action}",
        ),
      );
    }
  }

  // First try direct path matching
  foundItem = structurePlanResult.find((item) => item.path === docPath);

  // If not found and boardId is provided, try boardId-flattenedPath format matching
  if (!foundItem && boardId) {
    // Check if path starts with boardId followed by a dash
    if (docPath.startsWith(`${boardId}-`)) {
      // Extract the flattened path part after boardId-
      const flattenedPath = docPath.substring(boardId.length + 1);

      // Find item by comparing flattened paths
      foundItem = structurePlanResult.find((item) => {
        // Convert item.path to flattened format (replace / with -)
        const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
        return itemFlattenedPath === flattenedPath;
      });
    }
  }

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

  // Merge the found item with originalStructurePlan and add content if available
  const result = {
    ...foundItem,
  };

  // Add content if we read it from user selection
  if (selectedFileContent !== null) {
    result.content = selectedFileContent;
  }

  // Add feedback to result if provided
  if (userFeedback?.trim()) {
    result.feedback = userFeedback.trim();
  }

  return result;
}
