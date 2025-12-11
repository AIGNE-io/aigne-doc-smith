import sharp from "sharp";
import path from "node:path";
import { debug } from "./debug.mjs";

/**
 * Compress an image using sharp
 * Supports JPEG, PNG, and WebP formats
 * @param {string} inputPath - Path to the input image file
 * @param {object} options - Compression options
 * @param {number} options.quality - Compression quality (0-100, default: 80)
 * @param {string} options.outputFormat - Output format: 'jpeg', 'png', 'webp' (default: auto-detect from input)
 * @param {string} options.outputPath - Output path for compressed image (if not provided, creates temp file)
 * @returns {Promise<string>} - Path to the compressed image (outputPath if provided, or temp path, or inputPath if compression fails)
 */
export async function compressImage(inputPath, options = {}) {
  const { quality = 80, outputFormat, outputPath } = options;

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

    // Create sharp instance and compress
    let sharpInstance = sharp(inputPath);

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

    // Write compressed image directly to output path
    await sharpInstance.toFile(finalOutputPath);

    debug(
      `✅ Image compressed: ${inputPath} -> ${finalOutputPath} (format: ${format}, quality: ${quality})`,
    );

    return finalOutputPath;
  } catch (error) {
    debug(`❌ Failed to compress image ${inputPath}`, error);
    // Return original path if compression fails
    return inputPath;
  }
}
