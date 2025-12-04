import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import fs from "fs-extra";
import { syncDiagramToTranslations } from "../../utils/sync-diagram-to-translations.mjs";
import * as docsFinderUtils from "../../utils/docs-finder-utils.mjs";
import * as debugModule from "../../utils/debug.mjs";
import { readdirSync } from "node:fs";

describe("sync-diagram-to-translations", () => {
  let readdirSyncSpy;
  let readFileContentSpy;
  let writeFileSpy;
  let debugSpy;
  let mockDocsDir;

  beforeEach(() => {
    mockDocsDir = "/mock/docs";
    // Use mock.module to properly mock readdirSync
    mock.module("node:fs", () => ({
      readdirSync: mock(() => []),
    }));
    readdirSyncSpy = spyOn({ readdirSync }, "readdirSync").mockReturnValue([]);
    readFileContentSpy = spyOn(docsFinderUtils, "readFileContent").mockResolvedValue("");
    writeFileSpy = spyOn(fs, "writeFile").mockResolvedValue();
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    readdirSyncSpy?.mockRestore();
    readFileContentSpy?.mockRestore();
    writeFileSpy?.mockRestore();
    debugSpy?.mockRestore();
  });

  describe("no translation files", () => {
    test("should return empty result when no translation files found", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md"]); // Only main file, no translations

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toEqual([]);
      expect(debugSpy).toHaveBeenCalledWith("ℹ️  No translation files found, skipping sync");
    });

    test("should return empty result when readdirSync fails", async () => {
      readdirSyncSpy.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toEqual([]);
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("⚠️  Could not read translation files"),
      );
    });
  });

  describe("no diagram images in main content", () => {
    test("should return empty result when main content has no diagrams", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = "Just regular text with no diagrams";
      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toEqual([]);
      expect(debugSpy).toHaveBeenCalledWith("ℹ️  No diagram images in main content, skipping sync");
    });
  });

  describe("replace D2 code blocks with AI images", () => {
    test("should replace D2 code blocks in translation with AI images from main", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(0);
      expect(writeFileSpy).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("🔄 Replaced D2 block with AI image"),
      );
    });

    test("should replace multiple D2 code blocks", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt2](assets/diagram/guide-diagram-1.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nfirst\n\`\`\`\n\`\`\`d2\nsecond\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      const writeCall = writeFileSpy.mock.calls[0];
      const writtenContent = writeCall[1];
      expect(writtenContent).toContain("DIAGRAM_IMAGE_START");
      expect(writtenContent).not.toContain("```d2");
    });
  });

  describe("update image paths", () => {
    test("should update image path when it changed", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0-new.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0-old.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      expect(writeFileSpy).toHaveBeenCalled();
      const writeCall = writeFileSpy.mock.calls[0];
      const writtenContent = writeCall[1];
      expect(writtenContent).toContain("guide-diagram-0-new.jpg");
      expect(writtenContent).not.toContain("guide-diagram-0-old.jpg");
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("🔄 Updated image path"));
    });

    test("should handle special characters in image paths", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0(new).jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0(old).jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      expect(writeFileSpy).toHaveBeenCalled();
    });

    test("should not update when paths are the same", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const imageMarkdown = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const mainContent = imageMarkdown;
      const translationContent = imageMarkdown;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("⏭️  No changes needed"));
    });
  });

  describe("add missing images", () => {
    test("should add missing images when translation has fewer than main", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt2](assets/diagram/guide-diagram-1.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      expect(writeFileSpy).toHaveBeenCalled();
      const writeCall = writeFileSpy.mock.calls[0];
      const writtenContent = writeCall[1];
      expect(writtenContent).toContain("guide-diagram-0.jpg");
      expect(writtenContent).toContain("guide-diagram-1.jpg");
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("➕ Added 1 missing diagram(s)"),
      );
    });

    test("should add images at the end when translation has no images", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = "Just regular text";

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      const writeCall = writeFileSpy.mock.calls[0];
      const writtenContent = writeCall[1];
      expect(writtenContent).toContain("Just regular text");
      expect(writtenContent).toContain("DIAGRAM_IMAGE_START");
    });
  });

  describe("multiple translation files", () => {
    test("should sync to all translation files", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md", "guide.ja.md", "guide.fr.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(3); // zh, ja, fr
      expect(writeFileSpy).toHaveBeenCalledTimes(3);
    });

    test("should handle mixed success and skip", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md", "guide.ja.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const zhContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``; // Needs update
      const jaContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`; // Already synced

      readFileContentSpy.mockResolvedValueOnce(zhContent).mockResolvedValueOnce(jaContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(1);
    });
  });

  describe("error handling", () => {
    test("should handle readFileContent failure", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

      readFileContentSpy.mockResolvedValue(null); // Simulate read failure

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining("⚠️  Could not read translation file"),
      );
    });

    test("should handle writeFile failure", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);
      writeFileSpy.mockRejectedValue(new Error("Write permission denied"));

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].file).toBe("guide.zh.md");
      expect(result.errors[0].error).toBe("Write permission denied");
      expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("❌ Error syncing diagram"));
    });

    test("should continue processing other files after error", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md", "guide.ja.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);
      writeFileSpy
        .mockRejectedValueOnce(new Error("Write permission denied")) // zh fails
        .mockResolvedValueOnce(); // ja succeeds

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1); // ja succeeded
      expect(result.errors).toHaveLength(1); // zh failed
    });
  });

  describe("translation file detection", () => {
    test("should correctly identify translation files", async () => {
      readdirSyncSpy.mockReturnValue([
        "guide.md", // Main file (should be excluded)
        "guide.zh.md", // Translation
        "guide.zh-CN.md", // Translation with locale variant
        "guide.ja.md", // Translation
        "other.md", // Different document (should be excluded)
        "guide.en.md", // Same locale as main (should be excluded)
      ]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      // Should sync to zh, zh-CN, ja (3 files)
      expect(result.updated).toBe(3);
      expect(writeFileSpy).toHaveBeenCalledTimes(3);
    });

    test("should handle nested paths correctly", async () => {
      readdirSyncSpy.mockReturnValue(["guides-getting-started.md", "guides-getting-started.zh.md"]);

      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](assets/diagram/guide-diagram-0.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      const translationContent = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(
        mainContent,
        "/guides/getting-started",
        mockDocsDir,
        "en",
      );

      expect(result.updated).toBe(1);
    });
  });

  describe("complex scenarios", () => {
    test("should handle all three strategies together", async () => {
      readdirSyncSpy.mockReturnValue(["guide.md", "guide.zh.md"]);

      // Main has 2 images
      const mainContent = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](assets/diagram/guide-diagram-0-new.jpg)\n<!-- DIAGRAM_IMAGE_END -->\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt2](assets/diagram/guide-diagram-1.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

      // Translation has 1 D2 block (will be replaced) and 1 old image (will be updated), missing 1 image (will be added)
      const translationContent = `\`\`\`d2\nold d2\n\`\`\`\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](assets/diagram/guide-diagram-0-old.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;

      readFileContentSpy.mockResolvedValue(translationContent);

      const result = await syncDiagramToTranslations(mainContent, "/guide", mockDocsDir, "en");

      expect(result.updated).toBe(1);
      const writeCall = writeFileSpy.mock.calls[0];
      const writtenContent = writeCall[1];
      // Should have both images from main
      expect(writtenContent).toContain("guide-diagram-0-new.jpg");
      expect(writtenContent).toContain("guide-diagram-1.jpg");
      // Should not have D2 or old image
      expect(writtenContent).not.toContain("```d2");
      expect(writtenContent).not.toContain("guide-diagram-0-old.jpg");
    });
  });
});
