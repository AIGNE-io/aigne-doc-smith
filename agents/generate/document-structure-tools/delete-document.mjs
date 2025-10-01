import {
  getDeleteDocumentInputJsonSchema,
  getDeleteDocumentOutputJsonSchema,
  validateDeleteDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function deleteDocument(input) {
  // Validate input using Zod schema
  const validation = validateDeleteDocumentInput(input);
  if (!validation.success) {
    console.log(`⚠️  Cannot delete document: ${validation.error}`);
    return { documentStructure: input.documentStructure };
  }

  const { documentStructure, path } = validation.data;

  // Find the document to delete
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    console.log(
      `⚠️  Cannot delete document: Document '${path}' does not exist. Please choose an existing document to delete.`,
    );
    return { documentStructure };
  }

  const documentToDelete = documentStructure[documentIndex];

  // Check if any other documents have this document as parent
  const childDocuments = documentStructure.filter((item) => item.parentId === path);
  if (childDocuments.length > 0) {
    console.log(
      `⚠️  Cannot delete document: Document '${path}' has ${childDocuments.length} child document(s): ${childDocuments.map((p) => p.path).join(", ")}. Please first move or delete these child documents.`,
    );
    return { documentStructure };
  }

  // Remove the document from the structure
  const updatedStructure = documentStructure.filter((_, index) => index !== documentIndex);

  return {
    documentStructure: updatedStructure,
    deletedDocument: documentToDelete,
  };
}

deleteDocument.taskTitle = "Delete document";
deleteDocument.description = "Remove a document from the documentation structure";
deleteDocument.inputSchema = getDeleteDocumentInputJsonSchema();
deleteDocument.outputSchema = getDeleteDocumentOutputJsonSchema();
