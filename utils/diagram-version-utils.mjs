import fs from "fs-extra";

/**
 * Calculate timestamp for diagram image
 * Uses file modification time (mtime) as the version identifier
 * @param {string} imagePath - Absolute path to the image file
 * @returns {Promise<string>} Unix timestamp in seconds (as string)
 */
export async function calculateImageTimestamp(imagePath) {
  const stats = await fs.stat(imagePath);
  // Use modification time, convert to Unix timestamp (seconds)
  const timestamp = Math.floor(stats.mtimeMs / 1000);
  return timestamp.toString();
}
