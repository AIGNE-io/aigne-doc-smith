/**
 * Conditionally call translateDocument agent
 * If translation is already set and approved (--diagram mode with existing translation), skip calling translateDocument
 * Otherwise, call translateDocument agent normally (including --diagram mode when translation doesn't exist)
 */
export default async function translateDocumentWrapper(input, options) {
  // If translation is already set and approved, skip document translation
  // This happens in --diagram mode when translation document exists (translate-diagram-images.mjs sets isApproved: true)
  // In --diagram mode when translation doesn't exist, translate-diagram-images.mjs sets isApproved: false to allow translation
  if (input.translation !== undefined && input.translation !== null && input.isApproved === true) {
    return input;
  }

  // Otherwise, call translateDocument agent (YAML-defined AI agent)
  const translateAgent = options.context?.agents?.["translateDocument"];
  if (!translateAgent) {
    throw new Error("translateDocument agent not found");
  }

  try {
    const result = await options.context.invoke(translateAgent, input);
    return {
      ...input,
      ...result,
      translation: result?.translation || result,
      // Preserve shouldTranslateDiagramsOnly flag
      shouldTranslateDiagramsOnly: input.shouldTranslateDiagramsOnly,
    };
  } catch (error) {
    throw new Error(`Failed to invoke translateDocument agent: ${error.message}`);
  }
}

translateDocumentWrapper.task_render_mode = "hide";
