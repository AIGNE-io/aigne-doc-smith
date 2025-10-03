import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Update document content schemas
export const updateDocumentContentInputSchema = z.object({
  diffPatch: z.string().min(1, "Diff patch is required"),
});

export const updateDocumentContentOutputSchema = z.object({
  success: z.boolean(),
  updatedContent: z.string().optional(),
  error: z.string().optional(),
  message: z.string(),
});

// JSON Schema conversions for update document content
export const getUpdateDocumentContentInputJsonSchema = () => {
  const schema = zodToJsonSchema(updateDocumentContentInputSchema);
  if (schema.properties) {
    schema.properties.diffPatch.description = "Diff patch string to apply to the original content";
  }
  return schema;
};

export const getUpdateDocumentContentOutputJsonSchema = () => {
  const schema = zodToJsonSchema(updateDocumentContentOutputSchema);
  if (schema.properties) {
    schema.properties.success.description = "Whether the update was successful";
    schema.properties.updatedContent.description =
      "Updated markdown content (only present if success is true)";
    schema.properties.error.description = "Error message (only present if success is false)";
    schema.properties.message.description = "Status message";
  }
  return schema;
};

// Validation helper for update document content
export const validateUpdateDocumentContentInput = (input) => {
  try {
    return {
      success: true,
      data: updateDocumentContentInputSchema.parse(input),
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
