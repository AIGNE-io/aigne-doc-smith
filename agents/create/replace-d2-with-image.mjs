import { copyFile } from "node:fs/promises";
import path from "node:path";
import fs from "fs-extra";
import { DIAGRAM_PLACEHOLDER, ensureTmpDir } from "../../utils/d2-utils.mjs";
import { DOC_SMITH_DIR, TMP_DIR, TMP_ASSETS_DIR } from "../../utils/constants/index.mjs";
import { getContentHash } from "../../utils/utils.mjs";
import { getExtnameFromContentType } from "../../utils/file-utils.mjs";

/**
 * Replace D2 code blocks with generated image in document content
 * This mimics the @image insertion pattern
 * Saves images to TMP_DIR/assets/diagram and replaces DIAGRAM_PLACEHOLDER with image reference
 */
export default async function replaceD2WithImage({ imageResult, images, content, diagramSourceCode, documentContent }) {
  // documentContent contains DIAGRAM_PLACEHOLDER from preCheckGenerateDiagram
  // content might be available from previous steps, but we should use documentContent
  // as it contains the placeholder that needs to be replaced
  let finalContent = documentContent || content || "";

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
    // Check for images array (new format from generate-diagram-image.yaml)
    if (imageResult.images && Array.isArray(imageResult.images) && imageResult.images.length > 0) {
      image = imageResult.images[0];
    }
    // Fallback to old format
    else if (imageResult.imageUrl || imageResult.image || imageResult.url || imageResult.path) {
      image = {
        path: imageResult.imageUrl || imageResult.image || imageResult.url || imageResult.path,
        filename: path.basename(imageResult.imageUrl || imageResult.image || imageResult.url || imageResult.path),
        mimeType: imageResult.mimeType || "image/jpeg",
        type: "local",
      };
    }
    // Check nested output
    else if (imageResult.output) {
      if (imageResult.output.images && Array.isArray(imageResult.output.images) && imageResult.output.images.length > 0) {
        image = imageResult.output.images[0];
      } else if (imageResult.output.imageUrl || imageResult.output.image || imageResult.output.url) {
        image = {
          path: imageResult.output.imageUrl || imageResult.output.image || imageResult.output.url,
          filename: path.basename(imageResult.output.imageUrl || imageResult.output.image || imageResult.output.url),
          mimeType: imageResult.output.mimeType || "image/jpeg",
          type: "local",
        };
      }
    }
  }

  if (!image || !image.path || image.type !== "local") {
    // Debug: log what we received to help diagnose the issue
    console.log("⚠️  No valid image found in replace-d2-with-image.mjs");
    console.log("  - images:", images ? `${Array.isArray(images) ? images.length : 'not array'} items` : "undefined");
    console.log("  - imageResult:", imageResult ? Object.keys(imageResult).join(", ") : "undefined");
    console.log("  - documentContent contains DIAGRAM_PLACEHOLDER:", finalContent.includes("DIAGRAM_PLACEHOLDER"));
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

  // Generate filename based on diagram source code hash (if available) or use hash of image path
  let fileName;
  if (diagramSourceCode) {
    // Extract clean D2 code for hashing
    let cleanD2Code = diagramSourceCode;
    const codeBlockMatch = diagramSourceCode.match(/```d2\s*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleanD2Code = codeBlockMatch[1];
    }
    const hash = getContentHash(cleanD2Code);
    fileName = `${hash}${ext}`;
  } else {
    // Use hash of image path as filename
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
    if (await fs.pathExists(destPath)) {
      console.log(`Diagram image cache found, skipping copy: ${destPath}`);
    } else {
      await copyFile(image.path, destPath);
      console.log(`✅ Diagram image saved to: ${destPath}`);
    }
  } catch (error) {
    console.error(
      `Failed to copy diagram image from ${image.path} to ${destPath}: ${error.message}`,
    );
    console.error(`  Source exists: ${await fs.pathExists(image.path)}`);
    console.error(`  Dest dir exists: ${await fs.pathExists(assetDir)}`);
    // If copy fails, return content as-is (keep D2 code blocks or placeholder)
    return { content: finalContent };
  }

  // Generate alt text from document content
  const altText = extractAltText(documentContent);

  // Create relative path from docs directory to assets directory
  // Similar to d2-utils.mjs saveAssets: path.posix.join("..", TMP_ASSETS_DIR, "d2", fileName)
  const relativePath = path.posix.join("..", TMP_DIR, TMP_ASSETS_DIR, "diagram", fileName);

  // Create markdown image reference
  const imageMarkdown = `![${altText}](${relativePath})`;

  // Replace DIAGRAM_PLACEHOLDER with image reference
  if (finalContent.includes(DIAGRAM_PLACEHOLDER)) {
    finalContent = finalContent.replace(DIAGRAM_PLACEHOLDER, imageMarkdown);
  } else if (diagramSourceCode) {
    // Try to find and replace D2 code blocks
    let cleanD2Code = diagramSourceCode;
    const codeBlockMatch = diagramSourceCode.match(/```d2\s*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleanD2Code = codeBlockMatch[1];
    }

    // Try to find the D2 code block in content and replace it
    const d2CodeBlockRegex = new RegExp(
      `\`\`\`d2\\s*\\n${escapeRegex(cleanD2Code.trim())}\\s*\`\`\``,
      "s",
    );

    if (d2CodeBlockRegex.test(finalContent)) {
      // Replace the exact D2 code block
      finalContent = finalContent.replace(d2CodeBlockRegex, imageMarkdown);
    } else {
      // Try to find any d2 code block and replace the first one
      const anyD2BlockRegex = /```d2\s*\n[\s\S]*?```/;
      if (anyD2BlockRegex.test(finalContent)) {
        finalContent = finalContent.replace(anyD2BlockRegex, imageMarkdown);
      } else {
        // Insert image at the beginning or after first paragraph
        const firstParagraphEnd = finalContent.indexOf("\n\n");
        if (firstParagraphEnd > 0) {
          finalContent =
            finalContent.slice(0, firstParagraphEnd) +
            "\n\n" +
            imageMarkdown +
            "\n\n" +
            finalContent.slice(firstParagraphEnd + 2);
        } else {
          finalContent = `${imageMarkdown}\n\n${finalContent}`;
        }
      }
    }
  } else {
    // Insert at the beginning or after first paragraph
    const firstParagraphEnd = finalContent.indexOf("\n\n");
    if (firstParagraphEnd > 0) {
      finalContent =
        finalContent.slice(0, firstParagraphEnd) +
        "\n\n" +
        imageMarkdown +
        "\n\n" +
        finalContent.slice(firstParagraphEnd + 2);
    } else {
      finalContent = `${imageMarkdown}\n\n${finalContent}`;
    }
  }

  return { content: finalContent };
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

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      description: "The document content (may contain D2 code blocks)",
    },
    diagramSourceCode: {
      type: "string",
      description: "The D2 diagram source code to replace",
    },
    documentContent: {
      type: "string",
      description: "Original document content for context",
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

