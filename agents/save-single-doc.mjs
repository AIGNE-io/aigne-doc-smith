import { saveDocWithTranslations } from "../utils/utils.mjs";

export default async function saveSingleDoc({
  path,
  content,
  docsDir,
  translates,
  labels,
  locale,
}) {
  const results = await saveDocWithTranslations({
    path,
    content,
    docsDir,
    translates,
    labels,
    locale,
  });
  return {};
}
