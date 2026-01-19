/**
 * Tests for skills-entry/doc-smith-docs-detail
 *
 * Function signatures:
 * - index.mjs: Exports agent configuration object for document detail generation
 *
 * NOTE: Tests focus on module exports and configuration structure.
 * Actual generation depends on workspace state and AI capabilities.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../setup/test-utils.mjs";

describe("skills-entry/doc-smith-docs-detail", () => {
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

  // ==================== index.mjs ====================
  describe("index.mjs", () => {
    describe("Happy Path", () => {
      test("should export default object", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("object");
      });

      test("should have type property", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.type).toBeDefined();
        expect(module.default.type).toContain("agent");
      });

      test("should have name property", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.name).toBeDefined();
        expect(module.default.name).toBe("generateDocumentDetail");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should have instructions property", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.instructions).toBeDefined();
        expect(module.default.instructions.url).toBeDefined();
      });

      test("should have skills array", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.skills).toBeDefined();
        expect(Array.isArray(module.default.skills)).toBe(true);
      });

      test("should have afs configuration", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.afs).toBeDefined();
        expect(module.default.afs.modules).toBeDefined();
      });
    });

    describe("input_schema structure", () => {
      test("should have input_schema property", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should require path in input", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.input_schema.required).toContain("path");
      });

      test("should define path as string", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.input_schema.properties.path.type).toBe("string");
      });

      test("should define customRequirements as optional string", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        const props = module.default.input_schema.properties;
        expect(props.customRequirements).toBeDefined();
        expect(props.customRequirements.type).toBe("string");
        // Should not be in required
        expect(module.default.input_schema.required).not.toContain("customRequirements");
      });
    });

    describe("output_schema structure", () => {
      test("should have output_schema property", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema).toBeDefined();
        expect(module.default.output_schema.type).toBe("object");
      });

      test("should define success in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.success).toBeDefined();
        expect(module.default.output_schema.properties.success.type).toBe("boolean");
      });

      test("should define path in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.path).toBeDefined();
      });

      test("should define summary in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.summary).toBeDefined();
      });

      test("should define sections in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.sections).toBeDefined();
        expect(module.default.output_schema.properties.sections.type).toBe("array");
      });

      test("should define imageSlots in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.imageSlots).toBeDefined();
        expect(module.default.output_schema.properties.imageSlots.type).toBe("array");
      });

      test("should define validationResult in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.validationResult).toBeDefined();
      });

      test("should define error in output", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.output_schema.properties.error).toBeDefined();
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have valid agent type", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.type).toContain("agent-skill-manager");
      });

      test("should have instructions url", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.instructions.url).toBe("./prompt.md");
      });

      test("should include save-document in skills", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        const hasSaveDocument = module.default.skills.some(
          (s) => typeof s === "string" && s.includes("save-document")
        );
        expect(hasSaveDocument).toBe(true);
      });

      test("should include content-checker in skills", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        const hasContentChecker = module.default.skills.some(
          (s) => typeof s === "string" && s.includes("content-checker")
        );
        expect(hasContentChecker).toBe(true);
      });
    });

    describe("Security Scenarios", () => {
      test("should have session configuration", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.session).toBeDefined();
        expect(module.default.session.compact).toBeDefined();
      });

      test("should have max_tokens limit", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.session.compact.max_tokens).toBeDefined();
        expect(typeof module.default.session.compact.max_tokens).toBe("number");
      });

      test("should have model configuration", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.model).toBeDefined();
      });

      test("should have cache_config in model", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.model.cache_config).toBeDefined();
      });

      test("should mention document in description", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("document");
      });

      test("should mention content in description", async () => {
        const module = await import(
          "../../skills-entry/doc-smith-docs-detail/index.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("content");
      });
    });
  });
});
