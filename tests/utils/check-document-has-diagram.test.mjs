import { describe, expect, test } from "bun:test";
import {
  hasDiagramContent,
  getDiagramTypeLabels,
  formatDiagramTypeSuffix,
  hasBananaImages,
} from "../../utils/check-document-has-diagram.mjs";
import { DIAGRAM_PLACEHOLDER } from "../../utils/d2-utils.mjs";

describe("check-document-has-diagram", () => {
  describe("hasDiagramContent", () => {
    test("should return false for null or undefined content", () => {
      expect(hasDiagramContent(null)).toBe(false);
      expect(hasDiagramContent(undefined)).toBe(false);
    });

    test("should return false for non-string content", () => {
      expect(hasDiagramContent(123)).toBe(false);
      expect(hasDiagramContent({})).toBe(false);
      expect(hasDiagramContent([])).toBe(false);
    });

    test("should return true when content contains DIAGRAM_PLACEHOLDER", () => {
      const content = `Some text\n${DIAGRAM_PLACEHOLDER}\nMore text`;
      expect(hasDiagramContent(content)).toBe(true);
    });

    test("should return true when content contains D2 code blocks", () => {
      const content = `Some text\n\`\`\`d2\nshape1 -> shape2\n\`\`\`\nMore text`;
      expect(hasDiagramContent(content)).toBe(true);
    });

    test("should return true when content contains diagram images", () => {
      const content = `Some text\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->\nMore text`;
      expect(hasDiagramContent(content)).toBe(true);
    });

    test("should return false when content has no diagram-related content", () => {
      const content = "Just regular text with no diagrams";
      expect(hasDiagramContent(content)).toBe(false);
    });

    test("should detect multiple D2 code blocks", () => {
      const content = `\`\`\`d2\nfirst\`\`\`\n\`\`\`d2\nsecond\`\`\``;
      expect(hasDiagramContent(content)).toBe(true);
    });

    test("should detect multiple diagram images", () => {
      const content = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](path1.jpg)\n<!-- DIAGRAM_IMAGE_END -->\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt2](path2.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      expect(hasDiagramContent(content)).toBe(true);
    });
  });

  describe("getDiagramTypeLabels", () => {
    test("should return empty array for null or undefined content", () => {
      expect(getDiagramTypeLabels(null)).toEqual([]);
      expect(getDiagramTypeLabels(undefined)).toEqual([]);
    });

    test("should return empty array for non-string content", () => {
      expect(getDiagramTypeLabels(123)).toEqual([]);
      expect(getDiagramTypeLabels({})).toEqual([]);
    });

    test("should return ['⛔️ D2'] when content contains D2 code blocks", () => {
      const content = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;
      expect(getDiagramTypeLabels(content)).toEqual(["⛔️ D2"]);
    });

    test("should return ['🍌 Image'] when content contains diagram images", () => {
      const content = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      expect(getDiagramTypeLabels(content)).toEqual(["🍌 Image"]);
    });

    test("should return ['Placeholder'] when content contains DIAGRAM_PLACEHOLDER", () => {
      const content = `Some text\n${DIAGRAM_PLACEHOLDER}\nMore text`;
      expect(getDiagramTypeLabels(content)).toEqual(["Placeholder"]);
    });

    test("should return multiple labels when content has multiple diagram types", () => {
      const content = `\`\`\`d2\nshape1 -> shape2\n\`\`\`\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->\n${DIAGRAM_PLACEHOLDER}`;
      const labels = getDiagramTypeLabels(content);
      expect(labels).toContain("⛔️ D2");
      expect(labels).toContain("🍌 Image");
      expect(labels).toContain("Placeholder");
      expect(labels.length).toBe(3);
    });

    test("should return empty array when content has no diagram-related content", () => {
      const content = "Just regular text with no diagrams";
      expect(getDiagramTypeLabels(content)).toEqual([]);
    });
  });

  describe("formatDiagramTypeSuffix", () => {
    test("should return empty string for null or undefined labels", () => {
      expect(formatDiagramTypeSuffix(null)).toBe("");
      expect(formatDiagramTypeSuffix(undefined)).toBe("");
    });

    test("should return empty string for empty array", () => {
      expect(formatDiagramTypeSuffix([])).toBe("");
    });

    test("should format single label correctly", () => {
      expect(formatDiagramTypeSuffix(["⛔️ D2"])).toBe(" [⛔️ D2]");
    });

    test("should format multiple labels correctly", () => {
      expect(formatDiagramTypeSuffix(["⛔️ D2", "🍌 Image"])).toBe(" [⛔️ D2, 🍌 Image]");
    });

    test("should format three labels correctly", () => {
      expect(formatDiagramTypeSuffix(["⛔️ D2", "🍌 Image", "Placeholder"])).toBe(
        " [⛔️ D2, 🍌 Image, Placeholder]",
      );
    });
  });

  describe("hasBananaImages", () => {
    test("should return false for null or undefined content", () => {
      expect(hasBananaImages(null)).toBe(false);
      expect(hasBananaImages(undefined)).toBe(false);
    });

    test("should return false for non-string content", () => {
      expect(hasBananaImages(123)).toBe(false);
      expect(hasBananaImages({})).toBe(false);
    });

    test("should return true when content contains DIAGRAM_IMAGE_START", () => {
      const content = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      expect(hasBananaImages(content)).toBe(true);
    });

    test("should return false when content only has D2 code blocks", () => {
      const content = `\`\`\`d2\nshape1 -> shape2\n\`\`\``;
      expect(hasBananaImages(content)).toBe(false);
    });

    test("should return false when content only has DIAGRAM_PLACEHOLDER", () => {
      const content = `Some text\n${DIAGRAM_PLACEHOLDER}\nMore text`;
      expect(hasBananaImages(content)).toBe(false);
    });

    test("should return false when content has no diagram-related content", () => {
      const content = "Just regular text with no diagrams";
      expect(hasBananaImages(content)).toBe(false);
    });

    test("should detect multiple diagram images", () => {
      const content = `<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt1](path1.jpg)\n<!-- DIAGRAM_IMAGE_END -->\n<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->\n![alt2](path2.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      expect(hasBananaImages(content)).toBe(true);
    });

    test("should handle DIAGRAM_IMAGE_START with different formats", () => {
      const content1 = `<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->\n![alt](path.jpg)\n<!-- DIAGRAM_IMAGE_END -->`;
      expect(hasBananaImages(content1)).toBe(true);

      const content2 = `<!--DIAGRAM_IMAGE_START:flowchart:4:3-->\n![alt](path.jpg)\n<!--DIAGRAM_IMAGE_END-->`;
      expect(hasBananaImages(content2)).toBe(true);
    });
  });
});
