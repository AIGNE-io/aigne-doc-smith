/**
 * Common utility functions for image processing
 */

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import fs from "fs-extra";

/**
 * Calculate SHA256 hash of a file
 * @param {string} filePath - File path
 * @returns {Promise<string>} - SHA256 hash (hex)
 */
export async function calculateFileHash(filePath) {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Calculate SHA256 hash of string content
 * @param {string} content - String content
 * @returns {string} - SHA256 hash (hex)
 */
export function calculateContentHash(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Supported image extensions
 */
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/**
 * Find image file (supports multiple extensions)
 * @param {string} imagesDir - Image directory path
 * @param {string} locale - Language code
 * @param {string[]} extensions - Supported extension list (optional, defaults to IMAGE_EXTENSIONS)
 * @returns {Promise<string|null>} - Image file path, returns null if not found
 */
export async function findImageFile(imagesDir, locale, extensions = IMAGE_EXTENSIONS) {
  for (const ext of extensions) {
    const imagePath = join(imagesDir, `${locale}${ext}`);
    if (await fs.pathExists(imagePath)) {
      return imagePath;
    }
  }
  return null;
}

/**
 * Find image file (with language fallback)
 * @param {string} key - Image key
 * @param {string} locale - Current language code
 * @param {string} mainLocale - Primary language code (for fallback)
 * @param {string} assetsDir - Assets directory path
 * @returns {Promise<string|null>} - Image relative path (relative to assets), returns null if not found
 */
export async function findImageWithFallback(key, locale, mainLocale, assetsDir = "./assets") {
  const keyDir = join(assetsDir, key, "images");

  // 1. Try to find image for current language
  const currentLocaleImage = await findImageFile(keyDir, locale);
  if (currentLocaleImage) {
    // Return path relative to assets
    const filename = currentLocaleImage.split("/").pop();
    return join(key, "images", filename);
  }

  // 2. If current language doesn't exist, fall back to primary language
  if (mainLocale && locale !== mainLocale) {
    const mainLocaleImage = await findImageFile(keyDir, mainLocale);
    if (mainLocaleImage) {
      const filename = mainLocaleImage.split("/").pop();
      return join(key, "images", filename);
    }
  }

  // 3. Image doesn't exist
  return null;
}

/**
 * Get image MIME type
 * @param {string} filePath - Image file path
 * @returns {string} - MIME type
 */
export function getImageMimeType(filePath) {
  const ext = filePath.toLowerCase().split(".").pop();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[ext] || "image/jpeg";
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} - File extension
 */
export function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return mimeToExt[mimeType] || "png";
}
