/**
 * Conditionally call translateDocument agent
 * If translation is already set (--diagram mode), skip calling translateDocument
 * Otherwise, call translateDocument agent normally
 */
export default async function translateDocumentWrapper(input, options) {
  // If translation is already set (by translate-or-skip-diagram when --diagram flag is set), skip
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
