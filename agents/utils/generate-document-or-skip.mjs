/**
 * Conditionally call generateDocument. If we already have content for diagram-only intents,
 * skip LLM generation and pass through the existing content.
 */
export default async function generateDocumentOrSkip(input, options) {
  const { intentType, content, skipGenerateDocument } = input;

  const isDiagramIntent = intentType && ["addDiagram", "updateDiagram", "deleteDiagram"].includes(intentType);
  const shouldSkip = Boolean(skipGenerateDocument || (isDiagramIntent && content));

  if (shouldSkip) {
    // Return the existing content and mark the generation as skipped
    return {
      ...input,
      content,
      documentContent: content,
      originalContent: content,
      reviewContent: content,
    };
  }

  const generateAgent = options.context?.agents?.["generateDocument"];
  if (!generateAgent) {
    throw new Error("generateDocument agent not found");
  }

  const result = await options.context.invoke(generateAgent, input);
  const generatedContent = result?.content ?? result;

  return {
    ...input,
    ...result,
    content: generatedContent,
    documentContent: generatedContent,
    originalContent: generatedContent,
    reviewContent: generatedContent,
  };
}

generateDocumentOrSkip.task_render_mode = "hide";
