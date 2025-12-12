import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";
import { getMediaDescriptionCachePath } from "../../utils/file-utils.mjs";
import { compressImage } from "../../utils/image-compress.mjs";
import sharp from "sharp";
import { debug } from "../../utils/debug.mjs";
import { DOC_SMITH_DIR, TMP_DIR } from "../../utils/constants/index.mjs";
import { ensureTmpDir } from "../../utils/d2-utils.mjs";
import pMap from "p-map";

const SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB
const SVG_SIZE_THRESHOLD = 50 * 1024; // 50KB for SVG files
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_IMAGE_RESOLUTION = 2048; // 2K

// Supported MIME types for Gemini AI
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const SUPPORTED_SVG_TYPES = new Set(["image/svg+xml"]);

const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
]);

/**
 * Calculate hash for a media file
 * For files < 10MB: use file content
 * For files >= 10MB: use path + size + mtime to avoid memory issues
 * @param {string} absolutePath - The absolute path to the media file
 * @returns {Promise<string>} - The hash of the file
 */
async function calculateMediaHash(absolutePath) {
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
 * Load media descriptions from cache and generate new ones if needed
 * @param {Object} input - Input parameters
 * @param {Array} input.mediaFiles - Array of media file objects from load-sources
 * @param {string} input.docsDir - Base directory for documentation
 * @param {Object} options - Agent options
 * @returns {Promise<Object>} - Updated assetsContent with media descriptions
 */
export default async function loadMediaDescription(input, options) {
  const { mediaFiles = [], docsDir } = input;

  // Filter to get image, video and svg files with supported MIME types
  const mediaFilesToProcess = mediaFiles.filter((file) => {
    if (file.type === "image") {
      return SUPPORTED_IMAGE_TYPES.has(file.mimeType) || SUPPORTED_SVG_TYPES.has(file.mimeType);
    }
    if (file.type === "video") {
      return SUPPORTED_VIDEO_TYPES.has(file.mimeType);
    }
    return false;
  });

  // Path to media description cache file
  const cacheFilePath = getMediaDescriptionCachePath();

  // Load existing cache
  let cache = {};
  if (existsSync(cacheFilePath)) {
    try {
      const cacheContent = await readFile(cacheFilePath, "utf8");
      const parsedCache = parse(cacheContent);
      cache = parsedCache?.descriptions || {};
    } catch (error) {
      console.warn("Failed to read media description cache:", error.message);
    }
  }

  // Find media files without descriptions
  const mediaToDescribe = [];
  const mediaHashMap = new Map();

  const absoluteDocsDir = path.resolve(process.cwd(), docsDir);

  // Only process media files that need AI description
  for (const mediaFile of mediaFilesToProcess) {
    // Convert relative path to absolute path for consistent hashing
    // mediaFiles.path is relative to docsDir
    const absolutePath = path.join(absoluteDocsDir, mediaFile.path);
    const mediaHash = await calculateMediaHash(absolutePath);
    mediaHashMap.set(mediaFile.path, mediaHash);

    if (!cache[mediaHash]) {
      const isSvg = SUPPORTED_SVG_TYPES.has(mediaFile.mimeType);

      if (isSvg) {
        // For SVG files, check size and read content
        try {
          const stats = await stat(absolutePath);
          if (stats.size > SVG_SIZE_THRESHOLD) {
            console.warn(
              `SVG file ${mediaFile.path} exceeds ${SVG_SIZE_THRESHOLD / 1024}KB limit, skipping`,
            );
            continue;
          }

          const svgContent = await readFile(absolutePath, "utf8");
          mediaToDescribe.push({
            ...mediaFile,
            hash: mediaHash,
            path: mediaFile.path,
            svgContent,
          });
        } catch (error) {
          console.warn(`Failed to read SVG file ${mediaFile.path}:`, error.message);
        }
      } else {
        // For non-SVG media files, check if compression is needed
        let finalImagePath = absolutePath;
        let shouldCompress = false;

        try {
          // Check file size and dimensions
          const fileStats = await stat(absolutePath);
          const fileSize = fileStats.size;

          // Get image dimensions
          const metadata = await sharp(absolutePath).metadata();
          const { width, height } = metadata;

          // Determine if compression is needed
          // Compression rules:
          // 1. Only compress files larger than 1MB
          // 2. Compressed file must have resolution <= 2K and size < 1MB
          // 3. Files <= 1MB are never compressed, regardless of resolution
          const exceedsSize = fileSize > MAX_IMAGE_SIZE;

          // Only compress if file size > 1MB
          // For files <= 1MB, skip compression regardless of resolution
          if (exceedsSize) {
            // Create temporary compressed file path in temp directory with same relative structure
            // Example: docs/assets/images/photo.jpg -> .aigne/doc-smith/.tmp/docs/assets/images/photo.compressed.jpg
            await ensureTmpDir();
            const tmpBaseDir = path.join(process.cwd(), DOC_SMITH_DIR, TMP_DIR);

            // Get relative path from docsDir to maintain structure
            // mediaFile.path is already relative to docsDir (e.g., "assets/images/photo.jpg")
            const relativePath = mediaFile.path;
            const relativeDir = path.dirname(relativePath);
            const fileName = path.basename(relativePath, path.extname(relativePath));
            const fileExt = path.extname(relativePath);

            // Normalize docsDir to handle both relative and absolute paths
            // If docsDir is absolute, extract the relative part from cwd
            let normalizedDocsDir = docsDir;
            if (path.isAbsolute(docsDir)) {
              const cwd = process.cwd();
              if (docsDir.startsWith(cwd)) {
                normalizedDocsDir = path.relative(cwd, docsDir);
              } else {
                // If docsDir is outside cwd, use just the basename
                normalizedDocsDir = path.basename(docsDir);
              }
            }

            // Create temp directory structure matching the relative path
            // Structure: .aigne/doc-smith/.tmp/{docsDir}/{relativeDir}
            const tempDir = path.join(tmpBaseDir, normalizedDocsDir, relativeDir);
            await mkdir(tempDir, { recursive: true });

            // Create compressed file path
            const tempFileName = `${fileName}.compressed${fileExt}`;
            const tempPath = path.join(tempDir, tempFileName);

            // Check if compressed file already exists in cache directory
            if (existsSync(tempPath)) {
              debug(`Compressed file already exists for ${mediaFile.path}, skipping compression`);
              finalImagePath = tempPath;
              shouldCompress = true;
            } else {
              shouldCompress = true;
              debug(
                `Compressing image ${mediaFile.path} (size: ${(fileSize / 1024 / 1024).toFixed(2)}MB, resolution: ${width}x${height})`,
              );

              // Compress image with constraints
              // For files > 1MB: compress to resolution <= 2K and size < 1MB
              finalImagePath = await compressImage(absolutePath, {
                maxWidth: MAX_IMAGE_RESOLUTION, // Always limit to 2K
                maxHeight: MAX_IMAGE_RESOLUTION, // Always limit to 2K
                maxSizeBytes: MAX_IMAGE_SIZE, // Always limit to 1MB
                outputPath: tempPath,
                quality: 70, // Start with good quality
              });

              // Verify compressed file size
              const compressedStats = await stat(finalImagePath);
              if (compressedStats.size > MAX_IMAGE_SIZE) {
                console.warn(
                  `Compressed image ${mediaFile.path} still exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB (${(compressedStats.size / 1024 / 1024).toFixed(2)}MB), using compressed version anyway`,
                );
              } else {
                debug(
                  `✅ Image compressed: ${mediaFile.path} -> ${(compressedStats.size / 1024 / 1024).toFixed(2)}MB`,
                );
              }
            }
          } else {
            debug(
              `Image ${mediaFile.path} is <= 1MB (size: ${(fileSize / 1024 / 1024).toFixed(2)}MB, resolution: ${width}x${height}), skipping compression`,
            );
          }
        } catch (error) {
          console.warn(`Failed to compress image ${mediaFile.path}:`, error.message);
          // Use original path if compression fails
          finalImagePath = absolutePath;
        }

        // For non-SVG media files, use mediaFile field
        mediaToDescribe.push({
          ...mediaFile,
          hash: mediaHash,
          path: mediaFile.path,
          mediaFile: [
            {
              type: "local",
              path: finalImagePath,
              filename: mediaFile.name,
              mimeType: mediaFile.mimeType,
            },
          ],
          _compressed: shouldCompress, // Track if compression was applied for cleanup
          _originalPath: shouldCompress ? absolutePath : undefined, // Store original path for cleanup
        });
      }
    }
  }

  // Generate descriptions for media files without cache - batch processing with incremental save
  const newDescriptions = {};
  const results = []; // Track all results for accurate counting

  if (mediaToDescribe.length > 0) {
    // Ensure cache directory exists
    await mkdir(path.dirname(cacheFilePath), { recursive: true });

    // Create a write lock queue to ensure thread-safe cache updates
    let writeQueue = Promise.resolve();
    // Keep in-memory cache in sync to avoid unnecessary file reads
    const inMemoryCache = { ...cache };

    // Helper function to save cache with lock
    // Optimized: Use in-memory cache to reduce file I/O
    const saveCacheWithLock = async (newEntry) => {
      // Add to write queue to ensure sequential writes
      writeQueue = writeQueue
        .then(async () => {
          try {
            // Merge new entry into in-memory cache
            Object.assign(inMemoryCache, newEntry);

            // Save to disk
            const cacheYaml = stringify({
              descriptions: inMemoryCache,
              lastUpdated: new Date().toISOString(),
            });
            await writeFile(cacheFilePath, cacheYaml, "utf8");
            // Only update in-memory cache after successful write
            return true;
          } catch (error) {
            // Rollback: remove the entry from in-memory cache if write failed
            for (const key of Object.keys(newEntry)) {
              delete inMemoryCache[key];
            }
            console.error(`Failed to save cache: ${error.message}`);
            throw error;
          }
        })
        .catch(() => {
          // Don't let one write failure break the queue
          // Error is already logged above
          return false;
        });
      await writeQueue;
    };

    // Process media files concurrently with incremental save
    // Use pMap for concurrent processing with controlled concurrency
    const CONCURRENCY = 5; // Process 5 files concurrently

    await pMap(
      mediaToDescribe,
      async (mediaItem, index) => {
        const result = { success: false, path: mediaItem.path, error: null };

        try {
          // Generate description for single media file
          // Note: If compression was applied, mediaItem.mediaFile[0].path points to compressed file
          // This compressed file is used for upload, but cache uses original file hash and path
          const agentResult = await options.context.invoke(
            options.context.agents["generateMediaDescription"],
            mediaItem,
          );

          // Check if description was generated successfully
          // Note: agentResult.hash and agentResult.path come from the agent, but we need to ensure
          // we use the original file path and hash for caching, not the compressed file path
          if (agentResult?.hash && agentResult?.description) {
            // Use original file path and hash for cache entry
            // The compressed file is only used for upload, but cache should reference original file
            const originalPath = mediaItem.path;
            const originalHash = mediaItem.hash;

            const descriptionEntry = {
              path: originalPath, // Use original file path, not compressed file path
              description: agentResult.description,
              generatedAt: new Date().toISOString(),
            };

            // Immediately save to cache using lock mechanism
            await saveCacheWithLock({ [originalHash]: descriptionEntry });

            // Track in memory for summary
            newDescriptions[originalHash] = descriptionEntry;
            result.success = true;

            debug(
              `✅ Generated and saved description for ${mediaItem.path} (${index + 1}/${mediaToDescribe.length})`,
            );
          } else {
            result.error = "No description in result";
            console.warn(
              `Failed to generate description for ${mediaItem.path}: No description in result`,
            );
          }
        } catch (error) {
          result.error = error.message;
          console.error(`Failed to generate description for ${mediaItem.path}:`, error.message);
          // Continue processing other files even if one fails
        }

        results.push(result);
        return result;
      },
      { concurrency: CONCURRENCY },
    );

    // Calculate accurate counts from results
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    // Update cache reference to in-memory cache
    Object.assign(cache, inMemoryCache);

    // Log summary
    if (successCount > 0) {
      console.log(
        `Generated descriptions for ${successCount} media files (${errorCount} errors, ${mediaToDescribe.length - successCount - errorCount} skipped)`,
      );
    }
    if (errorCount > 0) {
      console.warn(
        `⚠️  Failed to generate descriptions for ${errorCount} media files. Completed descriptions have been saved.`,
      );
    }
  }

  // Build enhanced assetsContent with descriptions
  let enhancedAssetsContent;

  if (mediaFiles.length > 0) {
    enhancedAssetsContent = "# Available Media Assets for Documentation\n\n";
    const assets = mediaFiles.map((x) => {
      const mediaHash = mediaHashMap.get(x.path);
      const description = cache[mediaHash]?.description;
      const result = {
        name: x.name,
        path: x.path,
      };
      if (description) {
        result.description = description;
      }
      return result;
    });
    enhancedAssetsContent += stringify(assets);
  }

  return {
    ...input,
    assetsContent: enhancedAssetsContent,
    mediaFiles,
  };
}

loadMediaDescription.input_schema = {
  type: "object",
  properties: {
    mediaFiles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          path: { type: "string" },
          type: { type: "string" },
          width: { type: "number" },
          height: { type: "number" },
          mimeType: { type: "string" },
        },
      },
      description: "Array of media file objects (images/videos)",
    },
    docsDir: {
      type: "string",
      description: "Base directory for documentation",
    },
  },
  required: ["mediaFiles", "docsDir"],
};

loadMediaDescription.output_schema = {
  type: "object",
  properties: {
    assetsContent: {
      type: "string",
      description: "Enhanced assets content with media descriptions",
    },
    mediaFiles: {
      type: "array",
      description: "Array of media file objects",
    },
  },
};
