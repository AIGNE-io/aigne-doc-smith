import { readFileContent } from "../../utils/docs-finder-utils.mjs";
import { getFileName } from "../../utils/utils.mjs";
import { debug } from "../../utils/debug.mjs";
import { cacheDiagramImagesForTranslation } from "../../utils/translate-diagram-images.mjs";

/**
 * Translate diagram images for translation documents
 * Called during translate operation to cache image translation info when needed
 * This agent is called BEFORE translate-document-wrapper.mjs to cache image info
 * @param {Object} input - Input parameters
 * @param {string} input.path - Document path
 * @param {string} input.docsDir - Documentation directory
 * @param {string} input.locale - Main language locale
 * @param {boolean} input.shouldTranslateDiagramsOnly - Whether to translate diagrams only (from --diagram flag)
 * @param {string} input.language - Current language being translated
 * @param {Object} options - Options with context for invoking agents
 * @returns {Promise<Object>} - Result object with cached image info
 */
export default async function translateDiagramImagesAgent(input, options) {
  // Extract parameters from input
  const docPath = input.path;
  const docsDir = input.docsDir;
  const locale = input.locale || "en";
  const currentLanguage = input.language;
  const shouldTranslateDiagramsOnly = input.shouldTranslateDiagramsOnly || false;

  if (!docPath || !docsDir || !currentLanguage) {
    debug(
      "⚠️  Missing required parameters for diagram image translation (path, docsDir, or language)",
    );
    debug(`  - path: ${docPath}`);
    debug(`  - docsDir: ${docsDir}`);
    debug(`  - language: ${currentLanguage}`);
    return { ...input, cachedDiagramImages: null };
  }

  try {
    // Read main document content
    const mainFileName = getFileName(docPath, locale);
    const mainContent = await readFileContent(docsDir, mainFileName);

    if (!mainContent) {
      debug(`⚠️  Could not read main document: ${mainFileName}`);
      return { ...input, cachedDiagramImages: null };
    }

    // Read current translation file content (if exists) to check timestamps
    const translationFileName = getFileName(docPath, currentLanguage);
    const translationContent = await readFileContent(docsDir, translationFileName);

    // Cache diagram images for translation
    // This function will:
    // 1. If --diagram flag is set, always translate images
    // 2. Otherwise, check if main document image timestamps match translation document timestamps
    // 3. Cache the image info that needs to be inserted into translated document
    const cachedImages = await cacheDiagramImagesForTranslation(
      mainContent,
      translationContent || "",
      docPath,
      docsDir,
      locale,
      currentLanguage,
      options,
      shouldTranslateDiagramsOnly,
    );

    if (cachedImages && cachedImages.length > 0) {
      debug(`✅ Cached ${cachedImages.length} diagram image(s) for ${currentLanguage}`);
    } else {
      debug(`ℹ️  No diagram images need translation for ${currentLanguage}`);
    }

    return {
      ...input,
      cachedDiagramImages: cachedImages || null,
    };
  } catch (error) {
    // Don't fail the translation if image translation fails
    debug(`⚠️  Failed to cache diagram images: ${error.message}`);
    return { ...input, cachedDiagramImages: null };
  }
}

translateDiagramImagesAgent.task_render_mode = "hide";
