import chooseDocs from "../../utils/choose-docs.mjs";
import deleteDocument from "../document-structure-tools/delete-document.mjs";
import { DOC_ACTION } from "../../../utils/constants/index.mjs";
import addTranslatesToStructure from "../../utils/add-translates-to-structure.mjs";

export default async function removeDocumentsFromStructure(input = {}, options = {}) {
  const { docsDir, locale = "en", translateLanguages = [], originalDocumentStructure } = input;

  if (!Array.isArray(originalDocumentStructure) || originalDocumentStructure.length === 0) {
    console.warn(
      "🗑️ Remove Documents\n  • No document structure found. Please generate documents first.",
    );
    process.exit(0);
  }

  const { documentExecutionStructure } = addTranslatesToStructure({
    originalDocumentStructure,
    translateLanguages,
  });

  // Initialize currentStructure in userContext
  options.context.userContext.currentStructure = [...originalDocumentStructure];

  // Use chooseDocs to select documents to delete
  const chooseResult = await chooseDocs(
    {
      docs: [],
      documentExecutionStructure,
      docsDir,
      locale,
      isTranslate: false,
      feedback: "no feedback",
      requiredFeedback: false,
      action: DOC_ACTION.clear,
    },
    options,
  );

  if (!chooseResult?.selectedDocs || chooseResult.selectedDocs.length === 0) {
    console.log("No documents selected for removal.");
    process.exit(0);
  }

  // Delete each selected document
  const deletedDocuments = [];
  const errors = [];

  for (const selectedDoc of chooseResult.selectedDocs) {
    try {
      const deleteResult = await deleteDocument(
        {
          path: selectedDoc.path,
          recursive: true,
        },
        options,
      );

      if (deleteResult.error) {
        errors.push({
          path: selectedDoc.path,
          error: deleteResult.error.message,
        });
      } else {
        // deletedDocuments is now always an array
        deletedDocuments.push(...deleteResult.deletedDocuments);
      }
    } catch (error) {
      errors.push({
        path: selectedDoc.path,
        error: error.message,
      });
    }
  }

  if (errors.length > 0) {
    console.warn(
      `🗑️ Remove Documents\n  • Failed to remove documents:\n${errors
        .map((e) => `    - ${e.path}: ${e.error}`)
        .join("\n")}`,
    );
    process.exit(0);
  }

  // Get updated document structure
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
