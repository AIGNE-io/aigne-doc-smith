import { AIAgent } from "@aigne/core";
import z from "zod";

/**
 * Analyze user feedback to determine the intent type for document updates
 * Returns one of: "addDiagram", "deleteDiagram", "updateDiagram", "updateDocument"
 * Returns null if feedback is empty or invalid
 */
export default async function analyzeFeedbackIntent({ feedback }, options) {
  // Check if feedback exists and is not empty
  if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
    return { intentType: null };
  }

  const instructions = `<role>
You are a feedback intent analyzer. Your task is to determine which type of content modifications are needed based on the user's feedback.
</role>

<user_feedback>
{{feedback}}
</user_feedback>`;

  try {
    const analyzeUpdateFeedbackIntentAgent = AIAgent.from({
      name: "analyzeUpdateFeedbackIntent",
      description:
        "Analyze user feedback to determine if document are needed for content modifications",
      task_render_mode: "hide",
      instructions,
      inputSchema: z.object({
        feedback: z.string().describe("User feedback for content modifications"),
      }),
      outputSchema: z.object({
        intentType: z
          .enum(["addDiagram", "deleteDiagram", "updateDiagram", "updateDocument"])
          .describe(
            "The primary type of user intention: one of addDiagram, deleteDiagram, updateDiagram, updateDocument",
          ),
      }),
    });

    const { intentType } = await options.context.invoke(analyzeUpdateFeedbackIntentAgent, {
      feedback: feedback.trim(),
    });

    return { intentType };
  } catch (error) {
    // If analysis fails, return null to fall back to default document update flow
    console.warn(`Failed to analyze feedback intent: ${error.message}`);
    return { intentType: null };
  }
}

analyzeFeedbackIntent.task_render_mode = "hide";
