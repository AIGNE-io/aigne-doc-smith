import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getFilesWithGlob, loadGitignore } from "../../utils/file-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("file-utils", () => {
  let testDir;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(__dirname, "test-file-utils");
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  });

  describe("loadGitignore", () => {
    test("should load gitignore patterns from current directory", async () => {
      const gitignorePath = join(testDir, ".gitignore");
      const gitignoreContent = `
node_modules/
dist/
*.log
.env
# Comment line
      `.trim();

      await writeFile(gitignorePath, gitignoreContent);

      const patterns = await loadGitignore(testDir);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);

      // Should convert gitignore patterns to glob patterns
      expect(patterns.some((p) => p.includes("node_modules"))).toBe(true);
      expect(patterns.some((p) => p.includes("dist"))).toBe(true);
      expect(patterns.some((p) => p.includes("*.log"))).toBe(true);
      expect(patterns.some((p) => p.includes(".env"))).toBe(true);
    });

    test("should load gitignore patterns from git repository", async () => {
      const patterns = await loadGitignore(testDir);
      // Since we're in a git repository, it should load patterns
      expect(patterns).not.toBeNull();
      expect(Array.isArray(patterns)).toBe(true);
    });

    test("should handle empty gitignore file", async () => {
      const gitignorePath = join(testDir, ".gitignore");
      await writeFile(gitignorePath, "");

      const patterns = await loadGitignore(testDir);
      // Even with empty gitignore, parent git repo patterns are loaded
      expect(patterns).not.toBeNull();
      expect(Array.isArray(patterns)).toBe(true);
    });

    test("should ignore comment lines and empty lines", async () => {
      const gitignorePath = join(testDir, ".gitignore");
      const gitignoreContent = `
# This is a comment
node_modules/

# Another comment
*.log
`.trim();

      await writeFile(gitignorePath, gitignoreContent);

      const patterns = await loadGitignore(testDir);

      expect(patterns).toBeDefined();
      // Should not contain empty strings or comments
      expect(patterns.every((p) => p.trim().length > 0 && !p.startsWith("#"))).toBe(true);
    });

    test("should handle various gitignore pattern formats", async () => {
      const gitignorePath = join(testDir, ".gitignore");
      const gitignoreContent = `
/absolute-path
relative-path
directory/
*.extension
**/*.js
temp*
`.trim();

      await writeFile(gitignorePath, gitignoreContent);

      const patterns = await loadGitignore(testDir);

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);

      // Should handle different pattern types
      expect(patterns.some((p) => p.includes("absolute-path"))).toBe(true);
      expect(patterns.some((p) => p.includes("relative-path"))).toBe(true);
      expect(patterns.some((p) => p.includes("directory"))).toBe(true);
      expect(patterns.some((p) => p.includes("*.extension"))).toBe(true);
    });
  });

  describe("getFilesWithGlob", () => {
    beforeEach(async () => {
      // Create test file structure
      await mkdir(join(testDir, "src"), { recursive: true });
      await mkdir(join(testDir, "lib"), { recursive: true });
      await mkdir(join(testDir, "node_modules"), { recursive: true });

      await writeFile(join(testDir, "src", "index.js"), "// main file");
      await writeFile(join(testDir, "src", "utils.ts"), "// utils file");
      await writeFile(join(testDir, "lib", "helper.js"), "// helper file");
      await writeFile(join(testDir, "README.md"), "# readme");
      await writeFile(join(testDir, "package.json"), "{}");
      await writeFile(join(testDir, "node_modules", "dep.js"), "// dependency");
    });

    test("should find files with basic include patterns", async () => {
      const files = await getFilesWithGlob(testDir, ["*.js"], [], []);

      expect(files).toBeDefined();
      expect(Array.isArray(files)).toBe(true);
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("helper.js"))).toBe(true);
    });

    test("should exclude files based on exclude patterns", async () => {
      const files = await getFilesWithGlob(testDir, ["**/*.js"], ["node_modules/**"], []);

      expect(files).toBeDefined();
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("helper.js"))).toBe(true);
      expect(files.some((f) => f.includes("node_modules"))).toBe(false);
    });

    test("should handle multiple include patterns", async () => {
      const files = await getFilesWithGlob(testDir, ["*.js", "*.ts"], [], []);

      expect(files).toBeDefined();
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("utils.ts"))).toBe(true);
      expect(files.some((f) => f.includes("helper.js"))).toBe(true);
    });

    test("should handle gitignore patterns", async () => {
      const gitignorePatterns = ["node_modules/**"];
      const files = await getFilesWithGlob(testDir, ["**/*.js"], [], gitignorePatterns);

      expect(files).toBeDefined();
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("node_modules"))).toBe(false);
    });

    test("should return empty array for empty include patterns", async () => {
      const files = await getFilesWithGlob(testDir, [], [], []);

      expect(files).toBeDefined();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBe(0);
    });

    test("should return absolute paths", async () => {
      const files = await getFilesWithGlob(testDir, ["*.js"], [], []);

      expect(files).toBeDefined();
      files.forEach((file) => {
        expect(file.startsWith("/")).toBe(true);
      });
    });

    test("should handle nested directory patterns", async () => {
      await mkdir(join(testDir, "src", "components"), { recursive: true });
      await writeFile(join(testDir, "src", "components", "button.js"), "// button");

      const files = await getFilesWithGlob(testDir, ["src/**/*.js"], [], []);

      expect(files).toBeDefined();
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("button.js"))).toBe(true);
    });

    test("should handle complex glob patterns", async () => {
      const files = await getFilesWithGlob(testDir, ["**/*.{js,ts,md}"], ["node_modules/**"], []);

      expect(files).toBeDefined();
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("utils.ts"))).toBe(true);
      expect(files.some((f) => f.includes("README.md"))).toBe(true);
      expect(files.some((f) => f.includes("node_modules"))).toBe(false);
    });

    test("should handle non-existent directory gracefully", async () => {
      const nonExistentDir = join(testDir, "non-existent");
      const files = await getFilesWithGlob(nonExistentDir, ["*.js"], [], []);

      expect(files).toBeDefined();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBe(0);
    });
  });
});
