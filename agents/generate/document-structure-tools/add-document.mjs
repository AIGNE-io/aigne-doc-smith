export default async function addDocument({
  documentStructure,
  title,
  description,
  path,
  parentId,
  sourceIds,
}) {
  // Validate required parameters
  if (
    !title ||
    !description ||
    !path ||
    !sourceIds ||
    !Array.isArray(sourceIds) ||
    sourceIds.length === 0
  ) {
    console.log(
      "⚠️  Cannot add document: Missing required title, description, path, or source references.",
    );
    return { documentStructure };
  }

  // Validate path format
  if (!path.startsWith("/")) {
    console.log("⚠️  Cannot add document: Invalid path format. Path must start with '/'.");
    return { documentStructure };
  }

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

  // Add the new document to the document structure
  const updatedStructure = [...documentStructure, newDocument];

  return {
    documentStructure: updatedStructure,
    addedDocument: newDocument,
  };
}

addDocument.taskTitle = "Add new document";
addDocument.description = "Add a new document to the document structure";
addDocument.inputSchema = {
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
    title: {
      type: "string",
      description: "Title of the new document",
    },
    description: {
      type: "string",
      description: "Description of the new document",
    },
    path: {
      type: "string",
      description: "URL path for the new document (must start with '/')",
    },
    parentId: {
      type: ["string", "null"],
      description: "Parent document path (leave empty for top-level documents)",
    },
    sourceIds: {
      type: "array",
      description: "Source references from associated data sources (required)",
      items: { type: "string" },
      minItems: 1,
    },
  },
  required: ["documentStructure", "title", "description", "path", "sourceIds"],
};
addDocument.outputSchema = {
  type: "object",
  properties: {
    documentStructure: {
      type: "array",
      description: "Updated document structure array with the new document added",
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
    addedDocument: {
      type: "object",
      description: "The newly added document object",
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
