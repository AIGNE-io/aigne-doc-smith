import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtemp, rmdir } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { DOC_SMITH_DIR, TMP_DIR } from "../../utils/constants/index.mjs";
import {
  DIAGRAM_PLACEHOLDER,
  ensureTmpDir,
  isValidCode,
  replaceD2WithPlaceholder,
  replacePlaceholderWithD2,
  wrapCode,
} from "../../utils/d2-utils.mjs";

describe("d2-utils", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await new Promise((resolve, reject) => {
      mkdtemp(path.join(tmpdir(), "d2-test-"), (err, dir) => {
        if (err) reject(err);
        else resolve(dir);
      });
    });
  });

  afterEach(async () => {
    if (tempDir && existsSync(tempDir)) {
      await new Promise((resolve) => {
        rmdir(tempDir, { recursive: true }, () => resolve());
      });
    }
  });

  describe("ensureTmpDir", () => {
    test("should create tmp directory structure", async () => {
      // Change to temp directory for testing
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        await ensureTmpDir();

        const tmpDir = path.join(tempDir, DOC_SMITH_DIR, TMP_DIR);
        const gitignorePath = path.join(tmpDir, ".gitignore");

        expect(existsSync(tmpDir)).toBe(true);
        expect(existsSync(gitignorePath)).toBe(true);

        const gitignoreContent = await readFile(gitignorePath, "utf8");
        expect(gitignoreContent).toBe("**/*");
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("should not recreate if already exists", async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // First call
        await ensureTmpDir();

        const tmpDir = path.join(tempDir, DOC_SMITH_DIR, TMP_DIR);
        const gitignorePath = path.join(tmpDir, ".gitignore");

        // Modify .gitignore to test if it gets overwritten
        await writeFile(gitignorePath, "modified content");

        // Second call
        await ensureTmpDir();

        const gitignoreContent = await readFile(gitignorePath, "utf8");
        expect(gitignoreContent).toBe("modified content"); // Should not be overwritten
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("isValidCode", () => {
    test("should return true for 'd2'", () => {
      expect(isValidCode("d2")).toBe(true);
    });

    test("should return true for 'D2'", () => {
      expect(isValidCode("D2")).toBe(true);
    });

    test("should return false for other languages", () => {
      expect(isValidCode("javascript")).toBe(false);
      expect(isValidCode("python")).toBe(false);
      expect(isValidCode("")).toBe(false);
      expect(isValidCode(null)).toBe(false);
      expect(isValidCode(undefined)).toBe(false);
    });
  });

  describe("wrapCode", () => {
    test("should return original content when D2 block already exists", () => {
      const content = "```d2\nA -> B\n```";
      expect(wrapCode({ content })).toBe(content);
    });

    test("should wrap plain content in a D2 code block", () => {
      const content = "A -> B";
      const expected = "```d2\nA -> B\n```";
      expect(wrapCode({ content })).toBe(expected);
    });
  });

  describe("replaceD2WithPlaceholder", () => {
    test("should replace D2 code block with placeholder", () => {
      const content = "# Title\n\n```d2\nA -> B\n```\n\nSome text";
      const [result, codeBlock] = replaceD2WithPlaceholder({ content });
      expect(result).toBe(`# Title\n\n${DIAGRAM_PLACEHOLDER}\n\nSome text`);
      expect(codeBlock).toBe("```d2\nA -> B\n```");
    });

    test("should return original content when no D2 block exists", () => {
      const content = "# Title\n\nNo diagrams here";
      const [result, codeBlock] = replaceD2WithPlaceholder({ content });
      expect(result).toBe(content);
      expect(codeBlock).toBe("");
    });

    test("should only replace first D2 block", () => {
      const content = "```d2\nA -> B\n```\n\n```d2\nC -> D\n```";
      const [result, codeBlock] = replaceD2WithPlaceholder({ content });
      expect(result).toBe(`${DIAGRAM_PLACEHOLDER}\n\n\`\`\`d2\nC -> D\n\`\`\``);
      expect(codeBlock).toBe("```d2\nA -> B\n```");
    });
  });

  describe("replacePlaceholderWithD2", () => {
    test("should replace placeholder with D2 code block", () => {
      const content = `# Title\n\n${DIAGRAM_PLACEHOLDER}\n\nSome text`;
      const result = replacePlaceholderWithD2({ content, diagramSourceCode: "A -> B" });
      expect(result).toBe("# Title\n\n```d2\nA -> B\n```\n\nSome text");
    });

    test("should return original content when no placeholder exists", () => {
      const content = "# Title\n\nNo placeholder here";
      const result = replacePlaceholderWithD2({ content, diagramSourceCode: "A -> B" });
      expect(result).toBe(content);
    });

    test("should return original content when diagramSourceCode is empty", () => {
      const content = `# Title\n\n${DIAGRAM_PLACEHOLDER}`;
      const result = replacePlaceholderWithD2({ content, diagramSourceCode: "" });
      expect(result).toBe(content);
    });

    test("should add newline before code block if missing", () => {
      const content = `# Title${DIAGRAM_PLACEHOLDER}\n\nSome text`;
      const result = replacePlaceholderWithD2({ content, diagramSourceCode: "A -> B" });
      expect(result).toContain("# Title\n```d2");
    });

    test("should add newline after code block if missing", () => {
      const content = `# Title\n\n${DIAGRAM_PLACEHOLDER}Some text`;
      const result = replacePlaceholderWithD2({ content, diagramSourceCode: "A -> B" });
      expect(result).toContain("```\nSome text");
    });
  });
});
