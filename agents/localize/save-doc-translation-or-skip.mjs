/**
 * Save translated document
 * Always saves the translation content, regardless of --diagram flag.
 * In --diagram mode, the translation content may only have updated diagram images,
 * but it still needs to be saved to persist the image changes.
 */
export default async function saveDocTranslationOrSkip(input, options) {
  // Always save translation content, whether it's a full translation or just diagram image updates
  // The translation content (from set-review-content.mjs) already contains the updated diagram images
  const saveDocTranslationAgent = options.context?.agents?.["saveDocTranslation"];
  if (saveDocTranslationAgent) {
    return await options.context.invoke(saveDocTranslationAgent, input);
  }

  return {};
}

saveDocTranslationOrSkip.task_render_mode = "hide";
