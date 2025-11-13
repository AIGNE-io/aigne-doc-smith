import {
  getAddDocumentInputJsonSchema,
  getAddDocumentOutputJsonSchema,
  validateAddDocumentInput,
} from "../../../types/document-structure-schema.mjs";
import streamlineDocumentTitlesIfNeeded from "../../utils/streamline-document-titles-if-needed.mjs";

export default async function addDocument(input, options) {
  // Validate input using Zod schema
  const validation = validateAddDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot add document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      error: { message: errorMessage },
    };
  }

  const { title, description, path, parentId, sourceIds } = validation.data;
  let documentStructure = options?.context?.userContext?.currentStructure;

  if (!documentStructure) {
    documentStructure = input.documentStructure;
  }

  // Validate parent exists if parentId is provided
  if (parentId && parentId !== "null") {
    const parentExists = documentStructure.some((item) => item.path === parentId);
    if (!parentExists) {
      const errorMessage = `Cannot add document: Parent document '${parentId}' not found.`;
      console.log(`⚠️  ${errorMessage}`);
      return {
        documentStructure,
        error: { message: errorMessage },
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
      error: { message: errorMessage },
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

  // Streamline document titles if needed (will streamline the new document if title > 18 characters)
  await streamlineDocumentTitlesIfNeeded({ documentStructure: [newDocument] }, options);

  // Add the document to the structure
  const updatedStructure = [...documentStructure, newDocument];

  const successMessage = `addDocument executed successfully.
  Successfully added document '${title}' with path '${path}'.
  Check if the latest version of documentStructure meets user feedback, if so, just return 'success'.`;

  // update shared document structure
  if (options?.context?.userContext) {
    options.context.userContext.currentStructure = updatedStructure;
  }

  return {
    documentStructure: updatedStructure,
    message: successMessage,
    addedDocument: newDocument,
  };
}

addDocument.taskTitle = "Add document";
addDocument.description = "Add a document to the documentation structure";
addDocument.inputSchema = getAddDocumentInputJsonSchema();
addDocument.outputSchema = getAddDocumentOutputJsonSchema();
