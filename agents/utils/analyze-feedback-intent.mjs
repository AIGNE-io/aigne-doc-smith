import { AIAgent } from "@aigne/core";
import z from "zod";
import { diagramImageWithPathRegex } from "../../utils/d2-utils.mjs";

/**
 * Detect existing diagram in document content using regex
 * Uses generic regex patterns to detect diagram images inserted by the system
 * @param {string} documentContent - Document content to analyze
 * @returns {Object|null} - Diagram info if found, null otherwise
 */
function detectExistingDiagram(documentContent) {
  if (!documentContent || typeof documentContent !== "string") {
    return null;
  }

  // Use generic regex to detect diagram image blocks with special markers
  // Format: <!-- DIAGRAM_IMAGE_START:type:aspectRatio -->![alt](path)<!-- DIAGRAM_IMAGE_END -->
  const pathMatches = Array.from(documentContent.matchAll(diagramImageWithPathRegex));

  if (pathMatches.length > 0) {
    // Currently each document has only one diagram, so use the first one
    const firstPathMatch = pathMatches[0];
    const imagePath = firstPathMatch[1];
    const fullMatch = firstPathMatch[0];

    return {
      path: imagePath,
      index: 0,
      markdown: fullMatch,
    };
  }

  return null;
}

/**
 * Analyze user feedback to determine the intent type for document updates
 * Supports two modes:
 * - Global mode (no documentContent): Only analyzes feedback to determine intentType
 * - Single document mode (with documentContent): Detects diagrams and provides full analysis
 * Returns: { intentType, diagramInfo, generationMode, changes }
 */
export default async function analyzeFeedbackIntent(
  { feedback, shouldUpdateDiagrams, documentContent },
  options,
) {
  // Check if documentContent is available (single document mode vs global mode)
  const hasDocumentContent =
    documentContent && typeof documentContent === "string" && documentContent.trim();

  // Check if feedback exists and is not empty
  // If feedback is empty and --diagram flag is set, default to updateDiagram
  if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
    // If --diagram flag is set, default to updateDiagram (user wants to update diagrams)
    if (shouldUpdateDiagrams) {
      const diagramInfo = hasDocumentContent ? detectExistingDiagram(documentContent) : null;
      return {
        intentType: "updateDiagram",
        diagramInfo,
        generationMode: diagramInfo ? "image-to-image" : "add-new",
        changes: [],
      };
    }
    // No feedback and no flag - return minimal structure
    const diagramInfo = hasDocumentContent ? detectExistingDiagram(documentContent) : null;
    return {
      intentType: null,
      diagramInfo,
      generationMode: null,
      changes: [],
    };
  }

  // Step 1: Detect existing diagram only if documentContent is available (single document mode)
  const diagramInfo = hasDocumentContent ? detectExistingDiagram(documentContent) : null;

  // Step 2: Build instructions with diagram context (only in single document mode)
  let diagramContextSection = "";
  if (hasDocumentContent) {
    if (diagramInfo) {
      diagramContextSection = `The document contains an existing diagram: ${diagramInfo.path}`;
    } else {
      diagramContextSection = `The document does not contain any diagram images.`;
    }
  }

  const instructions = `Analyze the user feedback and classify the intent:

**Intent Types:**
- addDiagram: User wants to add/create a new diagram/image/chart
- deleteDiagram: User wants to remove/delete an existing diagram/image/chart
- updateDiagram: User wants to modify/update an existing diagram/image/chart
- updateDocument: User wants to update text/content (not diagram-related)

${diagramContextSection ? `**Context:** ${diagramContextSection}` : ""}

**User Feedback:**
${feedback.trim()}

**For updateDiagram, determine generationMode:**
- "image-to-image": Diagram exists AND user describes changes (default when diagram exists)
- "text-only": User explicitly requests regenerating from text only
- "add-new": No existing diagram

Analyze the feedback and return the intent type, generationMode (if applicable), and any specific changes mentioned.`;

  try {
    const analyzeUpdateFeedbackIntentAgent = AIAgent.from({
      name: "analyzeUpdateFeedbackIntent",
      description:
        "Analyze user feedback to determine if document are needed for content modifications",
      task_render_mode: "hide",
      instructions,
      inputSchema: z.object({
        feedback: z.string().describe("User feedback for content modifications"),
        diagramInfo: z
          .object({
            path: z.string(),
            index: z.number(),
            markdown: z.string(),
          })
          .nullable()
          .describe("Existing diagram information if found, null otherwise"),
      }),
      outputSchema: z.object({
        intentType: z
          .enum(["addDiagram", "deleteDiagram", "updateDiagram", "updateDocument"])
          .describe(
            "The primary type of user intention: one of addDiagram, deleteDiagram, updateDiagram, updateDocument",
          ),
        generationMode: z
          .enum(["image-to-image", "text-only", "add-new", "remove-image"])
          .optional()
          .describe(
            "Generation mode for diagram operations. Only relevant for addDiagram/updateDiagram. 'image-to-image' for modifying existing, 'text-only' for regenerating from text, 'add-new' for creating new.",
          ),
        changes: z
          .array(z.string())
          .optional()
          .describe(
            "Specific changes mentioned in feedback (e.g., ['add node: database', 'modify style: modern']). Only relevant for updateDiagram.",
          ),
      }),
    });

    const llmInput = {
      feedback: feedback.trim(),
      diagramInfo,
    };
    const llmResult = await options.context.invoke(analyzeUpdateFeedbackIntentAgent, llmInput);

    // Handle case where LLM returns null, undefined, or invalid result
    if (!llmResult || typeof llmResult !== "object") {
      throw new Error(`LLM returned invalid result: ${JSON.stringify(llmResult)}`);
    }

    let { intentType, generationMode, changes } = llmResult;

    // If LLM returned null/undefined intentType, try to infer from feedback content
    if (!intentType) {
      const feedbackLower = feedback.toLowerCase();
      const hasDiagramTerms =
        feedbackLower.includes("图") ||
        feedbackLower.includes("diagram") ||
        feedbackLower.includes("chart") ||
        feedbackLower.includes("节点") ||
        feedbackLower.includes("node");

      if (hasDiagramTerms && diagramInfo) {
        intentType = "updateDiagram";
      } else if (hasDiagramTerms && !diagramInfo) {
        intentType = "addDiagram";
      } else {
        intentType = "updateDocument";
      }
    }

    // If --diagram flag is set and user didn't explicitly request delete/add,
    // default to updateDiagram (for backward compatibility)
    if (
      shouldUpdateDiagrams &&
      intentType &&
      !["deleteDiagram", "addDiagram"].includes(intentType)
    ) {
      intentType = "updateDiagram";
    }

    // Set default generationMode based on intentType and diagramInfo if not provided by LLM
    if (!generationMode) {
      if (intentType === "deleteDiagram") {
        generationMode = "remove-image";
      } else if (intentType === "addDiagram") {
        generationMode = "add-new";
      } else if (intentType === "updateDiagram") {
        generationMode = diagramInfo ? "image-to-image" : "add-new";
      }
    }

    // Ensure we always have a valid intentType at this point
    if (!intentType) {
      intentType = "updateDocument";
      generationMode = generationMode || null;
    }

    return {
      intentType,
      diagramInfo,
      generationMode,
      changes: changes || [],
    };
  } catch (error) {
    console.warn(`[analyzeFeedbackIntent] Failed to analyze feedback intent: ${error.message}`);

    // If analysis fails and --diagram flag is set, default to updateDiagram
    if (shouldUpdateDiagrams) {
      return {
        intentType: "updateDiagram",
        diagramInfo,
        generationMode: diagramInfo ? "image-to-image" : "add-new",
        changes: [],
      };
    }

    // Fallback: try to infer intent from feedback content
    const feedbackLower = feedback.toLowerCase();
    const hasDiagramTerms =
      feedbackLower.includes("图") ||
      feedbackLower.includes("diagram") ||
      feedbackLower.includes("chart") ||
      feedbackLower.includes("节点") ||
      feedbackLower.includes("node");

    let fallbackIntentType = "updateDocument";
    let fallbackGenerationMode = null;

    if (hasDiagramTerms && diagramInfo) {
      fallbackIntentType = "updateDiagram";
      fallbackGenerationMode = "image-to-image";
    } else if (hasDiagramTerms && !diagramInfo) {
      fallbackIntentType = "addDiagram";
      fallbackGenerationMode = "add-new";
    }

    return {
      intentType: fallbackIntentType,
      diagramInfo,
      generationMode: fallbackGenerationMode,
      changes: [],
    };
  }
}

analyzeFeedbackIntent.task_render_mode = "hide";
