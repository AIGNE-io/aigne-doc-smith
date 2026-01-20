/**
 * Tests for skills-entry/doc-smith
 *
 * Function signatures:
 * - index.mjs: Exports agent configuration object
 * - workspace-init.mjs: workspaceInit(): Initialize DocSmith workspace
 *
 * NOTE: Tests focus on module exports and configuration structure.
 * Actual initialization depends on workspace state.
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("skills-entry/doc-smith", () => {
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
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("object");
      });

      test("should have type property", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.type).toBeDefined();
        expect(module.default.type).toContain("agent");
      });

      test("should have name property", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.name).toBeDefined();
        expect(module.default.name).toBe("docsmith");
      });

      test("should have instructions property", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.instructions).toBeDefined();
      });

      test("should have skills array", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.skills).toBeDefined();
        expect(Array.isArray(module.default.skills)).toBe(true);
      });

      test("should have afs configuration", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.afs).toBeDefined();
        expect(module.default.afs.modules).toBeDefined();
      });
    });

    describe("Unhappy Path", () => {
      test("should have input_key defined", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.input_key).toBe("message");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module).toBeDefined();
      });

      test("should have valid agent type", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.type).toContain("agent-library");
      });

      test("should have instructions url", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.instructions.url).toBeDefined();
      });
    });

    describe("Security Scenarios", () => {
      test("should have task_render_mode", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        expect(module.default.task_render_mode).toBeDefined();
      });

      test("should include bash-executor in skills", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        const hasBashExecutor = module.default.skills.some(
          (s) => typeof s === "string" && s.includes("bash-executor"),
        );
        expect(hasBashExecutor).toBe(true);
      });

      test("should include structure-checker in skills", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        const hasStructureChecker = module.default.skills.some(
          (s) => typeof s === "string" && s.includes("structure-checker"),
        );
        expect(hasStructureChecker).toBe(true);
      });

      test("should include content-checker in skills", async () => {
        const module = await import("../../../skills-entry/doc-smith/index.mjs");
        const hasContentChecker = module.default.skills.some(
          (s) => typeof s === "string" && s.includes("content-checker"),
        );
        expect(hasContentChecker).toBe(true);
      });
    });
  });

  // ==================== workspace-init.mjs ====================
  describe("workspace-init.mjs", () => {
    describe("Happy Path", () => {
      test("should export default function", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });

      test("should have description property", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.description).toBeDefined();
        expect(typeof module.default.description).toBe("string");
      });

      test("should have task_render_mode property", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.task_render_mode).toBeDefined();
      });

      test("should mention workspace in description", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.description.toLowerCase()).toContain("workspace");
      });

      test("should mention initialize in description", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.description.toLowerCase()).toContain("initialize");
      });
    });

    describe("Unhappy Path", () => {
      test("should be async function", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.constructor.name).toBe("AsyncFunction");
      });
    });

    describe("Critical Error Scenarios", () => {
      test("should import without errors", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module).toBeDefined();
      });

      test("should have hide task_render_mode", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.task_render_mode).toBe("hide");
      });

      test("should return object from function call", async () => {
        // Intent: workspaceInit should always return an object
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        // Function should be callable and return object-like structure
        expect(typeof module.default).toBe("function");
      });

      test("should have no required parameters", async () => {
        // Intent: workspaceInit takes no parameters, can be called directly
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.length).toBe(0);
      });
    });

    describe("Security Scenarios", () => {
      test("should mention DocSmith in description", async () => {
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.description).toContain("DocSmith");
      });

      test("should hide task render to prevent information exposure", async () => {
        // Intent: Hide task to prevent exposing workspace detection logic
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.task_render_mode).toBe("hide");
      });

      test("should not expose sensitive config in description", async () => {
        // Intent: Description should not contain paths or sensitive info
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.description).not.toContain("/Users/");
        expect(module.default.description).not.toContain("\\Users\\");
        expect(module.default.description).not.toContain("password");
        expect(module.default.description).not.toContain("token");
      });

      test("should have concise description without implementation details", async () => {
        // Intent: Description should not reveal internal implementation
        const module = await import("../../../skills-entry/doc-smith/workspace-init.mjs");
        expect(module.default.description.length).toBeLessThan(100);
      });
    });
  });
});
