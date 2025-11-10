import {
  getUpdateDocumentInputJsonSchema,
  getUpdateDocumentOutputJsonSchema,
  validateUpdateDocumentInput,
} from "../../../types/document-structure-schema.mjs";
import streamlineDocumentTitlesIfNeeded from "../../utils/streamline-document-titles-if-needed.mjs";

export default async function updateDocument(input, options) {
  // Validate input using Zod schema
  const validation = validateUpdateDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot update document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      error: { message: errorMessage },
    };
  }

  const { path, title, description, sourceIds } = validation.data;
  let documentStructure = options?.context?.userContext?.currentStructure;

  if (!documentStructure) {
    documentStructure = input.documentStructure;
  }

  // Find the document to update
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    const errorMessage = `Cannot update document: Document '${path}' does not exist. Choose an existing document to update.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      error: { message: errorMessage },
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

  if (!options.context.userContext.streamlinedDocumentTitles) {
    // Streamline document titles if needed (will streamline the updated document if title > 18 characters)
    await streamlineDocumentTitlesIfNeeded({ documentStructure: [updatedDocument] }, options);
    options.context.userContext.streamlinedDocumentTitles = true;
  }

  // Update the document in the structure
  const updatedStructure = [...documentStructure];
  updatedStructure[documentIndex] = updatedDocument;

  const updates = [];
  if (title !== undefined) updates.push(`title to '${title}'`);
  if (description !== undefined) updates.push("description");
  if (sourceIds !== undefined) updates.push("sourceIds");
  const updatesText = updates.length > 0 ? updates.join(", ") : "properties";

  const successMessage = `updateDocument executed successfully.
  Successfully updated ${updatesText} for document '${path}'.
  Check if the latest version of documentStructure meets user feedback, if so, just return 'success'.`;

  // update shared document structure
  if (options?.context?.userContext) {
    options.context.userContext.currentStructure = updatedStructure;
  }

  return {
    documentStructure: updatedStructure,
    message: successMessage,
    originalDocument: originalDocument,
    updatedDocument: updatedDocument,
  };
}

updateDocument.taskTitle = "Update document";
updateDocument.description = "Modify properties of a document in the documentation structure";
updateDocument.inputSchema = getUpdateDocumentInputJsonSchema();
updateDocument.outputSchema = getUpdateDocumentOutputJsonSchema();
