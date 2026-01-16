/**
 * 图片处理相关的通用工具函数
 */

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import fs from "fs-extra";

/**
 * 计算文件的 SHA256 hash
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} - SHA256 hash (hex)
 */
export async function calculateFileHash(filePath) {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * 计算字符串内容的 SHA256 hash
 * @param {string} content - 字符串内容
 * @returns {string} - SHA256 hash (hex)
 */
export function calculateContentHash(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * 支持的图片扩展名
 */
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/**
 * 查找图片文件（支持多种扩展名）
 * @param {string} imagesDir - 图片目录路径
 * @param {string} locale - 语言代码
 * @param {string[]} extensions - 支持的扩展名列表（可选，默认使用 IMAGE_EXTENSIONS）
 * @returns {Promise<string|null>} - 图片文件路径，如果不存在返回 null
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
 * 查找图片文件（带语言回退）
 * @param {string} key - 图片 key
 * @param {string} locale - 当前语言代码
 * @param {string} mainLocale - 主语言代码（用于回退）
 * @param {string} assetsDir - assets 目录路径
 * @returns {Promise<string|null>} - 图片相对路径（相对于 assets），如果不存在返回 null
 */
export async function findImageWithFallback(key, locale, mainLocale, assetsDir = "./assets") {
  const keyDir = join(assetsDir, key, "images");

  // 1. 尝试查找当前语言的图片
  const currentLocaleImage = await findImageFile(keyDir, locale);
  if (currentLocaleImage) {
    // 返回相对于 assets 的路径
    const filename = currentLocaleImage.split("/").pop();
    return join(key, "images", filename);
  }

  // 2. 如果当前语言不存在，回退到主语言
  if (mainLocale && locale !== mainLocale) {
    const mainLocaleImage = await findImageFile(keyDir, mainLocale);
    if (mainLocaleImage) {
      const filename = mainLocaleImage.split("/").pop();
      return join(key, "images", filename);
    }
  }

  // 3. 图片不存在
  return null;
}

/**
 * 获取图片的 MIME 类型
 * @param {string} filePath - 图片文件路径
 * @returns {string} - MIME 类型
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
 * 根据 MIME 类型获取文件扩展名
 * @param {string} mimeType - MIME 类型
 * @returns {string} - 文件扩展名
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
