import {
  getMoveDocumentInputJsonSchema,
  getMoveDocumentOutputJsonSchema,
  validateMoveDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function moveDocument(input, options) {
  // Validate input using Zod schema
  const validation = validateMoveDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot move document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      error: { message: errorMessage },
    };
  }

  const { path, newParentId } = validation.data;
  let documentStructure = options?.context?.userContext?.currentStructure;

  if (!documentStructure) {
    documentStructure = input.documentStructure;
  }

  // Find the document to move
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    const errorMessage = `Cannot move document: Document '${path}' does not exist. Please select an existing document to move.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      error: { message: errorMessage },
    };
  }

  const documentToMove = documentStructure[documentIndex];

  // Validate new parent exists if newParentId is provided
  if (
    newParentId !== null &&
    newParentId !== undefined &&
    newParentId !== "null" &&
    newParentId !== ""
  ) {
    const newParentExists = documentStructure.some((item) => item.path === newParentId);
    if (!newParentExists) {
      const errorMessage = `Cannot move document: Target parent document '${newParentId}' does not exist. Please select an existing parent document.`;
      console.log(`⚠️  ${errorMessage}`);
      return {
        documentStructure,
        error: { message: errorMessage },
      };
    }

    // Check for circular dependency: the new parent cannot be a descendant of the document being moved
    const isDescendant = (parentPath, childPath) => {
      const children = documentStructure.filter((item) => item.parentId === parentPath);
      for (const child of children) {
        if (child.path === childPath || isDescendant(child.path, childPath)) {
          return true;
        }
      }
      return false;
    };

    if (isDescendant(path, newParentId)) {
      const errorMessage = `Cannot move document: Moving '${path}' under '${newParentId}' would create an invalid hierarchy. Please select a parent that is not nested under the document being moved.`;
      console.log(`⚠️  ${errorMessage}`);
      return {
        documentStructure,
        error: { message: errorMessage },
      };
    }
  }

  // Create updated document object with new parent
  const updatedDocument = {
    ...documentToMove,
    parentId: newParentId || null,
  };

  // Update the document's position in the structure
  const updatedStructure = [...documentStructure];
  updatedStructure[documentIndex] = updatedDocument;

  const newParentText = newParentId ? `'${newParentId}'` : "root level";
  const successMessage = `moveDocument executed successfully.
  Successfully moved document '${documentToMove.title}' to ${newParentText}.
  Check if the latest version of documentStructure meets user feedback, if so, just return 'success'.`;

  // update shared document structure
  if (options?.context?.userContext) {
    options.context.userContext.currentStructure = updatedStructure;
  }

  return {
    documentStructure: updatedStructure,
    message: successMessage,
    originalDocument: documentToMove,
    updatedDocument: updatedDocument,
  };
}

moveDocument.taskTitle = "Move document";
moveDocument.description =
  "Relocate a document to a different parent in the documentation structure";
moveDocument.inputSchema = getMoveDocumentInputJsonSchema();
moveDocument.outputSchema = getMoveDocumentOutputJsonSchema();
