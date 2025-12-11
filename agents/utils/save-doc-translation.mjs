import { saveDocTranslation as _saveDocTranslation } from "../../utils/utils.mjs";

export default async function saveDocTranslation({
  path,
  docsDir,
  translation,
  language,
  labels,
  isShowMessage = false,
}) {
  await _saveDocTranslation({
    path,
    docsDir,
    language,
    translation,
    labels,
  });

  // Note: Diagram image translation is now handled by translate-diagram-images.mjs
  // in the translate workflow, which compares timestamps and only translates when needed

  if (isShowMessage) {
    const message = `✅ Translation completed successfully.`;
    return { message };
  }

  return {};
}

saveDocTranslation.task_render_mode = "hide";
