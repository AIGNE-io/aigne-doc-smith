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
      "⚠️  Unable to add document: Missing required information (title, description, path, or sourceIds). Please provide more specific details about the new document you want to add.",
    );
    return { documentStructure };
  }

  // Validate path format
  if (!path.startsWith("/")) {
    console.log(
      "⚠️  Unable to add document: Invalid path format. Please specify a valid URL path that starts with '/'. For example: '/introduction' or '/api/overview'.",
    );
    return { documentStructure };
  }

  // Validate parent exists if parentId is provided
  if (parentId !== null && parentId !== undefined && parentId !== "null" && parentId !== "") {
    const parentExists = documentStructure.some((item) => item.path === parentId);
    if (!parentExists) {
      console.log(
        `⚠️  Unable to add document: Parent document '${parentId}' doesn't exist. Please specify an existing parent document or set as top-level document.`,
      );
      return { documentStructure };
    }
  }

  // Check if document with same path already exists
  const existingDocument = documentStructure.find((item) => item.path === path);
  if (existingDocument) {
    console.log(
      `⚠️  Unable to add document: Document with path '${path}' already exists. Please choose a different path for the new document.`,
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

addDocument.taskTitle = "Add a new document to document structure";
addDocument.description = "Add a new document to the document structure under a specified parent document";
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
      description:
        "URL path for the new document, must start with /, no language prefix",
    },
    parentId: {
      type: ["string", "null"],
      description: "Parent document path, null for top-level documents",
    },
    sourceIds: {
      type: "array",
      description: "Associated sourceIds from datasources, cannot be empty",
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