import { readdirSync } from "node:fs";
import { readFileContent } from "./docs-finder-utils.mjs";
import { debug } from "./debug.mjs";
import path from "node:path";
import fs from "fs-extra";
import { d2CodeBlockRegex, diagramImageWithPathRegex } from "./d2-utils.mjs";

/**
 * Find all translation files for a document
 * @param {string} docPath - Document path (e.g., "/guides/getting-started")
 * @param {string} docsDir - Documentation directory
 * @param {string} locale - Main language locale (e.g., "en")
 * @returns {Promise<Array<{language: string, fileName: string}>>} - Array of translation file info
 */
async function findTranslationFiles(docPath, docsDir, locale) {
  // Convert path to flat filename format
  const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");

  try {
    const files = readdirSync(docsDir);
    const translationFiles = [];
    const mainFileName = locale === "en" ? `${flatName}.md` : `${flatName}.${locale}.md`;

    // Filter files to find translation files matching the pattern
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      if (file === mainFileName) continue; // Skip main language file

      // Case 1: File without language suffix (xxx.md) - this is English translation when main language is not English
      if (file === `${flatName}.md` && locale !== "en") {
        translationFiles.push({
          language: "en",
          fileName: file,
        });
        continue;
      }

      // Case 2: File with language suffix (xxx.{lang}.md) - all other translations
      if (file.startsWith(`${flatName}.`) && file.match(/\.\w+(-\w+)?\.md$/)) {
        const langMatch = file.match(/\.(\w+(-\w+)?)\.md$/);
        if (langMatch && langMatch[1] !== locale) {
          translationFiles.push({
            language: langMatch[1],
            fileName: file,
          });
        }
      }
    }

    return translationFiles;
  } catch (error) {
    debug(`⚠️  Could not read translation files from ${docsDir}: ${error.message}`);
    return [];
  }
}

/**
 * Extract diagram image paths from content
 * @param {string} content - Document content
 * @returns {Array<{path: string, fullMatch: string, index: number}>} - Array of diagram image info
 */
function extractDiagramImagePaths(content) {
  const images = [];
  const matches = Array.from((content || "").matchAll(diagramImageWithPathRegex));

  for (const match of matches) {
    images.push({
      path: match[4] || "",
      fullMatch: match[0] || "",
      index: match.index,
    });
  }

  return images;
}

/**
 * Replace diagram images in translation files
 * @param {string} mainContent - Main document content (already updated)
 * @param {string} docPath - Document path
 * @param {string} docsDir - Documentation directory
 * @param {string} locale - Main language locale
 * @param {string} operationType - Operation type: "delete", "add", "update", or "sync" (default)
 * @returns {Promise<{updated: number, skipped: number, errors: Array}>} - Sync result
 */
export async function syncDiagramToTranslations(
  mainContent,
  docPath,
  docsDir,
  locale = "en",
  operationType = "sync",
) {
  const result = {
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Find all translation files
  const translationFiles = await findTranslationFiles(docPath, docsDir, locale);

  if (translationFiles.length === 0) {
    debug("ℹ️  No translation files found, skipping sync");
    return result;
  }

  // Extract diagram images from updated main content
  const mainImages = extractDiagramImagePaths(mainContent);

  // If no diagrams in main content and operation is not delete, skip sync
  // For delete operations, we need to process translations even if main has 0 diagrams
  // to remove diagrams from translation files
  if (mainImages.length === 0 && operationType !== "delete") {
    debug("ℹ️  No diagram images in main content, skipping sync");
    return result;
  }

  // Process each translation file
  for (const { fileName } of translationFiles) {
    try {
      const translationFilePath = path.join(docsDir, fileName);
      const translationContent = await readFileContent(docsDir, fileName);

      // Check for null or undefined (file read failure), but allow empty string (valid content)
      if (translationContent === null || translationContent === undefined) {
        debug(`⚠️  Could not read translation file: ${fileName}`);
        result.skipped++;
        continue;
      }

      let hasChanges = false;
      let updatedContent = translationContent;

      // Strategy 1: Replace D2 code blocks with AI images (if main doc switched from D2 to AI)
      const translationD2Blocks = Array.from(translationContent.matchAll(d2CodeBlockRegex));
      if (translationD2Blocks.length > 0 && mainImages.length > 0) {
        // If main doc has AI images and translation has D2 blocks, replace them by index
        for (let i = 0; i < Math.min(translationD2Blocks.length, mainImages.length); i++) {
          const d2Match = translationD2Blocks[i];
          const mainImage = mainImages[i];

          if (d2Match && mainImage) {
            // Replace D2 block with AI image from main doc
            updatedContent = updatedContent.replace(d2Match[0], mainImage.fullMatch);
            hasChanges = true;
            debug(`🔄 Replaced D2 block with AI image in ${fileName} (index ${i})`);
          }
        }
      }

      // Strategy 2: Replace old image paths with new ones (if paths changed)
      const translationImages = extractDiagramImagePaths(updatedContent); // Re-extract after D2 replacement
      if (mainImages.length > 0) {
        for (let i = 0; i < Math.min(translationImages.length, mainImages.length); i++) {
          const translationImage = translationImages[i];
          const mainImage = mainImages[i];

          // If image path changed, update it
          if (translationImage && mainImage && translationImage.path !== mainImage.path) {
            // Replace old image path with new one (escape special regex characters)
            const escapedPath = translationImage.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const oldImagePattern = new RegExp(
              `<!--\\s*DIAGRAM_IMAGE_START:[^>]+-->\\s*!\\[[^\\]]*\\]\\(${escapedPath}\\)\\s*<!--\\s*DIAGRAM_IMAGE_END\\s*-->`,
              "g",
            );
            updatedContent = updatedContent.replace(oldImagePattern, mainImage.fullMatch);
            hasChanges = true;
            debug(
              `🔄 Updated image path in ${fileName} (index ${i}): ${translationImage.path} -> ${mainImage.path}`,
            );
          }
        }
      }

      // Strategy 3: If translation has fewer images than main, add missing ones
      // (This handles cases where new diagrams were added)
      let finalTranslationImages = extractDiagramImagePaths(updatedContent); // Re-extract after all replacements
      if (mainImages.length > 0 && finalTranslationImages.length < mainImages.length) {
        // Find the last diagram position in updated content
        const lastDiagramIndex =
          finalTranslationImages.length > 0
            ? finalTranslationImages[finalTranslationImages.length - 1].index +
              finalTranslationImages[finalTranslationImages.length - 1].fullMatch.length
            : updatedContent.length;

        // Add missing images after the last diagram
        const missingImages = mainImages.slice(finalTranslationImages.length);
        const imagesToAdd = missingImages.map((img) => img.fullMatch).join("\n\n");

        updatedContent =
          updatedContent.slice(0, lastDiagramIndex) +
          "\n\n" +
          imagesToAdd +
          "\n\n" +
          updatedContent.slice(lastDiagramIndex);
        hasChanges = true;
        debug(`➕ Added ${missingImages.length} missing diagram(s) to ${fileName}`);
        // Re-extract after adding images
        finalTranslationImages = extractDiagramImagePaths(updatedContent);
      }

      // Strategy 4: If translation has more images than main, remove excess ones
      // (This handles cases where diagrams were deleted from main document, including all diagrams)
      if (finalTranslationImages.length > mainImages.length) {
        // Remove excess images from translation (keep only the first N images matching main)
        // Process from end to start to preserve indices
        const excessCount = finalTranslationImages.length - mainImages.length;
        for (let i = finalTranslationImages.length - 1; i >= mainImages.length; i--) {
          const imageToRemove = finalTranslationImages[i];
          const before = updatedContent.substring(0, imageToRemove.index);
          const after = updatedContent.substring(
            imageToRemove.index + imageToRemove.fullMatch.length,
          );
          // Remove the image and clean up extra newlines
          updatedContent = `${before.replace(/\n+$/, "")}\n${after.replace(/^\n+/, "")}`;
          hasChanges = true;
        }
        debug(`➖ Removed ${excessCount} excess diagram(s) from ${fileName}`);
      }

      // Strategy 5: Remove D2 code blocks from translation if main has no diagrams
      // (This handles cases where all diagrams were deleted from main document)
      if (mainImages.length === 0) {
        // Re-extract D2 blocks from updated content (in case some were already replaced)
        const remainingD2Blocks = Array.from(updatedContent.matchAll(d2CodeBlockRegex));
        if (remainingD2Blocks.length > 0) {
          // Remove all D2 code blocks from translation
          // Process from end to start to preserve indices
          for (let i = remainingD2Blocks.length - 1; i >= 0; i--) {
            const d2Match = remainingD2Blocks[i];
            const before = updatedContent.substring(0, d2Match.index);
            const after = updatedContent.substring(d2Match.index + d2Match[0].length);
            // Remove the D2 block and clean up extra newlines
            updatedContent = `${before.replace(/\n+$/, "")}\n${after.replace(/^\n+/, "")}`;
            hasChanges = true;
          }
          // Clean up extra newlines
          updatedContent = updatedContent.replace(/\n{3,}/g, "\n\n");
          debug(`➖ Removed ${remainingD2Blocks.length} D2 code block(s) from ${fileName}`);
        }
      }

      // Save updated translation file if there were changes
      if (hasChanges) {
        await fs.writeFile(translationFilePath, updatedContent, "utf8");
        result.updated++;
        debug(`✅ Synced diagram images to ${fileName}`);
      } else {
        result.skipped++;
        debug(`⏭️  No changes needed for ${fileName}`);
      }
    } catch (error) {
      debug(`❌ Error syncing diagram to ${fileName}: ${error.message}`);
      result.errors.push({
        file: fileName,
        error: error.message,
      });
    }
  }

  return result;
}
