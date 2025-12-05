import { AIAgent } from "@aigne/core";
import { pick } from "@aigne/core/utils/type-utils.js";
import z from "zod";
import {
  DIAGRAM_PLACEHOLDER,
  replaceD2WithPlaceholder,
  replaceDiagramsWithPlaceholder,
} from "../../../utils/d2-utils.mjs";
import { userContextAt } from "../../../utils/utils.mjs";

async function getIntentType(input, options) {
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
  const analyzeUpdateFeedbackIntentAgent = AIAgent.from({
    name: "analyzeUpdateFeedbackIntent",
    description:
      "Analyze user feedback to determine if document are needed for content modifications",
    task_render_mode: "hide",
    instructions,
    // TODO: can't set reasoningEffort
    // modelOptions: {
    //   reasoningEffort: 1,
    // },
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
    feedback: input.feedback,
  });
  return intentType;
}

async function saveDoc(input, options, { content, intentType }) {
  const saveAgent = options.context?.agents?.["saveDoc"];
  await options.context.invoke(saveAgent, {
    ...pick(input, ["path", "docsDir", "labels", "locale"]),
    content,
    intentType, // Pass intentType so saveDoc can handle translation sync
  });
}

async function addDiagram(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();
  const generateDiagramAgent = options.context.agents["checkGenerateDiagram"];
  const generateDiagramResult = await options.context.invoke(generateDiagramAgent, {
    ...pick(input, ["locale", "path", "docsDir", "diagramming", "feedback"]),
    documentContent: currentContent,
    originalContent: currentContent,
  });
  const content = generateDiagramResult.content;
  contentContext.set(content);
  // Pass intentType to saveDoc so it can handle translation sync automatically
  await saveDoc(input, options, { content, intentType: "addDiagram" });
  return { content };
}

async function updateDiagram(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();
  let [content] = replaceD2WithPlaceholder({
    content: currentContent,
  });
  const generateAgent = options.context?.agents?.["generateDiagram"];
  const result = await options.context.invoke(generateAgent, {
    documentContent: content,
    locale: input.locale,
    diagramming: input.diagramming || {},
    feedback: input.feedback,
    originalContent: currentContent, // Pass original content to find existing diagrams
    path: input.path,
    docsDir: input.docsDir,
  });

  // generateDiagram now returns { content } with image already inserted
  // The image replaces DIAGRAM_PLACEHOLDER or D2 code blocks
  if (result?.content) {
    content = result.content;
  }

  contentContext.set(content);
  // Pass intentType to saveDoc so it can handle translation sync automatically
  await saveDoc(input, options, { content, intentType: "updateDiagram" });
  return { content };
}

async function deleteDiagram(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();

  // Extract diagram index from feedback if provided
  // This allows deleting a specific diagram when multiple diagrams exist
  let diagramIndex = input.diagramIndex;
  if (diagramIndex === undefined && input.feedback) {
    // Import extractDiagramIndexFromFeedback from replace-d2-with-image.mjs
    const { extractDiagramIndexFromFeedback } = await import(
      "../../create/replace-d2-with-image.mjs"
    );
    const extractedIndex = extractDiagramIndexFromFeedback(input.feedback);
    if (extractedIndex !== null) {
      diagramIndex = extractedIndex;
    }
  }

  // Replace all diagrams (D2 code blocks, generated images, Mermaid) with placeholder
  // If diagramIndex is provided, only replace that specific diagram
  // This ensures LLM can identify and remove the diagram regardless of its type
  const documentContent = replaceDiagramsWithPlaceholder({
    content: currentContent,
    diagramIndex,
  });
  const instructions = `<role>
Your task is to remove ${DIAGRAM_PLACEHOLDER} and adjust the document context (based on the user's feedback) to make it easier to understand.
</role>

<document_content>
{{documentContent}}
</document_content>

<user_feedback>
{{feedback}}
</user_feedback>

<output_constraints>
- Do not provide any explanations; include only the document content itself
</output_constraints>`;
  const deleteAgent = AIAgent.from({
    name: "deleteDiagram",
    description: "Remove a diagram from the document content",
    task_render_mode: "hide",
    instructions,
    inputSchema: z.object({
      documentContent: z.string().describe("Source content of the document"),
      feedback: z.string().describe("User feedback for content modifications"),
    }),
    outputKey: "message",
  });
  const { message: content } = await options.context.invoke(deleteAgent, {
    documentContent,
    feedback: input.feedback,
  });

  // Delete associated diagram image files
  if (input.docsDir) {
    try {
      const { deleteDiagramImages } = await import("../../../utils/delete-diagram-images.mjs");
      const { deleted } = await deleteDiagramImages(currentContent, input.path, input.docsDir);
      if (deleted > 0) {
        console.log(`Deleted ${deleted} diagram image file(s) for ${input.path}`);
      }
    } catch (error) {
      // Don't fail the operation if image deletion fails
      console.warn(`Failed to delete diagram images: ${error.message}`);
    }
  }

  contentContext.set(content);
  // Pass intentType to saveDoc so it can handle translation sync automatically
  await saveDoc(input, options, { content, intentType: "deleteDiagram" });

  return { content };
}

async function updateDocument(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();
  const updateAgent = options.context.agents["updateDocumentDetail"];
  const updateResult = await options.context.invoke(updateAgent, {
    ...input,
    originalContent: currentContent,
  });
  if (updateResult.message === "success") {
    const updatedContent = contentContext.get();

    contentContext.set(updatedContent);
    await saveDoc(input, options, { content: updatedContent });
  }
  return {
    content: contentContext.get(),
  };
}

export default async function updateSingleDocumentDetail(input, options) {
  // Use intentType from input if available (analyzed in parent flow),
  // otherwise fall back to analyzing it here (for backward compatibility)
  let intentType = input.intentType;
  if (!intentType && input.feedback) {
    intentType = await getIntentType(input, options);
  }

  // If intentType is still null or undefined, default to updateDocument
  // This ensures that some operation is always performed, even if intent analysis failed
  // or no explicit intent was provided
  if (!intentType) {
    intentType = "updateDocument";
  }

  const fnMap = {
    addDiagram,
    updateDiagram,
    deleteDiagram,
    updateDocument,
  };

  if (fnMap[intentType]) {
    const result = await fnMap[intentType](input, options);
    return result;
  }

  // Fallback: if intentType is not in fnMap, default to updateDocument
  console.warn(`Unknown intentType: ${intentType}, defaulting to updateDocument`);
  return await updateDocument(input, options);
}
