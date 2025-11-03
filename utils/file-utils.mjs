import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path, { join } from "node:path";
import { glob } from "glob";
import fs from "fs-extra";
import { isBinaryFile } from "isbinaryfile";
import { encode } from "gpt-tokenizer";
import { fileTypeFromBuffer } from "file-type";
import { gunzipSync } from "node:zlib";

import { debug } from "./debug.mjs";
import { isGlobPattern } from "./utils.mjs";
import { uploadFiles } from "./upload-files.mjs";
import { extractApi } from "./extract-api.mjs";
import { minimatch } from "minimatch";

/**
 * Check if a directory is inside a git repository using git command
 * @param {string} dir - Directory path to check
 * @returns {boolean} True if inside a git repository
 */
export function isInGitRepository(dir) {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd: dir,
      stdio: "pipe",
      encoding: "utf8",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Find git repository root directory using git command
 * @param {string} startDir - Starting directory path
 * @returns {string|null} Git repository root path or null if not found
 */
function findGitRoot(startDir) {
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      cwd: startDir,
      stdio: "pipe",
      encoding: "utf8",
    }).trim();
    return gitRoot;
  } catch {
    return null;
  }
}

/**
 * Convert gitignore patterns to glob-compatible patterns
 * @param {string} pattern - A single gitignore pattern
 * @returns {string[]} Array of glob patterns that match gitignore behavior
 */
function gitignoreToGlobPatterns(pattern) {
  const patterns = [];

  // Remove leading slash (already handled by gitignore parsing)
  const cleanPattern = pattern.replace(/^\//, "");

  // If pattern doesn't contain wildcards and doesn't end with /
  // it could match both files and directories
  if (!cleanPattern.includes("*") && !cleanPattern.includes("?") && !cleanPattern.endsWith("/")) {
    // Add patterns to match both file and directory
    patterns.push(cleanPattern); // Exact match
    patterns.push(`${cleanPattern}/**`); // Directory contents
    patterns.push(`**/${cleanPattern}`); // Nested exact match
    patterns.push(`**/${cleanPattern}/**`); // Nested directory contents
  } else if (cleanPattern.endsWith("/")) {
    // Directory-only pattern
    const dirPattern = cleanPattern.slice(0, -1);
    patterns.push(`${dirPattern}/**`);
    patterns.push(`**/${dirPattern}/**`);
  } else {
    // Pattern with wildcards or specific file
    patterns.push(cleanPattern);
    if (!cleanPattern.startsWith("**/")) {
      patterns.push(`**/${cleanPattern}`);
    }
  }

  return patterns;
}

/**
 * Parse .gitignore content into patterns
 * @param {string} content - .gitignore file content
 * @returns {string[]} Array of ignore patterns converted to glob format
 */
function parseGitignoreContent(content) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.replace(/^\//, "")); // Remove leading slash

  // Convert each gitignore pattern to glob patterns
  const allPatterns = [];
  for (const line of lines) {
    allPatterns.push(...gitignoreToGlobPatterns(line));
  }

  return [...new Set(allPatterns)]; // Remove duplicates
}

/**
 * Load .gitignore patterns from multiple directories (current + all parent directories up to git root)
 * @param {string} dir - Directory path (will search up to find all .gitignore files)
 * @returns {string[]|null} Array of merged ignore patterns or null if no .gitignore found
 */
export async function loadGitignore(dir) {
  // First, check if we're in a git repository
  const inGitRepo = isInGitRepository(dir);
  if (!inGitRepo) {
    // Not in a git repository, just check the current directory
    const gitignorePath = path.join(dir, ".gitignore");
    try {
      await access(gitignorePath);
      const gitignoreContent = await readFile(gitignorePath, "utf8");
      const ignorePatterns = parseGitignoreContent(gitignoreContent);
      return ignorePatterns.length > 0 ? ignorePatterns : null;
    } catch {
      return null;
    }
  }

  // We're in a git repository, collect all .gitignore files from current dir to git root
  const gitRoot = findGitRoot(dir);
  if (!gitRoot) {
    return null;
  }

  const allPatterns = [];
  let currentDir = path.resolve(dir);

  // Collect .gitignore patterns from current directory up to git root
  while (currentDir.startsWith(gitRoot)) {
    const gitignorePath = path.join(currentDir, ".gitignore");
    try {
      await access(gitignorePath);
      const gitignoreContent = await readFile(gitignorePath, "utf8");
      const patterns = parseGitignoreContent(gitignoreContent);

      // Add patterns with context of which directory they came from
      // Patterns from deeper directories take precedence
      allPatterns.unshift(...patterns);
    } catch {
      // .gitignore doesn't exist in this directory, continue
    }

    // Move up one directory
    if (currentDir === gitRoot) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }

  return allPatterns.length > 0 ? [...new Set(allPatterns)] : null;
}

/**
 * Get files using glob patterns
 * @param {string} dir - Directory to search
 * @param {string[]} includePatterns - Include patterns
 * @param {string[]} excludePatterns - Exclude patterns
 * @param {string[]} gitignorePatterns - .gitignore patterns
 * @returns {Promise<string[]>} Array of file paths
 */
export async function getFilesWithGlob(dir, includePatterns, excludePatterns, gitignorePatterns) {
  if (!includePatterns || includePatterns.length === 0) {
    console.warn("No include patterns provided");
    return [];
  }

  // Prepare all ignore patterns
  const allIgnorePatterns = [];

  if (excludePatterns) {
    allIgnorePatterns.push(...excludePatterns);
  }

  if (gitignorePatterns) {
    allIgnorePatterns.push(...gitignorePatterns);
  }

  // Add default exclusions if not already present
  const defaultExclusions = ["node_modules/**", "test/**", "temp/**"];
  for (const exclusion of defaultExclusions) {
    if (!allIgnorePatterns.includes(exclusion)) {
      allIgnorePatterns.push(exclusion);
    }
  }

  // Convert patterns to be relative to the directory
  const patterns = includePatterns.map((pattern) => {
    // If pattern doesn't start with / or **, make it relative to dir
    if (!pattern.startsWith("/") && !pattern.startsWith("**")) {
      return `**/${pattern}`; // Use ** to search recursively
    }
    return pattern;
  });

  try {
    const files = await glob(patterns, {
      cwd: dir,
      ignore: allIgnorePatterns.length > 0 ? allIgnorePatterns : undefined,
      absolute: true,
      nodir: true, // Only return files, not directories
      dot: false, // Don't include dot files by default
      gitignore: true, // Enable .gitignore support
    });

    return files;
  } catch (error) {
    console.warn(`Warning: Error during glob search in ${dir}: ${error.message}`);
    return [];
  }
}

/**
 * Check if a path exists
 * @param {string} targetPath - Path to check
 * @returns {Promise<boolean>} True if path exists
 */
export async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

/**
 * Convert absolute path to display path relative to current working directory
 * @param {string} targetPath - Absolute path to convert
 * @returns {string} Display path (relative or absolute)
 */
export function toDisplayPath(targetPath) {
  const rel = path.relative(process.cwd(), targetPath);
  return rel.startsWith("..") ? targetPath : rel || ".";
}

/**
 * Resolve path to absolute path
 * @param {string} value - Path to resolve
 * @returns {string|undefined} Absolute path or undefined if no value provided
 */
export function resolveToAbsolute(value) {
  if (!value) return undefined;
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

/**
 * Load files from sourcesPath array
 * Supports file paths, directory paths, and glob patterns
 * @param {string|string[]} sourcesPath - Single path or array of paths
 * @param {object} options - Options for file loading
 * @param {string|string[]} options.includePatterns - Include patterns for directories
 * @param {string|string[]} options.excludePatterns - Exclude patterns for directories
 * @param {boolean} options.useDefaultPatterns - Whether to use default patterns (default: true)
 * @param {string[]} options.defaultIncludePatterns - Default include patterns
 * @param {string[]} options.defaultExcludePatterns - Default exclude patterns
 * @returns {Promise<string[]>} Array of absolute file paths
 */
export async function loadFilesFromPaths(sourcesPath, options = {}) {
  const {
    includePatterns,
    excludePatterns,
    useDefaultPatterns = true,
    defaultIncludePatterns = [],
    defaultExcludePatterns = [],
  } = options;

  const paths = Array.isArray(sourcesPath) ? sourcesPath : [sourcesPath];
  let allFiles = [];

  for (const dir of paths) {
    try {
      if (typeof dir !== "string") {
        console.warn(`Invalid source path: ${dir}`);
        continue;
      }

      if (isRemoteFile(dir)) {
        allFiles.push(dir);
        continue;
      }

      // First try to access as a file or directory
      const stats = await stat(dir);

      if (stats.isFile()) {
        // If it's a file, add it directly without filtering
        allFiles.push(dir);
      } else if (stats.isDirectory()) {
        // If it's a directory, use the existing glob logic
        // Load .gitignore for this directory
        const gitignorePatterns = await loadGitignore(dir);

        // Prepare patterns
        let finalIncludePatterns = null;
        let finalExcludePatterns = null;

        if (useDefaultPatterns) {
          // Merge with default patterns
          const userInclude = includePatterns
            ? Array.isArray(includePatterns)
              ? includePatterns
              : [includePatterns]
            : [];
          const userExclude = excludePatterns
            ? Array.isArray(excludePatterns)
              ? excludePatterns
              : [excludePatterns]
            : [];

          finalIncludePatterns = [...defaultIncludePatterns, ...userInclude];
          finalExcludePatterns = [
            ...defaultExcludePatterns,
            ...userExclude.map((x) => {
              const prefix = `${dir}/`;
              return x.startsWith(prefix) ? x.slice(prefix.length) : x;
            }),
          ];
        } else {
          // Use only user patterns
          if (includePatterns) {
            finalIncludePatterns = Array.isArray(includePatterns)
              ? includePatterns
              : [includePatterns];
          }
          if (excludePatterns) {
            finalExcludePatterns = Array.isArray(excludePatterns)
              ? excludePatterns
              : [excludePatterns];
          }
        }

        // Get files using glob
        const filesInDir = await getFilesWithGlob(
          dir,
          finalIncludePatterns,
          finalExcludePatterns,
          gitignorePatterns,
        );
        allFiles = allFiles.concat(filesInDir);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        // Path doesn't exist as file or directory, try as glob pattern
        try {
          // Check if it looks like a glob pattern
          const isGlobPatternResult = isGlobPattern(dir);

          if (isGlobPatternResult) {
            // Use glob to find matching files from current working directory
            const matchedFiles = await glob(dir, {
              absolute: true,
              nodir: true, // Only files, not directories
              dot: false, // Don't include hidden files
            });

            if (matchedFiles.length > 0) {
              allFiles = allFiles.concat(matchedFiles);
            }
          }
        } catch (globErr) {
          console.warn(`Failed to process glob pattern "${dir}": ${globErr.message}`);
        }
      } else {
        throw err;
      }
    }
  }

  return allFiles;
}

/**
 * Check if a file is likely a text file by checking if it's binary
 * @param {string} filePath - File path to check
 * @returns {Promise<boolean>} True if file appears to be a text file
 */
async function isTextFile(filePath) {
  if (isRemoteFile(filePath)) {
    return isRemoteTextFile(filePath);
  }

  try {
    const isBinary = await isBinaryFile(filePath);
    return !isBinary;
  } catch (_error) {
    // If we can't read the file, assume it might be binary to be safe
    return false;
  }
}

/**
 * Check if a string is an HTTP/HTTPS URL
 * @param {string} fileUrl - The string to check
 * @returns {boolean} - True if the string starts with http:// or https://
 */
export function isRemoteFile(fileUrl) {
  if (typeof fileUrl !== "string") return false;

  try {
    const url = new URL(fileUrl);
    // Only accept http and https url
    if (["http:", "https:"].includes(url.protocol)) {
      return true;
    }
    // other protocol will be treated as bad url
    return false;
  } catch {
    return false;
  }
}

export async function isRemoteFileAvailable(fileUrl) {
  if (!isRemoteFile(fileUrl)) return false;

  try {
    const res = await fetch(fileUrl, {
      method: "HEAD",
    });
    return res.ok;
  } catch (error) {
    debug(`Failed to check HTTP file availability: ${fileUrl} - ${error.message}`);
    return false;
  }
}

export async function isRemoteTextFile(fileUrl) {
  try {
    const res = await fetch(fileUrl, {
      method: "HEAD",
    });
    const contentType = res.headers.get("content-type") || "";
    const textMimeTypes = [
      "application/json",
      "application/ld+json",
      "application/graphql+json",
      "application/xml",
      "application/xhtml+xml",
      "application/javascript",
      "application/ecmascript",
      "application/x-www-form-urlencoded",
      "application/rss+xml",
      "application/atom+xml",
    ];
    if (contentType.startsWith("text/") || textMimeTypes.includes(contentType)) {
      return true;
    }
    return false;
  } catch (error) {
    debug(`Failed to check HTTP file content type: ${fileUrl} - ${error.message}`);
    return null;
  }
}

export async function getRemoteFileContent(fileUrl) {
  if (!fileUrl) return null;
  try {
    const res = await fetch(fileUrl);
    const text = await res.text();
    return text;
  } catch (error) {
    debug(`Failed to fetch HTTP file content: ${fileUrl} - ${error.message}`);
    return null;
  }
}

/**
 * Read and parse file contents from an array of file paths
 * @param {string[]} files - Array of file paths to read
 * @param {string} baseDir - Base directory for calculating relative paths (defaults to cwd)
 * @param {object} options - Options for reading files
 * @param {boolean} options.skipBinaryFiles - Whether to skip binary files (default: true)
 * @returns {Promise<{sourceId: string, content: string}[]>} Array of file objects with sourceId and content
 */
export async function readFileContents(files, baseDir = process.cwd(), options = {}) {
  const { skipBinaryFiles = true } = options;

  const results = await Promise.all(
    files.map(async (file) => {
      // Skip binary files if enabled
      if (skipBinaryFiles) {
        const isText = await isTextFile(file);
        if (!isText) {
          return null;
        }
      }

      try {
        if (isRemoteFile(file)) {
          const content = await getRemoteFileContent(file);
          if (content) {
            return {
              sourceId: file,
              content,
            };
          }

          return null;
        } else {
          const content = await extractApi(file);
          if (!content) return null;

          const relativePath = path.relative(baseDir, file);
          return {
            sourceId: relativePath,
            content,
          };
        }
      } catch (error) {
        // If reading as text fails (e.g., binary file), skip it
        console.warn(`Failed to read file as text: ${file} - ${error.message}`);
        return null;
      }
    }),
  );

  // Filter out null results
  return results.filter((result) => result !== null);
}

export function calculateTokens(text) {
  const tokens = encode(text);
  return tokens.length;
}

/**
 * Calculate total lines and tokens from file contents
 * @param {Array<{content: string}>} sourceFiles - Array of objects containing content property
 * @returns {{totalTokens: number, totalLines: number}} Object with totalTokens and totalLines
 */
export function calculateFileStats(sourceFiles) {
  let totalTokens = 0;
  let totalLines = 0;

  for (const source of sourceFiles) {
    const { content } = source;
    if (content) {
      // Count tokens using gpt-tokenizer
      const tokens = encode(content);
      totalTokens += tokens.length;

      // Count lines (excluding empty lines)
      totalLines += content.split("\n").filter((line) => line.trim() !== "").length;
    }
  }

  return { totalTokens, totalLines };
}

/**
 * Build sources content string
 * @param {Array<{sourceId: string, content: string}>} sourceFiles - Array of source file objects
 * @returns {string} Concatenated sources content with sourceId comments
 */
export function buildSourcesContent(sourceFiles) {
  // Build sources string
  let allSources = "";

  // Include all files for normal contexts
  for (const source of sourceFiles) {
    allSources += `\n// sourceId: ${source.sourceId}\n${source.content}\n`;
  }

  return allSources;
}

/**
 * Get doc-smith configuration file path
 * @param {string} workDir - Working directory (defaults to current directory)
 * @returns {string} Absolute path to config.yaml
 */
export function getConfigFilePath(workDir) {
  const cwd = workDir || process.cwd();
  return path.join(cwd, ".aigne", "doc-smith", "config.yaml");
}

/**
 * Get doc-smith structure plan file path
 * @param {string} workDir - Working directory (defaults to current directory)
 * @returns {string} Absolute path to structure-plan.json
 */
export function getStructurePlanPath(workDir) {
  const cwd = workDir || process.cwd();
  return path.join(cwd, ".aigne", "doc-smith", "output", "structure-plan.json");
}

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

// Build reverse mapping: MIME → extensions
const MIME_TO_EXTS = Object.entries(EXT_TO_MIME).reduce((acc, [ext, mime]) => {
  const key = mime.toLowerCase();
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(ext);
  return acc;
}, {});

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
 * Get file extension (without dot) from content type
 * Handles content types with parameters (e.g., "image/jpeg; charset=utf-8")
 * @param {string} contentType - Content type string
 * @returns {string} File extension without dot
 */
export function getExtnameFromContentType(contentType) {
  if (!contentType) return "";
  const base = String(contentType).split(";")[0].trim().toLowerCase();
  const exts = MIME_TO_EXTS[base];
  if (exts?.length) return exts[0].slice(1); // Remove leading dot
  const parts = base.split("/");
  return parts[1] || "";
}

/**
 * Get media description cache file path
 * @returns {string} Absolute path to media-description.yaml
 */
export function getMediaDescriptionCachePath() {
  const cwd = process.cwd();
  return path.join(cwd, ".aigne", "doc-smith", "media-description.yaml");
}

/**
 * Detect file type from buffer with comprehensive fallback strategy
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - HTTP Content-Type header
 * @param {string} url - Original URL (for fallback)
 * @returns {Promise<{ext: string, mime: string}>} File extension and MIME type
 */
export async function detectFileType(buffer, contentType, url = "") {
  // 1. Try file-type for binary images (PNG, JPG, WebP, GIF, etc.)
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    if (fileType) {
      return {
        ext: fileType.ext,
        mime: fileType.mime,
      };
    }
  } catch (error) {
    console.debug("file-type detection failed:", error.message);
  }

  // 2. Check for SVG/SVGZ
  const svgResult = await detectSvgType(buffer, contentType);
  if (svgResult) {
    return svgResult;
  }

  // 3. Fallback to Content-Type
  if (contentType) {
    const ext = getExtnameFromContentType(contentType);
    if (ext) {
      return {
        ext,
        mime: contentType.split(";")[0].trim(),
      };
    }
  }

  // 4. Fallback to URL extension
  if (url) {
    const urlExt = path.extname(url).toLowerCase();
    if (urlExt) {
      return {
        ext: urlExt.slice(1), // Remove leading dot
        mime: getMimeType(url),
      };
    }
  }

  // 5. Default fallback
  return {
    ext: "bin",
    mime: "application/octet-stream",
  };
}

/**
 * Detect SVG/SVGZ file type
 * @param {Buffer} buffer - File buffer
 * @param {string} contentType - HTTP Content-Type header
 * @returns {Promise<{ext: string, mime: string} | null>} SVG info or null
 */
async function detectSvgType(buffer, contentType) {
  // Check Content-Type first
  if (contentType?.includes("image/svg+xml")) {
    return {
      ext: "svg",
      mime: "image/svg+xml",
    };
  }

  try {
    let text = "";

    // Check if it's gzipped (SVGZ)
    if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
      try {
        const decompressed = gunzipSync(buffer);
        text = decompressed.toString("utf8");
        if (isSvgContent(text)) {
          return {
            ext: "svgz",
            mime: "image/svg+xml",
          };
        }
      } catch {
        // Not gzipped, continue with regular text detection
      }
    }

    // Try as regular text
    if (!text) {
      text = buffer.toString("utf8");
    }

    if (isSvgContent(text)) {
      return {
        ext: "svg",
        mime: "image/svg+xml",
      };
    }
  } catch (error) {
    console.debug("SVG detection failed:", error.message);
  }

  return null;
}

/**
 * Check if text content is SVG
 * @param {string} text - Text content
 * @returns {boolean} True if SVG
 */
function isSvgContent(text) {
  if (!text || typeof text !== "string") return false;

  // Remove BOM and trim
  const cleanText = text.replace(/^\uFEFF/, "").trim();

  // Check for SVG root element
  return /^<\?xml\s+[^>]*>\s*<svg/i.test(cleanText) || /^<svg/i.test(cleanText);
}

/**
 * Download and upload a remote image URL
 * @param {string} imageUrl - The remote image URL
 * @param {string} docsDir - Directory to save temporary files
 * @param {string} appUrl - Application URL for upload
 * @param {string} accessToken - Access token for upload
 * @returns {Promise<{url: string, downloadFinalPath: string | null}>} The uploaded image URL and final path if failed
 */
export async function downloadAndUploadImage(imageUrl, docsDir, appUrl, accessToken) {
  let downloadFinalPath = null;

  try {
    // 1. Download with timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 2. Convert to Buffer for file type detection
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Detect file type with comprehensive fallback
    const contentType = response.headers.get("content-type");
    const { ext } = await detectFileType(buffer, contentType, imageUrl);

    // 4. Generate random filename and save file
    const randomId = randomBytes(16).toString("hex");
    const tempFilePath = join(docsDir, `temp-logo-${randomId}`);
    downloadFinalPath = ext ? `${tempFilePath}.${ext}` : tempFilePath;
    fs.writeFileSync(downloadFinalPath, buffer);

    // 5. Upload and get URL
    const { results: uploadResults } = await uploadFiles({
      appUrl,
      filePaths: [downloadFinalPath],
      accessToken,
      concurrency: 1,
    });

    // 6. Return uploaded URL
    return { url: uploadResults?.[0]?.url || imageUrl, downloadFinalPath };
  } catch (error) {
    console.warn(`Failed to download and upload image from ${imageUrl}: ${error.message}`);
    return { url: imageUrl, downloadFinalPath: null };
  }
}

/**
 * Extract the path prefix from a glob pattern until the first glob character
 */
function getPathPrefix(pattern) {
  const segments = pattern.split("/");
  const result = [];

  for (const segment of segments) {
    if (isGlobPattern(segment)) {
      break;
    }
    result.push(segment);
  }

  return result.join("/") || ".";
}

/**
 * Check if a dir matches any exclude pattern
 */
function isDirExcluded(dir, excludePatterns) {
  if (!dir || typeof dir !== "string") {
    return false;
  }

  let normalizedDir = dir.replace(/\\/g, "/").replace(/^\.\/+/, "");
  normalizedDir = normalizedDir.endsWith("/") ? normalizedDir : `${normalizedDir}/`;

  for (const excludePattern of excludePatterns) {
    if (minimatch(normalizedDir, excludePattern, { dot: true })) {
      return true;
    }
  }

  return false;
}

/**
 * Return source paths that would be excluded by exclude patterns (files are skipped, directories use minimatch, glob patterns use path prefix heuristic)
 */
export async function findInvalidSourcePaths(sourcePaths, excludePatterns) {
  if (!Array.isArray(sourcePaths) || sourcePaths.length === 0) {
    return [];
  }

  if (!Array.isArray(excludePatterns) || excludePatterns.length === 0) {
    return [];
  }

  const invalidPaths = [];

  for (const sourcePath of sourcePaths) {
    if (typeof sourcePath !== "string" || !sourcePath) {
      continue;
    }

    // Skip paths starting with "!" (exclusion patterns)
    if (sourcePath.startsWith("!")) {
      continue;
    }

    // Skip remote URLs
    if (isRemoteFile(sourcePath)) {
      continue;
    }

    // Check glob pattern: use heuristic algorithm
    if (isGlobPattern(sourcePath)) {
      const representativePath = getPathPrefix(sourcePath);
      if (isDirExcluded(representativePath, excludePatterns)) {
        invalidPaths.push(sourcePath);
      }
      continue;
    }

    try {
      const stats = await stat(sourcePath);
      // Skip file
      if (stats.isFile()) {
        continue;
      }
      // Check dir with minimatch
      if (stats.isDirectory()) {
        if (isDirExcluded(sourcePath, excludePatterns)) {
          invalidPaths.push(sourcePath);
        }
      }
    } catch {
      // Path doesn't exist
      invalidPaths.push(sourcePath);
    }
  }

  return invalidPaths;
}
