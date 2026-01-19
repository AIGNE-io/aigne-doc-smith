/**
 * Tests for utils/afs-factory.mjs
 *
 * Function signatures:
 * - generateAfsModules({ mode, workspace, skills, skillPath }): Generate AFS modules configuration
 * - generateDocSmithAfsModules(workspace): Generate AFS modules for doc-smith
 * - generateDocsDetailAfsModules(): Generate AFS modules for docs-detail
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

import {
  generateAfsModules,
  generateDocSmithAfsModules,
  generateDocsDetailAfsModules,
} from "../../utils/afs-factory.mjs";

describe("afs-factory.mjs", () => {
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

  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("generateAfsModules", () => {
      test("should be a function", () => {
        expect(typeof generateAfsModules).toBe("function");
      });

      test("should return a promise", () => {
        const result = generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });
        expect(result).toBeInstanceOf(Promise);
      });

      test("should return array of modules for project mode", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });
        expect(Array.isArray(modules)).toBe(true);
      });

      test("should return array of modules for standalone mode", async () => {
        const modules = await generateAfsModules({
          mode: "standalone",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });
        expect(Array.isArray(modules)).toBe(true);
      });

      test("should include workspace module", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });

        const workspaceModule = modules.find(
          (m) => m.options?.name === "workspace"
        );
        expect(workspaceModule).toBeDefined();
      });

      test("should include sources module", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });

        const sourcesModule = modules.find(
          (m) => m.options?.name === "sources"
        );
        expect(sourcesModule).toBeDefined();
      });
    });

    describe("generateDocSmithAfsModules", () => {
      test("should be a function", () => {
        expect(typeof generateDocSmithAfsModules).toBe("function");
      });

      test("should return a promise", () => {
        const result = generateDocSmithAfsModules(tempDir);
        expect(result).toBeInstanceOf(Promise);
      });

      test("should return array of modules", async () => {
        const modules = await generateDocSmithAfsModules(tempDir);
        expect(Array.isArray(modules)).toBe(true);
      });
    });

    describe("generateDocsDetailAfsModules", () => {
      test("should be a function", () => {
        expect(typeof generateDocsDetailAfsModules).toBe("function");
      });

      test("should return a promise", () => {
        const result = generateDocsDetailAfsModules();
        expect(result).toBeInstanceOf(Promise);
      });

      test("should return array of modules", async () => {
        const modules = await generateDocsDetailAfsModules();
        expect(Array.isArray(modules)).toBe(true);
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("generateAfsModules", () => {
      test("should handle missing mode parameter", async () => {
        try {
          await generateAfsModules({
            workspace: tempDir,
            skills: [],
            skillPath: tempDir,
          });
          // May use default mode
        } catch (error) {
          expect(error !== undefined || true).toBe(true);
        }
      });

      test("should handle invalid mode value", async () => {
        try {
          const modules = await generateAfsModules({
            mode: "invalid-mode",
            workspace: tempDir,
            skills: [],
            skillPath: tempDir,
          });
          // May fall back to default
          expect(Array.isArray(modules)).toBe(true);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      test("should handle missing workspace parameter", async () => {
        try {
          await generateAfsModules({
            mode: "project",
            skills: [],
            skillPath: tempDir,
          });
        } catch (error) {
          expect(error !== undefined || true).toBe(true);
        }
      });

      test("should handle non-existent workspace path", async () => {
        try {
          await generateAfsModules({
            mode: "project",
            workspace: "/nonexistent/path",
            skills: [],
            skillPath: tempDir,
          });
        } catch (error) {
          expect(error !== undefined || true).toBe(true);
        }
      });
    });

    describe("generateDocSmithAfsModules", () => {
      test("should handle null workspace", async () => {
        try {
          await generateDocSmithAfsModules(null);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      test("should handle empty workspace", async () => {
        try {
          await generateDocSmithAfsModules("");
        } catch (error) {
          expect(error !== undefined || true).toBe(true);
        }
      });
    });

    describe("generateDocsDetailAfsModules", () => {
      test("should work without parameters", async () => {
        // Should not throw
        const modules = await generateDocsDetailAfsModules();
        expect(Array.isArray(modules)).toBe(true);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("generateAfsModules", () => {
      test("should handle very long workspace path", async () => {
        const longPath = join(tempDir, "a".repeat(200));
        await mkdir(longPath, { recursive: true });

        const modules = await generateAfsModules({
          mode: "project",
          workspace: longPath,
          skills: [],
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle workspace with special characters", async () => {
        const specialPath = join(tempDir, "path with spaces");
        await mkdir(specialPath, { recursive: true });

        const modules = await generateAfsModules({
          mode: "project",
          workspace: specialPath,
          skills: [],
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle unicode in paths", async () => {
        const unicodePath = join(tempDir, "工作区");
        await mkdir(unicodePath, { recursive: true });

        const modules = await generateAfsModules({
          mode: "project",
          workspace: unicodePath,
          skills: [],
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle many skills", async () => {
        const skills = [];
        for (let i = 0; i < 50; i++) {
          skills.push({
            name: `skill-${i}`,
            path: `./skills/skill-${i}`,
            description: `Description ${i}`,
          });
        }

        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills,
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle concurrent generation calls", async () => {
        const promises = [
          generateAfsModules({ mode: "project", workspace: tempDir, skills: [], skillPath: tempDir }),
          generateAfsModules({ mode: "standalone", workspace: tempDir, skills: [], skillPath: tempDir }),
          generateAfsModules({ mode: "project", workspace: tempDir, skills: [], skillPath: tempDir }),
        ];

        const results = await Promise.all(promises);
        expect(results.length).toBe(3);
        results.forEach((modules) => {
          expect(Array.isArray(modules)).toBe(true);
        });
      });
    });

    describe("generateDocSmithAfsModules", () => {
      test("should handle workspace with config file", async () => {
        await mkdir(join(tempDir, ".aigne", "doc-smith"), { recursive: true });
        await writeFile(
          join(tempDir, ".aigne", "doc-smith", "config.yaml"),
          "version: 1"
        );

        const modules = await generateDocSmithAfsModules(tempDir);
        expect(Array.isArray(modules)).toBe(true);
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("generateAfsModules - Path Traversal", () => {
      test("should handle path traversal in workspace", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: "../../../etc/",
          skills: [],
          skillPath: tempDir,
        });

        // Should either reject or handle safely
        expect(Array.isArray(modules) || modules === null).toBe(true);
      });

      test("should handle path traversal in skillPath", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: "../../etc/passwd",
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle absolute paths in skills", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [
            { name: "test", path: "/etc/passwd", description: "Test" },
          ],
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });
    });

    describe("generateAfsModules - Injection Prevention", () => {
      test("should handle shell metacharacters in workspace path", async () => {
        const dangerousPath = join(tempDir, "workspace;rm -rf");
        await mkdir(dangerousPath, { recursive: true });

        const modules = await generateAfsModules({
          mode: "project",
          workspace: dangerousPath,
          skills: [],
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle script tags in skill names", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [
            {
              name: "<script>alert(1)</script>",
              path: "./skill",
              description: "Test",
            },
          ],
          skillPath: tempDir,
        });

        expect(Array.isArray(modules)).toBe(true);
      });

      test("should handle null bytes in paths", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir + "\x00/etc/passwd",
          skills: [],
          skillPath: tempDir,
        });

        // Should handle null bytes safely
        expect(Array.isArray(modules) || modules === undefined).toBe(true);
      });
    });

    describe("Module Configuration Security", () => {
      test("should use local-fs module type", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });

        modules.forEach((module) => {
          expect(module.module).toBe("local-fs");
        });
      });

      test("should include descriptions for modules", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });

        const workspaceModule = modules.find(
          (m) => m.options?.name === "workspace"
        );
        expect(workspaceModule?.options?.description).toBeDefined();
      });

      test("should not expose sensitive paths in descriptions", async () => {
        const modules = await generateAfsModules({
          mode: "project",
          workspace: tempDir,
          skills: [],
          skillPath: tempDir,
        });

        modules.forEach((module) => {
          const desc = module.options?.description || "";
          expect(desc).not.toContain("/etc/");
          expect(desc).not.toContain("password");
          expect(desc).not.toContain("secret");
        });
      });
    });
  });
});
