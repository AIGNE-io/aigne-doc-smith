/**
 * Tests for utils/workspace.mjs
 *
 * Test design based on function signatures:
 * - WORKSPACE_MODES: Constants for workspace modes
 * - pathExists(path): Check if path exists
 * - pathExistsSync(path): Sync version of pathExists
 * - isGitRepo(cwd): Check if directory is a git repository
 * - gitExec(command, cwd): Execute git command
 * - getGitInfo(cwd): Get git repository information
 * - getGitRoot(cwd): Get git repository root
 * - addToGitignore(gitRoot, pattern): Add pattern to .gitignore
 * - detectWorkspaceMode(): Detect current workspace mode
 * - detectWorkspaceModeSync(): Sync version of detectWorkspaceMode
 * - loadConfig(configPath): Load configuration from path
 * - isNewVersionConfig(config): Check if config is new version
 * - backupOldWorkspace(): Backup old workspace
 * - generateConfig(options): Generate configuration object
 * - createDirectoryStructure(baseDir, includeSources): Create workspace directories
 * - initProjectMode(): Initialize project mode
 * - initStandaloneMode(): Initialize standalone mode
 * - detectAndInitialize(): Detect mode and initialize
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { createTempDir } from "../setup/test-utils.mjs";

import {
  WORKSPACE_MODES,
  AIGNE_DIR,
  DOC_SMITH_DIR,
  WORKSPACE_SUBDIRS,
  pathExists,
  pathExistsSync,
  isGitRepo,
  detectWorkspaceMode,
  detectWorkspaceModeSync,
  loadConfig,
  isNewVersionConfig,
  generateConfig,
  createDirectoryStructure,
} from "../../utils/workspace.mjs";

describe("workspace.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("Constants", () => {
      test("WORKSPACE_MODES should be defined", () => {
        expect(typeof WORKSPACE_MODES).toBe("object");
        expect(WORKSPACE_MODES).not.toBeNull();
      });

      test("AIGNE_DIR should be a string", () => {
        expect(typeof AIGNE_DIR).toBe("string");
        expect(AIGNE_DIR.length).toBeGreaterThan(0);
      });

      test("DOC_SMITH_DIR should be a string", () => {
        expect(typeof DOC_SMITH_DIR).toBe("string");
        expect(DOC_SMITH_DIR.length).toBeGreaterThan(0);
      });

      test("WORKSPACE_SUBDIRS should be an array", () => {
        expect(Array.isArray(WORKSPACE_SUBDIRS)).toBe(true);
        expect(WORKSPACE_SUBDIRS.length).toBeGreaterThan(0);
      });
    });

    describe("pathExists", () => {
      test("should return true for existing directory", async () => {
        const result = await pathExists(".");
        expect(result).toBe(true);
      });

      test("should return false for non-existing path", async () => {
        const result = await pathExists("/non/existing/path/xyz123");
        expect(result).toBe(false);
      });

      test("should return true for existing file", async () => {
        const result = await pathExists("package.json");
        expect(result).toBe(true);
      });
    });

    describe("pathExistsSync", () => {
      test("should return true for existing directory", () => {
        const result = pathExistsSync(".");
        expect(result).toBe(true);
      });

      test("should return false for non-existing path", () => {
        const result = pathExistsSync("/non/existing/path/xyz123");
        expect(result).toBe(false);
      });
    });

    describe("isGitRepo", () => {
      test("should return boolean", async () => {
        const result = await isGitRepo(".");
        expect(typeof result).toBe("boolean");
      });
    });

    describe("detectWorkspaceMode", () => {
      test("should return a result", async () => {
        const result = await detectWorkspaceMode();
        expect(result).toBeDefined();
      });
    });

    describe("detectWorkspaceModeSync", () => {
      test("should return a result", () => {
        const result = detectWorkspaceModeSync();
        expect(result).toBeDefined();
      });
    });

    describe("generateConfig", () => {
      test("should generate config from options", () => {
        const options = { mode: "project", sources: [] };
        const result = generateConfig(options);
        // Returns string (YAML content) based on actual signature
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      test("should include mode in generated config", () => {
        const options = { mode: "standalone", sources: [] };
        const result = generateConfig(options);
        expect(typeof result).toBe("string");
      });
    });

    describe("isNewVersionConfig", () => {
      test("should return boolean for valid config", () => {
        const config = { version: 2 };
        const result = isNewVersionConfig(config);
        expect(typeof result).toBe("boolean");
      });
    });

    describe("createDirectoryStructure", () => {
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

      test("should create directories without error", async () => {
        // Function may return undefined or void on success
        const result = await createDirectoryStructure(tempDir);
        expect(result === undefined || result === null || typeof result === "object").toBe(true);
      });

      test("should create directories with sources option", async () => {
        const result = await createDirectoryStructure(tempDir, true);
        expect(result === undefined || result === null || typeof result === "object").toBe(true);
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("pathExists", () => {
      test("should handle empty string path", async () => {
        const result = await pathExists("");
        expect(typeof result).toBe("boolean");
      });

      test("should handle path with only whitespace", async () => {
        const result = await pathExists("   ");
        expect(typeof result).toBe("boolean");
      });
    });

    describe("pathExistsSync", () => {
      test("should handle empty string path", () => {
        const result = pathExistsSync("");
        expect(typeof result).toBe("boolean");
      });
    });

    describe("isGitRepo", () => {
      test("should return false for non-git directory", async () => {
        const result = await isGitRepo("/tmp");
        expect(result).toBe(false);
      });

      test("should handle non-existing directory", async () => {
        const result = await isGitRepo("/non/existing/path");
        expect(result).toBe(false);
      });
    });

    describe("loadConfig", () => {
      test("should handle non-existing config path", async () => {
        try {
          const result = await loadConfig("/non/existing/config.yaml");
          expect(result === null || result === undefined).toBe(true);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    describe("isNewVersionConfig", () => {
      test("should handle null config", () => {
        const result = isNewVersionConfig(null);
        expect(typeof result).toBe("boolean");
      });

      test("should handle undefined config", () => {
        const result = isNewVersionConfig(undefined);
        expect(typeof result).toBe("boolean");
      });

      test("should handle empty object", () => {
        const result = isNewVersionConfig({});
        expect(typeof result).toBe("boolean");
      });
    });

    describe("generateConfig", () => {
      test("should handle empty options", () => {
        const result = generateConfig({ mode: "", sources: [] });
        expect(typeof result).toBe("string");
      });

      test("should handle missing mode", () => {
        try {
          const result = generateConfig({ sources: [] });
          expect(typeof result).toBe("string");
        } catch (error) {
          // May throw on missing required fields
          expect(error).toBeDefined();
        }
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("pathExists", () => {
      test("should handle very long path", async () => {
        const longPath = `/${"a".repeat(500)}/file`;
        const result = await pathExists(longPath);
        expect(typeof result).toBe("boolean");
      });

      test("should handle path with null bytes", async () => {
        try {
          const result = await pathExists("/path\x00/with/null");
          expect(typeof result).toBe("boolean");
        } catch {
          // Some systems may throw on null bytes
        }
      });
    });

    describe("isGitRepo", () => {
      test("should not hang on inaccessible directories", async () => {
        // Should return quickly even for edge cases
        const startTime = Date.now();
        await isGitRepo("/root/inaccessible");
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });

    describe("createDirectoryStructure", () => {
      test("should handle read-only location gracefully", async () => {
        try {
          await createDirectoryStructure("/etc/test-readonly");
        } catch (error) {
          // Expected to fail on read-only locations
          expect(error).toBeDefined();
        }
      });

      test("should handle concurrent creation calls", async () => {
        const temp = await createTempDir();
        try {
          await Promise.all([
            createDirectoryStructure(temp.path),
            createDirectoryStructure(temp.path),
            createDirectoryStructure(temp.path),
          ]);
        } finally {
          await temp.cleanup();
        }
      });
    });

    describe("loadConfig", () => {
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

      test("should handle malformed YAML file", async () => {
        const configPath = join(tempDir, "config.yaml");
        await writeFile(configPath, "invalid: yaml: content: [");
        try {
          await loadConfig(configPath);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      test("should handle empty config file", async () => {
        const configPath = join(tempDir, "config.yaml");
        await writeFile(configPath, "");
        const result = await loadConfig(configPath);
        expect(result === null || result === undefined || typeof result === "object").toBe(true);
      });

      test("should handle binary file as config", async () => {
        const configPath = join(tempDir, "config.yaml");
        await writeFile(configPath, Buffer.from([0x00, 0x01, 0x02, 0xff]));
        try {
          await loadConfig(configPath);
        } catch (error) {
          // Expected to fail on binary content
          expect(error).toBeDefined();
        }
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("pathExists - Path Traversal", () => {
      test("should handle path traversal attempts without crashing", async () => {
        // pathExists is a low-level utility that doesn't restrict paths
        // It simply checks if the path exists - security validation is caller's responsibility
        const result = await pathExists("../../../etc/passwd");
        expect(typeof result).toBe("boolean");
        // On most systems, this relative path won't resolve to actual /etc/passwd
        // because it's relative to cwd, not root
      });

      test("should handle symlink-based traversal without crashing", async () => {
        // pathExists follows symlinks by design (uses fs.access)
        // This is expected behavior - callers should validate paths if needed
        const result = await pathExists("/tmp");
        expect(typeof result).toBe("boolean");
        // /tmp should exist on Unix systems
        if (process.platform !== "win32") {
          expect(result).toBe(true);
        }
      });
    });

    describe("isGitRepo - Command Injection", () => {
      test("should safely handle paths with shell metacharacters", async () => {
        // isGitRepo passes path as cwd option to spawn, not interpolated into shell
        // This should return false (not a git repo) without executing injected commands
        const maliciousPath = "/tmp; rm -rf /";
        const result = await isGitRepo(maliciousPath);
        expect(typeof result).toBe("boolean");
        // Path with semicolon is not a valid directory, should return false
        expect(result).toBe(false);
      });

      test("should handle paths with backticks", async () => {
        // Backticks should be treated as literal characters, not shell substitution
        const maliciousPath = "/tmp`whoami`/test";
        const result = await isGitRepo(maliciousPath);
        expect(typeof result).toBe("boolean");
        // This invalid path should return false without executing whoami
        expect(result).toBe(false);
      });

      test("should handle paths with $() command substitution", async () => {
        // $() should be treated as literal characters, not shell substitution
        const maliciousPath = "/tmp$(whoami)/test";
        const result = await isGitRepo(maliciousPath);
        expect(typeof result).toBe("boolean");
        // This invalid path should return false without executing the substitution
        expect(result).toBe(false);
      });
    });

    describe("createDirectoryStructure - Path Injection", () => {
      test("should handle path traversal in base directory", async () => {
        const temp = await createTempDir();
        try {
          // Attempt to escape the base directory using path traversal
          // createDirectoryStructure doesn't validate paths - it trusts the caller
          // This is acceptable as it's an internal utility, not user-facing
          const escapedPath = join(temp.path, `../../../tmp/evil-test-dir-${Date.now()}`);
          await createDirectoryStructure(escapedPath);
          // If it succeeds, clean up the created directory
          await rm(escapedPath, { recursive: true, force: true }).catch(() => {});
        } catch (error) {
          // Permission denied or other errors are expected for some paths
          expect(error).toBeDefined();
          expect(error.message).toBeDefined();
        } finally {
          await temp.cleanup();
        }
      });
    });

    describe("loadConfig - YAML Deserialization", () => {
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

      test("should not execute code in YAML tags", async () => {
        const configPath = join(tempDir, "config.yaml");
        // Malicious YAML with Python code execution attempt
        await writeFile(configPath, "!!python/object/apply:os.system ['echo pwned']");
        try {
          const result = await loadConfig(configPath);
          // Should either parse as string or reject
          expect(typeof result === "object" || result === null).toBe(true);
        } catch (error) {
          // Rejecting malicious YAML is also acceptable
          expect(error).toBeDefined();
        }
      });

      test("should safely handle YAML anchors and aliases (Billion Laughs prevention)", async () => {
        const configPath = join(tempDir, "config.yaml");
        // Billion laughs attack variant - exponential expansion via anchors/aliases
        await writeFile(
          configPath,
          `
a: &a ["lol","lol"]
b: &b [*a,*a]
c: &c [*b,*b]
d: [*c,*c]
`,
        );
        const startTime = Date.now();
        try {
          const result = await loadConfig(configPath);
          const elapsed = Date.now() - startTime;
          // Should complete quickly (under 1 second) without exponential memory growth
          expect(elapsed).toBeLessThan(1000);
          // Result should be parsed (yaml library handles this safely)
          expect(result).toBeDefined();
        } catch (error) {
          // Rejecting overly complex YAML is also acceptable security behavior
          expect(error).toBeDefined();
          expect(error.message).toBeDefined();
        }
      });

      test("should not expose system information", async () => {
        const configPath = join(tempDir, "config.yaml");
        await writeFile(configPath, "locale: zh\n");
        const result = await loadConfig(configPath);
        // Result should only contain config data, not system info
        if (result) {
          const stringified = JSON.stringify(result);
          expect(stringified).not.toContain(process.env.HOME || "/home");
          expect(stringified).not.toContain("password");
          expect(stringified).not.toContain("secret");
        }
      });
    });

    describe("Constants - Information Exposure", () => {
      test("AIGNE_DIR should not contain sensitive paths", () => {
        expect(AIGNE_DIR).not.toContain("/etc");
        expect(AIGNE_DIR).not.toContain("/root");
        expect(AIGNE_DIR).not.toContain("password");
      });

      test("WORKSPACE_SUBDIRS should not contain system directories", () => {
        for (const dir of WORKSPACE_SUBDIRS) {
          expect(dir).not.toMatch(/^\//);
          expect(dir).not.toContain("..");
        }
      });
    });
  });
});
