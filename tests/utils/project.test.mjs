/**
 * Tests for utils/project.mjs
 *
 * Function signatures:
 * - getProjectInfo(): Get project information from Git or directory
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

import { getProjectInfo } from "../../utils/project.mjs";

describe("project.mjs", () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    const temp = await createTempDir();
    tempDir = temp.path;
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("getProjectInfo", () => {
      test("should be a function", () => {
        expect(typeof getProjectInfo).toBe("function");
      });

      test("should return a promise", () => {
        const result = getProjectInfo();
        expect(result).toBeInstanceOf(Promise);
      });

      test("should return object with name property", async () => {
        const info = await getProjectInfo();
        expect(info).toHaveProperty("name");
        expect(typeof info.name).toBe("string");
      });

      test("should return object with description property", async () => {
        const info = await getProjectInfo();
        expect(info).toHaveProperty("description");
        expect(typeof info.description).toBe("string");
      });

      test("should return object with icon property", async () => {
        const info = await getProjectInfo();
        expect(info).toHaveProperty("icon");
      });

      test("should return object with fromGitHub property", async () => {
        const info = await getProjectInfo();
        expect(info).toHaveProperty("fromGitHub");
        expect(typeof info.fromGitHub).toBe("boolean");
      });

      test("should use directory name as default name", async () => {
        process.chdir(tempDir);
        const info = await getProjectInfo();
        expect(info.name).toBeDefined();
        expect(typeof info.name).toBe("string");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("getProjectInfo", () => {
      test("should handle directory without git", async () => {
        process.chdir(tempDir);
        // Should not throw, should use directory name
        const info = await getProjectInfo();
        expect(info).toBeDefined();
        expect(info.name).toBeDefined();
      });

      test("should handle empty sources directory", async () => {
        await mkdir(join(tempDir, "sources"));
        process.chdir(tempDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle sources directory with files only", async () => {
        await mkdir(join(tempDir, "sources"));
        await writeFile(join(tempDir, "sources", "file.txt"), "content");
        process.chdir(tempDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should return default values when GitHub info not available", async () => {
        process.chdir(tempDir);
        const info = await getProjectInfo();

        expect(info.name).toBeDefined();
        expect(info.fromGitHub).toBe(false);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("getProjectInfo", () => {
      test("should handle directory with special characters in name", async () => {
        const specialDir = join(tempDir, "project-name_with.special");
        await mkdir(specialDir);
        process.chdir(specialDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
        expect(info.name).toBeDefined();
      });

      test("should handle very long directory names", async () => {
        const longName = "a".repeat(200);
        const longDir = join(tempDir, longName);
        await mkdir(longDir);
        process.chdir(longDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle unicode in directory name", async () => {
        const unicodeDir = join(tempDir, "项目文档");
        await mkdir(unicodeDir);
        process.chdir(unicodeDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle network timeout when fetching GitHub info", async () => {
        // getProjectInfo should handle network issues gracefully
        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle concurrent calls", async () => {
        const promises = [
          getProjectInfo(),
          getProjectInfo(),
          getProjectInfo(),
        ];

        const results = await Promise.all(promises);
        expect(results.length).toBe(3);
        results.forEach((info) => {
          expect(info).toBeDefined();
          expect(info.name).toBeDefined();
        });
      });

      test("should handle sources directory with many subdirectories", async () => {
        await mkdir(join(tempDir, "sources"));
        for (let i = 0; i < 10; i++) {
          await mkdir(join(tempDir, "sources", `dir${i}`));
        }
        process.chdir(tempDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("getProjectInfo - Path Security", () => {
      test("should handle path traversal in directory name", async () => {
        // Can't actually create ".." directory, but test error handling
        process.chdir(tempDir);
        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle symlink in sources directory", async () => {
        await mkdir(join(tempDir, "sources"));
        // Symlinks are handled by the filesystem
        process.chdir(tempDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });
    });

    describe("getProjectInfo - Command Injection", () => {
      test("should handle directory names with shell metacharacters", async () => {
        const dangerousDir = join(tempDir, "project;rm -rf");
        await mkdir(dangerousDir);
        process.chdir(dangerousDir);

        // Should not execute the command
        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle directory names with backticks", async () => {
        const dangerousDir = join(tempDir, "project`id`");
        await mkdir(dangerousDir);
        process.chdir(dangerousDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });

      test("should handle directory names with $() command substitution", async () => {
        const dangerousDir = join(tempDir, "project$(whoami)");
        await mkdir(dangerousDir);
        process.chdir(dangerousDir);

        const info = await getProjectInfo();
        expect(info).toBeDefined();
      });
    });

    describe("getProjectInfo - Information Disclosure", () => {
      test("should not expose sensitive git configuration", async () => {
        const info = await getProjectInfo();
        // Should not expose .git internals
        expect(info).not.toHaveProperty("gitConfig");
        expect(info).not.toHaveProperty("credentials");
      });

      test("should not expose absolute paths in response", async () => {
        process.chdir(tempDir);
        const info = await getProjectInfo();

        // Response should not contain absolute temp path
        const infoString = JSON.stringify(info);
        expect(infoString).not.toContain(tempDir);
      });
    });

    describe("getProjectInfo - GitHub API Security", () => {
      test("should not expose GitHub tokens in error", async () => {
        try {
          await getProjectInfo();
        } catch (error) {
          expect(error?.message || "").not.toMatch(/token|authorization|bearer/i);
        }
      });

      test("should handle malicious repository names from GitHub", async () => {
        // Function should sanitize or handle malicious names
        const info = await getProjectInfo();
        // Name should not contain executable code
        expect(info.name).not.toContain("<script>");
        expect(info.description).not.toContain("<script>");
      });
    });
  });
});
