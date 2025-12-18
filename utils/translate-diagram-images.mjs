import { readFileContent } from "./docs-finder-utils.mjs";
import { debug } from "./debug.mjs";
import path from "node:path";
import fs from "fs-extra";
import { copyFile } from "node:fs/promises";
import { diagramImageFullRegex } from "./d2-utils.mjs";
import { calculateImageTimestamp } from "./diagram-version-utils.mjs";
import { getFileName } from "./utils.mjs";
import { compressImage } from "./image-compress.mjs";
import { pathExists } from "./file-utils.mjs";

// Constants
const DEFAULT_DIAGRAM_TYPE = "architecture";
const DEFAULT_ASPECT_RATIO = "16:9";
const DEFAULT_ALT_TEXT = "Diagram";
const DEFAULT_IMAGE_QUALITY = 85;
const DEFAULT_IMAGE_SIZE = "1K";
const DEFAULT_MIME_TYPE = "image/jpeg";

/**
 * Find translation files for a document, filtered by selected languages
 * @param {string} docPath - Document path (e.g., "/guides/getting-started")
 * @param {string} docsDir - Documentation directory
 * @param {string} locale - Main language locale (e.g., "en")
 * @param {Array<string>} selectedLanguages - Array of selected language codes to translate (e.g., ["zh", "ja"])
 * @returns {Promise<Array<{language: string, fileName: string}>>} - Array of translation file info
 */
async function findTranslationFiles(docPath, docsDir, locale, selectedLanguages = null) {
  // Convert path to flat filename format
  const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");

  try {
    const files = await fs.readdir(docsDir);
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
          const fileLanguage = langMatch[1];
          // If selectedLanguages is provided, only include files for selected languages
          if (selectedLanguages === null || selectedLanguages.includes(fileLanguage)) {
            translationFiles.push({
              language: fileLanguage,
              fileName: file,
            });
          }
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
 * Extract diagram images with timestamp from content
 * Supports both new format (with timestamp) and old format (without timestamp)
 * Uses a single regex to extract all information in one pass
 * @param {string} content - Document content
 * @returns {Array<{type: string, aspectRatio: string, timestamp: string|null, path: string, altText: string, fullMatch: string, index: number}>} - Array of diagram image info
 */
function extractDiagramImagesWithTimestamp(content) {
  const images = [];

  // Use unified regex to match both old and new formats in one pass
  // Captures: type, aspectRatio, optional timestamp, altText, path, fullMatch
  const matches = Array.from((content || "").matchAll(diagramImageFullRegex));
  for (const match of matches) {
    images.push({
      type: match[1] || DEFAULT_DIAGRAM_TYPE, // Diagram type (e.g., "architecture", "guide")
      aspectRatio: match[2] || DEFAULT_ASPECT_RATIO, // Aspect ratio (e.g., "16:9", "4:3")
      timestamp: (match[3] || "").replace(/^:/, ""), // Timestamp without leading colon (null for old format)
      altText: match[4] || DEFAULT_ALT_TEXT, // Alt text from markdown
      path: match[5] || "", // Image path
      fullMatch: match[0] || "", // Full matched block
      index: match.index || 0, // Position in document
    });
  }

  // Sort by position in document
  images.sort((a, b) => a.index - b.index);

  return images;
}

/**
 * Convert diagram info to mediaFile format for image generation
 * @param {Object} diagramInfo - Diagram info with path
 * @param {string} docPath - Document path
 * @param {string} docsDir - Documentation directory
 * @returns {Promise<Object|null>} - MediaFile object or null if file doesn't exist
 */
async function convertDiagramInfoToMediaFile(diagramInfo, docPath, docsDir) {
  if (!diagramInfo || !diagramInfo.path) {
    return null;
  }

  try {
    const imagePath = diagramInfo.path;

    // Resolve absolute path
    let absolutePath;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      // Remote URL, cannot convert to local file
      return null;
    } else if (path.isAbsolute(imagePath)) {
      absolutePath = imagePath;
    } else {
      // Relative path resolution:
      // - If path starts with "../", it's relative to the document directory
      // - Otherwise, it's relative to docsDir (e.g., "assets/diagram/...")
      if (imagePath.startsWith("../")) {
        // Relative to document directory
        const docDir = path.dirname(docPath);
        const imageRelativePath = path.join(docDir, imagePath).replace(/\\/g, "/");
        absolutePath = path.join(process.cwd(), docsDir, imageRelativePath);
      } else {
        // Relative to docsDir (most common case: "assets/diagram/...")
        absolutePath = path.join(process.cwd(), docsDir, imagePath);
      }
    }

    // Normalize path
    const normalizedPath = path.normalize(absolutePath);

    // Check if file exists
    if (!(await fs.pathExists(normalizedPath))) {
      return null;
    }

    // Get file extension for mimeType detection
    const ext = path.extname(normalizedPath).toLowerCase();
    let mimeType = DEFAULT_MIME_TYPE;
    if (ext === ".png") mimeType = "image/png";
    else if (ext === ".gif") mimeType = "image/gif";
    else if (ext === ".webp") mimeType = "image/webp";

    return {
      type: "local",
      path: normalizedPath,
      filename: path.basename(normalizedPath),
      mimeType,
    };
  } catch (error) {
    debug(`Failed to convert diagram info to mediaFile: ${error.message}`);
    return null;
  }
}

/**
 * Generate translated image filename with language suffix
 * @param {string} originalPath - Original image path (e.g., "assets/diagram/overview-diagram-0.jpg")
 * @param {string} language - Target language code (e.g., "zh")
 * @returns {string} - Translated image path (e.g., "assets/diagram/overview-diagram-0.zh.jpg")
 */
function generateTranslatedImagePath(originalPath, language) {
  const pathParts = originalPath.split(".");
  if (pathParts.length < 2) {
    // No extension, just append language
    return `${originalPath}.${language}`;
  }
  // Insert language before extension
  const ext = pathParts.pop();
  const base = pathParts.join(".");
  return `${base}.${language}.${ext}`;
}

/**
 * Compress and copy generated image to target location
 * Tries compression first, falls back to copying if compression fails
 * @param {Object} generatedImage - Generated image object with path
 * @param {string} targetPath - Target absolute path for the image
 * @param {string} fileName - Translation file name for error reporting
 * @returns {Promise<void>}
 */
async function compressAndCopyImage(generatedImage, targetPath, fileName = null) {
  try {
    const compressedPath = await compressImage(generatedImage.path, {
      quality: DEFAULT_IMAGE_QUALITY,
      outputPath: targetPath,
    });

    if (compressedPath === generatedImage.path) {
      // Compression failed, copy original
      await copyFile(generatedImage.path, targetPath);
    }
  } catch (error) {
    console.error(`copy original image ${fileName} to ${targetPath}`);
    debug(`copy original image ${fileName} to ${targetPath}`, error);
    await copyFile(generatedImage.path, targetPath);
  }
}

async function ensureImageTimestamp(imageInfo, docPath, docsDir) {
  if (imageInfo.timestamp) {
    return imageInfo.timestamp;
  }

  const existingImage = await convertDiagramInfoToMediaFile(
    { path: imageInfo.path },
    docPath,
    docsDir,
  );

  return existingImage
    ? await calculateImageTimestamp(existingImage.path)
    : Math.floor(Date.now() / 1000).toString();
}

function createImageMarkdown(diagramType, aspectRatio, timestamp, altText, imagePath) {
  const type = diagramType || DEFAULT_DIAGRAM_TYPE;
  const ratio = aspectRatio || DEFAULT_ASPECT_RATIO;
  const alt = altText || DEFAULT_ALT_TEXT;
  const timestampPart = timestamp ? `:${timestamp}` : "";
  return `<!-- DIAGRAM_IMAGE_START:${type}:${ratio}${timestampPart} -->\n![${alt}](${imagePath})\n<!-- DIAGRAM_IMAGE_END -->`;
}

const processedDocuments = new Set();

/**
 * Translate diagram images for translation documents
 * Only translates images when timestamp differs between main and translation documents
 * If main document images don't have timestamp (old format), generates timestamps and updates both main and translation documents
 * @param {string} mainContent - Main document content (with timestamp in markers)
 * @param {string} docPath - Document path
 * @param {string} docsDir - Documentation directory
 * @param {string} locale - Main language locale
 * @param {Object} options - Options object with context for invoking agents
 * @param {Array<string>} selectedLanguages - Selected languages to translate
 * @returns {Promise<{updated: number, skipped: number, errors: Array, mainContentUpdated: string|null}>} - Translation result with updated main content
 */
export async function translateDiagramImages(
  mainContent,
  docPath,
  docsDir,
  locale = "en",
  options = {},
  selectedLanguages = null,
) {
  // Avoid duplicate processing when called multiple times in iterate_on context
  const documentKey = `${docPath}:${docsDir}:${locale}`;
  if (processedDocuments.has(documentKey)) {
    debug(`⏭️  Diagram images for ${docPath} already processed, skipping`);
    return { updated: 0, skipped: 0, errors: [] };
  }
  processedDocuments.add(documentKey);

  const result = {
    updated: 0,
    skipped: 0,
    errors: [],
    mainContentUpdated: null, // Will contain updated main content if timestamps were added
  };

  try {
    // Find translation files, filtered by selected languages
    const translationFiles = await findTranslationFiles(
      docPath,
      docsDir,
      locale,
      selectedLanguages,
    );

    if (translationFiles.length === 0) {
      debug("ℹ️  No translation files found, skipping image translation");
      return result;
    }

    const mainImages = extractDiagramImagesWithTimestamp(mainContent);
    let updatedMainContent = mainContent;
    let mainContentNeedsUpdate = false;

    if (mainImages.length === 0) {
      debug("ℹ️  No diagram images in main content, skipping translation");
      return result;
    }

    for (let i = 0; i < mainImages.length; i++) {
      const mainImage = mainImages[i];
      if (!mainImage.timestamp) {
        const newTimestamp = await ensureImageTimestamp(mainImage, docPath, docsDir);
        mainImages[i] = { ...mainImage, timestamp: newTimestamp };
        updatedMainContent = updatedMainContent.replace(
          mainImage.fullMatch,
          createImageMarkdown(
            mainImage.type,
            mainImage.aspectRatio,
            newTimestamp,
            mainImage.altText,
            mainImage.path,
          ),
        );
        mainContentNeedsUpdate = true;
      }
    }

    if (mainContentNeedsUpdate) {
      const mainFileName = getFileName(docPath, locale);
      await fs.writeFile(path.join(docsDir, mainFileName), updatedMainContent, "utf8");
      result.mainContentUpdated = updatedMainContent;
      debug(`✅ Updated main document with timestamps: ${mainFileName}`);
    }
    for (const { language, fileName } of translationFiles) {
      try {
        const translationFilePath = path.join(docsDir, fileName);

        // Check if translation file exists before reading to avoid unnecessary warnings
        const fileExists = await pathExists(translationFilePath);
        if (!fileExists) {
          debug(`ℹ️  Translation file does not exist yet: ${fileName} (skipping)`);
          result.skipped++;
          continue;
        }

        const translationContent = await readFileContent(docsDir, fileName);

        if (translationContent === null || translationContent === undefined) {
          debug(`⚠️  Could not read translation file: ${fileName}`);
          result.skipped++;
          continue;
        }

        const translationImages = extractDiagramImagesWithTimestamp(translationContent);
        let hasChanges = false;
        let updatedContent = translationContent;
        for (let i = 0; i < mainImages.length; i++) {
          const mainImage = mainImages[i];
          const translationImage = translationImages[i];

          const translationImagePath = translationImage?.path || "";
          const hasLanguageSuffix =
            translationImagePath.includes(`.${language}.`) ||
            translationImagePath.endsWith(`.${language}`);

          const needsTranslation =
            mainImage &&
            (!translationImage ||
              !hasLanguageSuffix ||
              !translationImage.timestamp ||
              translationImage.timestamp !== mainImage.timestamp);

          if (!needsTranslation) {
            continue;
          }

          const existingImage = await convertDiagramInfoToMediaFile(
            { path: mainImage.path },
            docPath,
            docsDir,
          );

          if (!existingImage) {
            debug(
              `⏭️  Main image not found: ${mainImage.path}, skipping translation for ${language}`,
            );
            continue;
          }

          try {
            const translateDiagramAgent = options.context?.agents?.["translateDiagram"];
            if (!translateDiagramAgent) {
              debug(`⚠️  translateDiagram agent not found, skipping translation`);
              result.errors.push({
                file: fileName,
                imageIndex: i,
                error: "translateDiagram agent not found",
              });
              continue;
            }

            // Call translateDiagram agent with translation parameters
            const imageResult = await options.context.invoke(translateDiagramAgent, {
              existingImage: [existingImage], // Pass the main document image for translation
              ratio: mainImage.aspectRatio || DEFAULT_ASPECT_RATIO, // Aspect ratio from main image
              size: DEFAULT_IMAGE_SIZE, // Image clarity/size
              locale: language, // Target language code for translation
            });

            let generatedImage = null;
            if (
              imageResult?.images &&
              Array.isArray(imageResult.images) &&
              imageResult.images.length > 0
            ) {
              generatedImage = imageResult.images[0];
            } else if (imageResult?.image || imageResult?.imageUrl || imageResult?.path) {
              generatedImage = {
                path: imageResult.image || imageResult.imageUrl || imageResult.path,
                filename: path.basename(
                  imageResult.image || imageResult.imageUrl || imageResult.path,
                ),
                mimeType: imageResult.mimeType || DEFAULT_MIME_TYPE,
                type: "local",
              };
            }

            if (!generatedImage) {
              debug(`⚠️  No image generated for ${language} diagram ${i}`);
              result.errors.push({
                file: fileName,
                imageIndex: i,
                error: "No image generated from agent",
              });
              continue;
            }

            const translatedImagePath = generateTranslatedImagePath(mainImage.path, language);
            const translatedImageAbsolutePath = path.join(
              process.cwd(),
              docsDir,
              translatedImagePath,
            );
            await fs.ensureDir(path.dirname(translatedImageAbsolutePath));
            await compressAndCopyImage(generatedImage, translatedImageAbsolutePath, fileName);

            const altText = translationImage?.altText || mainImage.altText || DEFAULT_ALT_TEXT;
            const newImageMarkdown = createImageMarkdown(
              mainImage.type,
              mainImage.aspectRatio,
              mainImage.timestamp,
              altText,
              translatedImagePath,
            );

            if (translationImage) {
              updatedContent = updatedContent.replace(translationImage.fullMatch, newImageMarkdown);
            } else {
              const lastImageIndex =
                translationImages.length > 0
                  ? translationImages[translationImages.length - 1].index +
                    translationImages[translationImages.length - 1].fullMatch.length
                  : updatedContent.length;
              updatedContent =
                updatedContent.slice(0, lastImageIndex) +
                "\n\n" +
                newImageMarkdown +
                "\n\n" +
                updatedContent.slice(lastImageIndex);
            }

            hasChanges = true;
          } catch (error) {
            console.error(`❌ Error translating diagram image ${fileName} for ${language}`);
            debug(`❌ Error translating diagram image ${fileName} for ${language}`, error);
            result.errors.push({
              file: fileName,
              imageIndex: i,
              error: error.message,
            });
          }
        }

        if (hasChanges) {
          await fs.writeFile(translationFilePath, updatedContent, "utf8");
          result.updated++;
        } else {
          result.skipped++;
        }
      } catch (error) {
        debug(`❌ Error processing translation file ${fileName}: ${error.message}`);
        result.errors.push({
          file: fileName,
          error: error.message,
        });
      }
    }

    return result;
  } finally {
    // Clear processed documents after completion (even on error) to allow re-processing if needed
    processedDocuments.delete(documentKey);
  }
}

/**
 * Cache diagram images for translation (before document translation)
 * This function checks if images need translation and caches the translated image info
 * @param {string} mainContent - Main document content
 * @param {string} translationContent - Current translation document content (may be empty for new translations)
 * @param {string} docPath - Document path
 * @param {string} docsDir - Documentation directory
 * @param {string} locale - Main language locale
 * @param {string} language - Target language code
 * @param {Object} options - Options object with context for invoking agents
 * @param {boolean} shouldTranslateDiagramsOnly - Whether to translate diagrams only (from --diagram flag)
 * @returns {Promise<Array<{originalMatch: string, translatedMarkdown: string, index: number}>|null>} - Cached image info or null
 */
export async function cacheDiagramImagesForTranslation(
  mainContent,
  translationContent,
  docPath,
  docsDir,
  locale = "en",
  language,
  options = {},
  shouldTranslateDiagramsOnly = false,
) {
  try {
    const mainImages = extractDiagramImagesWithTimestamp(mainContent);
    let updatedMainContent = mainContent;
    let mainContentNeedsUpdate = false;

    if (mainImages.length === 0) {
      debug("ℹ️  No diagram images in main content");
      return null;
    }

    for (let i = 0; i < mainImages.length; i++) {
      const mainImage = mainImages[i];
      if (!mainImage.timestamp) {
        const newTimestamp = await ensureImageTimestamp(mainImage, docPath, docsDir);
        mainImages[i] = { ...mainImage, timestamp: newTimestamp };
        updatedMainContent = updatedMainContent.replace(
          mainImage.fullMatch,
          createImageMarkdown(
            mainImage.type,
            mainImage.aspectRatio,
            newTimestamp,
            mainImage.altText,
            mainImage.path,
          ),
        );
        mainContentNeedsUpdate = true;
      }
    }

    if (mainContentNeedsUpdate) {
      const mainFileName = getFileName(docPath, locale);
      await fs.writeFile(path.join(docsDir, mainFileName), updatedMainContent, "utf8");
      debug(`✅ Updated main document with timestamps: ${mainFileName}`);
    }

    const translationImages = translationContent
      ? extractDiagramImagesWithTimestamp(translationContent)
      : [];

    const cachedImages = [];

    for (let i = 0; i < mainImages.length; i++) {
      const mainImage = mainImages[i];
      const translationImage = translationImages[i];

      let needsTranslation = false;

      if (shouldTranslateDiagramsOnly) {
        // When --diagram flag is set, always regenerate translation images regardless of existing images
        needsTranslation = true;
        debug(
          `🔄 --diagram flag set: forcing regeneration of translation for ${language} diagram ${i}`,
        );
      } else {
        // Normal mode: check if translation is needed based on timestamp and language suffix
        const translationImagePath = translationImage?.path || "";
        const hasLanguageSuffix =
          translationImagePath.includes(`.${language}.`) ||
          translationImagePath.endsWith(`.${language}`);
        needsTranslation =
          !translationImage ||
          !hasLanguageSuffix ||
          !translationImage.timestamp ||
          translationImage.timestamp !== mainImage.timestamp;
      }

      if (!needsTranslation) {
        // No translation needed, but we should cache the existing translation image
        // to ensure it's preserved in the final document (this applies to both normal and --diagram mode)
        if (translationImage) {
          cachedImages.push({
            originalMatch: translationImage.fullMatch,
            translatedMarkdown: translationImage.fullMatch, // Keep existing markdown
            index: translationImage.index,
            mainImageIndex: mainImage.index,
          });
          debug(
            `💾 Cached existing diagram image for ${language} diagram ${i} (timestamp matches, no translation needed)`,
          );
        }
        continue;
      }

      const existingImage = await convertDiagramInfoToMediaFile(
        { path: mainImage.path },
        docPath,
        docsDir,
      );

      if (!existingImage) {
        debug(`⏭️  Main image not found: ${mainImage.path}, skipping translation for ${language}`);
        continue;
      }

      try {
        const translateDiagramAgent = options.context?.agents?.["translateDiagram"];
        if (!translateDiagramAgent) {
          debug(`⚠️  translateDiagram agent not found, skipping translation`);
          continue;
        }

        const imageResult = await options.context.invoke(translateDiagramAgent, {
          existingImage: [existingImage],
          ratio: mainImage.aspectRatio || DEFAULT_ASPECT_RATIO,
          size: DEFAULT_IMAGE_SIZE,
          locale: language,
        });

        let generatedImage = null;
        if (
          imageResult?.images &&
          Array.isArray(imageResult.images) &&
          imageResult.images.length > 0
        ) {
          generatedImage = imageResult.images[0];
        } else if (imageResult?.image || imageResult?.imageUrl || imageResult?.path) {
          generatedImage = {
            path: imageResult.image || imageResult.imageUrl || imageResult.path,
            filename: path.basename(imageResult.image || imageResult.imageUrl || imageResult.path),
            mimeType: imageResult.mimeType || DEFAULT_MIME_TYPE,
            type: "local",
          };
        }

        if (!generatedImage) {
          debug(`⚠️  No image generated for ${language} diagram ${i}`);
          continue;
        }

        const translatedImagePath = generateTranslatedImagePath(mainImage.path, language);
        const translatedImageAbsolutePath = path.join(process.cwd(), docsDir, translatedImagePath);
        await fs.ensureDir(path.dirname(translatedImageAbsolutePath));
        const translationFileName = getFileName(docPath, language);
        await compressAndCopyImage(
          generatedImage,
          translatedImageAbsolutePath,
          translationFileName,
        );

        const altText = translationImage?.altText || mainImage.altText || DEFAULT_ALT_TEXT;
        const newImageMarkdown = createImageMarkdown(
          mainImage.type,
          mainImage.aspectRatio,
          mainImage.timestamp,
          altText,
          translatedImagePath,
        );

        cachedImages.push({
          originalMatch: translationImage?.fullMatch || null,
          translatedMarkdown: newImageMarkdown,
          index: translationImage?.index || mainImage.index,
          mainImageIndex: mainImage.index,
        });
      } catch (error) {
        const translationFileName = getFileName(docPath, language);
        console.error(`❌ Error translating diagram image ${translationFileName} for ${language}`);
        debug(`❌ Error translating diagram image ${translationFileName} for ${language}`, error);
        // Continue processing other images even if one fails
      }
    }

    return cachedImages.length > 0 ? cachedImages : null;
  } catch (error) {
    debug(`❌ Error caching diagram images: ${error.message}`);
    return null;
  }
}

/**
 * Agent wrapper for caching diagram images during translation workflow
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
    const translationFilePath = path.join(docsDir, translationFileName);

    // Check if translation file exists before reading to avoid unnecessary warnings
    const translationFileExists = await pathExists(translationFilePath);
    const translationContent = translationFileExists
      ? await readFileContent(docsDir, translationFileName)
      : null;

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
      // Check if any images were actually translated (not just cached existing ones)
      const translatedCount = cachedImages.filter(
        (img) => img.translatedMarkdown !== img.originalMatch,
      ).length;
      if (translatedCount > 0) {
        debug(
          `✅ Cached ${cachedImages.length} diagram image(s) for ${currentLanguage} (${translatedCount} translated)`,
        );
      } else {
        debug(
          `ℹ️  Cached ${cachedImages.length} existing diagram image(s) for ${currentLanguage} (no translation needed)`,
        );
      }
    } else {
      debug(`ℹ️  No diagram images found or cached for ${currentLanguage}`);
    }

    // In --diagram mode:
    // - If translation document exists: use existing translation content (skip document translation, only replace images)
    // - If translation document doesn't exist: allow document translation first, then replace images
    let finalTranslation = input.translation;
    let finalIsApproved = input.isApproved;

    if (shouldTranslateDiagramsOnly) {
      if (translationContent) {
        // Translation document exists: use existing content, skip document translation
        finalTranslation = translationContent;
        finalIsApproved = true; // Skip document translation
        debug(
          `ℹ️  --diagram mode: using existing translation content for ${currentLanguage} (will only replace diagram images)`,
        );
      } else {
        // Translation document doesn't exist: allow document translation first
        finalTranslation = undefined; // Let translate-document-wrapper.mjs handle translation
        finalIsApproved = false; // Allow document translation
        debug(
          `ℹ️  --diagram mode: translation document not found for ${currentLanguage}, will translate document first, then replace diagram images`,
        );
      }
    }

    return {
      ...input,
      translation: finalTranslation,
      isApproved: finalIsApproved,
      cachedDiagramImages: cachedImages || null,
    };
  } catch (error) {
    // Don't fail the translation if image translation fails
    debug(`⚠️  Failed to cache diagram images: ${error.message}`);
    return { ...input, cachedDiagramImages: null };
  }
}

translateDiagramImagesAgent.task_render_mode = "hide";
