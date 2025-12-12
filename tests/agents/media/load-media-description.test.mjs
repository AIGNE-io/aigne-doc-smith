import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import loadMediaDescription from "../../../agents/media/load-media-description.mjs";
import * as d2UtilsModule from "../../../utils/d2-utils.mjs";
import * as debugModule from "../../../utils/debug.mjs";
import * as fileUtilsModule from "../../../utils/file-utils.mjs";
import * as imageCompressModule from "../../../utils/image-compress.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("load-media-description", () => {
  let testDir;
  let docsDir;
  let cacheDir;
  let debugSpy;
  let compressImageSpy;
  let ensureTmpDirSpy;
  let getMediaDescriptionCachePathSpy;
  let sharpMetadataMock;
  let mockContext;
  let mockInvoke;
  let processCwdSpy;

  beforeEach(async () => {
    // Create test directory structure
    testDir = join(
      tmpdir(),
      `test-media-desc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    );
    docsDir = join(testDir, "docs");
    cacheDir = join(testDir, ".aigne/doc-smith");
    await mkdir(docsDir, { recursive: true });
    await mkdir(cacheDir, { recursive: true });

    // Mock process.cwd to return testDir
    processCwdSpy = spyOn(process, "cwd").mockReturnValue(testDir);

    // Mock debug
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});

    // Mock compressImage
    compressImageSpy = spyOn(imageCompressModule, "compressImage").mockImplementation(
      async (inputPath, options) => {
        return options.outputPath || inputPath;
      },
    );

    // Mock ensureTmpDir
    ensureTmpDirSpy = spyOn(d2UtilsModule, "ensureTmpDir").mockResolvedValue();

    // Mock getMediaDescriptionCachePath
    getMediaDescriptionCachePathSpy = spyOn(
      fileUtilsModule,
      "getMediaDescriptionCachePath",
    ).mockReturnValue(join(cacheDir, "media-description.yaml"));

    // Mock sharp metadata
    sharpMetadataMock = mock(() => Promise.resolve({ width: 1000, height: 800 }));

    // Mock sharp module - need to import first
    const sharpModule = await import("sharp");
    const mockSharpInstance = {
      metadata: sharpMetadataMock,
    };
    spyOn(sharpModule, "default").mockImplementation(() => mockSharpInstance);

    // Mock context and agents
    mockInvoke = mock(async (agent, input) => {
      if (agent === mockContext.agents.generateMediaDescription) {
        return {
          hash: input.hash,
          path: input.path,
          description: `Generated description for ${input.path}`,
        };
      }
      return {};
    });

    mockContext = {
      agents: {
        generateMediaDescription: {
          invoke: mockInvoke,
        },
      },
      invoke: mockInvoke,
    };
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    debugSpy?.mockRestore();
    compressImageSpy?.mockRestore();
    ensureTmpDirSpy?.mockRestore();
    getMediaDescriptionCachePathSpy?.mockRestore();
    processCwdSpy?.mockRestore();
  });

  describe("basic functionality", () => {
    test("should return input when no media files provided", async () => {
      const result = await loadMediaDescription(
        {
          mediaFiles: [],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(result.assetsContent).toBeUndefined();
      expect(result.mediaFiles).toEqual([]);
    });

    test("should filter unsupported media types", async () => {
      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.gif",
              path: "test.gif",
              type: "image",
              mimeType: "image/gif", // Not supported
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(result.mediaFiles).toHaveLength(1);
      // Should not generate description for unsupported types
    });

    test("should load existing cache", async () => {
      const cachePath = join(cacheDir, "media-description.yaml");
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      // Calculate actual hash for the file
      const { createHash } = await import("node:crypto");
      const content = await readFile(imagePath);
      const testHash = createHash("sha256").update(content).digest("hex");

      const cacheContent = stringify({
        descriptions: {
          [testHash]: {
            path: "test.jpg",
            description: "Cached description",
            generatedAt: "2024-01-01T00:00:00Z",
          },
        },
        lastUpdated: "2024-01-01T00:00:00Z",
      });
      await writeFile(cachePath, cacheContent, "utf8");

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should use cached description
      expect(mockInvoke).not.toHaveBeenCalled();
      expect(result.assetsContent).toContain("Cached description");
    });
  });

  describe("SVG handling", () => {
    test("should process SVG files under size limit", async () => {
      const svgPath = join(docsDir, "test.svg");
      const svgContent = '<svg><circle r="10"/></svg>';
      await writeFile(svgPath, svgContent, "utf8");

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.svg",
              path: "test.svg",
              type: "image",
              mimeType: "image/svg+xml",
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(mockInvoke).toHaveBeenCalled();
      const callArgs = mockInvoke.mock.calls[0][1];
      expect(callArgs.svgContent).toBe(svgContent);
    });

    test("should skip SVG files over size limit", async () => {
      const svgPath = join(docsDir, "large.svg");
      const largeSvgContent = "x".repeat(60 * 1024); // 60KB, over 50KB limit
      await writeFile(svgPath, largeSvgContent, "utf8");

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "large.svg",
              path: "large.svg",
              type: "image",
              mimeType: "image/svg+xml",
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    test("should handle SVG read errors gracefully", async () => {
      // Create a file that exists but will fail when reading
      const svgPath = join(docsDir, "error.svg");
      // Create file but make it unreadable by mocking readFile to fail
      await writeFile(svgPath, "fake svg", "utf8");

      // Mock readFile to fail for SVG content reading
      const originalReadFile = readFile;
      const readFileSpy = spyOn(await import("node:fs/promises"), "readFile").mockImplementation(
        async (path, encoding) => {
          if (path === svgPath && encoding === "utf8") {
            throw new Error("Failed to read file");
          }
          return originalReadFile(path, encoding);
        },
      );

      const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "error.svg",
              path: "error.svg",
              type: "image",
              mimeType: "image/svg+xml",
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should continue processing without crashing
      expect(result).toBeDefined();
      expect(mockInvoke).not.toHaveBeenCalled();
      // Should have warned about the error
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to read SVG file"),
        expect.any(String),
      );
      readFileSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("image compression", () => {
    test("should compress images larger than 1MB", async () => {
      const imagePath = join(docsDir, "large.jpg");
      // Create a file that appears large
      const largeContent = Buffer.alloc(2 * 1024 * 1024, "x"); // 2MB
      await writeFile(imagePath, largeContent);

      sharpMetadataMock.mockResolvedValueOnce({ width: 1000, height: 800 });

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "large.jpg",
              path: "large.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(compressImageSpy).toHaveBeenCalled();
      expect(ensureTmpDirSpy).toHaveBeenCalled();
    });

    test("should skip compression for images <= 1MB", async () => {
      const imagePath = join(docsDir, "small.jpg");
      const smallContent = Buffer.alloc(500 * 1024, "x"); // 500KB
      await writeFile(imagePath, smallContent);

      sharpMetadataMock.mockResolvedValueOnce({ width: 1000, height: 800 });

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "small.jpg",
              path: "small.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(compressImageSpy).not.toHaveBeenCalled();
    });

    test("should use existing compressed file if available", async () => {
      const imagePath = join(docsDir, "large.jpg");
      const largeContent = Buffer.alloc(2 * 1024 * 1024, "x"); // 2MB
      await writeFile(imagePath, largeContent);

      // Create compressed file in temp directory
      const tmpCompressedPath = join(testDir, ".aigne/doc-smith/.tmp/docs/large.compressed.jpg");
      await mkdir(dirname(tmpCompressedPath), { recursive: true });
      await writeFile(tmpCompressedPath, "compressed data");

      sharpMetadataMock.mockResolvedValueOnce({ width: 1000, height: 800 });

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "large.jpg",
              path: "large.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(compressImageSpy).not.toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("Compressed file already exists"),
      );
    });

    test("should handle compression errors gracefully", async () => {
      const imagePath = join(docsDir, "error.jpg");
      const largeContent = Buffer.alloc(2 * 1024 * 1024, "x"); // 2MB
      await writeFile(imagePath, largeContent);

      compressImageSpy.mockRejectedValueOnce(new Error("Compression failed"));

      sharpMetadataMock.mockResolvedValueOnce({ width: 1000, height: 800 });

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "error.jpg",
              path: "error.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should continue processing with original file
      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe("incremental save", () => {
    test("should save cache after each successful description generation", async () => {
      const imagePath1 = join(docsDir, "image1.jpg");
      const imagePath2 = join(docsDir, "image2.jpg");
      await writeFile(imagePath1, "fake image data");
      await writeFile(imagePath2, "fake image data");

      const writeFileSpy = spyOn(await import("node:fs/promises"), "writeFile").mockResolvedValue();

      let invokeCount = 0;
      mockInvoke.mockImplementation(async (_agent, input) => {
        invokeCount++;
        // Simulate async processing
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          hash: input.hash,
          path: input.path,
          description: `Description ${invokeCount}`,
        };
      });

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "image1.jpg",
              path: "image1.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
            {
              name: "image2.jpg",
              path: "image2.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should save cache multiple times (once per successful generation)
      expect(writeFileSpy).toHaveBeenCalledTimes(2);
      writeFileSpy.mockRestore();
    });

    test("should continue processing after individual failures", async () => {
      const imagePath1 = join(docsDir, "image1.jpg");
      const imagePath2 = join(docsDir, "image2.jpg");
      await writeFile(imagePath1, "fake image data");
      await writeFile(imagePath2, "fake image data");

      let invokeCount = 0;
      mockInvoke.mockImplementation(async (_agent, input) => {
        invokeCount++;
        if (invokeCount === 1) {
          throw new Error("First image failed");
        }
        return {
          hash: input.hash,
          path: input.path,
          description: "Second image description",
        };
      });

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "image1.jpg",
              path: "image1.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
            {
              name: "image2.jpg",
              path: "image2.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should have processed both files
      expect(mockInvoke).toHaveBeenCalledTimes(2);
      // Should have saved at least one description
      expect(result.assetsContent).toBeDefined();
    });

    test("should use original file hash and path in cache", async () => {
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      const cachePath = join(cacheDir, "media-description.yaml");
      let savedCache = null;
      const writeFileSpy = spyOn(await import("node:fs/promises"), "writeFile").mockImplementation(
        async (path, content) => {
          if (path === cachePath) {
            savedCache = parse(content);
          }
        },
      );

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Check that cache uses original path, not compressed path
      const cacheEntries = Object.values(savedCache.descriptions || {});
      expect(cacheEntries.length).toBeGreaterThan(0);
      expect(cacheEntries[0].path).toBe("test.jpg"); // Original path
      writeFileSpy.mockRestore();
    });
  });

  describe("concurrent processing", () => {
    test("should process multiple files concurrently", async () => {
      const imagePaths = Array.from({ length: 10 }, (_, i) => ({
        path: join(docsDir, `image${i}.jpg`),
        name: `image${i}.jpg`,
      }));

      for (const { path } of imagePaths) {
        await writeFile(path, "fake image data");
      }

      const startTime = Date.now();
      let concurrentCount = 0;
      let maxConcurrent = 0;
      const activePromises = new Set();

      mockInvoke.mockImplementation(async (_agent, input) => {
        const promiseId = Symbol();
        activePromises.add(promiseId);
        concurrentCount = activePromises.size;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);

        await new Promise((resolve) => setTimeout(resolve, 50));
        activePromises.delete(promiseId);

        return {
          hash: input.hash,
          path: input.path,
          description: `Description for ${input.path}`,
        };
      });

      await loadMediaDescription(
        {
          mediaFiles: imagePaths.map(({ name }) => ({
            name,
            path: name,
            type: "image",
            mimeType: "image/jpeg",
            width: 1000,
            height: 800,
          })),
          docsDir: "docs",
        },
        { context: mockContext },
      );

      const duration = Date.now() - startTime;
      // With concurrency of 5, 10 files should take roughly 2 batches
      // If sequential, it would take ~500ms, with concurrency it should be faster
      expect(duration).toBeLessThan(300); // Should be faster than sequential
      expect(maxConcurrent).toBeLessThanOrEqual(5); // Should respect concurrency limit
    });
  });

  describe("hash calculation", () => {
    test("should use file content hash for small files", async () => {
      const imagePath = join(docsDir, "small.jpg");
      const imageContent = "fake image data";
      await writeFile(imagePath, imageContent);

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "small.jpg",
              path: "small.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Hash should be calculated based on file content
      expect(mockInvoke).toHaveBeenCalled();
    });

    test("should use metadata hash for large files", async () => {
      const imagePath = join(docsDir, "large.jpg");
      // Create a large file (15MB, over 10MB threshold)
      const largeContent = Buffer.alloc(15 * 1024 * 1024, "x");
      await writeFile(imagePath, largeContent);

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "large.jpg",
              path: "large.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should still process the file
      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe("video files", () => {
    test("should process supported video files", async () => {
      const videoPath = join(docsDir, "test.mp4");
      await writeFile(videoPath, "fake video data");

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.mp4",
              path: "test.mp4",
              type: "video",
              mimeType: "video/mp4",
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(mockInvoke).toHaveBeenCalled();
    });

    test("should skip unsupported video types", async () => {
      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.avi",
              path: "test.avi",
              type: "video",
              mimeType: "video/unsupported",
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    test("should handle cache read errors", async () => {
      const cachePath = join(cacheDir, "media-description.yaml");
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, "invalid yaml content: [", "utf8");

      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should continue processing despite cache error
      expect(mockInvoke).toHaveBeenCalled();
    });

    test("should handle missing cache file", async () => {
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should create new cache
      expect(mockInvoke).toHaveBeenCalled();
    });

    test("should handle agent invocation errors", async () => {
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      mockInvoke.mockRejectedValueOnce(new Error("Agent error"));

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should handle error gracefully
      expect(result).toBeDefined();
    });

    test("should handle missing description in result", async () => {
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      mockInvoke.mockResolvedValueOnce({
        hash: "test-hash",
        // Missing description
      });

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      // Should continue processing
      expect(result).toBeDefined();
    });
  });

  describe("assetsContent generation", () => {
    test("should generate assetsContent with descriptions", async () => {
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(result.assetsContent).toBeDefined();
      expect(result.assetsContent).toContain("Available Media Assets");
      expect(result.assetsContent).toContain("test.jpg");
    });

    test("should include description in assetsContent", async () => {
      const imagePath = join(docsDir, "test.jpg");
      await writeFile(imagePath, "fake image data");

      mockInvoke.mockResolvedValueOnce({
        hash: "test-hash",
        path: "test.jpg",
        description: "A beautiful test image",
      });

      const result = await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "test.jpg",
              path: "test.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(result.assetsContent).toContain("A beautiful test image");
    });

    test("should not generate assetsContent when no media files", async () => {
      const result = await loadMediaDescription(
        {
          mediaFiles: [],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(result.assetsContent).toBeUndefined();
    });
  });

  describe("temp directory structure", () => {
    test("should create compressed files in temp directory with correct structure", async () => {
      const imagePath = join(docsDir, "assets/images/photo.jpg");
      await mkdir(dirname(imagePath), { recursive: true });
      const largeContent = Buffer.alloc(2 * 1024 * 1024, "x"); // 2MB
      await writeFile(imagePath, largeContent);

      sharpMetadataMock.mockResolvedValueOnce({ width: 1000, height: 800 });

      compressImageSpy.mockImplementation(async (_inputPath, options) => {
        // Verify the output path structure
        expect(options.outputPath).toContain(".aigne/doc-smith/.tmp");
        expect(options.outputPath).toContain("docs/assets/images");
        expect(options.outputPath).toContain("photo.compressed.jpg");
        return options.outputPath;
      });

      await loadMediaDescription(
        {
          mediaFiles: [
            {
              name: "photo.jpg",
              path: "assets/images/photo.jpg",
              type: "image",
              mimeType: "image/jpeg",
              width: 1000,
              height: 800,
            },
          ],
          docsDir: "docs",
        },
        { context: mockContext },
      );

      expect(compressImageSpy).toHaveBeenCalled();
    });
  });
});
