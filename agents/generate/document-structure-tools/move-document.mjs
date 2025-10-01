import {
  getMoveDocumentInputJsonSchema,
  getMoveDocumentOutputJsonSchema,
  validateMoveDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function moveDocument(input) {
  // Validate input using Zod schema
  const validation = validateMoveDocumentInput(input);
  if (!validation.success) {
    console.log(`Error: Cannot move document - ${validation.error}`);
    return { documentStructure: input.documentStructure };
  }

  const { documentStructure, path, newParentId } = validation.data;

  // Find the document to move
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    console.log(
      `Error: Cannot move document - Document '${path}' does not exist. Please select an existing document to move.`,
    );
    return { documentStructure };
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
      console.log(
        `Error: Cannot move document - Target parent document '${newParentId}' does not exist. Please select an existing parent document.`,
      );
      return { documentStructure };
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
      console.log(
        `Error: Cannot move document - Moving '${path}' under '${newParentId}' would create an invalid hierarchy. Please select a parent that is not nested under the document being moved.`,
      );
      return { documentStructure };
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

  return {
    documentStructure: updatedStructure,
    originalDocument: documentToMove,
    updatedDocument,
  };
}

moveDocument.taskTitle = "Move document";
moveDocument.description =
  "Relocate a document to a different parent in the documentation structure";
moveDocument.inputSchema = getMoveDocumentInputJsonSchema();
moveDocument.outputSchema = getMoveDocumentOutputJsonSchema();
