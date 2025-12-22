import sharp from "sharp";
import path from "node:path";
import { stat } from "node:fs/promises";
import { debug } from "./debug.mjs";

/**
 * Compress an image using sharp
 * Supports JPEG, PNG, and WebP formats
 * @param {string} inputPath - Path to the input image file
 * @param {object} options - Compression options
 * @param {number} options.quality - Compression quality (0-100, default: 80)
 * @param {string} options.outputFormat - Output format: 'jpeg', 'png', 'webp' (default: auto-detect from input)
 * @param {string} options.outputPath - Output path for compressed image (if not provided, creates temp file)
 * @param {number} options.maxWidth - Maximum width in pixels (default: undefined, no limit)
 * @param {number} options.maxHeight - Maximum height in pixels (default: undefined, no limit)
 * @param {number} options.maxSizeBytes - Maximum file size in bytes (default: undefined, no limit)
 * @returns {Promise<string>} - Path to the compressed image (outputPath if provided, or temp path, or inputPath if compression fails)
 */
export async function compressImage(inputPath, options = {}) {
  const { quality = 80, outputFormat, outputPath, maxWidth, maxHeight, maxSizeBytes } = options;

  try {
    const inputExt = path.extname(inputPath).toLowerCase();

    // Determine output format
    let format = outputFormat;
    if (!format) {
      // Auto-detect from input extension
      if (inputExt === ".jpg" || inputExt === ".jpeg") {
        format = "jpeg";
      } else if (inputExt === ".png") {
        format = "png";
      } else if (inputExt === ".webp") {
        format = "webp";
      } else {
        // Default to JPEG for unknown formats
        format = "jpeg";
        debug(`Unknown image format ${inputExt}, defaulting to JPEG`);
      }
    }

    // Determine output path
    let finalOutputPath = outputPath;
    if (!finalOutputPath) {
      // If no output path provided, create temp file in same directory as input
      const outputExt = format === "jpeg" ? ".jpg" : format === "png" ? ".png" : ".webp";
      const inputDir = path.dirname(inputPath);
      const inputBase = path.basename(inputPath, path.extname(inputPath));
      finalOutputPath = path.join(inputDir, `${inputBase}.compressed${outputExt}`);
    }

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;

    // Calculate target dimensions if maxWidth or maxHeight is specified
    let targetWidth = width;
    let targetHeight = height;
    if (maxWidth || maxHeight) {
      const aspectRatio = width / height;
      if (maxWidth && width > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth / aspectRatio);
      }
      if (maxHeight && targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * aspectRatio);
      }
    }

    // Create sharp instance
    let sharpInstance = sharp(inputPath);

    // Resize if needed
    if (targetWidth !== width || targetHeight !== height) {
      sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
      debug(`Resizing image from ${width}x${height} to ${targetWidth}x${targetHeight}`);
    }

    // Apply format-specific compression options
    if (format === "jpeg") {
      // mozjpeg is a valid sharp option for better JPEG compression
      const jpegOptions = { quality, mozjpeg: true };
      sharpInstance = sharpInstance.jpeg(jpegOptions);
    } else if (format === "png") {
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
    } else if (format === "webp") {
      sharpInstance = sharpInstance.webp({ quality });
    }

    // If maxSizeBytes is specified, try to compress to target size
    if (maxSizeBytes) {
      let currentQuality = quality;
      const compressedPath = finalOutputPath;
      let attempts = 0;
      const maxAttempts = 10;
      const qualityStep = 5;

      while (attempts < maxAttempts) {
        // Create a new sharp instance for each attempt
        let attemptInstance = sharp(inputPath);
        if (targetWidth !== width || targetHeight !== height) {
          attemptInstance = attemptInstance.resize(targetWidth, targetHeight, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        // Apply format with current quality
        if (format === "jpeg") {
          attemptInstance = attemptInstance.jpeg({ quality: currentQuality, mozjpeg: true });
        } else if (format === "png") {
          attemptInstance = attemptInstance.png({ quality: currentQuality, compressionLevel: 9 });
        } else if (format === "webp") {
          attemptInstance = attemptInstance.webp({ quality: currentQuality });
        }

        await attemptInstance.toFile(compressedPath);

        const stats = await stat(compressedPath);
        if (stats.size <= maxSizeBytes || currentQuality <= 20) {
          // Target size achieved or quality too low, stop
          break;
        }

        // Reduce quality and try again
        currentQuality = Math.max(20, currentQuality - qualityStep);
        attempts++;
      }

      debug(
        `✅ Image compressed: ${inputPath} -> ${compressedPath} (format: ${format}, quality: ${currentQuality}, size: ${(await stat(compressedPath)).size} bytes)`,
      );

      return compressedPath;
    }

    // Write compressed image directly to output path
    await sharpInstance.toFile(finalOutputPath);

    debug(
      `✅ Image compressed: ${inputPath} -> ${finalOutputPath} (format: ${format}, quality: ${quality}, dimensions: ${targetWidth}x${targetHeight})`,
    );

    return finalOutputPath;
  } catch (error) {
    debug(`❌ Failed to compress image ${inputPath}`, error);
    // Return original path if compression fails
    return inputPath;
  }
}
