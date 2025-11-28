import { AIAgent } from "@aigne/core";
import { pick } from "@aigne/core/utils/type-utils.js";
import z from "zod";
import {
  DIAGRAM_PLACEHOLDER,
  replaceD2WithPlaceholder,
  replacePlaceholderWithD2,
} from "../../../utils/d2-utils.mjs";
import { userContextAt } from "../../../utils/utils.mjs";

async function getIntentType(input, options) {
  const instructions = `<role>
You are a feedback intent analyzer. Your task is to determine which type of content modifications are needed based on the user's feedback.
</role>

<user_feedback>
{{feedback}}
</user_feedback>`;
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

async function saveDoc(input, options, { content }) {
  const saveAgent = options.context?.agents?.["saveDoc"];
  await options.context.invoke(saveAgent, {
    ...pick(input, ["path", "docsDir", "labels", "locale"]),
    content,
  });
}

async function addDiagram(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();
  const generateDiagramAgent = options.context.agents["checkGenerateDiagram"];
  const generateDiagramResult = await options.context.invoke(generateDiagramAgent, {
    ...pick(input, ["locale", "path", "diagramming", "feedback"]),
    documentContent: currentContent,
  });
  const content = generateDiagramResult.content;
  contentContext.set(content);
  await saveDoc(input, options, { content });
  return { content };
}

async function updateDiagram(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();
  let [content, previousDiagramContent] = replaceD2WithPlaceholder({
    content: currentContent,
  });
  const generateAgent = options.context?.agents?.["generateDiagram"];
  const { diagramSourceCode } = await options.context.invoke(generateAgent, {
    documentContent: content,
    locale: input.locale,
    previousDiagramContent,
    feedback: input.feedback,
  });
  content = replacePlaceholderWithD2({
    content,
    diagramSourceCode,
  });
  contentContext.set(content);
  await saveDoc(input, options, { content });
  return { content };
}

async function deleteDiagram(input, options) {
  const contentContext = userContextAt(options, `currentContents.${input.path}`);
  const currentContent = contentContext.get();
  const [documentContent] = replaceD2WithPlaceholder({
    content: currentContent,
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
  contentContext.set(content);
  await saveDoc(input, options, { content });

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
  const intentType = await getIntentType(input, options);

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
  return {};
}
