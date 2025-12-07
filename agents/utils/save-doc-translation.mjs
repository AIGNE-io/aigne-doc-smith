import { saveDocTranslation as _saveDocTranslation } from "../../utils/utils.mjs";
import { readFileContent } from "../../utils/docs-finder-utils.mjs";
import { getFileName } from "../../utils/utils.mjs";
import { debug } from "../../utils/debug.mjs";
import { syncDiagramToTranslations } from "../../utils/sync-diagram-to-translations.mjs";

export default async function saveDocTranslation({
  path,
  docsDir,
  translation,
  language,
  labels,
  isShowMessage = false,
  locale,
}) {
  await _saveDocTranslation({
    path,
    docsDir,
    language,
    translation,
    labels,
  });

  // Sync diagram images from main document to translations
  // This ensures all images (including diagrams) in the main document are synced to translation files
  if (path && docsDir && locale) {
    try {
      // Read main document content (it should already be saved)
      const mainFileName = getFileName(path, locale);
      const mainContent = await readFileContent(docsDir, mainFileName);

      if (mainContent) {
        const syncResult = await syncDiagramToTranslations(
          mainContent,
          path,
          docsDir,
          locale,
          "sync",
        );

        if (syncResult.updated > 0) {
          debug(
            `✅ Synced diagram images to ${syncResult.updated} translation file(s) after translation`,
          );
        }
      }
    } catch (error) {
      // Don't fail the translation if sync fails
      debug(`⚠️  Failed to sync diagram images after translation: ${error.message}`);
    }
  }

  if (isShowMessage) {
    const message = `✅ Translation completed successfully.`;
    return { message };
  }

  return {};
}

saveDocTranslation.task_render_mode = "hide";
