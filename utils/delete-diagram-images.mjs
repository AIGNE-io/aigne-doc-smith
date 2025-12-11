import { unlink } from "node:fs/promises";
import { join, dirname, normalize } from "node:path";
import fs from "fs-extra";
import { debug } from "./debug.mjs";
import { diagramImageWithPathRegex } from "./d2-utils.mjs";

/**
 * Extract image file paths from markdown content
 * Finds all diagram image references and extracts their file paths
 * @param {string} content - Markdown content
 * @param {string} path - Document path (e.g., "guides/getting-started.md")
 * @param {string} docsDir - Documentation directory
 * @returns {Promise<Array<string>>} Array of absolute paths to image files
 */
export async function extractDiagramImagePaths(content, path, docsDir) {
  if (!content || !path || !docsDir) {
    return [];
  }

  const imagePaths = [];

  // Pattern to match: <!-- DIAGRAM_IMAGE_START:... -->![alt](path)<!-- DIAGRAM_IMAGE_END -->
  const matches = Array.from((content || "").matchAll(diagramImageWithPathRegex));

  for (const match of matches) {
    const imagePath = match[4] || ""; // Path is in capture group 4 (groups: 1=type, 2=aspectRatio, 3=timestamp, 4=path)

    // Resolve absolute path
    // If imagePath is relative, resolve from document location
    // If imagePath is absolute or starts with http, skip
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      continue; // Skip remote URLs
    }

    // Calculate relative path from document to image
    const docDir = dirname(path);
    const imageRelativePath = imagePath.startsWith("../")
      ? imagePath
      : join(docDir, imagePath).replace(/\\/g, "/");

    // Resolve absolute path
    const absolutePath = join(process.cwd(), docsDir, imageRelativePath);

    // Normalize path (remove .. and .)
    const normalizedPath = normalize(absolutePath);

    if (await fs.pathExists(normalizedPath)) {
      imagePaths.push(normalizedPath);
    }
  }

  return imagePaths;
}

/**
 * Delete diagram image files associated with a document
 * @param {string} content - Markdown content (before deletion)
 * @param {string} path - Document path
 * @param {string} docsDir - Documentation directory
 * @returns {Promise<{deleted: number, failed: number}>}
 */
export async function deleteDiagramImages(content, path, docsDir) {
  if (!content || !path || !docsDir) {
    return { deleted: 0, failed: 0 };
  }

  try {
    const imagePaths = await extractDiagramImagePaths(content, path, docsDir);

    if (imagePaths.length === 0) {
      return { deleted: 0, failed: 0 };
    }

    let deleted = 0;
    let failed = 0;

    for (const imagePath of imagePaths) {
      try {
        await unlink(imagePath);
        debug(`Deleted diagram image: ${imagePath}`);
        deleted++;
      } catch (error) {
        if (error.code !== "ENOENT") {
          // File not found is ok, other errors should be logged
          console.warn(`Failed to delete diagram image ${imagePath}: ${error.message}`);
          failed++;
        } else {
          // File already doesn't exist, count as deleted
          deleted++;
        }
      }
    }

    return { deleted, failed };
  } catch (error) {
    console.warn(`Error deleting diagram images: ${error.message}`);
    return { deleted: 0, failed: 0 };
  }
}
