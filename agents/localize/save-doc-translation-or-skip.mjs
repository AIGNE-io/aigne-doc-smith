/**
 * Save translated document or skip if --diagram flag is set
 */
export default async function saveDocTranslationOrSkip(input, options) {
  // Skip saving if --diagram flag is set (only translating images)
  if (input.shouldTranslateDiagramsOnly) {
    return {};
  }

  // Otherwise, proceed with normal save
  const saveDocTranslationAgent = options.context?.agents?.["saveDocTranslation"];
  if (saveDocTranslationAgent) {
    return await options.context.invoke(saveDocTranslationAgent, input);
  }

  return {};
}

saveDocTranslationOrSkip.task_render_mode = "hide";
