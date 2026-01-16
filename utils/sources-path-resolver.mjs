import { resolve } from "node:path";
import fs from "fs-extra";

/**
 * Check if path is a /sources/... absolute path
 * @param {string} imagePath - Image path
 * @returns {boolean}
 */
export function isSourcesAbsolutePath(imagePath) {
  return imagePath.startsWith("/sources/");
}

/**
 * Parse /sources/... absolute path and extract relative path portion
 * @param {string} absolutePath - Absolute path, format: /sources/<relativePath>
 * @returns {string | null} - Relative path, returns null if parsing fails or path is unsafe
 */
export function parseSourcesPath(absolutePath) {
  // /sources/assets/screenshot.png → assets/screenshot.png
  const match = absolutePath.match(/^\/sources\/(.+)$/);
  if (!match) return null;

  const relativePath = match[1];

  // Security check: reject paths containing path traversal sequences
  // Prevent accessing files outside sources directory via paths like /sources/../../../etc/passwd
  if (relativePath.includes("..")) {
    return null;
  }

  return relativePath;
}

/**
 * Resolve virtual absolute path to physical path based on config.yaml sources configuration
 * Searches each source in order and returns the first existing path
 *
 * Execution layer perspective (after AFS mount):
 *   modules/workspace/ and modules/sources/ are at same level
 *   Documents reference using /sources/<path> format
 *
 * Physical disk perspective:
 *   - local-path: path relative to workspace
 *   - git-clone: workspace/sources/<name>/ directory
 *
 * @param {string} absolutePath - Virtual absolute path, format: /sources/<relativePath>
 * @param {Array} sourcesConfig - sources configuration array from config.yaml
 * @param {string} workspaceBase - Workspace physical root directory
 * @returns {Promise<{physicalPath: string, sourceName: string} | null>} - Physical path and source name, returns null if resolution fails
 */
export async function resolveSourcesPath(absolutePath, sourcesConfig, workspaceBase) {
  const relativePath = parseSourcesPath(absolutePath);
  if (!relativePath) return null;

  // Search in each source in order
  for (const source of sourcesConfig) {
    let physicalPath;

    if (source.type === "local-path") {
      // local-path: path relative to workspace
      physicalPath = resolve(workspaceBase, source.path, relativePath);
    } else if (source.type === "git-clone") {
      // git-clone: cloned to workspace/sources/<name>/ directory
      physicalPath = resolve(workspaceBase, "sources", source.name, relativePath);
    } else {
      continue;
    }

    // Check if file exists
    if (await fs.pathExists(physicalPath)) {
      return { physicalPath, sourceName: source.name };
    }
  }

  return null;
}
