import { DIAGRAM_STYLES } from "../../utils/constants/index.mjs";
import path from "node:path";
import fs from "fs-extra";

const DEFAULT_DIAGRAM_STYLE = "modern";
const DEFAULT_DIAGRAM_TYPE = "flowchart";

// Type-specific content requirements
const TYPE_REQUIREMENTS = {
  architecture: `- Accurately represent the system architecture, components, services, and their relationships
  - Show clear component boundaries and service interactions
  - Include all key architectural elements (layers, modules, services, databases, APIs)
  - Display data flow and communication patterns between components
  - Use clear labels for each component and connection`,
  flowchart: `- Accurately represent the process flow, steps, decisions, and workflow
  - Show clear step-by-step progression with decision points
  - Use standard flowchart symbols: rectangles for processes, diamonds for decisions, arrows for flows
  - Include all key steps and decision branches
  - Maintain logical flow direction (top-to-bottom or left-to-right)`,
  guide: `- Show user journey, tutorial flow, or guided process
  - Display clear progression from start to completion
  - Include key milestones, checkpoints, or decision points
  - Use clear visual cues to guide the viewer through the process
  - Make it easy to follow and understand the path`,
  intro: `- Provide a high-level overview or conceptual explanation
  - Show main concepts, relationships, and key ideas
  - Use clear visual hierarchy to emphasize important elements
  - Make it accessible and easy to understand for newcomers
  - Focus on big picture rather than detailed implementation`,
  sequence: `- Show interactions over time between components or actors
  - Display clear message flow and timing
  - Include all participating entities and their interactions
  - Show chronological order of events
  - Use clear labels for messages and interactions`,
  network: `- Show network structure, nodes, and connections
  - Display routing paths and network topology
  - Include all network components (routers, switches, servers, clients)
  - Show connection types and data flow directions
  - Use clear labels for network elements`,
};

// Style-specific requirements
const STYLE_REQUIREMENTS = {
  modern: `- Modern, clean, professional diagram style
  - Contemporary design elements with smooth lines
  - Professional color scheme suitable for technical documentation
  - Clear visual hierarchy and readable text
  - Sleek and polished appearance`,
  standard: `- Standard flowchart style with traditional symbols
  - Conventional formatting and clear structure
  - Rectangles for processes, diamonds for decisions, arrows for flows
  - Clear, readable text labels
  - Professional and familiar appearance`,
  "hand-drawn": `- Hand-drawn, sketch-like style with natural, organic lines
  - Slightly imperfect shapes for a casual, approachable appearance
  - Natural line variations and hand-drawn aesthetics
  - Friendly and informal visual style
  - Avoid perfect geometric shapes`,
  anthropomorphic: `- Anthropomorphic style with personified elements
  - Vivid and lively imagery with characters or objects having human-like features
  - Engaging and memorable visual elements
  - Creative and expressive design
  - Make abstract concepts more relatable through personification`,
  flat: `- Flat design style with no shadows, gradients, or 3D effects
  - Clean geometric shapes with bold colors
  - Minimalist aesthetics with simple, flat surfaces
  - Modern and clean appearance
  - Avoid depth and dimensionality`,
  minimalist: `- Minimalist style with the fewest possible elements
  - Maximum clarity with simple shapes
  - Ample white space and essential information only
  - Clean and uncluttered appearance
  - Focus on core message without distractions`,
  "3d": `- 3D style with three-dimensional effects and perspective
  - Depth, shadows, and realistic spatial relationships
  - Three-dimensional appearance with volume and dimension
  - Professional and modern 3D rendering
  - Clear depth cues and perspective`,
};

/**
 * Convert diagramInfo from analyzeFeedbackIntent to mediaFile format
 * @param {Object} diagramInfo - Diagram info from analyzeFeedbackIntent (contains path, index, markdown)
 * @param {string} docPath - Document path
 * @param {string} docsDir - Documentation directory
 * @returns {Promise<Array|null>} - Array of mediaFile objects or null if conversion fails
 * Note: Currently each document has only one diagram, so we always use the first (and only) image
 */
async function convertDiagramInfoToMediaFile(diagramInfo, docPath, docsDir) {
  if (!diagramInfo || !diagramInfo.path) {
    return null;
  }

  try {
    const imagePath = diagramInfo.path;
    const docDir = path.dirname(docPath);

    // Resolve absolute path
    let absolutePath;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // Remote URL, cannot convert to local file
      return null;
    } else if (path.isAbsolute(imagePath)) {
      absolutePath = imagePath;
    } else {
      // Relative path - resolve from document location
      const imageRelativePath = imagePath.startsWith("../")
        ? imagePath
        : path.join(docDir, imagePath).replace(/\\/g, "/");
      absolutePath = path.join(process.cwd(), docsDir, imageRelativePath);
    }

    // Normalize path
    const normalizedPath = path.normalize(absolutePath);

    // Check if file exists
    if (!(await fs.pathExists(normalizedPath))) {
      return null;
    }

    // Get file info
    const ext = path.extname(normalizedPath).toLowerCase().slice(1);
    const filename = path.basename(normalizedPath);

    // Determine MIME type
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const mimeType = mimeTypes[ext] || "image/png";

    // Return mediaFile format (array as required by input_file_key)
    return [
      {
        type: "local",
        path: normalizedPath,
        filename,
        mimeType,
      },
    ];
  } catch (error) {
    console.warn(`Failed to convert diagramInfo to mediaFile: ${error.message}`);
    return null;
  }
}

/**
 * Analyze document content to determine diagram type and select appropriate style
 * Uses LLM analysis to determine diagram type and style
 * Supports extracting style and type preferences from user feedback
 * Now also detects existing images and determines if image-to-image generation should be used
 */
export default async function analyzeDiagramType(
  {
    documentContent,
    availableStyles = [],
    defaultStyle,
    diagramming,
    locale = "en",
    feedback = "",
    path,
    docsDir,
    // Analysis results from first layer (analyzeFeedbackIntent)
    intentAnalysis,
  },
  options,
) {
  // Extract defaultStyle from diagramming object if not provided directly
  if (!defaultStyle && diagramming?.style) {
    defaultStyle = diagramming.style;
  }

  // Step 1: Use LLM to analyze document content (chart detection and intent analysis already done in first layer)
  const llmAgent = options.context?.agents?.["analyzeDiagramTypeLLM"];
  let llmResult = null;

  if (llmAgent) {
    try {
      // Build styleDescriptions object for template
      // Include predefined styles as reference, but allow LLM to use any style
      const styleDescriptions = {};
      const stylesToUse =
        availableStyles.length > 0 ? availableStyles : Object.keys(DIAGRAM_STYLES);
      for (const style of stylesToUse) {
        if (DIAGRAM_STYLES[style]) {
          styleDescriptions[style] =
            DIAGRAM_STYLES[style].description || DIAGRAM_STYLES[style].name;
        }
      }
      // Also include all predefined styles as reference even if not in availableStyles
      // This helps LLM understand common style options but doesn't restrict it
      for (const [style, styleInfo] of Object.entries(DIAGRAM_STYLES)) {
        if (!styleDescriptions[style]) {
          styleDescriptions[style] = styleInfo.description || styleInfo.name;
        }
      }

      const llmInput = {
        documentContent,
        availableStyles: stylesToUse,
        styleDescriptions,
        locale,
        feedback: feedback || "",
        defaultStyle: defaultStyle || null,
        // Note: We only analyze current documentContent, no originalContent comparison
        // User feedback is the only indicator for whether diagram needs update
      };

      llmResult = await options.context.invoke(llmAgent, llmInput);
    } catch (error) {
      console.warn(`⚠️  LLM analysis failed: ${error.message}`);
    }
  }

  // Step 2: Determine diagram type
  // Priority: LLM result (which already analyzed feedback) > default
  const diagramType = llmResult?.diagramType || DEFAULT_DIAGRAM_TYPE;

  // Step 3: Select style
  // Trust LLM to always return a valid style (required in output_schema)
  // LLM can return any style name, not limited to predefined styles
  // Only use fallback if LLM completely failed
  const diagramStyle = llmResult?.diagramStyle || defaultStyle || DEFAULT_DIAGRAM_STYLE;

  // Note: We allow any style name from LLM, even if not in availableStyles
  // This enables creative styles beyond predefined ones (e.g., 'watercolor', 'cyberpunk', 'isometric')
  // If availableStyles is provided and not empty, it serves as a preference guide, not a strict restriction

  // Step 4: Generate prompt requirements for image generation
  const diagramTypeRequirements =
    TYPE_REQUIREMENTS[diagramType] || TYPE_REQUIREMENTS[DEFAULT_DIAGRAM_TYPE];
  const diagramStyleRequirements =
    STYLE_REQUIREMENTS[diagramStyle] || STYLE_REQUIREMENTS[DEFAULT_DIAGRAM_STYLE];

  // Generate negative prompt exclusions based on style
  let negativePromptExclusions = "";
  if (diagramStyle !== "anthropomorphic") {
    negativePromptExclusions += ", anthropomorphic";
  }
  if (diagramStyle !== "hand-drawn") {
    negativePromptExclusions += ", hand-drawn, sketch";
  }

  // Step 5: Extract document summary from LLM result
  // The LLM creates a concise summary focusing on key elements for diagram generation
  // This ensures both the analysis model and image generation model have consistent understanding
  const documentSummary = llmResult?.documentSummary || documentContent;

  // If LLM didn't provide a summary (fallback), use original content
  // But prefer the LLM-generated summary as it's focused and aligned with the analysis

  // Step 6: Determine aspect ratio from LLM result
  // The LLM analyzes the content structure and recommends the best aspect ratio
  // We trust the LLM's judgment as it has analyzed the actual content
  // If LLM doesn't provide aspectRatio (shouldn't happen, but fallback for safety), use 4:3 as safe default
  let aspectRatio = llmResult?.aspectRatio || "4:3";

  // Validate that the aspectRatio is one of the supported values
  const supportedRatios = ["1:1", "5:4", "4:3", "3:2", "16:9", "21:9"];
  if (!supportedRatios.includes(aspectRatio)) {
    console.warn(`Invalid aspectRatio "${aspectRatio}" from LLM, falling back to "4:3"`);
    aspectRatio = "4:3";
  }

  // Step 2: Use analysis results from first layer (analyzeFeedbackIntent)
  // Get generationMode and diagramInfo from intentAnalysis
  const generationMode = intentAnalysis?.generationMode || "add-new";
  const diagramInfo = intentAnalysis?.diagramInfo || null;

  // Step 3: Convert diagramInfo to mediaFile format if needed for image-to-image generation
  let existingImage = null;
  let useImageToImage = false;

  if (diagramInfo && generationMode === "image-to-image" && path && docsDir) {
    // Convert diagramInfo to the format expected by image generation agent
    existingImage = await convertDiagramInfoToMediaFile(diagramInfo, path, docsDir);
    useImageToImage = existingImage !== null;
  }

  // Step 3: Return document content and summary for image generation
  return {
    diagramType,
    diagramStyle,
    aspectRatio,
    documentContent, // The full document content (kept for backward compatibility and additional context)
    documentSummary, // The concise summary generated by LLM, focused on key elements for diagram generation
    diagramTypeRequirements,
    diagramStyleRequirements,
    negativePromptExclusions,
    // Image-to-image generation support (from LLM analysis)
    existingImage, // Array of mediaFile objects or null
    useImageToImage, // Boolean indicating if image-to-image mode should be used
    generationMode, // Generation mode from LLM: "text-only", "image-to-image", "remove-image", "add-new"
  };
}

analyzeDiagramType.input_schema = {
  type: "object",
  properties: {
    documentContent: {
      type: "string",
      description: "The document content to analyze for diagram type and style selection",
    },
    availableStyles: {
      type: "array",
      description:
        "List of available diagram styles configured by user (optional restriction). If empty, any style is allowed.",
      items: {
        type: "string",
      },
    },
    defaultStyle: {
      type: "string",
      description:
        "Default diagram style to use when no style is specified in feedback. Can be any style name, not limited to predefined styles.",
    },
    diagramming: {
      type: "object",
      description: "Diagramming configuration object (alternative way to pass style)",
      properties: {
        style: {
          type: "string",
          description: "Default diagram style",
        },
      },
    },
    locale: {
      type: "string",
      description: "Language for analysis",
      default: "en",
    },
    feedback: {
      type: "string",
      description:
        "User feedback that may contain style or type preferences (e.g., 'use anthropomorphic style', 'create architecture diagram')",
      default: "",
    },
    path: {
      type: "string",
      description:
        "Document path (e.g., 'guides/getting-started.md') used for extracting existing images",
    },
    docsDir: {
      type: "string",
      description: "Documentation directory where diagram images are stored",
    },
  },
  required: ["documentContent"],
};

analyzeDiagramType.output_schema = {
  type: "object",
  properties: {
    diagramType: {
      type: "string",
      description: "The detected diagram type",
    },
    diagramStyle: {
      type: "string",
      description: "The selected diagram style",
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
    aspectRatio: {
      type: "string",
      description: "Aspect ratio for the diagram (must match content flow direction)",
      enum: ["1:1", "5:4", "4:3", "3:2", "16:9", "21:9"],
    },
    documentContent: {
      type: "string",
      description:
        "The full document content (kept for backward compatibility and additional context)",
    },
    documentSummary: {
      type: "string",
      description:
        "A concise summary of the document content focusing on key elements needed for diagram generation. This summary is generated by the analysis LLM to ensure consistent understanding between analysis and image generation models.",
    },
    existingImage: {
      type: "array",
      nullable: true,
      description:
        "Array of mediaFile objects for existing diagram image (for image-to-image generation). Null if no existing image or text-only regeneration requested.",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          path: { type: "string" },
          filename: { type: "string" },
          mimeType: { type: "string" },
        },
      },
    },
    useImageToImage: {
      type: "boolean",
      description:
        "Whether to use image-to-image generation mode. True if existing image found and generationMode is 'image-to-image'.",
    },
    generationMode: {
      type: "string",
      description: "Generation mode determined from intentAnalysis (from analyzeFeedbackIntent).",
    },
    intentAnalysis: {
      type: "object",
      description:
        "Analysis results from analyzeFeedbackIntent containing intentType, diagramInfo, generationMode, and changes.",
      properties: {
        intentType: {
          type: "string",
          enum: ["addDiagram", "updateDiagram", "deleteDiagram", "updateDocument"],
        },
        diagramInfo: {
          type: "object",
          nullable: true,
          properties: {
            path: { type: "string" },
            index: { type: "number" },
            markdown: { type: "string" },
          },
        },
        generationMode: {
          type: "string",
        },
        changes: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
  required: [
    "diagramType",
    "diagramStyle",
    "aspectRatio",
    "documentSummary",
    "diagramTypeRequirements",
    "diagramStyleRequirements",
    "negativePromptExclusions",
    "documentContent",
    "useImageToImage",
  ],
};
