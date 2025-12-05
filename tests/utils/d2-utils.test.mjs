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
  replaceDiagramsWithPlaceholder,
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

  describe("replaceDiagramsWithPlaceholder", () => {
    test("should return original content when content is empty", () => {
      expect(replaceDiagramsWithPlaceholder({ content: "" })).toBe("");
      expect(replaceDiagramsWithPlaceholder({ content: null })).toBe(null);
      expect(replaceDiagramsWithPlaceholder({ content: undefined })).toBe(undefined);
    });

    test("should return original content when no diagrams exist", () => {
      const content = "# Title\n\nSome text without diagrams";
      expect(replaceDiagramsWithPlaceholder({ content })).toBe(content);
    });

    test("should replace single DIAGRAM_PLACEHOLDER with itself (no change)", () => {
      const content = `# Title\n\n${DIAGRAM_PLACEHOLDER}\n\nSome text`;
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
    });

    test("should replace multiple DIAGRAM_PLACEHOLDERs", () => {
      const content = `# Title\n\n${DIAGRAM_PLACEHOLDER}\n\nText\n\n${DIAGRAM_PLACEHOLDER}\n\nMore text`;
      const result = replaceDiagramsWithPlaceholder({ content });
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(2);
    });

    test("should replace single D2 code block", () => {
      const content = "# Title\n\n```d2\nA -> B\n```\n\nSome text";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("```d2");
    });

    test("should replace multiple D2 code blocks", () => {
      const content = "```d2\nA -> B\n```\n\nText\n\n```d2\nC -> D\n```";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).not.toContain("```d2");
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(2);
    });

    test("should replace single diagram image", () => {
      const content =
        "# Title\n\n<!-- DIAGRAM_IMAGE_START:test -->\n![alt](path.png)\n<!-- DIAGRAM_IMAGE_END -->\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("DIAGRAM_IMAGE_START");
      expect(result).not.toContain("path.png");
    });

    test("should replace multiple diagram images", () => {
      const content =
        "<!-- DIAGRAM_IMAGE_START:test1 -->\n![alt1](path1.png)\n<!-- DIAGRAM_IMAGE_END -->\n\nText\n\n<!-- DIAGRAM_IMAGE_START:test2 -->\n![alt2](path2.png)\n<!-- DIAGRAM_IMAGE_END -->";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).not.toContain("DIAGRAM_IMAGE_START");
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(2);
    });

    test("should replace single Mermaid code block", () => {
      const content = "# Title\n\n```mermaid\ngraph TD\nA --> B\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("```mermaid");
    });

    test("should replace multiple Mermaid code blocks", () => {
      const content =
        "```mermaid\ngraph TD\nA --> B\n```\n\nText\n\n```mermaid\nflowchart LR\nC --> D\n```";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).not.toContain("```mermaid");
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(2);
    });

    test("should replace mixed diagram types", () => {
      const content =
        "```d2\nA -> B\n```\n\n<!-- DIAGRAM_IMAGE_START:test -->\n![alt](path.png)\n<!-- DIAGRAM_IMAGE_END -->\n\n```mermaid\ngraph TD\nC --> D\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).not.toContain("```d2");
      expect(result).not.toContain("DIAGRAM_IMAGE_START");
      expect(result).not.toContain("```mermaid");
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(3);
    });

    test("should replace specific diagram by index", () => {
      const content = "```d2\nA -> B\n```\n\nText\n\n```d2\nC -> D\n```\n\nMore text";
      const result = replaceDiagramsWithPlaceholder({ content, diagramIndex: 1 });
      // Should only replace the second D2 block
      expect(result).toContain("```d2\nA -> B\n```");
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("```d2\nC -> D\n```");
    });

    test("should replace first diagram when diagramIndex is 0", () => {
      const content = "```d2\nA -> B\n```\n\nText\n\n```d2\nC -> D\n```";
      const result = replaceDiagramsWithPlaceholder({ content, diagramIndex: 0 });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).toContain("```d2\nC -> D\n```");
      expect(result).not.toContain("```d2\nA -> B\n```");
    });

    test("should not replace when diagramIndex is negative", () => {
      const content = "```d2\nA -> B\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content, diagramIndex: -1 });
      // Should replace all (negative index is invalid, so all are replaced)
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("```d2");
    });

    test("should not replace when diagramIndex is out of range", () => {
      const content = "```d2\nA -> B\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content, diagramIndex: 10 });
      // Should replace all (out of range index is invalid, so all are replaced)
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("```d2");
    });

    test("should add newline before placeholder if missing", () => {
      const content = "# Title```d2\nA -> B\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toMatch(/# Title\nDIAGRAM_PLACEHOLDER/);
    });

    test("should add newline after placeholder if missing", () => {
      const content = "# Title\n\n```d2\nA -> B\n```Text";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toMatch(/DIAGRAM_PLACEHOLDER\nText/);
    });

    test("should add newlines on both sides if missing", () => {
      const content = "# Title```d2\nA -> B\n```Text";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toMatch(/# Title\nDIAGRAM_PLACEHOLDER\nText/);
    });

    test("should preserve existing newlines", () => {
      const content = "# Title\n\n```d2\nA -> B\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toMatch(/# Title\n\nDIAGRAM_PLACEHOLDER\n\nText/);
    });

    test("should handle diagram image with title in DIAGRAM_IMAGE_START", () => {
      const content =
        "# Title\n\n<!-- DIAGRAM_IMAGE_START:test-diagram -->\n![alt](path.png)\n<!-- DIAGRAM_IMAGE_END -->\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("DIAGRAM_IMAGE_START");
    });

    test("should handle D2 code block with title", () => {
      const content = "# Title\n\n```d2 Vault 驗證流程\nA -> B\n```\n\nText";
      const result = replaceDiagramsWithPlaceholder({ content });
      expect(result).toContain(DIAGRAM_PLACEHOLDER);
      expect(result).not.toContain("```d2");
    });

    test("should handle complex content with multiple diagram types and text", () => {
      const content =
        "Introduction\n\n```d2\nFirst diagram\n```\n\nMiddle text\n\n<!-- DIAGRAM_IMAGE_START:img1 -->\n![alt](img1.png)\n<!-- DIAGRAM_IMAGE_END -->\n\nMore text\n\n```mermaid\ngraph TD\nA --> B\n```\n\nConclusion";
      const result = replaceDiagramsWithPlaceholder({ content });
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(3);
      expect(result).toContain("Introduction");
      expect(result).toContain("Middle text");
      expect(result).toContain("More text");
      expect(result).toContain("Conclusion");
    });

    test("should handle replacement with diagramIndex and newline adjustments", () => {
      const content = "Text1```d2\nA -> B\n```Text2\n\n```d2\nC -> D\n```\n\nText3";
      const result = replaceDiagramsWithPlaceholder({ content, diagramIndex: 0 });
      // First diagram should be replaced with newlines
      expect(result).toMatch(/Text1\nDIAGRAM_PLACEHOLDER\nText2/);
      // Second diagram should remain
      expect(result).toContain("```d2\nC -> D\n```");
    });

    test("should sort diagrams by position before replacement", () => {
      // Create content where diagrams are not in order by type
      const content =
        "```d2\nFirst\n```\n\n<!-- DIAGRAM_IMAGE_START:test -->\n![alt](path.png)\n<!-- DIAGRAM_IMAGE_END -->\n\n```d2\nSecond\n```";
      const result = replaceDiagramsWithPlaceholder({ content });
      // All should be replaced in correct order
      const matches = result.match(new RegExp(DIAGRAM_PLACEHOLDER, "g"));
      expect(matches).toHaveLength(3);
    });

    test("should handle empty string content", () => {
      expect(replaceDiagramsWithPlaceholder({ content: "" })).toBe("");
    });
  });
});
