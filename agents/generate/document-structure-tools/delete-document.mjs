export default async function deleteDocument({ documentStructure, path }) {
  // Validate required parameters
  if (!path) {
    console.log(
      "⚠️  Unable to delete document: No document specified. Please clearly indicate which document you want to remove from the document structure.",
    );
    return { documentStructure };
  }

  // Find the document to delete
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    console.log(
      `⚠️  Unable to delete document: Document '${path}' doesn't exist in the document structure. Please specify an existing document to delete.`,
    );
    return { documentStructure };
  }

  const documentToDelete = documentStructure[documentIndex];

  // Check if any other documents have this document as parent
  const childDocuments = documentStructure.filter((item) => item.parentId === path);
  if (childDocuments.length > 0) {
    console.log(
      `⚠️  Unable to delete document: Document '${path}' has ${childDocuments.length} child document(s) (${childDocuments.map((p) => p.path).join(", ")}). Please first move these documents to a different parent or delete them before removing this document.`,
    );
    return { documentStructure };
  }

  // Remove the document from the document structure
  const updatedStructure = documentStructure.filter((_, index) => index !== documentIndex);

  return {
    documentStructure: updatedStructure,
    deletedDocument: documentToDelete,
  };
}

deleteDocument.taskTitle = "Delete a document from document structure";
deleteDocument.description = "Delete a document from the document structure by its path";
deleteDocument.inputSchema = {
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
      description: "URL path of the document to delete",
    },
  },
  required: ["documentStructure", "path"],
};
deleteDocument.outputSchema = {
  type: "object",
  properties: {
    documentStructure: {
      type: "array",
      description: "Updated document structure array with the document removed",
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
    deletedDocument: {
      type: "object",
      description: "The deleted document object",
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