import { debug } from "../../utils/debug.mjs";
import { d2CodeBlockRegex, diagramImageFullRegex } from "../../utils/d2-utils.mjs";

/**
 * Replace cached diagram images in translated document and set reviewContent
 * This step runs after translate-document-wrapper.mjs to:
 * 1. Insert cached image translations into the translated document
 * 2. Set reviewContent from the final translation
 * Note: Each document has at most one diagram image
 */
export default async function setReviewContent(input) {
  let translation = input.translation || "";
  const cachedImages = input.cachedDiagramImages || null;

  // Replace cached diagram image if any (each document has at most one image)
  if (cachedImages && cachedImages.length > 0) {
    try {
      const cachedImage = cachedImages[0]; // Only one image per document

      // Find existing image in translated content
      // Note: Translation process may copy content from main document, so we always need to
      // replace with cached image to ensure the final document uses the correct language-specific image
      const imageMatch = translation.match(diagramImageFullRegex);

      if (imageMatch) {
        translation = translation.replace(diagramImageFullRegex, cachedImage.translatedMarkdown);
        debug(`✅ Replaced diagram image in translation with language-specific image`);
      } else {
        const d2Match = translation.match(d2CodeBlockRegex);
        if (d2Match) {
          translation = translation.replace(d2CodeBlockRegex, cachedImage.translatedMarkdown);
          debug(`✅ Replaced D2 code block in translation with language-specific image`);
        } else {
          // No existing image, insert at the position from main document
          const insertIndex = Math.min(cachedImage.mainImageIndex, translation.length);
          translation =
            translation.slice(0, insertIndex) +
            "\n\n" +
            cachedImage.translatedMarkdown +
            "\n\n" +
            translation.slice(insertIndex);
          debug(`✅ Inserted diagram image at index ${insertIndex}`);
        }
      }
    } catch (error) {
      debug(`⚠️  Failed to replace cached diagram image: ${error.message}`);
      // Continue with original translation if replacement fails
    }
  }

  return {
    ...input,
    translation,
    reviewContent: translation || input.content || "",
  };
}

setReviewContent.task_render_mode = "hide";
