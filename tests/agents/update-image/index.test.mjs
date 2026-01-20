/**
 * Tests for agents/update-image/*
 *
 * Function signatures:
 * - load-existing-image.mjs: loadExistingImage(input): Load existing image by doc and slotId
 *
 * NOTE: Tests focus on module exports and input/output schema structure.
 * Actual loading depends on workspace configuration and file system state.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("update-image agents", () => {
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

  // ==================== load-existing-image.mjs ====================
  describe("load-existing-image.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should have output_schema property", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema).toBeDefined();
        expect(module.default.output_schema.type).toBe("object");
      });
    });

    describe("input_schema structure", () => {
      test("should require doc property", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.input_schema.required).toContain("doc");
      });

      test("should require slotId property", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.input_schema.required).toContain("slotId");
      });

      test("should define doc as string type", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.input_schema.properties.doc.type).toBe("string");
      });

      test("should define slotId as string type", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.input_schema.properties.slotId.type).toBe("string");
      });
    });

    describe("output_schema structure", () => {
      test("should require success property", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should define slotId in output", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.properties.slotId).toBeDefined();
      });

      test("should define key in output", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.properties.key).toBeDefined();
      });

      test("should define existingImage in output", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.properties.existingImage).toBeDefined();
        expect(module.default.output_schema.properties.existingImage.type).toBe("array");
      });

      test("should define currentAspectRatio in output", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.properties.currentAspectRatio).toBeDefined();
      });
    });

    describe("Unhappy Path", () => {
      test("should throw on missing doc parameter", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        await expect(loadExistingImage({ slotId: "test" })).rejects.toThrow();
      });

      test("should throw on missing slotId parameter", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        await expect(loadExistingImage({ doc: "/test" })).rejects.toThrow();
      });

      test("should throw on empty input", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        await expect(loadExistingImage({})).rejects.toThrow();
      });

      test("should throw on null input", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        await expect(loadExistingImage(null)).rejects.toThrow();
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module).toBeDefined();
      });

      test("should mention image in description", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.description.toLowerCase()).toContain("image");
      });

      test("should throw when document does not exist", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        await expect(
          loadExistingImage({ doc: "/nonexistent-doc", slotId: "test-slot" }),
        ).rejects.toThrow();
      });

      test("should include locale in output schema", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.properties.locale).toBeDefined();
      });

      test("should include hash in output schema", async () => {
        const module = await import("../../../agents/update-image/load-existing-image.mjs");
        expect(module.default.output_schema.properties.hash).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should handle path traversal in doc", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        // Should throw error (not succeed with path traversal)
        await expect(
          loadExistingImage({ doc: "../../../etc/passwd", slotId: "test" }),
        ).rejects.toThrow();
      });

      test("should handle XSS in slotId", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        // Should throw error (document doesn't exist)
        await expect(
          loadExistingImage({ doc: "/test", slotId: "<script>alert(1)</script>" }),
        ).rejects.toThrow();
      });

      test("should handle null bytes in doc", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        await expect(loadExistingImage({ doc: "/test\x00evil", slotId: "slot" })).rejects.toThrow();
      });

      test("should handle very long slotId", async () => {
        const { default: loadExistingImage } = await import(
          "../../../agents/update-image/load-existing-image.mjs"
        );
        const longSlotId = "a".repeat(10000);
        await expect(loadExistingImage({ doc: "/test", slotId: longSlotId })).rejects.toThrow();
      });
    });
  });
});
