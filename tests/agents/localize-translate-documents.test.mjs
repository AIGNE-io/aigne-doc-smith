/**
 * Tests for agents/localize/translate-documents/*
 *
 * Function signatures:
 * - generate-summary.mjs: generateSummary(input): Generate translation summary report
 * - load-glossary.mjs: loadGlossary(): Load translation glossary file
 * - prepare-translation.mjs: prepareTranslation(input): Prepare translation tasks
 * - save-translation.mjs: saveTranslation(input): Save translation result
 * - translate-document-to-language.mjs: translateDocumentToLanguage(input, options): Translate doc
 *
 * NOTE: Tests focus on module exports and synchronous function behavior.
 * Async functions that depend on workspace state are tested for structure only.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../setup/test-utils.mjs";

describe("localize/translate-documents agents", () => {
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

  // ==================== generate-summary.mjs ====================
  describe("generate-summary.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should have output_schema property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        expect(module.default.output_schema).toBeDefined();
        expect(module.default.output_schema.type).toBe("object");
      });

      test("should generate summary for completed tasks", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [
            { path: "/overview", sourceLanguage: "en", targetLanguages: [{ language: "zh" }] },
          ],
          sourceLanguage: "en",
          targetLanguages: ["zh"],
          totalDocs: 1,
          skipped: false,
        });
        expect(result).toHaveProperty("message");
        expect(result).toHaveProperty("summary");
        expect(result.summary.totalDocs).toBe(1);
      });

      test("should handle skipped translation", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [],
          sourceLanguage: "en",
          targetLanguages: [],
          totalDocs: 0,
          skipped: true,
        });
        expect(result.summary.skipped).toBe(true);
        expect(result.message).toContain("skipped");
      });
    });

    describe("Unhappy Path", () => {
      test("should handle empty tasks array", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [],
          sourceLanguage: "en",
          targetLanguages: ["zh"],
          totalDocs: 0,
          skipped: false,
        });
        expect(result).toHaveProperty("message");
        expect(result.summary.totalDocs).toBe(0);
      });

      test("should handle more than 5 documents", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const tasks = Array.from({ length: 10 }, (_, i) => ({
          path: `/doc-${i}`,
          sourceLanguage: "en",
          targetLanguages: [{ language: "zh" }],
        }));
        const result = generateSummary({
          translationTasks: tasks,
          sourceLanguage: "en",
          targetLanguages: ["zh"],
          totalDocs: 10,
          skipped: false,
        });
        expect(result.message).toContain("more documents");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should calculate total translations correctly", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [{ path: "/a" }, { path: "/b" }],
          sourceLanguage: "en",
          targetLanguages: ["zh", "ja"],
          totalDocs: 2,
          skipped: false,
        });
        expect(result.summary.totalTranslations).toBe(4); // 2 docs * 2 languages
      });

      test("should include documentPaths in summary", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [{ path: "/overview" }],
          sourceLanguage: "en",
          targetLanguages: ["zh"],
          totalDocs: 1,
          skipped: false,
        });
        expect(result.summary.documentPaths).toContain("/overview");
      });
    });

    describe("Security Scenarios", () => {
      test("should handle XSS in path", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [{ path: "<script>alert(1)</script>" }],
          sourceLanguage: "en",
          targetLanguages: ["zh"],
          totalDocs: 1,
          skipped: false,
        });
        expect(result).toHaveProperty("message");
      });

      test("should handle special characters in language", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [],
          sourceLanguage: "en<>",
          targetLanguages: ['zh"'],
          totalDocs: 0,
          skipped: false,
        });
        expect(result).toHaveProperty("message");
      });

      test("should handle null bytes in path", async () => {
        const { default: generateSummary } = await import(
          "../../agents/localize/translate-documents/generate-summary.mjs"
        );
        const result = generateSummary({
          translationTasks: [{ path: "/test\x00evil" }],
          sourceLanguage: "en",
          targetLanguages: ["zh"],
          totalDocs: 1,
          skipped: false,
        });
        expect(result).toHaveProperty("message");
      });
    });
  });

  // ==================== load-glossary.mjs ====================
  describe("load-glossary.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.description).toBeDefined();
        expect(module.default.description.toLowerCase()).toContain("glossary");
      });

      test("should have output_schema property", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.output_schema).toBeDefined();
        expect(module.default.output_schema.required).toContain("glossary");
        expect(module.default.output_schema.required).toContain("message");
      });
    });

    describe("Unhappy Path", () => {
      test("should accept no parameters", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.length).toBe(0);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module).toBeDefined();
      });

      test("should define glossary as string in output", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.output_schema.properties.glossary.type).toBe("string");
      });

      test("should define message in output", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.output_schema.properties.message.type).toBe("string");
      });
    });

    describe("Security Scenarios", () => {
      test("should mention GLOSSARY.md in description", async () => {
        const module = await import("../../agents/localize/translate-documents/load-glossary.mjs");
        expect(module.default.description).toContain("GLOSSARY");
      });
    });
  });

  // ==================== prepare-translation.mjs ====================
  describe("prepare-translation.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
        expect(module.default.input_schema.type).toBe("object");
      });

      test("should require langs in input", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default.input_schema.required).toContain("langs");
      });
    });

    describe("Unhappy Path", () => {
      test("should reject missing langs", async () => {
        const { default: prepareTranslation } = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        const result = await prepareTranslation({ docs: [] });
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      test("should reject empty langs array", async () => {
        const { default: prepareTranslation } = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        const result = await prepareTranslation({ langs: [] });
        expect(result.success).toBe(false);
      });

      test("should reject null langs", async () => {
        const { default: prepareTranslation } = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        const result = await prepareTranslation({ langs: null });
        expect(result.success).toBe(false);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema with success", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should define force in input schema", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        expect(module.default.input_schema.properties.force).toBeDefined();
        expect(module.default.input_schema.properties.force.type).toBe("boolean");
      });
    });

    describe("Security Scenarios", () => {
      test("should handle injection in langs", async () => {
        const { default: prepareTranslation } = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        const result = await prepareTranslation({ langs: ["<script>"] });
        // Should return error since config file likely doesn't exist
        expect(result).toHaveProperty("success");
      });

      test("should handle path traversal in docs", async () => {
        const { default: prepareTranslation } = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        const result = await prepareTranslation({
          docs: ["../../../etc/passwd"],
          langs: ["zh"],
        });
        expect(result).toHaveProperty("success");
      });

      test("should handle null bytes in langs", async () => {
        const { default: prepareTranslation } = await import(
          "../../agents/localize/translate-documents/prepare-translation.mjs"
        );
        const result = await prepareTranslation({ langs: ["en\x00zh"] });
        expect(result).toHaveProperty("success");
      });
    });
  });

  // ==================== save-translation.mjs ====================
  describe("save-translation.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
      });

      test("should require all necessary parameters", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("path");
        expect(required).toContain("targetFile");
        expect(required).toContain("targetLanguage");
        expect(required).toContain("sourceHash");
        expect(required).toContain("translation");
      });
    });

    describe("Unhappy Path", () => {
      test("should accept 5 required parameters", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.input_schema.required.length).toBe(5);
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema with success", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should mention metadata in description", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("meta");
      });
    });

    describe("Security Scenarios", () => {
      test("should define targetFile path property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.input_schema.properties.targetFile).toBeDefined();
        expect(module.default.input_schema.properties.targetFile.type).toBe("string");
      });

      test("should define sourceHash property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/save-translation.mjs"
        );
        expect(module.default.input_schema.properties.sourceHash).toBeDefined();
      });
    });
  });

  // ==================== translate-document-to-language.mjs ====================
  describe("translate-document-to-language.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should be async function", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });

      test("should have description property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.description).toBeDefined();
      });

      test("should have input_schema property", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.input_schema).toBeDefined();
      });

      test("should require path, sourceLanguage, language", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        const required = module.default.input_schema.required;
        expect(required).toContain("path");
        expect(required).toContain("sourceLanguage");
        expect(required).toContain("language");
      });
    });

    describe("Unhappy Path", () => {
      test("should accept 2 parameters (input, options)", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.length).toBe(2);
      });

      test("should define optional force parameter", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.input_schema.properties.force).toBeDefined();
      });

      test("should define optional glossary parameter", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.input_schema.properties.glossary).toBeDefined();
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module).toBeDefined();
      });

      test("should have output_schema with success", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.output_schema.required).toContain("success");
      });

      test("should define skipped in output schema", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.output_schema.properties.skipped).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should mention hash in description", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.description.toLowerCase()).toContain("hash");
      });

      test("should define error code in output", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.output_schema.properties.error).toBeDefined();
      });

      test("should define suggestion in output", async () => {
        const module = await import(
          "../../agents/localize/translate-documents/translate-document-to-language.mjs"
        );
        expect(module.default.output_schema.properties.suggestion).toBeDefined();
      });
    });
  });
});
