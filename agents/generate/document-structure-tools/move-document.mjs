import {
  getMoveDocumentInputJsonSchema,
  getMoveDocumentOutputJsonSchema,
  validateMoveDocumentInput,
} from "../../../types/document-structure-schema.mjs";

export default async function moveDocument(input) {
  // Validate input using Zod schema
  const validation = validateMoveDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot move document - ${validation.error}`;
    console.log(`Error: ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      message: errorMessage,
    };
  }

  const { documentStructure, path, newParentId, newPath } = validation.data;

  // Find the document to move
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    const errorMessage = `Cannot move document - Document '${path}' does not exist. Please select an existing document to move.`;
    console.log(`Error: ${errorMessage}`);
    return {
      documentStructure,
      message: errorMessage,
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
      const errorMessage = `Cannot move document - Target parent document '${newParentId}' does not exist. Please select an existing parent document.`;
      console.log(`Error: ${errorMessage}`);
      return {
        documentStructure,
        message: errorMessage,
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
      const errorMessage = `Cannot move document - Moving '${path}' under '${newParentId}' would create an invalid hierarchy. Please select a parent that is not nested under the document being moved.`;
      console.log(`Error: ${errorMessage}`);
      return {
        documentStructure,
        message: errorMessage,
      };
    }
  }

  // Validate newPath if provided
  if (newPath && newPath !== path) {
    // Check if newPath already exists
    const pathExists = documentStructure.some((item) => item.path === newPath);
    if (pathExists) {
      const errorMessage = `Cannot move document - A document with path '${newPath}' already exists. Choose a different path.`;
      console.log(`Error: ${errorMessage}`);
      return {
        documentStructure,
        message: errorMessage,
      };
    }

    // Check if any documents have the current path as parent and would be affected
    const childDocuments = documentStructure.filter((item) => item.parentId === path);
    if (childDocuments.length > 0) {
      // Update all child documents to use the new path as parent
      console.log(
        `Note: Will update ${childDocuments.length} child document(s) to reference new parent path.`,
      );
    }
  }

  // Create updated document object with new parent and path
  const finalPath = newPath || path;
  const updatedDocument = {
    ...documentToMove,
    path: finalPath,
    parentId: newParentId || null,
  };

  // Update the document structure
  const updatedStructure = [...documentStructure];
  updatedStructure[documentIndex] = updatedDocument;

  // Update child documents if path changed
  if (newPath && newPath !== path) {
    for (let i = 0; i < updatedStructure.length; i++) {
      if (updatedStructure[i].parentId === path) {
        updatedStructure[i] = {
          ...updatedStructure[i],
          parentId: newPath,
        };
      }
    }
  }

  const oldParentText = documentToMove.parentId
    ? ` from parent '${documentToMove.parentId}'`
    : " from top-level";
  const newParentText = newParentId ? ` to parent '${newParentId}'` : " to top-level";
  const pathChangeText =
    newPath && newPath !== path ? ` and changed path from '${path}' to '${newPath}'` : "";
  const childUpdateText =
    newPath &&
    newPath !== path &&
    documentStructure.filter((item) => item.parentId === path).length > 0
      ? ` (also updated ${documentStructure.filter((item) => item.parentId === path).length} child document(s))`
      : "";
  const successMessage = `Successfully moved document '${documentToMove.title}'${oldParentText}${newParentText}${pathChangeText}${childUpdateText}.`;

  return {
    documentStructure: updatedStructure,
    originalDocument: documentToMove,
    updatedDocument,
    message: successMessage,
  };
}

moveDocument.taskTitle = "Move document";
moveDocument.description = "Move a document to a different parent in the document structure";
moveDocument.inputSchema = getMoveDocumentInputJsonSchema();
moveDocument.outputSchema = getMoveDocumentOutputJsonSchema();
