import {
  getUpdateDocumentInputJsonSchema,
  getUpdateDocumentOutputJsonSchema,
  validateUpdateDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function updateDocument(input) {
  // Validate input using Zod schema
  const validation = validateUpdateDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot update document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      message: errorMessage,
    };
  }

  const { documentStructure, path, title, description, sourceIds } = validation.data;

  // Find the document to update
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    const errorMessage = `Cannot update document: Document '${path}' does not exist. Choose an existing document to update.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      message: errorMessage,
    };
  }

  const originalDocument = documentStructure[documentIndex];

  // Create updated document object
  const updatedDocument = {
    ...originalDocument,
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(sourceIds !== undefined && { sourceIds: [...sourceIds] }), // Create a copy of the array
  };

  // Update the document structure
  const updatedStructure = [...documentStructure];
  updatedStructure[documentIndex] = updatedDocument;

  const updatedFields = [];
  if (title !== undefined) updatedFields.push(`title to '${title}'`);
  if (description !== undefined) updatedFields.push(`description`);
  if (sourceIds !== undefined) updatedFields.push(`sourceIds (${sourceIds.length} sources)`);

  const successMessage = `Successfully updated document '${originalDocument.title}' at path '${path}': ${updatedFields.join(", ")}.\nCheck if the latest version of documentStructure meets user feedback, if so, return the latest version directly.`;

  return {
    documentStructure: updatedStructure,
    originalDocument,
    updatedDocument,
    message: successMessage,
  };
}

updateDocument.taskTitle = "Update document";
updateDocument.description = "Update properties of an existing document in the document structure";
updateDocument.inputSchema = getUpdateDocumentInputJsonSchema();
updateDocument.outputSchema = getUpdateDocumentOutputJsonSchema();
