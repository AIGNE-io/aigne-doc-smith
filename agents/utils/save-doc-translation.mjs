import { saveDocTranslation as _saveDocTranslation } from "../../utils/utils.mjs";

export default async function saveDocTranslations({
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

  if (isShowMessage) {
    const message = `✅ Translation completed successfully.`;
    return { message };
  }

  return {};
}

saveDocTranslations.task_render_mode = "hide";
