import { copyFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import fs from "fs-extra";
import { createHash } from "node:crypto";
import { DIAGRAM_PLACEHOLDER, ensureTmpDir } from "../../utils/d2-utils.mjs";
import { DOC_SMITH_DIR, TMP_DIR, TMP_ASSETS_DIR } from "../../utils/constants/index.mjs";
import { getContentHash } from "../../utils/utils.mjs";
import { getExtnameFromContentType } from "../../utils/file-utils.mjs";
import { debug } from "../../utils/debug.mjs";
import { compressImage } from "../../utils/image-compress.mjs";

const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB

/**
 * Calculate hash for an image file
 * For files < 1MB: use file content
 * For files >= 1MB: use path + size + mtime to avoid memory issues
 * @param {string} absolutePath - The absolute path to the image file
 * @returns {Promise<string>} - The hash of the file
 */
async function calculateImageHash(absolutePath) {
  const stats = await stat(absolutePath);

  if (stats.size < SIZE_THRESHOLD) {
    // Small file: use full content
    const content = await readFile(absolutePath);
    return createHash("sha256").update(content).digest("hex");
  }

  // Large file: use path + size + mtime
  const hashInput = `${absolutePath}:${stats.size}:${stats.mtimeMs}`;
  return createHash("sha256").update(hashInput).digest("hex");
}

/**
 * Replace D2 code blocks with generated image in document content
 * This mimics the @image insertion pattern
 * Saves images to TMP_DIR/assets/diagram and replaces DIAGRAM_PLACEHOLDER with image reference
 */
export default async function replaceD2WithImage({
  imageResult,
  images,
  content,
  documentContent,
  diagramType,
  aspectRatio,
  diagramIndex,
  originalContent,
  feedback,
}) {
  // Determine which content to use for finding diagrams and final replacement
  // Priority:
  // 1. documentContent (may contain DIAGRAM_PLACEHOLDER from replaceD2WithPlaceholder)
  // 2. originalContent (for finding existing diagrams when updating)
  // 3. content (fallback)
  const contentForFindingDiagrams = originalContent || documentContent || content || "";
  // For final content, prefer documentContent first (may have placeholder), then originalContent
  let finalContent = documentContent || originalContent || content || "";

  // Extract diagram index from feedback if not explicitly provided
  let targetDiagramIndex = diagramIndex;
  if (targetDiagramIndex === undefined && feedback) {
    const extractedIndex = extractDiagramIndexFromFeedback(feedback);
    if (extractedIndex !== null) {
      targetDiagramIndex = extractedIndex;
      debug(`Extracted diagram index ${targetDiagramIndex} from feedback: "${feedback}"`);
    }
  }

  // Extract image from the image generation result
  // In team agent, image agent output is merged into the context
  // So we need to check both imageResult and direct images field
  let image = null;

  // First check if images array is directly available (from image agent output)
  // Image agent outputs: { images: [{ filename, mimeType, type: "local", path }], ... }
  if (images && Array.isArray(images) && images.length > 0) {
    image = images[0];
  }
  // Then check imageResult (might be the whole output object)
  else if (imageResult) {
    // Check for images array (from image generation agents)
    if (imageResult.images && Array.isArray(imageResult.images) && imageResult.images.length > 0) {
      image = imageResult.images[0];
    }
    // Fallback to old format
    else if (imageResult.imageUrl || imageResult.image || imageResult.url || imageResult.path) {
      image = {
        path: imageResult.imageUrl || imageResult.image || imageResult.url || imageResult.path,
        filename: path.basename(
          imageResult.imageUrl || imageResult.image || imageResult.url || imageResult.path,
        ),
        mimeType: imageResult.mimeType || "image/jpeg",
        type: "local",
      };
    }
    // Check nested output
    else if (imageResult.output) {
      if (
        imageResult.output.images &&
        Array.isArray(imageResult.output.images) &&
        imageResult.output.images.length > 0
      ) {
        image = imageResult.output.images[0];
      } else if (
        imageResult.output.imageUrl ||
        imageResult.output.image ||
        imageResult.output.url
      ) {
        image = {
          path: imageResult.output.imageUrl || imageResult.output.image || imageResult.output.url,
          filename: path.basename(
            imageResult.output.imageUrl || imageResult.output.image || imageResult.output.url,
          ),
          mimeType: imageResult.output.mimeType || "image/jpeg",
          type: "local",
        };
      }
    }
  }

  if (!image || !image.path || image.type !== "local") {
    // Debug: log what we received to help diagnose the issue
    debug("⚠️  No valid image found in replace-d2-with-image.mjs");
    debug(
      "  - images:",
      images ? `${Array.isArray(images) ? images.length : "not array"} items` : "undefined",
    );
    debug("  - imageResult:", imageResult ? Object.keys(imageResult).join(", ") : "undefined");
    debug(
      "  - documentContent contains DIAGRAM_PLACEHOLDER:",
      finalContent.includes("DIAGRAM_PLACEHOLDER"),
    );
    // If no image, return content as-is (keep D2 code blocks or placeholder)
    return { content: finalContent };
  }

  // Ensure temp directory exists
  await ensureTmpDir();

  // Save image to assets directory
  // Path: .aigne/doc-smith/.tmp/assets/diagram
  // Use process.cwd() to ensure absolute path
  const assetDir = path.join(process.cwd(), DOC_SMITH_DIR, TMP_DIR, TMP_ASSETS_DIR, "diagram");
  await fs.ensureDir(assetDir);

  // Get file extension from source path
  let ext = path.extname(image.path);

  // If no extension found, try to determine from mimeType
  if (!ext && image.mimeType) {
    const extFromMime = getExtnameFromContentType(image.mimeType);
    if (extFromMime) {
      ext = `.${extFromMime}`;
    }
  }

  // Ensure we have a file extension
  if (!ext) {
    console.warn(
      `Could not determine file extension for diagram image from ${image.path} - using .jpg as fallback`,
    );
    ext = ".jpg";
  }

  // Generate filename based on image file hash (for caching)
  // Use image file content hash to ensure same image generates same filename
  // This allows proper cache hits while ensuring new images get new filenames
  let fileName;
  try {
    // Calculate hash of the actual image file
    const imageHash = await calculateImageHash(image.path);
    fileName = `${imageHash}${ext}`;
  } catch (error) {
    // Fallback: Use hash of image path if file hash calculation fails
    debug(`Failed to calculate image hash, using path hash: ${error.message}`);
    const hash = getContentHash(image.path);
    fileName = `${hash}${ext}`;
  }

  const destPath = path.join(assetDir, fileName);

  // Copy image from temp directory to assets directory
  try {
    // Check if source file exists
    if (!(await fs.pathExists(image.path))) {
      console.error(`Source image file does not exist: ${image.path}`);
      return { content: finalContent };
    }

    // Check if destination already exists (cache hit)
    // Since filename is based on file hash, if file exists, it's the same file
    if (await fs.pathExists(destPath)) {
      debug(`Diagram image cache found, skipping copy: ${destPath}`);
    } else {
      // Compress the image directly to destination path
      try {
        debug(`Compressing image directly to destination: ${image.path} -> ${destPath}`);
        const compressedPath = await compressImage(image.path, {
          quality: 85,
          outputPath: destPath,
        });

        // If compression failed, fallback to copying original file
        if (compressedPath === image.path) {
          debug(`Compression failed, copying original file: ${image.path}`);
          await copyFile(image.path, destPath);
        }
        debug(`✅ Diagram image saved to: ${destPath}`);
      } catch (error) {
        debug(`Image compression failed, copying original: ${error.message}`);
        // Fallback to copying original file if compression fails
        await copyFile(image.path, destPath);
        debug(`✅ Diagram image saved to: ${destPath}`);
      }
    }
  } catch (error) {
    console.error(
      `Failed to copy diagram image from ${image.path} to ${destPath}: ${error.message}`,
    );
    debug(`  Source exists: ${await fs.pathExists(image.path)}`);
    debug(`  Dest dir exists: ${await fs.pathExists(assetDir)}`);
    // If copy fails, return content as-is (keep D2 code blocks or placeholder)
    return { content: finalContent };
  }

  // Generate alt text from document content
  const altText = extractAltText(documentContent);

  // Create relative path from docs directory to assets directory
  // Docs are in: .aigne/doc-smith/.tmp/docs/
  // Assets are in: .aigne/doc-smith/.tmp/assets/diagram/
  // So relative path from docs to assets: ../assets/diagram/filename
  // If docs are not in .tmp/docs/, include .tmp in the path
  const relativePath = path.posix.join("..", TMP_DIR, TMP_ASSETS_DIR, "diagram", fileName);

  // Create markdown image reference with markers for easy replacement
  // Format: <!-- DIAGRAM_IMAGE_START:type:aspectRatio -->![alt](path)<!-- DIAGRAM_IMAGE_END -->
  const diagramTypeTag = diagramType || "unknown";
  const aspectRatioTag = aspectRatio || "unknown";
  const imageMarkdown = `<!-- DIAGRAM_IMAGE_START:${diagramTypeTag}:${aspectRatioTag} -->\n![${altText}](${relativePath})\n<!-- DIAGRAM_IMAGE_END -->`;

  // Find all diagram locations in the content
  // Use contentForFindingDiagrams which contains original diagrams (if originalContent provided)
  // or documentContent which may contain DIAGRAM_PLACEHOLDER
  const diagramLocations = findAllDiagramLocations(contentForFindingDiagrams);

  // Debug: log found locations
  if (diagramLocations.length > 0) {
    debug(
      `Found ${diagramLocations.length} diagram location(s):`,
      diagramLocations.map((loc) => `${loc.type} at ${loc.start}-${loc.end}`).join(", "),
    );
  }

  // Determine which diagram to replace
  let targetIndex = targetDiagramIndex !== undefined ? targetDiagramIndex : 0; // Default to first diagram (index 0)

  if (targetIndex < 0 || targetIndex >= diagramLocations.length) {
    // If index is out of range, default to first available or insert new
    targetIndex = diagramLocations.length > 0 ? 0 : -1;
  }

  // Replace DIAGRAM_PLACEHOLDER first (highest priority)
  // Check both finalContent and documentContent for placeholder
  const hasPlaceholder =
    finalContent.includes(DIAGRAM_PLACEHOLDER) || documentContent?.includes(DIAGRAM_PLACEHOLDER);

  if (hasPlaceholder) {
    debug("Replacing DIAGRAM_PLACEHOLDER");
    // Use documentContent if it has placeholder, otherwise use finalContent
    const contentWithPlaceholder = documentContent?.includes(DIAGRAM_PLACEHOLDER)
      ? documentContent
      : finalContent;
    finalContent = contentWithPlaceholder.replace(DIAGRAM_PLACEHOLDER, imageMarkdown);
  } else if (diagramLocations.length > 0 && targetIndex >= 0) {
    // Replace the diagram at the specified index
    // Use originalContent if available (for accurate position), otherwise use finalContent
    const contentToReplace = originalContent || finalContent;
    const targetLocation = diagramLocations[targetIndex];
    if (targetLocation) {
      debug(
        `Replacing diagram at index ${targetIndex} (type: ${targetLocation.type}, position: ${targetLocation.start}-${targetLocation.end})`,
      );
      const beforeReplace = contentToReplace.slice(0, targetLocation.start);
      const afterReplace = contentToReplace.slice(targetLocation.end);
      finalContent = beforeReplace + imageMarkdown + afterReplace;
    } else {
      debug(`⚠️  Target location at index ${targetIndex} not found`);
    }
  } else {
    // No diagrams found and no placeholder
    // This can happen when:
    // 1. User requests to update a diagram but no diagrams exist in the document
    // 2. New document generation without any diagram markers
    // In this case, append the diagram to the end of the document
    debug("⚠️  No diagram location found to replace. Appending diagram to end of document.");
    debug(`  - Content length: ${finalContent.length}`);
    debug(`  - Contains DIAGRAM_PLACEHOLDER: ${finalContent.includes(DIAGRAM_PLACEHOLDER)}`);
    debug(`  - Contains DIAGRAM_IMAGE_START: ${finalContent.includes("DIAGRAM_IMAGE_START")}`);
    debug(`  - Contains \`\`\`d2: ${finalContent.includes("```d2")}`);
    debug(`  - Contains \`\`\`mermaid: ${finalContent.includes("```mermaid")}`);

    // Append diagram to the end of the document with proper spacing
    const trimmedContent = finalContent.trimEnd();
    const separator = trimmedContent && !trimmedContent.endsWith("\n") ? "\n\n" : "\n";
    finalContent = trimmedContent + separator + imageMarkdown;
  }

  return { content: finalContent };
}

/**
 * Find all diagram locations in content
 * Returns array of { type, start, end } for each diagram found
 * Types: 'placeholder', 'image', 'd2', 'mermaid'
 */
function findAllDiagramLocations(content) {
  const locations = [];

  // 1. Find DIAGRAM_PLACEHOLDER
  let placeholderIndex = content.indexOf(DIAGRAM_PLACEHOLDER);
  while (placeholderIndex !== -1) {
    locations.push({
      type: "placeholder",
      start: placeholderIndex,
      end: placeholderIndex + DIAGRAM_PLACEHOLDER.length,
    });
    placeholderIndex = content.indexOf(DIAGRAM_PLACEHOLDER, placeholderIndex + 1);
  }

  // 2. Find DIAGRAM_IMAGE_START markers
  // Format: <!-- DIAGRAM_IMAGE_START:type:aspectRatio -->...<!-- DIAGRAM_IMAGE_END -->
  // Note: aspectRatio can contain colon (e.g., "16:9"), so we need to match until -->
  const diagramImageRegex = /<!-- DIAGRAM_IMAGE_START:[^>]+ -->[\s\S]*?<!-- DIAGRAM_IMAGE_END -->/g;
  let match = diagramImageRegex.exec(content);
  while (match !== null) {
    locations.push({
      type: "image",
      start: match.index,
      end: match.index + match[0].length,
    });
    match = diagramImageRegex.exec(content);
  }

  // 3. Find D2 code blocks
  const d2CodeBlockRegex = /```d2\s*\n([\s\S]*?)```/g;
  match = d2CodeBlockRegex.exec(content);
  while (match !== null) {
    locations.push({
      type: "d2",
      start: match.index,
      end: match.index + match[0].length,
    });
    match = d2CodeBlockRegex.exec(content);
  }

  // 4. Find Mermaid code blocks
  const mermaidCodeBlockRegex = /```mermaid\s*\n([\s\S]*?)```/g;
  match = mermaidCodeBlockRegex.exec(content);
  while (match !== null) {
    locations.push({
      type: "mermaid",
      start: match.index,
      end: match.index + match[0].length,
    });
    match = mermaidCodeBlockRegex.exec(content);
  }

  // Sort by position in document (top to bottom)
  locations.sort((a, b) => a.start - b.start);

  return locations;
}

/**
 * Extract diagram index from feedback
 * Returns 0-based index, or null if not specified
 * Examples: "first diagram" -> 0, "second diagram" -> 1, "第2张图" -> 1
 */
/**
 * Extract diagram index from feedback
 * Returns 0-based index, or null if not specified
 * Examples: "first diagram" -> 0, "second diagram" -> 1, "第2张图" -> 1
 */
function extractDiagramIndexFromFeedback(feedback) {
  if (!feedback) return null;

  const feedbackLower = feedback.toLowerCase();

  // Check Chinese patterns first (more specific)
  // Examples: "第一张图", "第二张图", "第2张图"
  const chinesePattern = /第([一二三四五六七八九十]|\d+)[张个]图/i;
  const chineseMatch = feedbackLower.match(chinesePattern);
  if (chineseMatch?.[1]) {
    const chineseNumbers = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10,
    };
    const numStr = chineseMatch[1];
    const num = chineseNumbers[numStr] || parseInt(numStr, 10);
    return num > 0 ? num - 1 : 0; // Convert to 0-based index
  }

  // Check number patterns (diagram #2, image 3, etc.)
  const numberPattern = /(?:diagram|image|picture|chart|graph)\s*#?(\d+)/i;
  const numberMatch = feedbackLower.match(numberPattern);
  if (numberMatch?.[1]) {
    const num = parseInt(numberMatch[1], 10);
    return num > 0 ? num - 1 : 0; // Convert to 0-based index
  }

  // Check ordinal patterns (first, second, third, etc.)
  const ordinalMap = {
    first: 0,
    "1st": 0,
    1: 0,
    second: 1,
    "2nd": 1,
    2: 1,
    third: 2,
    "3rd": 2,
    3: 2,
    fourth: 3,
    "4th": 3,
    4: 3,
    fifth: 4,
    "5th": 4,
    5: 4,
  };

  for (const [ordinal, index] of Object.entries(ordinalMap)) {
    const ordinalPattern = new RegExp(
      `(?:${ordinal})\\s+(?:diagram|image|picture|chart|graph)`,
      "i",
    );
    if (ordinalPattern.test(feedbackLower)) {
      return index;
    }
  }

  return null;
}

/**
 * Extract alt text from document content
 */
function extractAltText(documentContent) {
  if (!documentContent) return "Diagram";

  const lines = documentContent.split("\n").filter((line) => line.trim());
  if (lines.length > 0) {
    let altText = lines[0].trim();
    // Remove markdown headers
    altText = altText.replace(/^#+\s*/, "");
    if (altText.length > 100) {
      altText = `${altText.substring(0, 97)}...`;
    }
    return altText || "Diagram";
  }
  return "Diagram";
}

replaceD2WithImage.input_schema = {
  type: "object",
  properties: {
    images: {
      type: "array",
      description: "Images array from image generation agent",
    },
    imageResult: {
      type: "object",
      description: "The result from image generation agent (fallback)",
    },
    content: {
      type: "string",
      description: "The document content (may contain DIAGRAM_PLACEHOLDER)",
    },
    documentContent: {
      type: "string",
      description: "Original document content containing DIAGRAM_PLACEHOLDER",
    },
    diagramType: {
      type: "string",
      description: "The diagram type (for marking the image)",
      enum: ["architecture", "flowchart", "guide", "intro", "sequence", "network"],
    },
    aspectRatio: {
      type: "string",
      description: "The aspect ratio of the diagram (for marking the image)",
      enum: ["1:1", "3:4", "4:3", "16:9"],
    },
    diagramIndex: {
      type: "number",
      description:
        "Index of the diagram to replace (0-based). If not provided, will try to extract from feedback (e.g., 'first diagram' -> 0, 'second diagram' -> 1), otherwise defaults to 0.",
    },
    originalContent: {
      type: "string",
      description:
        "Original document content before any modifications. Used to find existing diagrams when updating.",
    },
  },
  required: ["documentContent"],
};

replaceD2WithImage.output_schema = {
  type: "object",
  properties: {
    content: {
      type: "string",
      description: "Document content with D2 code blocks replaced by image",
    },
  },
  required: ["content"],
};
