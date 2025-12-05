import { AIAgent } from "@aigne/core";
import z from "zod";

/**
 * Analyze user feedback to determine the intent type for document updates
 * Returns one of: "addDiagram", "deleteDiagram", "updateDiagram", "updateDocument"
 * Returns null if feedback is empty or invalid
 */
export default async function analyzeFeedbackIntent({ feedback, shouldUpdateDiagrams }, options) {
  // Check if feedback exists and is not empty
  // If feedback is empty and --diagram flag is set, default to updateDiagram
  // Otherwise return null
  if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
    // If --diagram flag is set, default to updateDiagram (user wants to update diagrams)
    if (shouldUpdateDiagrams) {
      return { intentType: "updateDiagram" };
    }
    return { intentType: null };
  }

  // Always analyze user feedback first, even if --diagram flag is set
  // This ensures user's explicit intent (e.g., "remove image", "delete diagram") is respected
  // The --diagram flag should only be a hint, not override explicit user commands

  const instructions = `<role>
You are a feedback intent analyzer. Your task is to determine which type of content modifications are needed based on the user's feedback.

You must analyze the user's feedback and classify it into one of the following intent types:
- addDiagram: User wants to add a new diagram/image/chart
- deleteDiagram: User wants to remove/delete a diagram/image/chart
- updateDiagram: User wants to modify/update an existing diagram/image/chart
- updateDocument: User wants to update document content (text, sections, etc.) without diagram operations
</role>

<intent_classification_rules>
**deleteDiagram** - Use this when user explicitly wants to remove or delete a diagram/image/chart:
- Keywords: remove, delete, 删除, 移除, 去掉, 清除
- Combined with: diagram, image, picture, chart, graph, 图表, 图片, 图, 架构图
- Examples:
  - "Remove the diagram"
  - "Delete the image"
  - "删除这张图片"
  - "Remove the second diagram"
  - "去掉架构图"
  - "Remove image from page 3"
  - "Delete the chart showing the flow"

**addDiagram** - Use this when user wants to add a new diagram:
- Keywords: add, create, insert, 添加, 创建, 插入
- Combined with: diagram, image, picture, chart, graph, 图表, 图片, 图
- Examples:
  - "Add a diagram showing the architecture"
  - "Create a flow chart"
  - "添加一个架构图"

**updateDiagram** - Use this when user wants to modify an existing diagram:
- Keywords: update, modify, change, improve, 更新, 修改, 改进
- Combined with: diagram, image, picture, chart, graph, 图表, 图片, 图
- Examples:
  - "Update the diagram to show the new process"
  - "Modify the chart to include more details"
  - "更新架构图"

**updateDocument** - Use this for all other content modifications:
- Text changes, section updates, content improvements
- No mention of diagrams/images/charts
- Examples:
  - "Update the introduction section"
  - "Fix the typo in paragraph 2"
  - "Improve the explanation"
</intent_classification_rules>

<user_feedback>
{{feedback}}
</user_feedback>

<analysis_guidelines>
1. Pay close attention to action verbs (remove, delete, add, update, etc.)
2. Identify the target object (diagram, image, chart, or general content)
3. If feedback mentions removing/deleting a diagram/image/chart → deleteDiagram
4. If feedback mentions adding a diagram/image/chart → addDiagram
5. If feedback mentions updating a diagram/image/chart → updateDiagram
6. If feedback is about general content without diagram references → updateDocument
7. When in doubt, prioritize the most explicit action mentioned in the feedback
</analysis_guidelines>`;

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

    // If --diagram flag is set and user didn't explicitly request delete/add,
    // default to updateDiagram (for backward compatibility)
    // But if user explicitly requested delete/add, respect that intent
    if (
      shouldUpdateDiagrams &&
      intentType &&
      !["deleteDiagram", "addDiagram"].includes(intentType)
    ) {
      return { intentType: "updateDiagram" };
    }

    return { intentType };
  } catch (error) {
    // If analysis fails and --diagram flag is set, default to updateDiagram
    // Otherwise return null to fall back to default document update flow
    if (shouldUpdateDiagrams) {
      console.warn(
        `Failed to analyze feedback intent, defaulting to updateDiagram due to --diagram flag: ${error.message}`,
      );
      return { intentType: "updateDiagram" };
    }
    console.warn(`Failed to analyze feedback intent: ${error.message}`);
    return { intentType: null };
  }
}

analyzeFeedbackIntent.task_render_mode = "hide";
