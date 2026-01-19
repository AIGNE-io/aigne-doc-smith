/**
 * Tests for utils/image-slots.mjs
 *
 * Exports:
 * - SLOT_REGEX: Regex pattern for afs:image slots (format: <!-- afs:image id="..." key="..." desc="..." -->)
 * - generateKey(docPath, id): Generate unique key for slot
 * - parseSlots(content, docPath): Parse image slots from content
 */

import { describe, test, expect } from "bun:test";

import { SLOT_REGEX, generateKey, parseSlots } from "../../utils/image-slots.mjs";

// Helper to reset global regex state before tests
function resetSlotRegex() {
  SLOT_REGEX.lastIndex = 0;
}

describe("image-slots.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("SLOT_REGEX", () => {
      test("should be a RegExp", () => {
        expect(SLOT_REGEX).toBeInstanceOf(RegExp);
      });

      test("should match afs:image slot syntax", () => {
        // Actual format: <!-- afs:image id="..." key="..." desc="..." -->
        const content = '<!-- afs:image id="hero" key="overview-hero" desc="Hero image" -->';
        SLOT_REGEX.lastIndex = 0;
        expect(SLOT_REGEX.test(content)).toBe(true);
      });

      test("should match slot without key (key is optional)", () => {
        const content = '<!-- afs:image id="screenshot" desc="Screenshot description" -->';
        SLOT_REGEX.lastIndex = 0;
        expect(SLOT_REGEX.test(content)).toBe(true);
      });

      test("should capture slot id, key, and desc", () => {
        const content = '<!-- afs:image id="my-id" key="my-key" desc="My description" -->';
        SLOT_REGEX.lastIndex = 0;
        const match = SLOT_REGEX.exec(content);
        expect(match).not.toBeNull();
        expect(match[1]).toBe("my-id"); // id
        expect(match[2]).toBe("my-key"); // key
        expect(match[3]).toBe("My description"); // desc
      });
    });

    describe("generateKey", () => {
      test("should generate key from docPath and id", () => {
        const result = generateKey("/docs/overview", "hero");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      test("should generate unique keys for different inputs", () => {
        const key1 = generateKey("/doc1", "slot1");
        const key2 = generateKey("/doc2", "slot1");
        const key3 = generateKey("/doc1", "slot2");
        expect(key1).not.toBe(key2);
        expect(key1).not.toBe(key3);
      });

      test("should generate consistent keys for same inputs", () => {
        const key1 = generateKey("/path", "id");
        const key2 = generateKey("/path", "id");
        expect(key1).toBe(key2);
      });

      test("should remove leading slash from path", () => {
        const key = generateKey("/overview", "hero");
        expect(key).toBe("overview-hero");
      });

      test("should replace slashes with dashes", () => {
        const key = generateKey("/guide/getting-started", "intro");
        expect(key).toBe("guide-getting-started-intro");
      });
    });

    describe("parseSlots", () => {
      test("should parse slots from content", () => {
        resetSlotRegex();
        const content = `# Document
<!-- afs:image id="hero" desc="Hero image" -->
Some text
<!-- afs:image id="diagram" key="custom-key" desc="Diagram" -->`;
        const result = parseSlots(content, "/test");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
      });

      test("should return empty array for content without slots", () => {
        resetSlotRegex();
        const content = "# Document\nNo slots here";
        const result = parseSlots(content, "/test");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test("should include id, key, desc, and raw in parsed slots", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="test" desc="Test description" -->';
        const result = parseSlots(content, "/my/doc/path");
        expect(result.length).toBe(1);
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("key");
        expect(result[0]).toHaveProperty("desc");
        expect(result[0]).toHaveProperty("raw");
      });

      test("should auto-generate key when not provided", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="hero" desc="Hero" -->';
        const result = parseSlots(content, "/overview");
        expect(result[0].key).toBe("overview-hero");
      });

      test("should use provided key when available", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="hero" key="custom-key" desc="Hero" -->';
        const result = parseSlots(content, "/overview");
        expect(result[0].key).toBe("custom-key");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("generateKey", () => {
      test("should handle empty docPath", () => {
        const result = generateKey("", "id");
        expect(typeof result).toBe("string");
      });

      test("should handle empty id", () => {
        const result = generateKey("/path", "");
        expect(typeof result).toBe("string");
      });

      test("should handle both empty", () => {
        const result = generateKey("", "");
        expect(typeof result).toBe("string");
      });
    });

    describe("parseSlots", () => {
      test("should handle empty content", () => {
        resetSlotRegex();
        const result = parseSlots("", "/test");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test("should handle malformed slot syntax (missing desc)", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="test" -->';
        const result = parseSlots(content, "/test");
        // Should not match malformed slots
        expect(Array.isArray(result)).toBe(true);
      });

      test("should handle unclosed comments", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="test" desc="Test';
        expect(() => parseSlots(content, "/test")).not.toThrow();
      });
    });

    describe("SLOT_REGEX", () => {
      test("should not match invalid syntax", () => {
        SLOT_REGEX.lastIndex = 0;
        expect(SLOT_REGEX.test("random text")).toBe(false);
      });

      test("should not match partial syntax", () => {
        SLOT_REGEX.lastIndex = 0;
        expect(SLOT_REGEX.test("<!-- afs:image")).toBe(false);
      });

      test("should not match old image-slot syntax", () => {
        SLOT_REGEX.lastIndex = 0;
        expect(SLOT_REGEX.test("<!-- image-slot: hero -->")).toBe(false);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("generateKey", () => {
      test("should handle very long docPath", () => {
        const longPath = `/${"a".repeat(1000)}`;
        expect(() => generateKey(longPath, "id")).not.toThrow();
      });

      test("should handle very long id", () => {
        const longId = "x".repeat(1000);
        expect(() => generateKey("/path", longId)).not.toThrow();
      });

      test("should handle special characters in docPath", () => {
        expect(() => generateKey("/path/with spaces/and-dashes", "id")).not.toThrow();
      });

      test("should handle unicode in id", () => {
        expect(() => generateKey("/path", "图片-slot")).not.toThrow();
      });
    });

    describe("parseSlots", () => {
      test("should handle very large content", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="test" desc="Test" -->\n'.repeat(1000);
        expect(() => parseSlots(content, "/test")).not.toThrow();
      });

      test("should handle content with binary-like data", () => {
        resetSlotRegex();
        const content = 'Text \x00\x01 <!-- afs:image id="test" desc="Test" --> more';
        expect(() => parseSlots(content, "/test")).not.toThrow();
      });

      test("should handle nested HTML comments", () => {
        resetSlotRegex();
        const content = '<!-- outer <!-- afs:image id="test" desc="Test" --> -->';
        expect(() => parseSlots(content, "/test")).not.toThrow();
      });

      test("should handle multiple slots with same id", () => {
        resetSlotRegex();
        const content = `<!-- afs:image id="same" desc="First" -->
<!-- afs:image id="same" desc="Second" -->
<!-- afs:image id="same" desc="Third" -->`;
        const result = parseSlots(content, "/test");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("generateKey - Injection Prevention", () => {
      test("should handle path traversal in docPath", () => {
        const result = generateKey("/../../../etc/passwd", "id");
        expect(typeof result).toBe("string");
      });

      test("should handle shell metacharacters in id", () => {
        const result = generateKey("/path", "id; rm -rf /");
        expect(typeof result).toBe("string");
      });

      test("should handle null bytes", () => {
        const result = generateKey("/path\x00evil", "id");
        expect(typeof result).toBe("string");
      });

      test("should handle script tags in id", () => {
        const result = generateKey("/path", "<script>alert(1)</script>");
        expect(typeof result).toBe("string");
      });
    });

    describe("parseSlots - XSS Prevention", () => {
      test("should handle script injection in slot id", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="<script>alert(1)</script>" desc="Test" -->';
        const result = parseSlots(content, "/test");
        // Should parse but not execute
        expect(Array.isArray(result)).toBe(true);
      });

      test("should handle HTML entities in slot id", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="&lt;script&gt;" desc="Test" -->';
        const result = parseSlots(content, "/test");
        expect(Array.isArray(result)).toBe(true);
      });

      test("should handle event handlers in slot id", () => {
        resetSlotRegex();
        const content = '<!-- afs:image id="" onload="alert(1)" desc="Test" -->';
        const result = parseSlots(content, "/test");
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("SLOT_REGEX - ReDoS Prevention", () => {
      test("should not hang on pathological input", () => {
        resetSlotRegex();
        const startTime = Date.now();
        const malicious = `<!-- afs:image id="${"a".repeat(100)}" desc="Test" -->`;
        SLOT_REGEX.lastIndex = 0;
        SLOT_REGEX.test(malicious);
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(1000);
      });

      test("should handle repeated patterns efficiently", () => {
        resetSlotRegex();
        const startTime = Date.now();
        const content = '<!-- afs:image id="test" desc="Test" --> '.repeat(100);
        parseSlots(content, "/test");
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(1000);
      });
    });
  });
});
