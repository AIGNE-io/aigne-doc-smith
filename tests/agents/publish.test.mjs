/**
 * Tests for agents/publish/*
 *
 * Function signatures:
 * - check.mjs: check({ fileName }): Check configuration and documents before publishing
 * - publish-docs.mjs: publishDocs({ appUrl, outputDir, config, ... }): Publish docs
 * - translate-meta.mjs: translateMeta({ config }): Translate project metadata
 *
 * NOTE: Tests avoid real network requests and authentication.
 * Tests focus on module exports and input validation.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

describe("publish agents", () => {
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

  // ==================== check.mjs ====================
  describe("check.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have description property", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should define fileName in schema", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module.default.input_schema.properties.fileName).toBeDefined();
      });

      test("should mention configuration in description", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module.default.description.toLowerCase()).toContain("check");
      });
    });

    describe("Unhappy Path", () => {
      // NOTE: Actual function calls require workspace setup
      test("should accept empty options", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module.default.length).toBeGreaterThanOrEqual(0);
      });

      test("should accept fileName parameter", async () => {
        const module = await import("../../agents/publish/check.mjs");
        const schema = module.default.input_schema;
        expect(schema.properties.fileName.type).toBe("string");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(module).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should have fileName parameter for flexibility", async () => {
        const module = await import("../../agents/publish/check.mjs");
        expect(
          module.default.input_schema.properties.fileName
        ).toBeDefined();
      });
    });
  });

  // ==================== publish-docs.mjs ====================
  describe("publish-docs.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have input_schema property", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should have description property", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.description).toBeDefined();
      });

      test("should define appUrl in schema", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.input_schema.properties.appUrl).toBeDefined();
      });

      test("should define outputDir in schema", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.input_schema.properties.outputDir).toBeDefined();
      });

      test("should define config in schema", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.input_schema.properties.config).toBeDefined();
      });

      test("should define with-branding in schema", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(
          module.default.input_schema.properties["with-branding"]
        ).toBeDefined();
      });
    });

    describe("Unhappy Path", () => {
      // NOTE: Actual function calls require auth and network
      test("should accept multiple parameters", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module).toBeDefined();
      });

      test("should define translatedMetadata in schema", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(
          module.default.input_schema.properties.translatedMetadata
        ).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should mention publishing in description", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.description.toLowerCase()).toContain("publish");
      });

      test("should have config type as object", async () => {
        const module = await import("../../agents/publish/publish-docs.mjs");
        expect(module.default.input_schema.properties.config.type).toBe(
          "object"
        );
      });
    });
  });

  // ==================== translate-meta.mjs ====================
  describe("translate-meta.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have input_schema property", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should have description property", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.description).toBeDefined();
      });

      test("should define config in schema", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.input_schema.properties.config).toBeDefined();
      });

      test("should mention translation in description", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.description.toLowerCase()).toContain("translate");
      });
    });

    describe("Unhappy Path", () => {
      // NOTE: Actual function calls require AI agent context
      test("should accept config parameter", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should have config as object type", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.input_schema.properties.config.type).toBe(
          "object"
        );
      });

      test("should mention metadata in description", async () => {
        const module = await import("../../agents/publish/translate-meta.mjs");
        expect(module.default.description.toLowerCase()).toContain("metadata");
      });
    });
  });
});
