import { readdir } from "node:fs/promises";
import { join } from "node:path";

export default async function findItemByPath(
  { "doc-path": docPath, structurePlanResult, boardId, docsDir },
  options
) {
  let foundItem = null;

  // If docPath is empty, let user select from available documents
  if (!docPath) {
    try {
      // Get all .md files in docsDir
      const files = await readdir(docsDir);

      // Filter for main language .md files (exclude _sidebar.md and language-specific files)
      const mainLanguageFiles = files.filter(
        (file) =>
          file.endsWith(".md") &&
          file !== "_sidebar.md" &&
          !file.match(/\.\w+(-\w+)?\.md$/) // Exclude language-specific files like .en.md, .zh-CN.md, etc.
      );

      if (mainLanguageFiles.length === 0) {
        throw new Error(
          "Please provide a doc-path parameter to specify which document to update"
        );
      }

      // Let user select a file
      const selectedFile = await options.prompts.search({
        message: "Select a document to update:",
        source: async (input, { signal }) => {
          if (!input || input.trim() === "") {
            return mainLanguageFiles.map((file) => ({
              name: file,
              value: file,
            }));
          }

          const searchTerm = input.trim().toLowerCase();
          const filteredFiles = mainLanguageFiles.filter((file) =>
            file.toLowerCase().includes(searchTerm)
          );

          return filteredFiles.map((file) => ({
            name: file,
            value: file,
          }));
        },
      });

      if (!selectedFile) {
        throw new Error(
          "Please provide a doc-path parameter to specify which document to update"
        );
      }

      // Convert filename back to path
      // Remove .md extension
      const flatName = selectedFile.replace(/\.md$/, "");

      // Try to find matching item by comparing flattened paths
      let foundItemByFile = null;

      // First try without boardId prefix
      foundItemByFile = structurePlanResult.find((item) => {
        const itemFlattenedPath = item.path
          .replace(/^\//, "")
          .replace(/\//g, "-");
        return itemFlattenedPath === flatName;
      });
      if (!foundItemByFile) {
        throw new Error(
          "Please provide a doc-path parameter to specify which document to update"
        );
      }

      docPath = foundItemByFile.path;
    } catch (error) {
      throw new Error(
        "Please provide a doc-path parameter to specify which document to update"
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
        const itemFlattenedPath = item.path
          .replace(/^\//, "")
          .replace(/\//g, "-");
        return itemFlattenedPath === flattenedPath;
      });
    }
  }

  if (!foundItem) {
    throw new Error(
      `Item with path "${docPath}" not found in structurePlanResult`
    );
  }

  // Merge the found item with originalStructurePlan
  return {
    ...foundItem,
  };
}
