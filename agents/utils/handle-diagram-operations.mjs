import { AIAgent } from "@aigne/core";
import { pick } from "@aigne/core/utils/type-utils.js";
import z from "zod";
import {
  DIAGRAM_PLACEHOLDER,
  replaceD2WithPlaceholder,
  replaceDiagramsWithPlaceholder,
} from "../../utils/d2-utils.mjs";
import { readFileContent } from "../../utils/docs-finder-utils.mjs";
import { getFileName, userContextAt } from "../../utils/utils.mjs";
import { debug } from "../../utils/debug.mjs";

/**
 * Read current document content from file system
 * Reuses the same logic as initCurrentContent but returns the content
 * First checks userContext, then reads from file if not in context
 */
async function readCurrentContent(input, options) {
  const { path, docsDir, locale = "en" } = input;

  if (!path || !docsDir) {
    return null;
  }

  // First check if content is already in userContext
  const contentContext = userContextAt(options, `currentContents.${path}`);
  const existingContent = contentContext.get();
  if (existingContent) {
    return existingContent;
  }

  // If not in context, read from file (same logic as initCurrentContent)
  try {
    const fileName = getFileName(path, locale);
    const content = await readFileContent(docsDir, fileName);

    if (!content) {
      console.warn(`⚠️  Could not read content from ${fileName}`);
      return null;
    }

    // Set in userContext for future use
    contentContext.set(content);

    return content;
  } catch (error) {
    console.warn(`Failed to read current content for ${path}: ${error.message}`);
    return null;
  }
}

/**
 * Save document content
 */
async function saveDoc(input, options, { content, intentType }) {
  const saveAgent = options.context?.agents?.["saveDoc"];
  if (!saveAgent) {
    console.warn("saveDoc agent not found");
    return;
  }
  await options.context.invoke(saveAgent, {
    ...pick(input, ["path", "docsDir", "labels", "locale"]),
    content,
    intentType, // Pass intentType so saveDoc can handle translation sync
  });
}

/**
 * Handle addDiagram intent
 */
async function addDiagram(input, options) {
  // readCurrentContent will check userContext first, then read from file if needed
  const currentContent = await readCurrentContent(input, options);
  if (!currentContent) {
    throw new Error(`Could not read current content for ${input.path}`);
  }

  const contentContext = userContextAt(options, `currentContents.${input.path}`);

  const generateDiagramAgent = options.context.agents["checkGenerateDiagram"];
  if (!generateDiagramAgent) {
    throw new Error("checkGenerateDiagram agent not found");
  }

  const generateDiagramResult = await options.context.invoke(generateDiagramAgent, {
    ...pick(input, ["locale", "diagramming", "feedback", "path", "docsDir"]),
    documentContent: currentContent,
    originalContent: currentContent,
  });

  const content = generateDiagramResult.content;
  contentContext.set(content);
  // Pass intentType to saveDoc so it can handle translation sync automatically
  await saveDoc(input, options, { content, intentType: "addDiagram" });
  return { content };
}

/**
 * Handle updateDiagram intent
 */
async function updateDiagram(input, options) {
  // readCurrentContent will check userContext first, then read from file if needed
  const currentContent = await readCurrentContent(input, options);
  if (!currentContent) {
    throw new Error(`Could not read current content for ${input.path}`);
  }

  const contentContext = userContextAt(options, `currentContents.${input.path}`);

  let [content] = replaceD2WithPlaceholder({
    content: currentContent,
  });

  const generateAgent = options.context?.agents?.["generateDiagram"];
  if (!generateAgent) {
    throw new Error("generateDiagram agent not found");
  }

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

/**
 * Handle deleteDiagram intent
 */
async function deleteDiagram(input, options) {
  // readCurrentContent will check userContext first, then read from file if needed
  const currentContent = await readCurrentContent(input, options);
  if (!currentContent) {
    throw new Error(`Could not read current content for ${input.path}`);
  }

  const contentContext = userContextAt(options, `currentContents.${input.path}`);

  // Extract diagram index from feedback if provided
  // This allows deleting a specific diagram when multiple diagrams exist
  let diagramIndex = input.diagramIndex;
  if (diagramIndex === undefined && input.feedback) {
    // Import extractDiagramIndexFromFeedback from replace-d2-with-image.mjs
    const { extractDiagramIndexFromFeedback } = await import("../create/replace-d2-with-image.mjs");
    const extractedIndex = extractDiagramIndexFromFeedback(input.feedback);
    if (extractedIndex !== null) {
      diagramIndex = extractedIndex;
      debug(`Extracted diagram index ${diagramIndex} from feedback: "${input.feedback}"`);
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
      const { deleteDiagramImages } = await import("../../utils/delete-diagram-images.mjs");
      const { deleted } = await deleteDiagramImages(currentContent, input.path, input.docsDir);
      if (deleted > 0) {
        debug(`Deleted ${deleted} diagram image file(s) for ${input.path}`);
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

/**
 * Handle diagram operations based on intent type
 * Supports: addDiagram, updateDiagram, deleteDiagram
 */
export default async function handleDiagramOperations(
  { intentType, path, docsDir, locale, feedback, diagramming, labels },
  options,
) {
  if (!intentType || !["addDiagram", "updateDiagram", "deleteDiagram"].includes(intentType)) {
    throw new Error(`Invalid intent type for diagram operations: ${intentType}`);
  }

  const input = {
    path,
    docsDir,
    locale,
    feedback,
    diagramming,
    labels,
  };

  const fnMap = {
    addDiagram,
    updateDiagram,
    deleteDiagram,
  };

  if (fnMap[intentType]) {
    const result = await fnMap[intentType](input, options);
    return result;
  }

  throw new Error(`Unsupported intent type: ${intentType}`);
}

handleDiagramOperations.task_render_mode = "hide";
