export default async function updateDocument({
  documentStructure,
  path,
  title,
  description,
  sourceIds,
}) {
  // Validate required parameters
  if (!path) {
    console.log(
      "⚠️  Unable to update document: No document specified. Please clearly indicate which document you want to modify.",
    );
    return { documentStructure };
  }

  // At least one update field must be provided
  if (!title && !description && !sourceIds) {
    console.log(
      "⚠️  Unable to update document: No changes specified. Please provide details about what you want to modify (title, description, or content sources).",
    );
    return { documentStructure };
  }

  // Find the document to update
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    console.log(
      `⚠️  Unable to update document: Document '${path}' doesn't exist in the document structure. Please specify an existing document to update.`,
    );
    return { documentStructure };
  }

  const originalDocument = documentStructure[documentIndex];

  // Validate sourceIds if provided
  if (sourceIds !== undefined) {
    if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
      console.log(
        "⚠️  Unable to update document: Invalid content sources specified. Please provide valid source references for the document content.",
      );
      return { documentStructure };
    }
  }

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

  return {
    documentStructure: updatedStructure,
    originalDocument,
    updatedDocument,
  };
}

updateDocument.taskTitle = "Update properties of an existing document in document structure";
updateDocument.description =
  "Update one or more properties (title, description, sourceIds) of an existing document in document structure";
updateDocument.inputSchema = {
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
      description: "URL path of the document to update",
    },
    title: {
      type: "string",
      description: "New title for the document (optional)",
    },
    description: {
      type: "string",
      description: "New description for the document (optional)",
    },
    sourceIds: {
      type: "array",
      description: "New sourceIds for the document (optional), cannot be empty if provided",
      items: { type: "string" },
      minItems: 1,
    },
  },
  required: ["documentStructure", "path"],
  anyOf: [{ required: ["title"] }, { required: ["description"] }, { required: ["sourceIds"] }],
};
updateDocument.outputSchema = {
  type: "object",
  properties: {
    documentStructure: {
      type: "array",
      description: "Updated document structure array with the document modified",
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
      description: "The original document object before update",
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
      description: "The updated document object after modification",
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