import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import fs from "fs-extra";
import {
  DIAGRAM_STYLES,
  DIAGRAM_TYPES,
  DOC_SMITH_DIR,
  TMP_DIR,
  TMP_ASSETS_DIR,
} from "../../utils/constants/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_DIAGRAM_STYLE = "anthropomorphic";
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
 * Analyze document content to determine diagram type and select appropriate style
 * Uses hybrid approach: keyword matching + LLM analysis
 * Supports extracting style and type preferences from user feedback
 */
export default async function analyzeDiagramType(
  { documentContent, availableStyles = [], locale = "en", feedback = "" },
  options,
) {
  // Step 0: Extract style and type preferences from user feedback (if provided)
  const feedbackPreferences = extractPreferencesFromFeedback(feedback || "");

  // Step 1: Keyword-based type detection
  const keywordScores = detectDiagramTypeByKeywords(documentContent);

  // Step 2: Use LLM to analyze and make final decision
  const llmAgent = options.context?.agents?.["analyzeDiagramTypeLLM"];
  let llmResult = null;

  if (llmAgent) {
    try {
      // Build styleDescriptions object for template
      const styleDescriptions = {};
      const stylesToUse =
        availableStyles.length > 0 ? availableStyles : Object.keys(DIAGRAM_STYLES);
      for (const style of stylesToUse) {
        if (DIAGRAM_STYLES[style]) {
          styleDescriptions[style] =
            DIAGRAM_STYLES[style].description || DIAGRAM_STYLES[style].name;
        }
      }

      // Only include feedbackPreferences if it has non-null values
      const llmInput = {
        documentContent,
        keywordScores,
        availableStyles: stylesToUse,
        styleDescriptions,
        locale,
        feedback: feedback || "",
      };

      // Only add feedbackPreferences if at least one field is not null
      if (feedbackPreferences && (feedbackPreferences.style || feedbackPreferences.type)) {
        llmInput.feedbackPreferences = feedbackPreferences;
      }

      llmResult = await options.context.invoke(llmAgent, llmInput);
    } catch (error) {
      console.warn(`⚠️  LLM analysis failed, using keyword-based detection: ${error.message}`);
    }
  }

  // Step 3: Determine diagram type
  // Priority: feedback preference > LLM result > keyword match > default
  let diagramType = DEFAULT_DIAGRAM_TYPE;
  if (feedbackPreferences.type) {
    diagramType = feedbackPreferences.type;
  } else if (llmResult?.diagramType) {
    diagramType = llmResult.diagramType;
  } else if (keywordScores[0]?.type) {
    diagramType = keywordScores[0].type;
  }

  // Step 4: Select style
  // Priority: feedback preference > LLM result > single configured style > type-based selection > default
  let diagramStyle = DEFAULT_DIAGRAM_STYLE;

  // First check if user specified a style in feedback
  if (feedbackPreferences.style) {
    // Validate that the requested style is available
    if (availableStyles.length === 0 || availableStyles.includes(feedbackPreferences.style)) {
      diagramStyle = feedbackPreferences.style;
    } else {
      console.warn(
        `⚠️  Requested style "${feedbackPreferences.style}" not in available styles, using fallback`,
      );
    }
  }

  // If no feedback preference, proceed with normal selection
  if (!feedbackPreferences.style) {
    if (availableStyles && availableStyles.length > 0) {
      // If LLM provided a style recommendation and it's in available styles, use it
      if (llmResult?.diagramStyle && availableStyles.includes(llmResult.diagramStyle)) {
        diagramStyle = llmResult.diagramStyle;
      } else if (availableStyles.length === 1) {
        // If only one style is configured, use it
        diagramStyle = availableStyles[0];
      } else {
        // Otherwise, let LLM choose from available styles
        if (llmResult?.diagramStyle && availableStyles.includes(llmResult.diagramStyle)) {
          diagramStyle = llmResult.diagramStyle;
        } else {
          // Fallback: choose based on diagram type
          diagramStyle = selectStyleByType(diagramType, availableStyles);
        }
      }
    } else {
      // No styles configured, use LLM recommendation or default
      diagramStyle = llmResult?.diagramStyle || DEFAULT_DIAGRAM_STYLE;
    }
  }

  // Step 5: Generate reasoning
  let reasoning = llmResult?.reasoning;
  if (!reasoning) {
    reasoning = generateReasoning(diagramType, diagramStyle, keywordScores, feedbackPreferences);
  }

  // Step 6: Generate prompt requirements for image generation
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

  // Step 7: Determine aspect ratio based on diagram type
  // flowchart, guide: 4:3
  // architecture, sequence, network, intro: 16:9
  let aspectRatio = "16:9";
  if (diagramType === "flowchart") {
    aspectRatio = "4:3";
  }

  // Step 8: Prepare template image for flowchart type
  let templateImage = null;
  if (diagramType === "flowchart") {
    // Get project root directory (3 levels up from agents/create/)
    // agents/create/ -> agents/ -> root/
    const projectRoot = path.resolve(__dirname, "../..");
    const templateImagePath = path.join(
      projectRoot,
      "assets",
      "images",
      "diagram-templates",
      "flowchart-template.jpg",
    );

    // Check if template image exists, if not, fallback to temp directory
    let finalTemplatePath = templateImagePath;
    if (!(await fs.pathExists(templateImagePath))) {
      // Fallback to temp directory (for backward compatibility)
      const fallbackPath = path.join(
        process.cwd(),
        DOC_SMITH_DIR,
        TMP_DIR,
        TMP_ASSETS_DIR,
        "image.jpg",
      );
      if (await fs.pathExists(fallbackPath)) {
        finalTemplatePath = fallbackPath;
      } else {
        // Template not found, skip template image
        console.warn(
          `⚠️  Flowchart template image not found at ${templateImagePath} or ${fallbackPath}`,
        );
      }
    }

    if (finalTemplatePath && (await fs.pathExists(finalTemplatePath))) {
      templateImage = {
        type: "local",
        path: finalTemplatePath,
      };
    }
  }

  return {
    diagramType,
    diagramStyle,
    aspectRatio,
    reasoning,
    diagramTypeRequirements,
    diagramStyleRequirements,
    negativePromptExclusions,
    templateImage,
  };
}

/**
 * Detect diagram type using keyword matching
 * Returns array of { type, score } sorted by score descending
 */
function detectDiagramTypeByKeywords(documentContent) {
  if (!documentContent) return [];

  const content = documentContent.toLowerCase();
  const scores = [];

  for (const [type, typeInfo] of Object.entries(DIAGRAM_TYPES)) {
    let score = 0;
    for (const keyword of typeInfo.keywords) {
      const keywordLower = keyword.toLowerCase();
      // Count occurrences
      const matches = (content.match(new RegExp(keywordLower, "g")) || []).length;
      score += matches;
    }
    if (score > 0) {
      scores.push({ type, score });
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return scores;
}

/**
 * Select style based on diagram type when multiple styles are available
 */
function selectStyleByType(diagramType, availableStyles) {
  // Type-to-style preference mapping
  const typeStylePreference = {
    architecture: ["modern", "3d", "flat", "anthropomorphic"],
    flowchart: ["standard", "modern", "flat", "minimalist"],
    guide: ["hand-drawn", "modern", "flat", "anthropomorphic"],
    intro: ["modern", "flat", "minimalist", "3d"],
    sequence: ["standard", "modern", "flat", "minimalist"],
    network: ["modern", "3d", "flat", "standard"],
  };

  const preferences = typeStylePreference[diagramType] || ["modern", "standard", "flat"];

  // Find first available style from preferences
  for (const preferredStyle of preferences) {
    if (availableStyles.includes(preferredStyle)) {
      return preferredStyle;
    }
  }

  // Fallback: return first available style
  return availableStyles[0] || DEFAULT_DIAGRAM_STYLE;
}

/**
 * Extract style and type preferences from user feedback
 * Returns { style: string | null, type: string | null }
 */
function extractPreferencesFromFeedback(feedback) {
  if (!feedback) return { style: null, type: null };

  const feedbackLower = feedback.toLowerCase();
  const preferences = { style: null, type: null };

  // Extract style preferences
  const styleKeywords = {
    anthropomorphic: ["拟人", "anthropomorphic", "personified", "拟物", "personification"],
    "hand-drawn": ["手绘", "hand-drawn", "hand drawn", "sketch", "手画", "草图"],
    modern: ["现代", "modern", "contemporary"],
    standard: ["标准", "standard", "traditional", "传统"],
    flat: ["扁平", "flat", "flat design"],
    minimalist: ["极简", "minimalist", "minimal", "简洁"],
    "3d": ["3d", "3-d", "三维", "立体", "three-dimensional"],
  };

  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some((keyword) => feedbackLower.includes(keyword))) {
      preferences.style = style;
      break;
    }
  }

  // Extract type preferences
  const typeKeywords = {
    architecture: ["架构", "architecture", "架构图", "系统架构"],
    flowchart: ["流程", "flowchart", "流程图", "flow chart"],
    guide: ["引导", "guide", "引导图", "教程图"],
    intro: ["介绍", "introduction", "介绍图", "概述图"],
    sequence: ["时序", "sequence", "时序图", "交互图"],
    network: ["网络", "network", "网络图", "拓扑图", "topology"],
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((keyword) => feedbackLower.includes(keyword))) {
      preferences.type = type;
      break;
    }
  }

  return preferences;
}

/**
 * Generate reasoning text for the decision
 */
function generateReasoning(diagramType, diagramStyle, keywordScores, feedbackPreferences = {}) {
  const typeName = DIAGRAM_TYPES[diagramType]?.name || diagramType;
  const styleName = DIAGRAM_STYLES[diagramStyle]?.name || diagramStyle;

  let reasoning = `Selected diagram type: ${typeName}, style: ${styleName}`;

  if (feedbackPreferences.style || feedbackPreferences.type) {
    const parts = [];
    if (feedbackPreferences.style) {
      parts.push(`style from user feedback`);
    }
    if (feedbackPreferences.type) {
      parts.push(`type from user feedback`);
    }
    reasoning += ` (${parts.join(", ")})`;
  } else if (keywordScores && keywordScores.length > 0) {
    const topMatch = keywordScores[0];
    if (topMatch.type === diagramType) {
      reasoning += `. Detected based on keywords (score: ${topMatch.score})`;
    }
  }

  return reasoning;
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
      description: "List of available diagram styles configured by user",
      items: {
        type: "string",
        enum: Object.keys(DIAGRAM_STYLES),
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
  },
  required: ["documentContent"],
};

analyzeDiagramType.output_schema = {
  type: "object",
  properties: {
    diagramType: {
      type: "string",
      description: "The detected diagram type",
      enum: Object.keys(DIAGRAM_TYPES),
    },
    diagramStyle: {
      type: "string",
      description: "The selected diagram style",
      enum: Object.keys(DIAGRAM_STYLES),
    },
    reasoning: {
      type: "string",
      description: "Explanation of the decision",
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
      description: "Aspect ratio for the diagram (4:3 or 16:9)",
      enum: ["4:3", "16:9"],
    },
    templateImage: {
      type: "object",
      description: "Template image reference for flowchart type (null for other types)",
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
      nullable: true,
    },
  },
  required: [
    "diagramType",
    "diagramStyle",
    "aspectRatio",
    "reasoning",
    "diagramTypeRequirements",
    "diagramStyleRequirements",
    "negativePromptExclusions",
  ],
};
