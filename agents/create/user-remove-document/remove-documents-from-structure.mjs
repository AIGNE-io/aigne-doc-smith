import deleteDocument from "../document-structure-tools/delete-document.mjs";
import { buildDocumentTree } from "../../../utils/docs-finder-utils.mjs";
import chalk from "chalk";

/**
 * Build checkbox choices from tree structure with visual hierarchy
 * @param {Array} nodes - Array of tree nodes
 * @param {string} prefix - Current prefix for indentation
 * @param {number} depth - Current depth level (0 for root)
 * @returns {Array} Array of choice objects
 */
function buildChoicesFromTree(nodes, prefix = "", depth = 0) {
  const choices = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isLastSibling = i === nodes.length - 1;
    const hasChildren = node.children && node.children.length > 0;
    
    // Build the tree prefix - top level nodes don't have ├─ or └─
    const treePrefix = depth === 0 ? "" : prefix + (isLastSibling ? "└─ " : "├─ ");
    const warningText = hasChildren ? chalk.yellow(" - will cascade delete all child documents") : "";
    const displayName = `${treePrefix}${node.title} (${node.path})${warningText}`;

    choices.push({
      name: displayName,
      value: node.path,
    });

    // Recursively add children with updated prefix
    if (hasChildren) {
      const childPrefix = depth === 0 ? "" : prefix + (isLastSibling ? "   " : "│  ");
      choices.push(...buildChoicesFromTree(node.children, childPrefix, depth + 1));
    }
  }

  return choices;
}

export default async function removeDocumentsFromStructure(input = {}, options = {}) {
  const { originalDocumentStructure } = input;

  if (!Array.isArray(originalDocumentStructure) || originalDocumentStructure.length === 0) {
    console.warn(
      "🗑️ Remove Documents\n  • No document structure found. Please generate documents first.",
    );
    process.exit(0);
  }

  // Initialize currentStructure in userContext
  options.context.userContext.currentStructure = [...originalDocumentStructure];

  // Build tree structure
  const { rootNodes } = buildDocumentTree(originalDocumentStructure);

  // Build choices with tree structure visualization
  const choices = buildChoicesFromTree(rootNodes);

  // Let user select documents to delete
  let selectedPaths = [];
  try {
    selectedPaths = await options.prompts.checkbox({
      message: "Select documents to remove (Press Enter with no selection to finish):",
      choices,
    });
  } catch {
    // User cancelled or no selection made
    console.log("No documents were removed.");
    process.exit(0);
  }

  // If no documents selected, exit
  if (!selectedPaths || selectedPaths.length === 0) {
    console.log("No documents were removed.");
    process.exit(0);
  }

  // Delete each selected document with cascade deletion
  const deletedDocuments = [];
  const errors = [];

  for (const path of selectedPaths) {
    try {
      const deleteResult = await deleteDocument(
        {
          path,
          recursive: true,
        },
        options,
      );

      if (deleteResult.error) {
        errors.push({
          path,
          error: deleteResult.error.message,
        });
      } else {
        deletedDocuments.push(...deleteResult.deletedDocuments);
      }
    } catch (error) {
      errors.push({
        path,
        error: error.message,
      });
    }
  }

  // Check if there are errors
  if (errors.length > 0) {
    console.warn(
      `🗑️ Remove Documents\n  • Failed to remove documents:\n${errors
        .map((e) => `    - ${e.path}: ${e.error}`)
        .join("\n")}`,
    );
    process.exit(0);
  }

  if (deletedDocuments.length === 0) {
    console.log("No documents were removed.");
    process.exit(0);
  }

  // Get final updated document structure
  const updatedStructure = options.context.userContext.currentStructure;

  return {
    documentStructure: updatedStructure,
    originalDocumentStructure: JSON.parse(JSON.stringify(updatedStructure)),
    deletedDocuments,
  };
}

removeDocumentsFromStructure.taskTitle = "Remove documents from structure";
removeDocumentsFromStructure.description =
  "Select and remove documents from the documentation structure";
