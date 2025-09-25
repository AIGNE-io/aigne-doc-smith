import { newUnifiedDiffStrategyService } from "diff-apply";

export default async function updateDocumentContent({ originalContent, diffPatch }) {
  if (!originalContent || typeof originalContent !== "string") {
    throw new Error("originalContent must be a non-empty string");
  }

  if (!diffPatch || typeof diffPatch !== "string") {
    throw new Error("diffPatch must be a non-empty string");
  }

  try {
    // Apply the diff patch to the original content
    const strategy = newUnifiedDiffStrategyService.create(0.95); // 95% confidence required

    const result = await strategy.applyDiff({ originalContent, diffContent: diffPatch });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        message: "Failed to update document content",
      };
    }

    return {
      success: true,
      updatedContent: result.content,
      message: "Document content updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to update document content",
    };
  }
}

updateDocumentContent.inputSchema = {
  type: "object",
  properties: {
    originalContent: {
      type: "string",
      description: "Original markdown content to be updated",
    },
    diffPatch: {
      type: "string",
      description: "Diff patch string to apply to the original content",
    },
  },
  required: ["originalContent", "diffPatch"],
};

updateDocumentContent.outputSchema = {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      description: "Whether the update was successful",
    },
    updatedContent: {
      type: "string",
      description: "Updated markdown content (only present if success is true)",
    },
    error: {
      type: "string",
      description: "Error message (only present if success is false)",
    },
    message: {
      type: "string",
      description: "Status message",
    },
  },
  required: ["success", "message"],
};

updateDocumentContent.description = "Apply diff patch to update markdown document content";
