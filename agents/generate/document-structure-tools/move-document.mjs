export default async function moveDocument({ documentStructure, path, newParentId }) {
  // Validate required parameters
  if (!path) {
    console.log(
      "⚠️  Cannot move document: No document specified. Indicate which document you want to move and its destination.",
    );
    return { documentStructure };
  }

  // Find the document to move
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    console.log(
      `⚠️  Cannot move document: Document '${path}' does not exist. Choose an existing document to move.`,
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
        `⚠️  Cannot move document: Target parent document '${newParentId}' does not exist. Choose an existing parent document.`,
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
        `⚠️  Cannot move document: Moving '${path}' under '${newParentId}' would create an invalid hierarchy. Choose a parent that is not nested under the document being moved.`,
      );
      return { documentStructure };
    }
  }

  // Create updated document object with new parent
  const updatedDocument = {
    ...documentToMove,
    parentId: newParentId || null,
  };

  // Update the document structure
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
  "Move a document to a different parent in the document structure";
moveDocument.inputSchema = {
  type: "object",
  properties: {
    documentStructure: {
      type: "array",
      description: "Current document structure array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          path: { type: "string" },
          parentId: { type: ["string", "null"] },
          sourceIds: { type: "array", items: { type: "string" } },
        },
      },
    },
    path: {
      type: "string",
      description: "URL path of the document to move",
    },
    newParentId: {
      type: ["string", "null"],
      description: "Path of the new parent document (leave empty for top-level)",
    },
  },
  required: ["documentStructure", "path"],
};
moveDocument.outputSchema = {
  type: "object",
  properties: {
    documentStructure: {
      type: "array",
      description: "Updated document structure array with the document moved",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          path: { type: "string" },
          parentId: { type: ["string", "null"] },
          sourceIds: { type: "array", items: { type: "string" } },
        },
      },
    },
    originalDocument: {
      type: "object",
      description: "The original document object before moving",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        path: { type: "string" },
        parentId: { type: ["string", "null"] },
        sourceIds: { type: "array", items: { type: "string" } },
      },
    },
    updatedDocument: {
      type: "object",
      description: "The updated document object after moving",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        path: { type: "string" },
        parentId: { type: ["string", "null"] },
        sourceIds: { type: "array", items: { type: "string" } },
      },
    },
  },
  required: ["documentStructure"],
};
