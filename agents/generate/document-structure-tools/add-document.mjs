import {
  getAddDocumentInputJsonSchema,
  getAddDocumentOutputJsonSchema,
  validateAddDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function addDocument(input) {
  // Validate input using Zod schema
  const validation = validateAddDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot add document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      message: errorMessage,
    };
  }

  const { documentStructure, title, description, path, parentId, sourceIds } = validation.data;

  // Validate parent exists if parentId is provided
  if (parentId && parentId !== "null") {
    const parentExists = documentStructure.some((item) => item.path === parentId);
    if (!parentExists) {
      const errorMessage = `Cannot add document: Parent document '${parentId}' not found.`;
      console.log(`⚠️  ${errorMessage}`);
      return {
        documentStructure,
        message: errorMessage,
      };
    }
  }

  // Check if document with same path already exists
  const existingDocument = documentStructure.find((item) => item.path === path);
  if (existingDocument) {
    const errorMessage = `Cannot add document: A document with path '${path}' already exists. Choose a different path.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      message: errorMessage,
    };
  }

  // Create new document object
  const newDocument = {
    title,
    description,
    path,
    parentId: parentId || null,
    sourceIds: [...sourceIds], // Create a copy of the array
  };

  // Add the new document to the document structure
  const updatedStructure = [...documentStructure, newDocument];

  const successMessage = `Successfully added document '${title}' at path '${path}'${parentId ? ` under parent '${parentId}'` : " as a top-level document"}.\nCheck if the latest version of documentStructure meets user feedback, if so, return the latest version directly.`;

  return {
    documentStructure: updatedStructure,
    addedDocument: newDocument,
    message: successMessage,
  };
}

addDocument.taskTitle = "Add new document";
addDocument.description = "Add a new document to the document structure";
addDocument.inputSchema = getAddDocumentInputJsonSchema();
addDocument.outputSchema = getAddDocumentOutputJsonSchema();
