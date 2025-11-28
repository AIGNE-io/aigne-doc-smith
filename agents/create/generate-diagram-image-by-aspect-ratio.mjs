/**
 * Route to appropriate image generation agent based on aspect ratio
 * This skill acts as a router to select between 16:9 and 4:3 image generation agents
 */
export default async function generateDiagramImageByAspectRatio(
  {
    documentContent,
    diagramType,
    diagramStyle,
    aspectRatio,
    diagramTypeRequirements,
    diagramStyleRequirements,
    negativePromptExclusions,
    templateImage,
    locale,
  },
  options,
) {
  // Select the appropriate agent based on aspect ratio
  const agentName = aspectRatio === "4:3" ? "generateDiagramImage4_3" : "generateDiagramImage16_9";
  const agent = options.context?.agents?.[agentName];

  if (!agent) {
    throw new Error(`Image generation agent ${agentName} not found`);
  }

  // Invoke the selected agent with all required parameters
  const result = await options.context.invoke(agent, {
    documentContent,
    diagramType,
    diagramStyle,
    diagramTypeRequirements,
    diagramStyleRequirements,
    negativePromptExclusions,
    templateImage,
    locale,
  });

  // Ensure diagramType and aspectRatio are included in the result for downstream processing
  return {
    ...result,
    diagramType,
    aspectRatio,
  };
}

generateDiagramImageByAspectRatio.input_schema = {
  type: "object",
  properties: {
    documentContent: {
      type: "string",
      description:
        "The document content that describes the system, process, or architecture to diagram",
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
      description: "Aspect ratio for the diagram",
      enum: ["4:3", "16:9"],
    },
    diagramTypeRequirements: {
      type: "string",
      description: "Content requirements for the diagram type",
    },
    diagramStyleRequirements: {
      type: "string",
      description: "Style requirements for the diagram style",
    },
    negativePromptExclusions: {
      type: "string",
      description: "Additional negative prompt exclusions based on style",
    },
    templateImage: {
      type: "object",
      description: "Template image reference (optional)",
      nullable: true,
      properties: {
        type: {
          type: "string",
          enum: ["local"],
        },
        path: {
          type: "string",
          description: "Absolute path to template image",
        },
      },
    },
    locale: {
      type: "string",
      description: "Language for diagram labels",
      default: "en",
    },
  },
  required: [
    "documentContent",
    "diagramType",
    "diagramStyle",
    "aspectRatio",
    "diagramTypeRequirements",
    "diagramStyleRequirements",
    "negativePromptExclusions",
  ],
};

generateDiagramImageByAspectRatio.output_schema = {
  type: "object",
  properties: {
    images: {
      type: "array",
      description: "Generated images array from the image generation agent",
      items: {
        type: "object",
        properties: {
          filename: {
            type: "string",
          },
          mimeType: {
            type: "string",
          },
          type: {
            type: "string",
          },
          path: {
            type: "string",
          },
        },
      },
    },
    diagramType: {
      type: "string",
      description: "The diagram type",
      enum: ["architecture", "flowchart", "guide", "intro", "sequence", "network"],
    },
    aspectRatio: {
      type: "string",
      description: "The aspect ratio used",
      enum: ["4:3", "16:9"],
    },
  },
};
