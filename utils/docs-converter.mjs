import { join, relative, dirname, basename } from "node:path";
import fs from "fs-extra";
import { parse as yamlParse } from "yaml";
import { parseSlots } from "./image-slots.mjs";
import { findImageWithFallback } from "./image-utils.mjs";
import { PATHS } from "./agent-constants.mjs";
import {
  isSourcesAbsolutePath,
  parseSourcesPath,
  resolveSourcesPath,
} from "./sources-path-resolver.mjs";
import { loadConfigFromFile } from "./config.mjs";

/**
 * Scan document directory and identify all document directories containing .meta.yaml
 * @param {string} docsDir - Document root directory path
 * @returns {Promise<Array>} Document list, each containing {dirPath, dirName, locale, content, depth}
 */
export async function scanDocuments(docsDir) {
  const documents = [];

  async function scanDir(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    // Check if directory contains .meta.yaml
    const hasMetaFile = entries.some((entry) => entry.isFile() && entry.name === ".meta.yaml");

    if (hasMetaFile) {
      // This is a document directory, read all language files
      const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

      // Calculate document depth (level relative to docs/)
      const relativePath = relative(docsDir, currentPath);
      const depth = relativePath === "" ? 0 : relativePath.split("/").length;

      const dirName = basename(currentPath);

      for (const file of markdownFiles) {
        const locale = file.name.replace(".md", "");
        const filePath = join(currentPath, file.name);
        const content = await fs.readFile(filePath, "utf8");

        documents.push({
          dirPath: currentPath,
          dirName,
          locale,
          content,
          depth,
          relativePath,
        });
      }
    }

    // Recursively scan subdirectories
    const subDirs = entries.filter((entry) => entry.isDirectory());
    for (const subDir of subDirs) {
      await scanDir(join(currentPath, subDir.name));
    }
  }

  await scanDir(docsDir);
  return documents;
}

/**
 * Calculate target path based on document depth and language
 * @param {string} relativePath - Path relative to docs/
 * @param {string} dirName - Document directory name
 * @param {string} locale - Language code
 * @param {number} depth - Document depth
 * @returns {string} Target file path (relative to target directory)
 */
export function getTargetPath(relativePath, dirName, locale, depth) {
  // English documents have no language suffix, other languages have suffix
  const suffix = locale === "en" ? ".md" : `.${locale}.md`;
  const fileName = `${dirName}${suffix}`;

  if (depth === 1) {
    // Single level path: move file to root directory
    return fileName;
  }

  // Multi-level path: keep parent directory, use directory name as file name
  const parentPath = dirname(relativePath);
  return join(parentPath, fileName);
}

/**
 * Add .md suffix to internal links
 * @param {string} content - Document content
 * @returns {string} Processed content
 */
export function addMarkdownSuffixToLinks(content) {
  // Match Markdown links: [text](path)
  // But not images: ![alt](path)
  // Not external links (http:// or https://)
  // Not links that already have .md suffix
  // Not media file links (images, videos, etc.)

  // Media file extensions
  const mediaExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|avi|pdf)$/i;

  return content.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Skip external links
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return match;
    }

    // Skip links that already have .md suffix
    if (url.includes(".md")) {
      return match;
    }

    // Skip non-document links (such as mailto:, #anchor, etc.)
    if (url.includes(":") || url.startsWith("#")) {
      return match;
    }

    // Skip media file links (images, videos, PDFs, etc.)
    if (mediaExtensions.test(url)) {
      return match;
    }

    // Separate path and anchor
    const hashIndex = url.indexOf("#");
    if (hashIndex !== -1) {
      const path = url.substring(0, hashIndex);
      const hash = url.substring(hashIndex);
      return `[${text}](${path}.md${hash})`;
    }

    // Add .md suffix
    return `[${text}](${url}.md)`;
  });
}

/**
 * Adjust image paths (based on document depth)
 * @param {string} content - Document content
 * @param {number} depth - Document depth
 * @returns {string} Processed content
 */
export function adjustImagePaths(content, depth) {
  // Documents at depth 1 move up one level, need to remove one ../
  // Documents at depth 2+ keep paths unchanged

  if (depth !== 1) {
    return content;
  }

  // Match image links: ![alt](path)
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, path) => {
    // Only process relative paths (paths containing ../)
    if (!path.startsWith("../")) {
      return match;
    }

    // Remove one ../
    const newPath = path.replace(/^\.\.\//, "");
    return `![${alt}](${newPath})`;
  });
}

/**
 * Read primary language from config file
 * @returns {Promise<string|null>} - Primary language code, returns null if read fails
 */
async function loadMainLocale() {
  try {
    const configPath = PATHS.CONFIG;
    if (!(await fs.pathExists(configPath))) {
      return null;
    }
    const content = await fs.readFile(configPath, "utf8");
    const config = yamlParse(content);
    return config?.locale || null;
  } catch (_error) {
    return null;
  }
}

/**
 * Replace AFS image slots in document with actual image references
 * @param {string} content - Document content
 * @param {string} docPath - Document path (for calculating relative paths and generating keys)
 * @param {string} locale - Current document language
 * @param {string} mainLocale - Primary language
 * @param {number} depth - Document depth (for calculating relative paths)
 * @param {string} assetsDir - Assets directory path
 * @returns {Promise<string>} - Content with replacements
 */
async function replaceImageSlots(
  content,
  docPath,
  locale,
  mainLocale,
  depth,
  assetsDir = PATHS.ASSETS_DIR,
) {
  // Parse all slots
  const slots = parseSlots(content, docPath);

  if (slots.length === 0) {
    return content;
  }

  // Replace each slot
  let result = content;
  for (const slot of slots) {
    const { key, desc, raw } = slot;

    // Find image
    const imagePath = await findImageWithFallback(key, locale, mainLocale, assetsDir);

    if (imagePath) {
      // Calculate relative path prefix
      // Target document is at least in targetDir root, needs at least 1 ../ to access assets/ parallel to targetDir
      // depth 0/1: ../assets/{key}/images/{lang}.jpg  (from tmp-docs/overview.md to assets/)
      // depth 2: ../../assets/{key}/images/{lang}.jpg  (from tmp-docs/api/auth.md to assets/)
      // depth N: N ../'s (minimum 1)
      const pathPrefix = "../".repeat(Math.max(depth, 1));
      const imageRef = `${pathPrefix}assets/${imagePath}`;

      // Replace slot with image reference
      const imageMarkdown = `![${desc}](${imageRef})`;
      result = result.replace(raw, imageMarkdown);
    }
    // If image doesn't exist, keep slot unchanged (or could choose to remove)
  }

  return result;
}

/**
 * Process single /sources/... image path
 * @param {string} imagePath - Image path
 * @param {number} depth - Document depth
 * @param {string} targetDir - Target directory
 * @param {Array} sourcesConfig - Sources configuration
 * @param {string} workspaceBase - Workspace base path
 * @param {Set} processedImages - Set of processed images
 * @returns {Promise<{newPath: string, copied: boolean} | null>} - New path and whether file was copied
 */
async function processSourcesImagePath(
  imagePath,
  depth,
  targetDir,
  sourcesConfig,
  workspaceBase,
  processedImages,
) {
  if (!isSourcesAbsolutePath(imagePath)) {
    return null;
  }

  // Parse path, get relative path portion
  const relativePath = parseSourcesPath(imagePath);
  if (!relativePath) {
    console.warn(`⚠️  Invalid sources path format: ${imagePath}`);
    return null;
  }

  // Get physical path (automatically search in each source)
  const resolved = await resolveSourcesPath(imagePath, sourcesConfig, workspaceBase);
  if (!resolved) {
    console.warn(`⚠️  Cannot find image in any source: ${imagePath}`);
    return null;
  }

  const { physicalPath } = resolved;

  // Copy to sources subdirectory in temp directory
  // Maintain same path structure as execution layer: targetDir/../sources/<relativePath>
  const targetImagePath = join(dirname(targetDir), "sources", relativePath);

  let copied = false;
  if (!processedImages.has(targetImagePath)) {
    await fs.ensureDir(dirname(targetImagePath));
    await fs.copy(physicalPath, targetImagePath);
    processedImages.add(targetImagePath);
    copied = true;
  }

  // Calculate relative path
  // depth 0/1: ../sources/path/to/image.png
  // depth 2: ../../sources/path/to/image.png
  const pathPrefix = "../".repeat(Math.max(depth, 1));
  const newPath = `${pathPrefix}sources/${relativePath}`;

  return { newPath, copied };
}

/**
 * Process /sources/... absolute path images in document
 * Supports two formats:
 * - Markdown: ![alt](/sources/path/to/image.png)
 * - HTML: <img src="/sources/path/to/image.png" ... />
 * @param {string} content - Document content
 * @param {number} depth - Document depth (for calculating relative paths)
 * @param {string} targetDir - Target directory (temp directory)
 * @param {Array} sourcesConfig - sources configuration from config.yaml
 * @param {string} workspaceBase - Workspace base path
 * @returns {Promise<{content: string, copiedCount: number}>} - Processed content and count of copied images
 */
async function processSourcesImages(content, depth, targetDir, sourcesConfig, workspaceBase) {
  let result = content;
  const processedImages = new Set();
  let copiedCount = 0;

  // 1. Process Markdown format images: ![alt](/sources/path/to/image.png)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const markdownMatches = [...content.matchAll(markdownImageRegex)];

  for (const match of markdownMatches) {
    const [fullMatch, alt, imagePath] = match;

    const processResult = await processSourcesImagePath(
      imagePath,
      depth,
      targetDir,
      sourcesConfig,
      workspaceBase,
      processedImages,
    );

    if (processResult) {
      const { newPath, copied } = processResult;
      if (copied) copiedCount++;
      result = result.replace(fullMatch, `![${alt}](${newPath})`);
    }
  }

  // 2. Process HTML img tags: <img src="/sources/path/to/image.png" ... />
  const htmlImgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)\/?>/gi;
  const htmlMatches = [...result.matchAll(htmlImgRegex)];

  for (const match of htmlMatches) {
    const [fullMatch, beforeSrc, imagePath, afterSrc] = match;

    const processResult = await processSourcesImagePath(
      imagePath,
      depth,
      targetDir,
      sourcesConfig,
      workspaceBase,
      processedImages,
    );

    if (processResult) {
      const { newPath, copied } = processResult;
      if (copied) copiedCount++;
      // Rebuild img tag, keeping other attributes unchanged
      const newImgTag = `<img ${beforeSrc}src="${newPath}"${afterSrc}/>`;
      result = result.replace(fullMatch, newImgTag);
    }
  }

  return { content: result, copiedCount };
}

/**
 * Copy documents to temp directory and perform conversion
 * @param {string} sourceDir - Source document directory
 * @param {string} targetDir - Target directory
 * @returns {Promise<Object>} Conversion statistics
 */
export async function copyDocumentsToTemp(sourceDir, targetDir) {
  // Scan all documents
  const documents = await scanDocuments(sourceDir);

  if (documents.length === 0) {
    console.warn("⚠️  No documents found to convert.");
    return { total: 0, converted: 0 };
  }

  // Read primary language (for image fallback)
  const mainLocale = await loadMainLocale();

  // Load sources config (for processing /sources/... absolute paths)
  const config = await loadConfigFromFile();
  const sourcesConfig = config?.sources || [];

  const stats = {
    total: documents.length,
    converted: 0,
    depth1: 0,
    depth2Plus: 0,
    slotsReplaced: 0,
    sourcesCopied: 0,
  };

  // Process each document
  for (const doc of documents) {
    const { relativePath, dirName, locale, content, depth } = doc;

    // Calculate target path
    const targetPath = getTargetPath(relativePath, dirName, locale, depth);
    const fullTargetPath = join(targetDir, targetPath);

    // Process content
    let processedContent = content;

    // 1. Adjust image paths in original document (must be before replaceImageSlots to avoid processing newly generated paths)
    processedContent = adjustImagePaths(processedContent, depth);

    // 2. Replace AFS image slots with actual image references
    // Use relativePath as docPath (need to add leading /)
    const docPath = relativePath ? `/${relativePath}` : `/${dirName}`;
    const contentBeforeSlotReplace = processedContent;
    processedContent = await replaceImageSlots(
      processedContent,
      docPath,
      locale,
      mainLocale,
      depth,
      PATHS.ASSETS_DIR,
    );
    // Count replaced slots
    if (contentBeforeSlotReplace !== processedContent) {
      const slotsBefore = (contentBeforeSlotReplace.match(/<!--\s*afs:image/g) || []).length;
      const slotsAfter = (processedContent.match(/<!--\s*afs:image/g) || []).length;
      stats.slotsReplaced += slotsBefore - slotsAfter;
    }

    // 3. Process /sources/... absolute path images
    if (sourcesConfig.length > 0) {
      const sourcesResult = await processSourcesImages(
        processedContent,
        depth,
        targetDir,
        sourcesConfig,
        PATHS.WORKSPACE_BASE,
      );
      processedContent = sourcesResult.content;
      stats.sourcesCopied += sourcesResult.copiedCount;
    }

    // 4. Add .md suffix to internal links
    processedContent = addMarkdownSuffixToLinks(processedContent);

    // Create target directory and write file
    await fs.ensureDir(dirname(fullTargetPath));
    await fs.writeFile(fullTargetPath, processedContent, "utf8");

    stats.converted++;
    if (depth === 1) {
      stats.depth1++;
    } else {
      stats.depth2Plus++;
    }
  }

  return stats;
}
