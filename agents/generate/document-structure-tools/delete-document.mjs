import {
  getDeleteDocumentInputJsonSchema,
  getDeleteDocumentOutputJsonSchema,
  validateDeleteDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function deleteDocument(input) {
  // Validate input using Zod schema
  const validation = validateDeleteDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot delete document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      message: errorMessage,
    };
  }

  const { documentStructure, path } = validation.data;

  // Find the document to delete
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    const errorMessage = `Cannot delete document: Document '${path}' does not exist. Please choose an existing document to delete.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      message: errorMessage,
    };
  }

  const documentToDelete = documentStructure[documentIndex];

  // Check if any other documents have this document as parent
  const childDocuments = documentStructure.filter((item) => item.parentId === path);
  if (childDocuments.length > 0) {
    const errorMessage = `Cannot delete document: Document '${path}' has ${childDocuments.length} child document(s): ${childDocuments.map((p) => p.path).join(", ")}. Please first move or delete these child documents.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      message: errorMessage,
    };
  }

  // Remove the document from the document structure
  const updatedStructure = documentStructure.filter((_, index) => index !== documentIndex);

  const successMessage = `Successfully deleted document '${documentToDelete.title}' from path '${path}'.\nCheck if the latest version of documentStructure meets user feedback, if so, return the latest version directly.`;

  return {
    documentStructure: updatedStructure,
    deletedDocument: documentToDelete,
    message: successMessage,
  };
}

deleteDocument.taskTitle = "Delete document";
deleteDocument.description = "Delete a document from the document structure";
deleteDocument.inputSchema = getDeleteDocumentInputJsonSchema();
deleteDocument.outputSchema = getDeleteDocumentOutputJsonSchema();
