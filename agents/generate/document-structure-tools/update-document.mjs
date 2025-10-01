import {
  getUpdateDocumentInputJsonSchema,
  getUpdateDocumentOutputJsonSchema,
  validateUpdateDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function updateDocument(input) {
  // Validate input using Zod schema
  const validation = validateUpdateDocumentInput(input);
  if (!validation.success) {
    console.log(`⚠️  Cannot update document: ${validation.error}`);
    return { documentStructure: input.documentStructure };
  }

  const { documentStructure, path, title, description, sourceIds } = validation.data;

  // Find the document to update
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    console.log(
      `⚠️  Cannot update document: Document '${path}' does not exist. Choose an existing document to update.`,
    );
    return { documentStructure };
  }

  const originalDocument = documentStructure[documentIndex];

  // Create updated document object
  const updatedDocument = {
    ...originalDocument,
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(sourceIds !== undefined && { sourceIds: [...sourceIds] }), // Create a copy of the array
  };

  // Update the document in the structure
  const updatedStructure = [...documentStructure];
  updatedStructure[documentIndex] = updatedDocument;

  return {
    documentStructure: updatedStructure,
    originalDocument,
    updatedDocument,
  };
}

updateDocument.taskTitle = "Update document";
updateDocument.description = "Modify properties of a document in the documentation structure";
updateDocument.inputSchema = getUpdateDocumentInputJsonSchema();
updateDocument.outputSchema = getUpdateDocumentOutputJsonSchema();
