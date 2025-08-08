import { saveDocWithTranslations } from "../utils/utils.mjs";

export default async function saveSingleDoc({
  path,
  content,
  docsDir,
  translates,
  labels,
  locale,
  isTranslate = false,
  isShowMessage = false,
}) {
  const results = await saveDocWithTranslations({
    path,
    content,
    docsDir,
    translates,
    labels,
    locale,
    isTranslate,
  });

  if (isShowMessage) {
    const message = isTranslate
      ? `✅ Translation completed successfully`
      : `✅ Document updated successfully`;
    return { message };
  }

  return {};
}
