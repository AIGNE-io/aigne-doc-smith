import { readdirSync } from "node:fs";
import { readFileContent } from "./docs-finder-utils.mjs";
import { debug } from "./debug.mjs";
import path from "node:path";
import fs from "fs-extra";

// Note: .* matches title or other text after ```d2 (e.g., ```d2 Vault 驗證流程)
const d2CodeBlockRegex = /```d2.*\n([\s\S]*?)```/g;
const diagramImageRegex =
  /<!--\s*DIAGRAM_IMAGE_START:[^>]+-->\s*!\[[^\]]*\]\(([^)]+)\)\s*<!--\s*DIAGRAM_IMAGE_END\s*-->/g;

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

    // Filter files to find translation files matching the pattern
    for (const file of files) {
      if (
        file.startsWith(`${flatName}.`) &&
        file.endsWith(".md") &&
        file !== `${flatName}.md` &&
        file.match(/\.\w+(-\w+)?\.md$/)
      ) {
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

  // Reset regex lastIndex
  diagramImageRegex.lastIndex = 0;

  let match = diagramImageRegex.exec(content);
  while (match !== null) {
    images.push({
      path: match[1],
      fullMatch: match[0],
      index: match.index,
    });
    match = diagramImageRegex.exec(content);
  }

  return images;
}

/**
 * Replace diagram images in translation files
 * @param {string} mainContent - Main document content (already updated)
 * @param {string} docPath - Document path
 * @param {string} docsDir - Documentation directory
 * @param {string} locale - Main language locale
 * @returns {Promise<{updated: number, skipped: number, errors: Array}>} - Sync result
 */
export async function syncDiagramToTranslations(mainContent, docPath, docsDir, locale = "en") {
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

  // If no diagrams in main content, nothing to sync
  if (mainImages.length === 0) {
    debug("ℹ️  No diagram images in main content, skipping sync");
    return result;
  }

  // Process each translation file
  for (const { fileName } of translationFiles) {
    try {
      const translationFilePath = path.join(docsDir, fileName);
      const translationContent = await readFileContent(docsDir, fileName);

      if (!translationContent) {
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

      // Strategy 3: If translation has fewer images than main, add missing ones
      // (This handles cases where new diagrams were added)
      const finalTranslationImages = extractDiagramImagePaths(updatedContent); // Re-extract after all replacements
      if (finalTranslationImages.length < mainImages.length) {
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
