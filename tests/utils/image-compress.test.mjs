import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as debugModule from "../../utils/debug.mjs";
import { compressImage } from "../../utils/image-compress.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("image-compress", () => {
  let testDir;
  let debugSpy;
  let mockSharpInstance;
  let sharpSpy;

  beforeEach(async () => {
    // Create test directory
    testDir = join(
      tmpdir(),
      `test-image-compress-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    );
    await mkdir(testDir, { recursive: true });

    // Mock debug
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});

    // Create mock sharp instance with chainable methods
    mockSharpInstance = {
      metadata: mock(() => Promise.resolve({ width: 1000, height: 800, format: "jpeg" })),
      resize: mock(function () {
        return this;
      }),
      jpeg: mock(function () {
        return this;
      }),
      png: mock(function () {
        return this;
      }),
      webp: mock(function () {
        return this;
      }),
      toFile: mock(() => Promise.resolve({})),
    };

    // Mock sharp module to return our mock instance
    const sharpModule = await import("sharp");
    sharpSpy = spyOn(sharpModule, "default").mockImplementation(() => mockSharpInstance);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    debugSpy?.mockRestore();
    sharpSpy?.mockRestore();
  });

  describe("compressImage", () => {
    test("should compress JPEG image with default quality", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      const result = await compressImage(inputPath, {
        outputPath,
      });

      expect(result).toBe(outputPath);
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80, mozjpeg: true });
      expect(mockSharpInstance.toFile).toHaveBeenCalled();
    });

    test("should compress PNG image", async () => {
      const inputPath = join(testDir, "test.png");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.png");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({ width: 1000, height: 800, format: "png" });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      const result = await compressImage(inputPath, {
        outputPath,
        quality: 90,
      });

      expect(result).toBe(outputPath);
      expect(mockSharpInstance.png).toHaveBeenCalledWith({ quality: 90, compressionLevel: 9 });
    });

    test("should compress WebP image", async () => {
      const inputPath = join(testDir, "test.webp");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.webp");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "webp",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      const result = await compressImage(inputPath, {
        outputPath,
        quality: 85,
      });

      expect(result).toBe(outputPath);
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 85 });
    });

    test("should resize image when maxWidth is specified", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 3000,
        height: 2000,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        maxWidth: 2048,
      });

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(2048, 1365, {
        fit: "inside",
        withoutEnlargement: true,
      });
    });

    test("should resize image when maxHeight is specified", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      // Use image with height > maxHeight to trigger resize
      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 3000,
        height: 3000,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        maxHeight: 2048,
      });

      // When maxHeight is specified and height exceeds it, width should be adjusted
      // 3000x3000 with maxHeight 2048: aspect ratio 1.0, so width = 2048 * 1.0 = 2048
      expect(mockSharpInstance.resize).toHaveBeenCalled();
      const resizeCall = mockSharpInstance.resize.mock.calls[0];
      expect(resizeCall[0]).toBe(2048);
      expect(resizeCall[1]).toBe(2048);
    });

    test("should resize image when both maxWidth and maxHeight are specified", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 3000,
        height: 2000,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        maxWidth: 2048,
        maxHeight: 1536,
      });

      // Should respect both limits, starting with width
      expect(mockSharpInstance.resize).toHaveBeenCalled();
    });

    test("should not resize if dimensions are within limits", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        maxWidth: 2048,
        maxHeight: 2048,
      });

      // Should not call resize if dimensions are within limits
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();
    });

    test("should compress to target file size with maxSizeBytes", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");

      mockSharpInstance.metadata.mockResolvedValue({ width: 1000, height: 800, format: "jpeg" });

      // Mock file size checks - first attempt too large, second attempt succeeds
      let attemptCount = 0;
      const originalStat = stat;
      const statSpy = spyOn(await import("node:fs/promises"), "stat").mockImplementation(
        async (path) => {
          if (path === outputPath) {
            attemptCount++;
            const mockSize = attemptCount === 1 ? 2 * 1024 * 1024 : 500 * 1024; // 2MB then 500KB
            await writeFile(outputPath, "x".repeat(mockSize));
            return { size: mockSize, mtimeMs: Date.now() };
          }
          return originalStat(path);
        },
      );

      mockSharpInstance.toFile.mockImplementation(async () => {
        return {};
      });

      const result = await compressImage(inputPath, {
        outputPath,
        maxSizeBytes: 1 * 1024 * 1024, // 1MB
        quality: 80,
      });

      expect(result).toBe(outputPath);
      // Should have attempted multiple times to reach target size
      expect(attemptCount).toBeGreaterThan(1);
      statSpy.mockRestore();
    });

    test("should stop compression attempts when quality reaches minimum", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");

      mockSharpInstance.metadata.mockResolvedValue({ width: 1000, height: 800, format: "jpeg" });

      // Mock file size to always be too large
      const originalStat = stat;
      const statSpy = spyOn(await import("node:fs/promises"), "stat").mockImplementation(
        async (path) => {
          if (path === outputPath) {
            await writeFile(outputPath, "x".repeat(2 * 1024 * 1024)); // Always 2MB
            return { size: 2 * 1024 * 1024, mtimeMs: Date.now() };
          }
          return originalStat(path);
        },
      );

      mockSharpInstance.toFile.mockImplementation(async () => {
        return {};
      });

      const result = await compressImage(inputPath, {
        outputPath,
        maxSizeBytes: 1 * 1024 * 1024, // 1MB
        quality: 30, // Start with low quality
      });

      expect(result).toBe(outputPath);
      // Should stop when quality reaches 20 (max 10 attempts)
      expect(mockSharpInstance.toFile.mock.calls.length).toBeLessThanOrEqual(10);
      statSpy.mockRestore();
    });

    test("should auto-detect format from file extension", async () => {
      const inputPath = join(testDir, "test.png");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.png");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({ width: 1000, height: 800, format: "png" });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
      });

      expect(mockSharpInstance.png).toHaveBeenCalled();
    });

    test("should default to JPEG for unknown formats", async () => {
      const inputPath = join(testDir, "test.unknown");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "unknown",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
      });

      expect(mockSharpInstance.jpeg).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown image format"));
    });

    test("should use specified outputFormat", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.webp");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        outputFormat: "webp",
      });

      expect(mockSharpInstance.webp).toHaveBeenCalled();
    });

    test("should create temp file if outputPath not provided", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      const result = await compressImage(inputPath);

      expect(result).toContain("test.compressed.jpg");
      expect(result).toContain(testDir);
    });

    test("should return original path if compression fails", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");

      mockSharpInstance.metadata.mockRejectedValueOnce(new Error("Sharp error"));

      const result = await compressImage(inputPath, {
        outputPath: join(testDir, "compressed.jpg"),
      });

      expect(result).toBe(inputPath);
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to compress image"),
        expect.any(Error),
      );
    });

    test("should handle resize and size compression together", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");

      mockSharpInstance.metadata.mockResolvedValue({ width: 3000, height: 2000, format: "jpeg" });

      let attemptCount = 0;
      const originalStat = stat;
      const statSpy = spyOn(await import("node:fs/promises"), "stat").mockImplementation(
        async (path) => {
          if (path === outputPath) {
            attemptCount++;
            const mockSize = attemptCount === 1 ? 2 * 1024 * 1024 : 500 * 1024;
            await writeFile(outputPath, "x".repeat(mockSize));
            return { size: mockSize, mtimeMs: Date.now() };
          }
          return originalStat(path);
        },
      );

      mockSharpInstance.toFile.mockImplementation(async () => {
        return {};
      });

      await compressImage(inputPath, {
        outputPath,
        maxWidth: 2048,
        maxHeight: 2048,
        maxSizeBytes: 1 * 1024 * 1024,
        quality: 80,
      });

      expect(mockSharpInstance.resize).toHaveBeenCalled();
      expect(attemptCount).toBeGreaterThan(1);
      statSpy.mockRestore();
    });

    test("should maintain aspect ratio when resizing", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      // 3000x2000 = 1.5:1 aspect ratio
      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 3000,
        height: 2000,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        maxWidth: 2048,
      });

      // Should calculate: 2048 / 1.5 = 1365.33, rounded to 1365
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(2048, 1365, {
        fit: "inside",
        withoutEnlargement: true,
      });
    });

    test("should handle edge case: zero dimensions", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({ width: 0, height: 0, format: "jpeg" });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      const result = await compressImage(inputPath, {
        outputPath,
      });

      expect(result).toBe(outputPath);
    });

    test("should handle edge case: very large dimensions", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 10000,
        height: 8000,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        maxWidth: 2048,
        maxHeight: 2048,
      });

      expect(mockSharpInstance.resize).toHaveBeenCalled();
    });

    test("should handle PNG compression with compressionLevel", async () => {
      const inputPath = join(testDir, "test.png");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.png");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({ width: 1000, height: 800, format: "png" });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        quality: 90,
      });

      expect(mockSharpInstance.png).toHaveBeenCalledWith({ quality: 90, compressionLevel: 9 });
    });

    test("should handle JPEG compression with mozjpeg", async () => {
      const inputPath = join(testDir, "test.jpg");
      await writeFile(inputPath, "fake image data");
      const outputPath = join(testDir, "compressed.jpg");
      await writeFile(outputPath, "compressed data");

      mockSharpInstance.metadata.mockResolvedValueOnce({
        width: 1000,
        height: 800,
        format: "jpeg",
      });
      mockSharpInstance.toFile.mockResolvedValueOnce({});

      await compressImage(inputPath, {
        outputPath,
        quality: 85,
      });

      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 85, mozjpeg: true });
    });
  });
});
