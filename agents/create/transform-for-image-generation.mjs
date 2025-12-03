/**
 * Transform analyze-diagram-type output to generateDiagramImage input format
 * Maps aspectRatio to ratio and adds default size
 */
export default async function transformForImageGeneration(input) {
  const {
    documentContent,
    documentSummary, // Prefer the LLM-generated concise summary
    diagramType,
    diagramStyle,
    aspectRatio,
    locale = "en",
    imageSize = "1K", // Default image size
    // Pass through other parameters that may be needed downstream
    originalContent,
    diagramIndex,
    feedback,
    ...rest
  } = input;

  // Return format expected by generateDiagramImage agent
  // documentContent remains as original full content
  // documentSummary is the focused summary for image generation
  // Also include pass-through parameters for downstream steps
  return {
    documentContent, // Keep original full document content
    documentSummary, // Pass the summary for image generation (preferred if available)
    diagramType,
    diagramStyle,
    locale,
    ratio: aspectRatio, // Map aspectRatio to ratio for imageConfig
    aspectRatio: aspectRatio, // Keep aspectRatio for prompt template compatibility
    size: imageSize, // Default to 1K
    // Pass through parameters for replace-d2-with-image.mjs
    originalContent,
    diagramIndex,
    feedback,
    ...rest,
  };
}

transformForImageGeneration.input_schema = {
  type: "object",
  properties: {
    documentContent: {
      type: "string",
      description: "The full document content (kept for backward compatibility)",
    },
    diagramType: {
      type: "string",
      description: "The type of diagram to generate",
      enum: ["architecture", "flowchart", "guide", "intro", "sequence", "network"],
    },
    diagramStyle: {
      type: "string",
      description: "The visual style for the diagram",
      enum: ["modern", "standard", "hand-drawn", "anthropomorphic", "flat", "minimalist", "3d"],
    },
    aspectRatio: {
      type: "string",
      description: "Aspect ratio for the diagram (must match content flow direction)",
      enum: ["1:1", "5:4", "4:3", "3:2", "16:9", "21:9"],
    },
    locale: {
      type: "string",
      description: "Language for diagram labels",
      default: "en",
    },
    imageSize: {
      type: "string",
      description: "Size of the generated image (e.g., '1K', '2K')",
      default: "1K",
    },
    originalContent: {
      type: "string",
      description: "Original document content before modifications (pass-through for downstream)",
    },
    diagramIndex: {
      type: "number",
      description: "Index of the diagram to replace (pass-through for downstream)",
    },
    feedback: {
      type: "string",
      description: "User feedback (pass-through for downstream)",
    },
  },
  required: ["documentContent", "diagramType", "diagramStyle", "aspectRatio"],
};

transformForImageGeneration.output_schema = {
  type: "object",
  properties: {
    documentContent: {
      type: "string",
      description: "The full original document content",
    },
    documentSummary: {
      type: "string",
      description:
        "A comprehensive summary of the document content for diagram generation (preferred over documentContent if available)",
    },
    diagramType: {
      type: "string",
    },
    diagramStyle: {
      type: "string",
    },
    locale: {
      type: "string",
    },
    ratio: {
      type: "string",
      enum: ["1:1", "5:4", "4:3", "3:2", "16:9", "21:9"],
    },
    aspectRatio: {
      type: "string",
      enum: ["1:1", "5:4", "4:3", "3:2", "16:9", "21:9"],
    },
    size: {
      type: "string",
    },
    originalContent: {
      type: "string",
    },
    diagramIndex: {
      type: "number",
    },
    feedback: {
      type: "string",
    },
  },
  required: ["documentContent", "diagramType", "diagramStyle", "ratio"],
};
