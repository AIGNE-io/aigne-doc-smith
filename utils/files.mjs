import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PATHS } from "./agent-constants.mjs";

// Shared extension → MIME type mapping table
const EXT_TO_MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpg",
  ".mov": "video/mov",
  ".avi": "video/avi",
  ".flv": "video/x-flv",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".wmv": "video/wmv",
  ".m4v": "video/x-m4v",
  ".3gpp": "video/3gpp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".json": "application/json",
  ".xml": "application/xml",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
};

/**
 * Get MIME type from file path based on extension
 * @param {string} filePath - File path
 * @returns {string} MIME type
 */
export function getMimeType(filePath) {
  const ext = path.extname(filePath || "").toLowerCase();
  return EXT_TO_MIME[ext] || "application/octet-stream";
}

/**
 * Ensure temporary directory exists
 * @returns {Promise<void>}
 */
export async function ensureTmpDir() {
  if (!existsSync(PATHS.TMP_DIR)) {
    mkdirSync(PATHS.TMP_DIR, { recursive: true });
  }
}

/**
 * Check if a file is a remote URL
 * @param {string} file - File path or URL
 * @returns {boolean}
 */
export function isRemoteFile(file) {
  return file && (file.startsWith("http://") || file.startsWith("https://"));
}
