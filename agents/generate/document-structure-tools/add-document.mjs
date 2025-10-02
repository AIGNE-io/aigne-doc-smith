import {
  getAddDocumentInputJsonSchema,
  getAddDocumentOutputJsonSchema,
  validateAddDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function addDocument(input) {
  // Validate input using Zod schema
  const validation = validateAddDocumentInput(input);
  if (!validation.success) {
    console.log(`⚠️  Cannot add document: ${validation.error}`);
    return { documentStructure: input.documentStructure };
  }

  const { documentStructure, title, description, path, parentId, sourceIds } = validation.data;

  // Validate parent exists if parentId is provided
  if (parentId && parentId !== "null") {
    const parentExists = documentStructure.some((item) => item.path === parentId);
    if (!parentExists) {
      console.log(`⚠️  Cannot add document: Parent document '${parentId}' not found.`);
      return { documentStructure };
    }
  }

  // Check if document with same path already exists
  const existingDocument = documentStructure.find((item) => item.path === path);
  if (existingDocument) {
    console.log(
      `⚠️  Cannot add document: A document with path '${path}' already exists. Choose a different path.`,
    );
    return { documentStructure };
  }

  // Create new document object
  const newDocument = {
    title,
    description,
    path,
    parentId: parentId || null,
    sourceIds: [...sourceIds], // Create a copy of the array
  };

  // Add the document to the structure
  const updatedStructure = [...documentStructure, newDocument];

  return {
    documentStructure: updatedStructure,
    addedDocument: newDocument,
  };
}

addDocument.taskTitle = "Add document";
addDocument.description = "Add a document to the documentation structure";
addDocument.inputSchema = getAddDocumentInputJsonSchema();
addDocument.outputSchema = getAddDocumentOutputJsonSchema();
