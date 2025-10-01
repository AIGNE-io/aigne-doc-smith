import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Document item schema - represents a single document in the structure
export const documentItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  path: z.string().startsWith("/", 'Path must start with "/"'),
  parentId: z.string().nullable(),
  sourceIds: z.array(z.string()).min(1, "At least one source ID is required"),
});

// Documentation structure schema - represents the entire documentation structure array
export const documentStructureSchema = z.array(documentItemSchema);

// Add document schemas
export const addDocumentInputSchema = z.object({
  documentStructure: documentStructureSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  path: z.string().startsWith("/", 'Path must start with "/"'),
  parentId: z.string().nullable().optional(),
  sourceIds: z.array(z.string()).min(1, "At least one source ID is required"),
});

export const addDocumentOutputSchema = z.object({
  documentStructure: documentStructureSchema,
  addedDocument: documentItemSchema.optional(),
});

// Delete document schemas
export const deleteDocumentInputSchema = z.object({
  documentStructure: documentStructureSchema,
  path: z.string().min(1, "Path is required"),
});

export const deleteDocumentOutputSchema = z.object({
  documentStructure: documentStructureSchema,
  deletedDocument: documentItemSchema.optional(),
});

// Move document schemas
export const moveDocumentInputSchema = z.object({
  documentStructure: documentStructureSchema,
  path: z.string().min(1, "Path is required"),
  newParentId: z.string().nullable().optional(),
});

export const moveDocumentOutputSchema = z.object({
  documentStructure: documentStructureSchema,
  originalDocument: documentItemSchema.optional(),
  updatedDocument: documentItemSchema.optional(),
});

// Update document schemas
export const updateDocumentInputSchema = z
  .object({
    documentStructure: documentStructureSchema,
    path: z.string().min(1, "Path is required"),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    sourceIds: z.array(z.string()).min(1).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined || data.description !== undefined || data.sourceIds !== undefined,
    {
      message: "At least one field (title, description, or sourceIds) must be provided for update",
    },
  );

export const updateDocumentOutputSchema = z.object({
  documentStructure: documentStructureSchema,
  originalDocument: documentItemSchema.optional(),
  updatedDocument: documentItemSchema.optional(),
});

// JSON Schema conversion functions using zodToJsonSchema
export const getAddDocumentInputJsonSchema = () => {
  const schema = zodToJsonSchema(addDocumentInputSchema);
  // Add custom descriptions
  if (schema.properties) {
    schema.properties.documentStructure.description = "Current documentation structure array";
    schema.properties.title.description = "Title of the new document";
    schema.properties.description.description = "Description of the new document";
    schema.properties.path.description = "URL path for the new document (must start with '/')";
    schema.properties.parentId.description =
      "Parent document path (leave empty for top-level documents)";
    schema.properties.sourceIds.description =
      "Source references from associated data sources (required)";
  }
  return schema;
};

export const getAddDocumentOutputJsonSchema = () => {
  const schema = zodToJsonSchema(addDocumentOutputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description =
      "Updated documentation structure array with the new document added";
    schema.properties.addedDocument.description = "The newly added document object";
  }
  return schema;
};

export const getDeleteDocumentInputJsonSchema = () => {
  const schema = zodToJsonSchema(deleteDocumentInputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description = "Current documentation structure array";
    schema.properties.path.description = "URL path of the document to delete";
  }
  return schema;
};

export const getDeleteDocumentOutputJsonSchema = () => {
  const schema = zodToJsonSchema(deleteDocumentOutputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description =
      "Updated documentation structure array with the document removed";
    schema.properties.deletedDocument.description = "The deleted document object";
  }
  return schema;
};

export const getMoveDocumentInputJsonSchema = () => {
  const schema = zodToJsonSchema(moveDocumentInputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description = "Current documentation structure array";
    schema.properties.path.description = "URL path of the document to move";
    schema.properties.newParentId.description =
      "Path of the new parent document (leave empty for top-level)";
  }
  return schema;
};

export const getMoveDocumentOutputJsonSchema = () => {
  const schema = zodToJsonSchema(moveDocumentOutputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description =
      "Updated documentation structure array with the document moved";
    schema.properties.originalDocument.description = "The original document object before moving";
    schema.properties.updatedDocument.description = "The updated document object after moving";
  }
  return schema;
};

export const getUpdateDocumentInputJsonSchema = () => {
  const schema = zodToJsonSchema(updateDocumentInputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description = "Current documentation structure array";
    schema.properties.path.description = "URL path of the document to update";
    schema.properties.title.description = "New title for the document (optional)";
    schema.properties.description.description = "New description for the document (optional)";
    schema.properties.sourceIds.description =
      "New source references for the document (optional, cannot be empty if provided)";
  }
  // Add anyOf constraint for at least one update field
  schema.anyOf = [
    { required: ["title"] },
    { required: ["description"] },
    { required: ["sourceIds"] },
  ];
  return schema;
};

export const getUpdateDocumentOutputJsonSchema = () => {
  const schema = zodToJsonSchema(updateDocumentOutputSchema);
  if (schema.properties) {
    schema.properties.documentStructure.description =
      "Updated documentation structure array with the document modified";
    schema.properties.originalDocument.description = "The original document object before update";
    schema.properties.updatedDocument.description =
      "The updated document object after modification";
  }
  return schema;
};

// Validation helper functions
export const validateAddDocumentInput = (input) => {
  try {
    return {
      success: true,
      data: addDocumentInputSchema.parse(input),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.errors?.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ") ||
        error.message,
    };
  }
};

export const validateDeleteDocumentInput = (input) => {
  try {
    return {
      success: true,
      data: deleteDocumentInputSchema.parse(input),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.errors?.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ") ||
        error.message,
    };
  }
};

export const validateMoveDocumentInput = (input) => {
  try {
    return {
      success: true,
      data: moveDocumentInputSchema.parse(input),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.errors?.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ") ||
        error.message,
    };
  }
};

export const validateUpdateDocumentInput = (input) => {
  try {
    return {
      success: true,
      data: updateDocumentInputSchema.parse(input),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.errors?.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ") ||
        error.message,
    };
  }
};

// Type inference helpers for better IDE support
export const createDocumentItem = (data) => documentItemSchema.parse(data);
export const createDocumentStructure = (data) => documentStructureSchema.parse(data);
