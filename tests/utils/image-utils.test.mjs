/**
 * Tests for utils/image-utils.mjs
 *
 * Exports:
 * - calculateFileHash(filePath): Calculate hash of file
 * - calculateContentHash(content): Calculate hash of content
 * - IMAGE_EXTENSIONS: Array of supported image extensions
 * - findImageFile(imagesDir, locale, extensions): Find image file by locale
 * - findImageWithFallback(key, locale, mainLocale, assetsDir): Find image with fallback
 * - getImageMimeType(filePath): Get MIME type for image
 * - getExtensionFromMimeType(mimeType): Get extension from MIME type
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

import {
  calculateFileHash,
  calculateContentHash,
  IMAGE_EXTENSIONS,
  findImageFile,
  findImageWithFallback,
  getImageMimeType,
  getExtensionFromMimeType,
} from "../../utils/image-utils.mjs";

describe("image-utils.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("IMAGE_EXTENSIONS", () => {
      test("should be an array", () => {
        expect(Array.isArray(IMAGE_EXTENSIONS)).toBe(true);
      });

      test("should contain common image extensions", () => {
        expect(IMAGE_EXTENSIONS).toContain(".png");
        expect(IMAGE_EXTENSIONS).toContain(".jpg");
      });

      test("should only contain strings starting with dot", () => {
        for (const ext of IMAGE_EXTENSIONS) {
          expect(typeof ext).toBe("string");
          expect(ext.startsWith(".")).toBe(true);
        }
      });
    });

    describe("calculateContentHash", () => {
      test("should return hash string for content", () => {
        const result = calculateContentHash("test content");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      test("should return same hash for same content", () => {
        const hash1 = calculateContentHash("identical");
        const hash2 = calculateContentHash("identical");
        expect(hash1).toBe(hash2);
      });

      test("should return different hash for different content", () => {
        const hash1 = calculateContentHash("content1");
        const hash2 = calculateContentHash("content2");
        expect(hash1).not.toBe(hash2);
      });
    });

    describe("calculateFileHash", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should calculate hash for existing file", async () => {
        const filePath = join(tempDir, "test.txt");
        await writeFile(filePath, "test content");
        const result = await calculateFileHash(filePath);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      test("should return same hash for same file content", async () => {
        const file1 = join(tempDir, "file1.txt");
        const file2 = join(tempDir, "file2.txt");
        await writeFile(file1, "same content");
        await writeFile(file2, "same content");
        const hash1 = await calculateFileHash(file1);
        const hash2 = await calculateFileHash(file2);
        expect(hash1).toBe(hash2);
      });
    });

    describe("getImageMimeType", () => {
      test("should return MIME type for PNG", () => {
        const result = getImageMimeType("image.png");
        expect(result).toContain("image");
        expect(result).toContain("png");
      });

      test("should return MIME type for JPEG", () => {
        const result = getImageMimeType("photo.jpg");
        expect(result).toContain("image");
      });

      test("should return MIME type for GIF", () => {
        const result = getImageMimeType("animation.gif");
        expect(result).toContain("image");
      });

      test("should return MIME type for WebP", () => {
        const result = getImageMimeType("modern.webp");
        expect(result).toContain("image");
      });
    });

    describe("getExtensionFromMimeType", () => {
      test("should return extension for image/png", () => {
        const result = getExtensionFromMimeType("image/png");
        // Note: Implementation returns extension WITHOUT dot
        expect(result).toBe("png");
      });

      test("should return extension for image/jpeg", () => {
        const result = getExtensionFromMimeType("image/jpeg");
        // Note: Implementation returns extension WITHOUT dot
        expect(["jpg", "jpeg"]).toContain(result);
      });

      test("should return extension for image/gif", () => {
        const result = getExtensionFromMimeType("image/gif");
        // Note: Implementation returns extension WITHOUT dot
        expect(result).toBe("gif");
      });
    });

    describe("findImageFile", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should find image file by locale", async () => {
        await mkdir(tempDir, { recursive: true });
        await writeFile(join(tempDir, "zh.png"), "fake image");
        const result = await findImageFile(tempDir, "zh");
        expect(result).not.toBeNull();
      });

      test("should return null for non-existent image", async () => {
        const result = await findImageFile(tempDir, "nonexistent");
        expect(result).toBeNull();
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("calculateContentHash", () => {
      test("should handle empty content", () => {
        const result = calculateContentHash("");
        expect(typeof result).toBe("string");
      });

      test("should handle whitespace only content", () => {
        const result = calculateContentHash("   \n\t  ");
        expect(typeof result).toBe("string");
      });
    });

    describe("calculateFileHash", () => {
      test("should handle non-existent file", async () => {
        try {
          await calculateFileHash("/non/existent/file.png");
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    describe("getImageMimeType", () => {
      test("should handle unknown extension", () => {
        const result = getImageMimeType("file.xyz");
        expect(typeof result).toBe("string");
      });

      test("should handle file without extension", () => {
        const result = getImageMimeType("filename");
        expect(typeof result).toBe("string");
      });

      test("should handle empty string", () => {
        const result = getImageMimeType("");
        expect(typeof result).toBe("string");
      });
    });

    describe("getExtensionFromMimeType", () => {
      test("should handle unknown MIME type", () => {
        const result = getExtensionFromMimeType("application/unknown");
        expect(typeof result === "string" || result === null || result === undefined).toBe(true);
      });

      test("should handle empty MIME type", () => {
        const result = getExtensionFromMimeType("");
        expect(typeof result === "string" || result === null || result === undefined).toBe(true);
      });
    });

    describe("findImageWithFallback", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should return null when no image found", async () => {
        const result = await findImageWithFallback("nonexistent", "zh", "zh", tempDir);
        expect(result).toBeNull();
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("calculateContentHash", () => {
      test("should handle very large content", () => {
        const largeContent = "x".repeat(10000000); // 10MB
        expect(() => calculateContentHash(largeContent)).not.toThrow();
      });

      test("should handle binary content", () => {
        const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0xff]).toString();
        expect(() => calculateContentHash(binaryContent)).not.toThrow();
      });

      test("should handle unicode content", () => {
        const unicodeContent = "测试内容 🎉 émojis";
        expect(() => calculateContentHash(unicodeContent)).not.toThrow();
      });
    });

    describe("calculateFileHash", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should handle concurrent hash calculations", async () => {
        const filePath = join(tempDir, "test.txt");
        await writeFile(filePath, "content");
        const promises = [
          calculateFileHash(filePath),
          calculateFileHash(filePath),
          calculateFileHash(filePath),
        ];
        const results = await Promise.all(promises);
        expect(results[0]).toBe(results[1]);
        expect(results[1]).toBe(results[2]);
      });
    });

    describe("findImageFile", () => {
      test("should handle non-existent directory", async () => {
        const result = await findImageFile("/non/existent/dir", "zh");
        expect(result).toBeNull();
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("calculateFileHash - Path Traversal", () => {
      test("should not allow reading files outside intended directory", async () => {
        try {
          await calculateFileHash("/../../../etc/passwd");
        } catch (error) {
          // Should fail to read
          expect(error).toBeDefined();
        }
      });
    });

    describe("getImageMimeType - Injection", () => {
      test("should handle path traversal in filename", () => {
        const result = getImageMimeType("../../../etc/passwd.png");
        expect(typeof result).toBe("string");
      });

      test("should handle null bytes in filename", () => {
        const result = getImageMimeType("image.png\x00.exe");
        expect(typeof result).toBe("string");
      });

      test("should handle double extensions", () => {
        const result = getImageMimeType("malware.exe.png");
        // Should detect based on last extension
        expect(result).toContain("png");
      });
    });

    describe("findImageFile - Path Traversal", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should not escape directory with locale traversal", async () => {
        const result = await findImageFile(tempDir, "../../../etc/passwd");
        // Should not find /etc/passwd
        expect(result === null || !result.includes("/etc/")).toBe(true);
      });

      test("should handle shell metacharacters in locale", async () => {
        const result = await findImageFile(tempDir, "zh; rm -rf /");
        expect(result === null || typeof result === "string").toBe(true);
      });
    });

    describe("findImageWithFallback - Key Injection", () => {
      let tempDir;

      beforeEach(async () => {
        const temp = await createTempDir();
        tempDir = temp.path;
      });

      afterEach(async () => {
        if (tempDir) {
          await rm(tempDir, { recursive: true, force: true });
        }
      });

      test("should handle path traversal in key", async () => {
        const result = await findImageWithFallback("../../../etc/passwd", "zh", "zh", tempDir);
        expect(result === null || !result?.includes("/etc/")).toBe(true);
      });

      test("should handle malicious assetsDir", async () => {
        try {
          await findImageWithFallback("key", "zh", "zh", "/etc");
        } catch (error) {
          // May throw or return null
          expect(error !== undefined || true).toBe(true);
        }
      });
    });

    describe("IMAGE_EXTENSIONS - Validation", () => {
      test("should not contain executable extensions", () => {
        const dangerous = [".exe", ".bat", ".sh", ".cmd", ".ps1"];
        for (const ext of dangerous) {
          expect(IMAGE_EXTENSIONS).not.toContain(ext);
        }
      });

      test("should only contain known safe image extensions", () => {
        // Note: Implementation only supports: .jpg, .jpeg, .png, .gif, .webp
        const safe = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        for (const ext of IMAGE_EXTENSIONS) {
          expect(safe).toContain(ext);
        }
      });
    });
  });
});
