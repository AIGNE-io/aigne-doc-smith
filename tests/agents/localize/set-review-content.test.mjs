import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import setReviewContent from "../../../agents/localize/set-review-content.mjs";
import * as debugModule from "../../../utils/debug.mjs";

describe("set-review-content", () => {
  let debugSpy;

  beforeEach(() => {
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy?.mockRestore();
  });

  test("should set reviewContent from translation", async () => {
    const input = {
      translation: "Translated content",
      content: "Original content",
    };

    const result = await setReviewContent(input);

    expect(result.reviewContent).toBe("Translated content");
    expect(result.translation).toBe("Translated content");
  });

  test("should set reviewContent from content when translation is empty", async () => {
    const input = {
      translation: "",
      content: "Original content",
    };

    const result = await setReviewContent(input);

    expect(result.reviewContent).toBe("Original content");
  });

  test("should replace existing diagram image in translation", async () => {
    const input = {
      translation: `Some text\n<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Old](old.jpg)\n<!-- DIAGRAM_IMAGE_END -->\nMore text`,
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![New](new.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 0,
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("new.zh.jpg");
    expect(result.translation).not.toContain("old.jpg");
    expect(result.reviewContent).toBe(result.translation);
    expect(debugSpy).toHaveBeenCalledWith("✅ Replaced diagram image in translation");
  });

  test("should insert diagram image when translation has no image", async () => {
    const input = {
      translation: "Some translated text",
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 10,
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("DIAGRAM_IMAGE_START");
    expect(result.translation).toContain("test.zh.jpg");
    expect(result.reviewContent).toBe(result.translation);
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Inserted diagram image"));
  });

  test("should handle multiple cached images (take first)", async () => {
    const input = {
      translation: "Some text",
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![First](first.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 0,
        },
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Second](second.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 0,
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("first.zh.jpg");
    expect(result.translation).not.toContain("second.zh.jpg");
  });

  test("should return input unchanged when no cached images", async () => {
    const input = {
      translation: "Some text",
      cachedDiagramImages: null,
    };

    const result = await setReviewContent(input);

    expect(result.translation).toBe("Some text");
    expect(result.reviewContent).toBe("Some text");
    expect(result).toEqual({
      ...input,
      reviewContent: "Some text",
    });
  });

  test("should return input unchanged when cached images is empty array", async () => {
    const input = {
      translation: "Some text",
      cachedDiagramImages: [],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toBe("Some text");
    expect(result.reviewContent).toBe("Some text");
  });

  test("should handle errors gracefully and continue with original translation", async () => {
    const input = {
      translation: "Some text",
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: "", // Empty string might cause issues
          index: 0,
          mainImageIndex: 1000, // Large index to test insertion
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("Some text");
    expect(result.reviewContent).toBe(result.translation);
  });

  test("should preserve all input properties", async () => {
    const input = {
      translation: "Translated",
      content: "Original",
      cachedDiagramImages: null,
      customProperty: "customValue",
      otherProperty: 123,
    };

    const result = await setReviewContent(input);

    expect(result.customProperty).toBe("customValue");
    expect(result.otherProperty).toBe(123);
    expect(result.translation).toBe("Translated");
    expect(result.reviewContent).toBe("Translated");
  });

  test("should handle empty translation and content", async () => {
    const input = {
      translation: "",
      content: "",
      cachedDiagramImages: null,
    };

    const result = await setReviewContent(input);

    expect(result.reviewContent).toBe("");
  });

  test("should replace image when translation has image pointing to main document", async () => {
    const input = {
      translation: `Some text\n<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.jpg)\n<!-- DIAGRAM_IMAGE_END -->\nMore text`,
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](assets/diagram/test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 0,
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("test.zh.jpg");
    expect(result.translation).not.toContain("test.jpg");
    expect(debugSpy).toHaveBeenCalledWith("✅ Replaced diagram image in translation");
  });

  test("should handle insertion when mainImageIndex exceeds translation length", async () => {
    const input = {
      translation: "Short text",
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 1000, // Exceeds translation length
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("test.zh.jpg");
    expect(result.translation).toContain("Short text");
  });

  test("should handle regex match failure gracefully", async () => {
    const input = {
      translation: "Some text without proper image format",
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 0,
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toContain("test.zh.jpg");
    expect(result.translation).toContain("Some text");
  });

  test("should handle error during image replacement and continue with original translation", async () => {
    // Mock regex to throw an error
    const originalMatch = String.prototype.match;
    String.prototype.match = () => {
      throw new Error("Regex error");
    };

    const input = {
      translation: "Some text",
      cachedDiagramImages: [
        {
          originalMatch: null,
          translatedMarkdown: `<!-- DIAGRAM_IMAGE_START:architecture:16:9:1234567890 -->\n![Diagram](test.zh.jpg)\n<!-- DIAGRAM_IMAGE_END -->`,
          index: 0,
          mainImageIndex: 0,
        },
      ],
    };

    const result = await setReviewContent(input);

    expect(result.translation).toBe("Some text");
    expect(result.reviewContent).toBe("Some text");
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to replace cached diagram image"),
    );

    // Restore original method
    String.prototype.match = originalMatch;
  });
});
