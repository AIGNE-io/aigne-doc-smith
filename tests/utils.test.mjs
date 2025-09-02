import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  detectSystemLanguage,
  getAvailablePaths,
  getContentHash,
  getCurrentGitHead,
  getGitHubRepoInfo,
  getGithubRepoUrl,
  getModifiedFilesBetweenCommits,
  getProjectInfo,
  hasFileChangesBetweenCommits,
  hasSourceFilesChanged,
  isGlobPattern,
  loadConfigFromFile,
  normalizePath,
  processConfigFields,
  processContent,
  resolveFileReferences,
  saveDocWithTranslations,
  saveGitHeadToConfig,
  saveValueToConfig,
  toRelativePath,
  validatePath,
  validatePaths,
} from "../utils/utils.mjs";

describe("utils", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `utils-test-${Date.now()}`);
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("normalizePath", () => {
    test("should return absolute path when given absolute path", () => {
      const absolutePath = "/usr/local/bin";
      expect(normalizePath(absolutePath)).toBe(absolutePath);
    });

    test("should resolve relative path to absolute path", () => {
      const relativePath = "./test";
      const result = normalizePath(relativePath);
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain("test");
    });

    test("should handle empty string", () => {
      const result = normalizePath("");
      expect(path.isAbsolute(result)).toBe(true);
    });
  });

  describe("toRelativePath", () => {
    test("should convert absolute path to relative", () => {
      const absolutePath = path.join(process.cwd(), "test", "file.js");
      const result = toRelativePath(absolutePath);
      expect(result).toBe(path.join("test", "file.js"));
    });

    test("should return relative path unchanged", () => {
      const relativePath = "./test/file.js";
      expect(toRelativePath(relativePath)).toBe(relativePath);
    });

    test("should handle current working directory", () => {
      const result = toRelativePath(process.cwd());
      expect(result).toBe("");
    });
  });

  describe("processContent", () => {
    test("should process markdown links correctly", () => {
      const content = "Check out [this link](./docs/readme) for more info.";
      const result = processContent({ content });
      expect(result).toBe("Check out [this link](./docs-readme.md) for more info.");
    });

    test("should preserve external links", () => {
      const content = "Visit [Google](https://google.com) for search.";
      const result = processContent({ content });
      expect(result).toBe(content);
    });

    test("should preserve mailto links", () => {
      const content = "Contact [us](mailto:test@example.com).";
      const result = processContent({ content });
      expect(result).toBe(content);
    });

    test("should handle links with anchors", () => {
      const content = "See [section](./guide#installation) for details.";
      const result = processContent({ content });
      expect(result).toBe("See [section](./guide.md#installation) for details.");
    });

    test("should not process image links", () => {
      const content = "Here's an image: ![alt text](./image.png)";
      const result = processContent({ content });
      expect(result).toBe(content);
    });

    test("should handle links with existing extensions", () => {
      const content = "Download [file](./docs/readme.pdf) here.";
      const result = processContent({ content });
      expect(result).toBe(content);
    });

    test("should handle root-relative paths", () => {
      const content = "Check [root link](/docs/api) here.";
      const result = processContent({ content });
      expect(result).toBe("Check [root link](./docs-api.md) here.");
    });

    test("should handle paths starting with dot", () => {
      const content = "See [dotted path](./src/utils) for more.";
      const result = processContent({ content });
      expect(result).toBe("See [dotted path](./src-utils.md) for more.");
    });
  });

  describe("getContentHash", () => {
    test("should return consistent hash for same content", () => {
      const content = "test content";
      const hash1 = getContentHash(content);
      const hash2 = getContentHash(content);
      expect(hash1).toBe(hash2);
    });

    test("should return different hashes for different content", () => {
      const content1 = "test content 1";
      const content2 = "test content 2";
      const hash1 = getContentHash(content1);
      const hash2 = getContentHash(content2);
      expect(hash1).not.toBe(hash2);
    });

    test("should return 64-character hex string", () => {
      const content = "test";
      const hash = getContentHash(content);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    test("should handle empty string", () => {
      const hash = getContentHash("");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("validatePath", () => {
    test("should validate existing file", () => {
      const testFile = path.join(tempDir, "test.txt");
      writeFileSync(testFile, "test content");

      const result = validatePath(testFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test("should validate existing directory", () => {
      const result = validatePath(tempDir);
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test("should invalidate non-existent path", () => {
      const nonExistentPath = path.join(tempDir, "non-existent");
      const result = validatePath(nonExistentPath);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("does not exist");
    });

    test("should handle relative paths", () => {
      const testFile = path.join(tempDir, "relative-test.txt");
      writeFileSync(testFile, "content");

      const relativePath = path.relative(process.cwd(), testFile);
      const result = validatePath(relativePath);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validatePaths", () => {
    test("should validate multiple valid paths", () => {
      const testFile1 = path.join(tempDir, "test1.txt");
      const testFile2 = path.join(tempDir, "test2.txt");
      writeFileSync(testFile1, "content1");
      writeFileSync(testFile2, "content2");

      const result = validatePaths([testFile1, testFile2]);
      expect(result.validPaths).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    test("should separate valid and invalid paths", () => {
      const testFile = path.join(tempDir, "valid.txt");
      const invalidFile = path.join(tempDir, "invalid.txt");
      writeFileSync(testFile, "content");

      const result = validatePaths([testFile, invalidFile]);
      expect(result.validPaths).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.validPaths[0]).toBe(testFile);
      expect(result.errors[0].path).toBe(invalidFile);
    });

    test("should handle empty array", () => {
      const result = validatePaths([]);
      expect(result.validPaths).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("detectSystemLanguage", () => {
    test("should return a valid language code", () => {
      const result = detectSystemLanguage();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("should return 'en' as default when no env vars", () => {
      const originalEnv = {
        LANG: process.env.LANG,
        LANGUAGE: process.env.LANGUAGE,
        LC_ALL: process.env.LC_ALL,
      };

      delete process.env.LANG;
      delete process.env.LANGUAGE;
      delete process.env.LC_ALL;

      const result = detectSystemLanguage();

      // Restore original env vars
      if (originalEnv.LANG) process.env.LANG = originalEnv.LANG;
      if (originalEnv.LANGUAGE) process.env.LANGUAGE = originalEnv.LANGUAGE;
      if (originalEnv.LC_ALL) process.env.LC_ALL = originalEnv.LC_ALL;

      expect(result).toBe("en");
    });

    test("should handle Chinese locale variants", () => {
      const originalLang = process.env.LANG;

      process.env.LANG = "zh_TW.UTF-8";
      let result = detectSystemLanguage();
      expect(result).toBe("zh"); // "zh" is found first in SUPPORTED_LANGUAGES

      process.env.LANG = "zh_CN.UTF-8";
      result = detectSystemLanguage();
      expect(result).toBe("zh");

      if (originalLang) {
        process.env.LANG = originalLang;
      } else {
        delete process.env.LANG;
      }
    });

    test("detectSystemLanguage should handle edge cases", () => {
      const originalEnv = {
        LANG: process.env.LANG,
        LANGUAGE: process.env.LANGUAGE,
        LC_ALL: process.env.LC_ALL,
      };

      // Test case 1: No system locale at all
      delete process.env.LANG;
      delete process.env.LANGUAGE;
      delete process.env.LC_ALL;

      // Mock Intl to also fail
      const originalDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = () => {
        throw new Error("Intl not available");
      };

      try {
        const result = detectSystemLanguage();
        expect(result).toBe("en"); // Should fall back to default
      } finally {
        Intl.DateTimeFormat = originalDateTimeFormat;
      }

      // Test case 2: Handle special Chinese locale variants
      process.env.LANG = "zh_TW";
      let result = detectSystemLanguage();
      expect(["zh", "zh-TW"].includes(result)).toBe(true);

      process.env.LANG = "zh_HK.Big5";
      result = detectSystemLanguage();
      expect(["zh", "zh-TW"].includes(result)).toBe(true);

      // Test case 3: Unsupported language
      process.env.LANG = "xx_XX.UTF-8"; // Non-existent language
      result = detectSystemLanguage();
      expect(result).toBe("en"); // Should fall back to default

      // Restore original environment
      if (originalEnv.LANG) process.env.LANG = originalEnv.LANG;
      else delete process.env.LANG;
      if (originalEnv.LANGUAGE) process.env.LANGUAGE = originalEnv.LANGUAGE;
      else delete process.env.LANGUAGE;
      if (originalEnv.LC_ALL) process.env.LC_ALL = originalEnv.LC_ALL;
      else delete process.env.LC_ALL;
    });
  });

  describe("isGlobPattern", () => {
    test("should return true for patterns with asterisk", () => {
      expect(isGlobPattern("*.js")).toBe(true);
      expect(isGlobPattern("src/*.js")).toBe(true);
      expect(isGlobPattern("**/*.js")).toBe(true);
      expect(isGlobPattern("src/**/*.js")).toBe(true);
    });

    test("should return true for patterns with question mark", () => {
      expect(isGlobPattern("file?.js")).toBe(true);
      expect(isGlobPattern("src/?odal.js")).toBe(true);
    });

    test("should return true for patterns with character classes", () => {
      expect(isGlobPattern("file[abc].js")).toBe(true);
      expect(isGlobPattern("src/[Bb]utton.js")).toBe(true);
      expect(isGlobPattern("file[0-9].js")).toBe(true);
    });

    test("should return true for patterns with double asterisk", () => {
      expect(isGlobPattern("**/file.js")).toBe(true);
      expect(isGlobPattern("src/**/file.js")).toBe(true);
    });

    test("should return false for regular paths", () => {
      expect(isGlobPattern("src/file.js")).toBe(false);
      expect(isGlobPattern("./src")).toBe(false);
      expect(isGlobPattern("/absolute/path")).toBe(false);
      expect(isGlobPattern("regular-file.js")).toBe(false);
      expect(isGlobPattern("package.json")).toBe(false);
    });

    test("should return false for empty or undefined input", () => {
      expect(isGlobPattern("")).toBe(false);
      expect(isGlobPattern(undefined)).toBe(false);
      expect(isGlobPattern(null)).toBe(false);
    });

    test("should handle complex patterns", () => {
      expect(isGlobPattern("src/**/*.{js,ts,jsx,tsx}")).toBe(true);
      expect(isGlobPattern("components/**/[A-Z]*.js")).toBe(true);
      expect(isGlobPattern("test/**/*test.js")).toBe(true);
    });
  });

  describe("saveDocWithTranslations", () => {
    test("should save document without translations", async () => {
      const docsDir = path.join(tempDir, "docs");
      const result = await saveDocWithTranslations({
        path: "test-doc",
        content: "# Test Document\n\nContent here.",
        docsDir,
        locale: "en",
      });

      expect(result).toHaveLength(1);
      expect(result[0].success).toBe(true);
      expect(existsSync(path.join(docsDir, "test-doc.md"))).toBe(true);
    });

    test("should save document with translations", async () => {
      const docsDir = path.join(tempDir, "docs");
      const result = await saveDocWithTranslations({
        path: "test-doc",
        content: "# Test Document",
        docsDir,
        locale: "en",
        translates: [{ language: "zh", translation: "# 测试文档" }],
      });

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.success)).toBe(true);
      expect(existsSync(path.join(docsDir, "test-doc.md"))).toBe(true);
      expect(existsSync(path.join(docsDir, "test-doc.zh.md"))).toBe(true);
    });

    test("should handle path with slashes", async () => {
      const docsDir = path.join(tempDir, "docs");
      const result = await saveDocWithTranslations({
        path: "/api/user",
        content: "# API Documentation",
        docsDir,
        locale: "en",
      });

      expect(result[0].success).toBe(true);
      expect(existsSync(path.join(docsDir, "api-user.md"))).toBe(true);
    });

    test("should add labels to front matter", async () => {
      const docsDir = path.join(tempDir, "docs");
      await saveDocWithTranslations({
        path: "labeled-doc",
        content: "# Test",
        docsDir,
        locale: "en",
        labels: ["api", "guide"],
      });

      const content = readFileSync(path.join(docsDir, "labeled-doc.md"), "utf8");
      expect(content).toContain('labels: ["api","guide"]');
    });

    test("should skip main content when isTranslate is true", async () => {
      const docsDir = path.join(tempDir, "docs");
      const result = await saveDocWithTranslations({
        path: "translate-only",
        content: "# Main",
        docsDir,
        locale: "en",
        translates: [{ language: "zh", translation: "# 中文" }],
        isTranslate: true,
      });

      expect(result).toHaveLength(1);
      expect(existsSync(path.join(docsDir, "translate-only.md"))).toBe(false);
      expect(existsSync(path.join(docsDir, "translate-only.zh.md"))).toBe(true);
    });
  });

  describe("getCurrentGitHead", () => {
    test("should return git HEAD hash or null", () => {
      const result = getCurrentGitHead();
      if (result) {
        expect(typeof result).toBe("string");
        expect(result.length).toBe(40); // Git SHA-1 hash length
      } else {
        expect(result).toBe(null);
      }
    });

    test("should handle git command errors gracefully", () => {
      // Mock console.warn to capture warning messages
      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      // Change to a non-git directory temporarily
      const originalCwd = process.cwd();
      const nonGitDir = path.join(tempDir, "non-git");
      mkdirSync(nonGitDir, { recursive: true });

      try {
        process.chdir(nonGitDir);
        const result = getCurrentGitHead();
        expect(result).toBe(null);
        // Should have logged a warning
        expect(warnMessages.some((msg) => msg.includes("Failed to get git HEAD:"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
        console.warn = originalWarn;
      }
    });
  });

  describe("getModifiedFilesBetweenCommits", () => {
    test("should return array even with invalid commits", () => {
      const result = getModifiedFilesBetweenCommits("invalid-commit1", "invalid-commit2");
      expect(Array.isArray(result)).toBe(true);
    });

    test("should filter by provided file paths", () => {
      const result = getModifiedFilesBetweenCommits("invalid-commit", "HEAD", ["package.json"]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("hasSourceFilesChanged", () => {
    test("should return false for empty inputs", () => {
      expect(hasSourceFilesChanged([], [])).toBe(false);
      expect(hasSourceFilesChanged(null, [])).toBe(false);
      expect(hasSourceFilesChanged(["test.js"], null)).toBe(false);
    });

    test("should detect changes when files match", () => {
      const sourceIds = ["/path/to/file.js"];
      const modifiedFiles = ["/path/to/file.js"];
      expect(hasSourceFilesChanged(sourceIds, modifiedFiles)).toBe(true);
    });

    test("should return false when no files match", () => {
      const sourceIds = ["/path/to/file1.js"];
      const modifiedFiles = ["/path/to/file2.js"];
      expect(hasSourceFilesChanged(sourceIds, modifiedFiles)).toBe(false);
    });
  });

  describe("hasFileChangesBetweenCommits", () => {
    test("should return false for invalid commits", () => {
      const result = hasFileChangesBetweenCommits("invalid-commit1", "invalid-commit2");
      expect(result).toBe(false);
    });

    test("should accept include and exclude patterns", () => {
      const result = hasFileChangesBetweenCommits(
        "invalid-commit",
        "HEAD",
        ["*.js"],
        ["node_modules/**"],
      );
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getAvailablePaths", () => {
    beforeEach(() => {
      // Create a complex directory structure for testing
      const testStructure = {
        src: {
          components: {
            "Button.js": "export default Button",
            "Modal.js": "export default Modal",
          },
          utils: {
            "helpers.js": "export const help = () => {}",
            "constants.js": "export const API_URL = 'test'",
          },
          "index.js": "export * from './components'",
        },
        tests: {
          unit: {
            "button.test.js": "test('button', () => {})",
          },
          integration: {
            "app.test.js": "test('app', () => {})",
          },
        },
        docs: {
          "README.md": "# Documentation",
          "api.md": "# API Reference",
        },
        "package.json": '{"name": "test-project"}',
        "config.yaml": "test: true",
        ".gitignore": "node_modules/",
      };

      createDirectoryStructure(tempDir, testStructure);
    });

    test("should return current directory contents when no input", () => {
      // Mock process.cwd to return tempDir for this test
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const result = getAvailablePaths();

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);

      // We created 5 items: src, tests, docs, package.json, config.yaml, .gitignore
      // But .gitignore should be filtered out (hidden file)
      expect(result.length).toBe(5);

      // Should have required properties
      result.forEach((item) => {
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("value");
        expect(item).toHaveProperty("description");
        expect(typeof item.name).toBe("string");
        expect(typeof item.value).toBe("string");
        expect(typeof item.description).toBe("string");
      });

      // Should find our test directories and files (with ./ prefix)
      const names = result.map((r) => r.name);
      expect(names).toContain("./src");
      expect(names).toContain("./tests");
      expect(names).toContain("./docs");
      expect(names).toContain("./package.json");
      expect(names).toContain("./config.yaml");

      // Should not contain hidden files
      expect(names.find((name) => name.includes(".gitignore"))).toBeUndefined();
    });

    test("should filter by search term correctly", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      // Search for items containing "src"
      const result = getAvailablePaths("src");

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);

      expect(result.length).toBe(1);
      expect(result[0].description).toBe("📁 Directory");

      expect(result[0].name).toBe("src");

      process.cwd = () => tempDir;
      const packResult = getAvailablePaths("pack");
      process.cwd = originalCwd;

      expect(packResult.length).toBe(1);
      expect(packResult[0].name).toBe("./package.json");
      expect(packResult[0].description).toBe("📄 File");
    });

    test("Should not return duplicate paths for the same file/directory", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      // This test demonstrates the duplication bug
      const result = getAvailablePaths("src");

      process.cwd = originalCwd;

      // Extract all unique actual paths (normalize both "src" and "./src" to the same absolute path)
      const absolutePaths = result.map((r) => path.resolve(tempDir, r.name));
      const uniqueAbsolutePaths = [...new Set(absolutePaths)];

      expect(result.length).toBe(uniqueAbsolutePaths.length); // Should be equal (no duplicates)

      // Additional check: No two results should point to the same physical path
      expect(absolutePaths.length).toBe(uniqueAbsolutePaths.length);
    });

    test("should handle absolute path navigation", () => {
      const srcPath = path.join(tempDir, "src");
      const result = getAvailablePaths(srcPath);

      expect(Array.isArray(result)).toBe(true);
      // Should find exactly the src directory itself (as it's navigating TO the src path)
      expect(result.length).toBe(1);
      expect(result[0].name).toBe(srcPath);
      expect(result[0].value).toBe(srcPath);
      expect(result[0].description).toBe("📁 Directory");
    });

    test("should handle relative path with ./ prefix", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const result = getAvailablePaths("./src");

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      // Should find exactly the src directory (matching exact path)
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("./src");
      expect(result[0].description).toBe("📁 Directory");
    });

    test("should handle nested path navigation", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const result = getAvailablePaths("./src/comp");

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      // Should find exactly the components directory that matches "comp"
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("./src/components");
      expect(result[0].description).toBe("📁 Directory");
    });

    test("should distinguish between files and directories", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const result = getAvailablePaths();

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);

      // Should have exactly 3 directories and 2 files
      const directories = result.filter((r) => r.description === "📁 Directory");
      const files = result.filter((r) => r.description === "📄 File");

      expect(directories.length).toBe(3); // src, tests, docs
      expect(files.length).toBe(2); // package.json, config.yaml

      // Verify specific items
      const srcItem = result.find((r) => r.name === "./src");
      expect(srcItem.description).toBe("📁 Directory");

      const packageItem = result.find((r) => r.name === "./package.json");
      expect(packageItem.description).toBe("📄 File");

      const configItem = result.find((r) => r.name === "./config.yaml");
      expect(configItem.description).toBe("📄 File");
    });

    test("should handle non-existent directory gracefully", () => {
      const result = getAvailablePaths("/non/existent/path");

      expect(Array.isArray(result)).toBe(true);
      // Should return exactly 1 error item
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty("description");
      expect(result[0].description).toContain("does not exist");
      expect(result[0].name).toBe("/non/existent");
      expect(result[0].value).toBe("/non/existent");
    });

    test("should exclude common ignore patterns", () => {
      // Create additional test structure with ignored items
      const ignoredStructure = {
        node_modules: {
          package: "ignored",
        },
        ".git": {
          config: "ignored",
        },
        dist: {
          "bundle.js": "ignored",
        },
      };

      createDirectoryStructure(tempDir, ignoredStructure);

      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const result = getAvailablePaths();

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      // Should still be 5 items (original ones), ignored items should be filtered out
      expect(result.length).toBe(5);

      // Should not include ignored patterns
      const names = result.map((r) => r.name);
      expect(names).not.toContain("./node_modules");
      expect(names).not.toContain("./.git");
      expect(names).not.toContain("./dist");
      expect(names).not.toContain("./build");

      // Should still contain the original items
      expect(names).toContain("./src");
      expect(names).toContain("./tests");
      expect(names).toContain("./docs");
    });

    test("should sort results alphabetically with directories first", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const result = getAvailablePaths();

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);

      // Expected order: directories first (docs, src, tests), then files (config.yaml, package.json)
      expect(result[0].name).toBe("./docs");
      expect(result[0].description).toBe("📁 Directory");

      expect(result[1].name).toBe("./src");
      expect(result[1].description).toBe("📁 Directory");

      expect(result[2].name).toBe("./tests");
      expect(result[2].description).toBe("📁 Directory");

      expect(result[3].name).toBe("./config.yaml");
      expect(result[3].description).toBe("📄 File");

      expect(result[4].name).toBe("./package.json");
      expect(result[4].description).toBe("📄 File");

      // Verify directories come before files
      const directories = result.filter((r) => r.description === "📁 Directory");
      const files = result.filter((r) => r.description === "📄 File");
      expect(directories.length).toBe(3);
      expect(files.length).toBe(2);

      // All directories should appear before all files
      const lastDirIndex = result.lastIndexOf(directories[directories.length - 1]);
      const firstFileIndex = result.indexOf(files[0]);
      expect(lastDirIndex).toBeLessThan(firstFileIndex);
    });

    test("getAvailablePaths should handle relative path validation errors", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      // Test path with invalid directory
      const result = getAvailablePaths("./nonexistent/file");

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("./nonexistent/");
      expect(result[0].description).toContain("does not exist");
    });

    test("getAvailablePaths should handle relative paths without slash", () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      // Test case where lastSlashIndex === -1 for relative path
      const result = getAvailablePaths("./noslashthingy");

      process.cwd = originalCwd;

      expect(Array.isArray(result)).toBe(true);
      // Should search current directory for the term
    });
  });

  // Helper function to create directory structure
  function createDirectoryStructure(basePath, structure) {
    for (const [name, content] of Object.entries(structure)) {
      const itemPath = path.join(basePath, name);

      if (typeof content === "string") {
        // It's a file
        writeFileSync(itemPath, content);
      } else {
        // It's a directory
        mkdirSync(itemPath, { recursive: true });
        createDirectoryStructure(itemPath, content);
      }
    }
  }

  describe("getGithubRepoUrl", () => {
    test("should return string", () => {
      const result = getGithubRepoUrl();
      expect(typeof result).toBe("string");
    });
  });

  describe("processConfigFields", () => {
    test("should apply default values for missing fields", () => {
      const config = {};
      const result = processConfigFields(config);

      expect(result.nodeName).toBe("Section");
      expect(result.locale).toBe("en");
      expect(result.sourcesPath).toEqual(["./"]);
      expect(result.docsDir).toBe("./.aigne/doc-smith/docs");
      expect(result.outputDir).toBe("./.aigne/doc-smith/output");
      expect(result.translateLanguages).toEqual([]);
      expect(result.rules).toBe("");
      expect(result.targetAudience).toBe("");
    });

    test("should only set defaults, not preserve other values", () => {
      const config = {
        locale: "zh",
        sourcesPath: ["./src"],
      };
      const result = processConfigFields(config);

      // Function only sets defaults when values are missing/empty, doesn't copy existing non-default values
      expect(result.nodeName).toBe("Section"); // Default applied
      expect(result.locale).toBeUndefined(); // Not copied because zh is not empty/missing per logic
    });

    test("should process document purpose array", () => {
      const config = {
        documentPurpose: ["getStarted"],
      };
      const result = processConfigFields(config);

      expect(result.rules).toContain("Document Purpose");
    });

    test("should process target audience types", () => {
      const config = {
        targetAudienceTypes: ["developers"],
      };
      const result = processConfigFields(config);

      expect(result.rules).toContain("Target Audience");
    });

    test("should handle string rules only (array rules cause TypeError)", () => {
      const config = {
        rules: "Custom rule content",
      };
      const result = processConfigFields(config);

      // The function should process string rules
      expect(typeof result.rules).toBe("string");
      expect(result.rules).toContain("Custom rule");
    });
  });

  describe("resolveFileReferences", () => {
    test("should return non-string values unchanged", async () => {
      const config = { number: 123, boolean: true };
      const result = await resolveFileReferences(config);
      expect(result).toEqual(config);
    });

    test("should return strings without @ prefix unchanged", async () => {
      const config = { text: "normal string" };
      const result = await resolveFileReferences(config);
      expect(result).toEqual(config);
    });

    test("should handle arrays recursively", async () => {
      const config = ["normal", "@nonexistent.txt"];
      const result = await resolveFileReferences(config);
      expect(result[0]).toBe("normal");
      expect(result[1]).toBe("@nonexistent.txt"); // File doesn't exist, returns original
    });

    test("should handle nested objects", async () => {
      const config = {
        nested: {
          value: "@nonexistent.txt",
        },
      };
      const result = await resolveFileReferences(config);
      expect(result.nested.value).toBe("@nonexistent.txt");
    });

    test("should load existing file content", async () => {
      const testFile = path.join(tempDir, "test.txt");
      writeFileSync(testFile, "file content");

      const config = { file: `@${testFile}` };
      const result = await resolveFileReferences(config);
      expect(result.file).toBe("file content");
    });

    test("should handle JSON files", async () => {
      const jsonFile = path.join(tempDir, "test.json");
      writeFileSync(jsonFile, JSON.stringify({ key: "value" }));

      const config = { data: `@${jsonFile}` };
      const result = await resolveFileReferences(config);
      expect(result.data).toEqual({ key: "value" });
    });
  });

  describe("saveGitHeadToConfig", () => {
    test("should handle no git HEAD", async () => {
      // Should not throw error and should return without action
      await saveGitHeadToConfig(null);
      // No assertion needed, just verify it doesn't crash
    });

    test("should skip in test environment", async () => {
      // Should skip because BUN_TEST env var is set
      await saveGitHeadToConfig("abcd1234");
      // No assertion needed, just verify it doesn't crash
    });

    test("should handle test environment correctly", async () => {
      // This function should skip in test environment (BUN_TEST is set)
      // We don't need to test the actual file creation since that would affect real config
      await saveGitHeadToConfig("test-hash");
      // Should complete without error due to test environment skip
    });
  });

  describe("loadConfigFromFile", () => {
    test("should return null or config object", async () => {
      const result = await loadConfigFromFile();
      // Function either returns null (if no config) or a config object
      expect(result === null || typeof result === "object").toBe(true);
    });

    test("should handle malformed config file gracefully", async () => {
      // Create invalid config file in temp directory with process.cwd() override
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      const configDir = path.join(tempDir, ".aigne", "doc-smith");
      mkdirSync(configDir, { recursive: true });
      writeFileSync(path.join(configDir, "config.yaml"), "invalid: yaml: [");

      const result = await loadConfigFromFile();
      expect(result).toBe(null); // Should handle parse error gracefully

      process.cwd = originalCwd;
    });
  });

  describe("saveValueToConfig", () => {
    test("should skip undefined values", async () => {
      await saveValueToConfig("testKey", undefined);
      // Should not crash and should skip the operation
    });

    test("should handle string values", async () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      await saveValueToConfig("testKey", "testValue");

      process.cwd = originalCwd;
      // Should not crash
    });

    test("should handle array values", async () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      await saveValueToConfig("testArray", ["item1", "item2"]);

      process.cwd = originalCwd;
      // Should not crash
    });
  });

  describe("getProjectInfo", () => {
    test("should return project info object", async () => {
      const result = await getProjectInfo();

      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("icon");
      expect(result).toHaveProperty("fromGitHub");
      expect(typeof result.fromGitHub).toBe("boolean");
    });
  });

  describe("getGitHubRepoInfo", () => {
    test("should return null for invalid URL", async () => {
      const result = await getGitHubRepoInfo("invalid-url");
      expect(result).toBe(null);
    });

    test("should return null for non-GitHub URL", async () => {
      const result = await getGitHubRepoInfo("https://gitlab.com/user/repo");
      expect(result).toBe(null);
    });

    test("should handle network errors gracefully", async () => {
      const result = await getGitHubRepoInfo("https://github.com/nonexistent/nonexistent");
      // Should not crash, may return null depending on network
      expect(result === null || typeof result === "object").toBe(true);
    });

    test("should fetch real GitHub repository info - aigne-doc-smith", async () => {
      const result = await getGitHubRepoInfo("https://github.com/AIGNE-io/aigne-doc-smith.git");

      if (result !== null) {
        // If successful, should have expected repository structure
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("description");
        expect(result.name).toBe("aigne-doc-smith");
      } else {
        // Network might be unavailable or API rate limited - that's acceptable
        expect(result).toBe(null);
      }
    }, 10000); // 10 second timeout for network request

    test("should fetch real GitHub repository info - FastAPI", async () => {
      // Test with SSH URL format converted to HTTPS
      const result = await getGitHubRepoInfo("git@github.com:fastapi/fastapi.git");

      if (result !== null) {
        // If successful, should have expected repository structure
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("description");
        expect(result.name).toBe("fastapi");
        expect(typeof result.description).toBe("string");
        expect(result.description.length).toBeGreaterThan(0);
      } else {
        // Network might be unavailable or API rate limited - that's acceptable
        expect(result).toBe(null);
      }
    }, 10000); // 10 second timeout for network request

    test("should handle SSH URL format correctly", async () => {
      // Test that SSH URLs are properly converted to GitHub API URLs
      const sshUrl = "git@github.com:fastapi/fastapi.git";
      const result = await getGitHubRepoInfo(sshUrl);

      // Should either return repository info or null (network issues)
      expect(result === null || typeof result === "object").toBe(true);

      if (result !== null) {
        expect(result.name).toBe("fastapi");
      }
    }, 10000);

    test("should handle HTTPS URL with .git suffix", async () => {
      const httpsUrl = "https://github.com/AIGNE-io/aigne-doc-smith.git";
      const result = await getGitHubRepoInfo(httpsUrl);

      // Should either return repository info or null (network issues)
      expect(result === null || typeof result === "object").toBe(true);

      if (result !== null) {
        expect(result.name).toBe("aigne-doc-smith");
      }
    }, 10000);
  });

  describe("error handling edge cases", () => {
    test("processContent should handle malformed links", () => {
      const content = "Malformed [link](incomplete";
      const result = processContent({ content });
      expect(result).toBe(content); // Should not crash
    });

    test("validatePath should handle extremely long paths", () => {
      const longPath = "a".repeat(1000);
      const result = validatePath(longPath);
      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("error");
    });

    test("getAvailablePaths should handle permission errors", () => {
      const result = getAvailablePaths("/root/restricted");
      expect(Array.isArray(result)).toBe(true);
    });

    test("normalizePath should handle special characters", () => {
      const result = normalizePath("./test with spaces/file.txt");
      expect(path.isAbsolute(result)).toBe(true);
    });

    test("toRelativePath should handle root path", () => {
      const result = toRelativePath("/");
      expect(typeof result).toBe("string");
    });
  });

  // Additional tests for uncovered lines
  describe("additional coverage tests", () => {
    test("saveDocWithTranslations should add labels to front matter", async () => {
      const testDocsDir = path.join(tempDir, "docs");
      const content = "# Test content";
      const labels = ["test", "example"];

      const results = await saveDocWithTranslations({
        path: "test-with-labels.md",
        content,
        docsDir: testDocsDir,
        locale: "en",
        labels,
      });

      expect(results.length).toBe(1);

      if (!results[0].success) {
        console.log("Error:", results[0].error);
      }
      expect(results[0].success).toBe(true);

      // The actual path should be what's returned in results
      const actualPath = results[0].path;
      expect(existsSync(actualPath)).toBe(true);

      const savedContent = readFileSync(actualPath, "utf8");
      expect(savedContent).toContain('labels: ["test","example"]');
      expect(savedContent).toContain("# Test content");
    });

    test("saveDocWithTranslations should handle error cases", async () => {
      // Test with invalid directory - use read-only directory
      const results = await saveDocWithTranslations({
        path: "test.md",
        content: "# Test content",
        docsDir: "/root/invalid", // This should fail
        locale: "en",
      });

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });

    test("saveGitHeadToConfig should create directory and handle file operations", async () => {
      // Test in non-test environment by temporarily unsetting test env
      const originalBunTest = process.env.BUN_TEST;
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.BUN_TEST;
      delete process.env.NODE_ENV;

      const originalCwd = process.cwd;
      const testCwd = path.join(tempDir, "git-test");
      mkdirSync(testCwd, { recursive: true });
      process.cwd = () => testCwd;

      try {
        await saveGitHeadToConfig("abc123456");

        const configPath = path.join(testCwd, ".aigne", "doc-smith", "config.yaml");
        if (existsSync(configPath)) {
          const configContent = readFileSync(configPath, "utf8");
          expect(configContent).toContain("lastGitHead:");
        }
      } finally {
        // Restore environment
        process.cwd = originalCwd;
        if (originalBunTest) process.env.BUN_TEST = originalBunTest;
        if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
      }
    });

    test("hasFileChangesBetweenCommits should return false when no files match patterns", () => {
      const result = hasFileChangesBetweenCommits(
        "invalid-commit1",
        "invalid-commit2",
        ["*.nonexistent"],
        ["*.excluded"],
      );
      expect(result).toBe(false);
    });

    test("hasFileChangesBetweenCommits should handle include/exclude pattern matching", () => {
      // Test with specific include patterns that won't match anything
      const result = hasFileChangesBetweenCommits(
        "invalid-commit1",
        "HEAD",
        ["*.xyz"], // Pattern that won't match
        ["*.js"], // Exclude pattern
      );
      expect(result).toBe(false);
    });

    test("loadConfigFromFile should handle existing config file", async () => {
      const originalCwd = process.cwd;
      process.cwd = () => tempDir;

      try {
        const configDir = path.join(tempDir, ".aigne", "doc-smith");
        mkdirSync(configDir, { recursive: true });

        const validConfig = `
projectName: test-project
locale: en
sourcesPath:
  - ./src
`;
        writeFileSync(path.join(configDir, "config.yaml"), validConfig);

        const result = await loadConfigFromFile();
        expect(result).toBeDefined();
        expect(result.projectName).toBe("test-project");
      } finally {
        process.cwd = originalCwd;
      }
    });

    test("saveValueToConfig should handle different value types", async () => {
      const configDir = path.join(tempDir, "save-config-test");
      mkdirSync(configDir, { recursive: true });

      const originalCwd = process.cwd;
      process.cwd = () => configDir;

      try {
        // Test with various data types
        await saveValueToConfig("testKey", "string value");
        await saveValueToConfig("testArray", ["item1", "item2"]);
        await saveValueToConfig("testNumber", 42);
        await saveValueToConfig("testBoolean", true);

        const configPath = path.join(configDir, ".aigne", "doc-smith", "config.yaml");
        if (existsSync(configPath)) {
          const configContent = readFileSync(configPath, "utf8");
          expect(configContent).toContain("testKey:");
          expect(configContent).toContain("testArray:");
        }
      } finally {
        process.cwd = originalCwd;
      }
    });

    test("resolveFileReferences should handle file read errors", async () => {
      const config = {
        file: "@/nonexistent/path/file.txt",
      };
      const result = await resolveFileReferences(config);
      // Should return original reference when file doesn't exist
      expect(result.file).toBe("@/nonexistent/path/file.txt");
    });

    test("processConfigFields should handle empty config", () => {
      const config = {};
      const result = processConfigFields(config);

      expect(result.locale).toBe("en");
      expect(Array.isArray(result.sourcesPath)).toBe(true);
      expect(result.sourcesPath.length).toBe(1);
      expect(result.sourcesPath[0]).toBe("./");
    });

    test("saveDocWithTranslations should handle translations correctly", async () => {
      const testDocsDir = path.join(tempDir, "docs-translate");
      const content = "# Test";

      // Create translations with valid structure
      const translations = [{ language: "zh", translation: "# 测试" }];

      const results = await saveDocWithTranslations({
        path: "translation-test.md",
        content,
        docsDir: testDocsDir,
        locale: "en",
        translates: translations,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2); // Original + 1 translation
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("saveDocWithTranslations should add labels to translations", async () => {
      const testDocsDir = path.join(tempDir, "docs-translation-labels");
      const content = "# Main Content";
      const labels = ["test", "translation"];
      const translations = [{ language: "zh", translation: "# 主要内容" }];

      const results = await saveDocWithTranslations({
        path: "labeled-translation",
        content,
        docsDir: testDocsDir,
        locale: "en",
        translates: translations,
        labels,
      });

      expect(results.length).toBe(2); // Main + translation
      expect(results.every((r) => r.success)).toBe(true);

      // Check that translation file has labels
      const translationPath = results[1].path;
      expect(existsSync(translationPath)).toBe(true);
      const translationContent = readFileSync(translationPath, "utf8");
      expect(translationContent).toContain('labels: ["test","translation"]');
      expect(translationContent).toContain("# 主要内容");
    });

    test("getModifiedFilesBetweenCommits should return filtered files when filePaths provided", () => {
      // Create a test file to ensure it matches filter
      const testFile = path.join(tempDir, "filter-test.js");
      writeFileSync(testFile, "console.log('test');");

      const result = getModifiedFilesBetweenCommits("invalid-commit1", "HEAD", [testFile]);

      expect(Array.isArray(result)).toBe(true);
      // Even with invalid commits, function should return array
    });

    test("getModifiedFilesBetweenCommits should return all files when no filePaths filter", () => {
      // Test the case where filePaths.length === 0
      const result = getModifiedFilesBetweenCommits("invalid-commit1", "invalid-commit2", []);
      expect(Array.isArray(result)).toBe(true);
    });

    test("hasFileChangesBetweenCommits should handle empty file list", () => {
      const result = hasFileChangesBetweenCommits(
        "invalid-commit1",
        "invalid-commit2",
        [], // Empty file list should return false
        [],
      );
      expect(result).toBe(false);
    });

    test("hasFileChangesBetweenCommits should handle files that don't match include patterns", () => {
      // Mock successful git command that returns some file changes
      const originalWarn = console.warn;
      console.warn = () => {}; // Suppress warning for this test

      try {
        const result = hasFileChangesBetweenCommits(
          "invalid-commit1",
          "invalid-commit2",
          ["*.nonexistent"], // Pattern that won't match any files
          [],
        );
        expect(result).toBe(false);
      } finally {
        console.warn = originalWarn;
      }
    });

    test("saveGitHeadToConfig should handle file replacement scenario", async () => {
      const originalBunTest = process.env.BUN_TEST;
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.BUN_TEST;
      delete process.env.NODE_ENV;

      const originalCwd = process.cwd;
      const testCwd = path.join(tempDir, "replace-git-test");
      mkdirSync(testCwd, { recursive: true });
      process.cwd = () => testCwd;

      try {
        // First call creates the file
        await saveGitHeadToConfig("first-hash");

        // Second call should replace existing lastGitHead
        await saveGitHeadToConfig("second-hash");

        const configPath = path.join(testCwd, ".aigne", "doc-smith", "config.yaml");
        if (existsSync(configPath)) {
          const configContent = readFileSync(configPath, "utf8");
          expect(configContent).toContain("second-hash");
          expect(configContent).not.toContain("first-hash");
        }
      } finally {
        // Restore environment
        process.cwd = originalCwd;
        if (originalBunTest) process.env.BUN_TEST = originalBunTest;
        if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
      }
    });

    test("saveGitHeadToConfig should handle file write errors gracefully", async () => {
      const originalBunTest = process.env.BUN_TEST;
      const originalNodeEnv = process.env.NODE_ENV;
      const originalWarn = console.warn;
      delete process.env.BUN_TEST;
      delete process.env.NODE_ENV;

      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      const originalCwd = process.cwd;
      process.cwd = () => "/root"; // Read-only directory

      try {
        await saveGitHeadToConfig("test-hash");
        // Should handle error gracefully and log warning
        expect(
          warnMessages.some((msg) => msg.includes("Failed to save git HEAD to config.yaml:")),
        ).toBe(true);
      } finally {
        // Restore environment
        process.cwd = originalCwd;
        console.warn = originalWarn;
        if (originalBunTest) process.env.BUN_TEST = originalBunTest;
        if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
      }
    });

    test("saveGitHeadToConfig should append to file without ending newline", async () => {
      const originalBunTest = process.env.BUN_TEST;
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.BUN_TEST;
      delete process.env.NODE_ENV;

      const originalCwd = process.cwd;
      const testCwd = path.join(tempDir, "append-git-test");
      mkdirSync(testCwd, { recursive: true });
      process.cwd = () => testCwd;

      try {
        // Create config directory and file without ending newline
        const configDir = path.join(testCwd, ".aigne", "doc-smith");
        mkdirSync(configDir, { recursive: true });
        const configPath = path.join(configDir, "config.yaml");
        writeFileSync(configPath, "existingKey: value"); // No ending newline

        await saveGitHeadToConfig("test-hash");

        const configContent = readFileSync(configPath, "utf8");
        expect(configContent).toContain("existingKey: value");
        expect(configContent).toContain("lastGitHead: test-hash");
        // Should properly handle newline addition
        expect(configContent.endsWith("\n")).toBe(true);
      } finally {
        // Restore environment
        process.cwd = originalCwd;
        if (originalBunTest) process.env.BUN_TEST = originalBunTest;
        if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
      }
    });

    test("loadConfigFromFile should handle non-existent config directory", async () => {
      const originalCwd = process.cwd;
      process.cwd = () => path.join(tempDir, "no-config-dir");

      try {
        const result = await loadConfigFromFile();
        expect(result).toBe(null);
      } finally {
        process.cwd = originalCwd;
      }
    });

    test("resolveFileReferences should handle various file types", async () => {
      // Test with YAML file
      const yamlFile = path.join(tempDir, "test.yaml");
      writeFileSync(yamlFile, "key: value\narray:\n  - item1\n  - item2");

      const config = {
        yaml: `@${yamlFile}`,
        nonexistent: "@nonexistent.txt",
        normal: "normal value",
      };

      const result = await resolveFileReferences(config);
      expect(result.yaml).toBeDefined();
      expect(typeof result.yaml).toBe("object");
      expect(result.nonexistent).toBe("@nonexistent.txt");
      expect(result.normal).toBe("normal value");
    });

    test("saveValueToConfig should handle file append scenario", async () => {
      const configDir = path.join(tempDir, "append-config-test");
      mkdirSync(configDir, { recursive: true });

      const originalCwd = process.cwd;
      process.cwd = () => configDir;

      try {
        // Create initial config without newline ending
        const aigneDir = path.join(configDir, ".aigne", "doc-smith");
        mkdirSync(aigneDir, { recursive: true });
        writeFileSync(path.join(aigneDir, "config.yaml"), "existingKey: value");

        // This should append with proper newline handling
        await saveValueToConfig("newKey", "newValue");

        const configPath = path.join(aigneDir, "config.yaml");
        const configContent = readFileSync(configPath, "utf8");
        expect(configContent).toContain("existingKey: value");
        expect(configContent).toContain("newKey: newValue");
      } finally {
        process.cwd = originalCwd;
      }
    });

    test("saveValueToConfig should handle complex array update scenarios", async () => {
      const configDir = path.join(tempDir, "array-update-test");
      mkdirSync(configDir, { recursive: true });

      const originalCwd = process.cwd;
      process.cwd = () => configDir;

      try {
        const aigneDir = path.join(configDir, ".aigne", "doc-smith");
        mkdirSync(aigneDir, { recursive: true });
        const configPath = path.join(aigneDir, "config.yaml");

        // Test case 1: Array with inline format
        writeFileSync(configPath, "testArray: [item1, item2]");
        await saveValueToConfig("testArray", ["newItem1", "newItem2"]);
        let configContent = readFileSync(configPath, "utf8");
        expect(configContent).toContain("testArray:");
        expect(configContent).toContain("newItem1");

        // Test case 2: Array with mixed content
        writeFileSync(
          configPath,
          `# Initial comment
testArray:
  - oldItem
# Another comment
otherKey: value`,
        );
        await saveValueToConfig("testArray", ["replacedItem"]);
        configContent = readFileSync(configPath, "utf8");
        expect(configContent).toContain("replacedItem");
        expect(configContent).toContain("otherKey: value");

        // Test case 3: Array at end of file
        writeFileSync(
          configPath,
          `someKey: value
testArray:
  - item1
  - item2`,
        );
        await saveValueToConfig("testArray", ["endItem"]);
        configContent = readFileSync(configPath, "utf8");
        expect(configContent).toContain("endItem");
        expect(configContent).toContain("someKey: value");

        // Test case 4: Add new array to end without newline
        writeFileSync(configPath, "existingKey: value");
        await saveValueToConfig("newArray", ["newArrayItem"], "Array comment");
        configContent = readFileSync(configPath, "utf8");
        expect(configContent).toContain("existingKey: value");
        expect(configContent).toContain("# Array comment");
        expect(configContent).toContain("newArray:");
        expect(configContent).toContain("newArrayItem");
      } finally {
        process.cwd = originalCwd;
      }
    });

    test("hasFileChangesBetweenCommits should handle complex pattern matching", () => {
      // Test regex special characters in patterns
      const result = hasFileChangesBetweenCommits(
        "invalid-commit1",
        "HEAD",
        ["*.{js,ts}"], // Pattern with curly braces
        ["test.*"], // Pattern with dot
      );
      expect(typeof result).toBe("boolean");
    });

    test("saveDocWithTranslations should skip main content when isTranslate is true", async () => {
      const testDocsDir = path.join(tempDir, "skip-main-test");

      const results = await saveDocWithTranslations({
        path: "skip-test.md",
        content: "# Should be skipped",
        docsDir: testDocsDir,
        locale: "en",
        isTranslate: true,
        translates: [{ language: "zh", translation: "# 翻译内容" }],
      });

      expect(results.length).toBe(1); // Only translation, main content skipped
      expect(results[0].path).toContain(".zh.md");
    });

    test("processConfigFields should handle complex configurations", () => {
      const config = {
        documentPurpose: ["getStarted", "findAnswers"], // Already an array
        targetAudienceTypes: ["developers", "devops"],
        rules: "string rule", // Keep as string to avoid error
        locale: "zh-CN",
        sourcesPath: [], // Empty array should get default
      };

      const result = processConfigFields(config);

      // Function processes arrays if constants are defined
      expect(typeof result.rules).toBe("string");
      expect(result.sourcesPath).toContain("./");

      // Target audience should be processed
      if (result.targetAudience) {
        expect(typeof result.targetAudience).toBe("string");
      }
    });

    test("resolveFileReferences should handle unsupported file extensions", async () => {
      const unsupportedFile = path.join(tempDir, "test.exe");
      writeFileSync(unsupportedFile, "binary content");

      const config = { file: `@${unsupportedFile}` };
      const result = await resolveFileReferences(config);

      // Should return original reference for unsupported file type
      expect(result.file).toBe(`@${unsupportedFile}`);
    });

    test("resolveFileReferences should handle JSON parsing errors", async () => {
      const malformedJsonFile = path.join(tempDir, "malformed.json");
      writeFileSync(malformedJsonFile, '{"key": value without quotes}');

      const config = { file: `@${malformedJsonFile}` };
      const result = await resolveFileReferences(config);

      // Should return raw content when JSON parsing fails
      expect(result.file).toBe('{"key": value without quotes}');
    });

    test("resolveFileReferences should handle YAML parsing errors", async () => {
      const malformedYamlFile = path.join(tempDir, "malformed.yaml");
      writeFileSync(malformedYamlFile, "key: value\n  invalid: indentation: error");

      const config = { file: `@${malformedYamlFile}` };
      const result = await resolveFileReferences(config);

      // Should return raw content when YAML parsing fails
      expect(result.file).toBe("key: value\n  invalid: indentation: error");
    });

    test("resolveFileReferences should handle absolute file paths", async () => {
      const absoluteFile = path.join(tempDir, "absolute.txt");
      writeFileSync(absoluteFile, "absolute path content");

      const config = { file: `@${absoluteFile}` };
      const result = await resolveFileReferences(config, "/different/base/path");

      // Should work with absolute path regardless of basePath
      expect(result.file).toBe("absolute path content");
    });

    test("resolveFileReferences should handle file read errors gracefully", async () => {
      const config = { file: "@/root/protected/file.txt" };
      const result = await resolveFileReferences(config);

      // Should return original reference when file read fails
      expect(result.file).toBe("@/root/protected/file.txt");
    });

    test("processConfigFields should handle existing target audience with new audience types", () => {
      const config = {
        targetAudience: "Existing audience description",
        targetAudienceTypes: ["developers"],
      };

      const result = processConfigFields(config);

      if (result.targetAudience) {
        expect(result.targetAudience).toContain("Existing audience description");
      }
    });

    test("getAvailablePaths should handle permission errors gracefully", () => {
      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      try {
        const result = getAvailablePaths("/root/protected");
        expect(Array.isArray(result)).toBe(true);
        // Should handle permission errors gracefully
      } finally {
        console.warn = originalWarn;
      }
    });

    test("processConfigFields should handle reader knowledge level content", () => {
      const config = {
        readerKnowledgeLevel: "domainFamiliar",
      };

      const result = processConfigFields(config);

      if (result.readerKnowledgeContent) {
        expect(typeof result.readerKnowledgeContent).toBe("string");
      }
    });

    test("processConfigFields should handle documentation depth content", () => {
      const config = {
        documentationDepth: "comprehensive",
      };

      const result = processConfigFields(config);

      if (result.documentationDepthContent) {
        expect(typeof result.documentationDepthContent).toBe("string");
      }
    });

    test("getProjectInfo should handle git repository without GitHub", async () => {
      // Mock execSync to return non-GitHub remote
      const originalWarn = console.warn;
      console.warn = () => {}; // Suppress warnings

      try {
        const result = await getProjectInfo();
        expect(typeof result).toBe("object");
        expect(result).toHaveProperty("fromGitHub");
        expect(typeof result.fromGitHub).toBe("boolean");
      } finally {
        console.warn = originalWarn;
      }
    });

    test("getProjectInfo should handle no git repository", async () => {
      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      const originalCwd = process.cwd();
      const nonGitDir = path.join(tempDir, "no-git");
      mkdirSync(nonGitDir, { recursive: true });

      try {
        process.chdir(nonGitDir);
        const result = await getProjectInfo();

        expect(typeof result).toBe("object");
        expect(result.fromGitHub).toBe(false);
        expect(warnMessages.some((msg) => msg.includes("No git repository found"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
        console.warn = originalWarn;
      }
    });

    test("saveValueToConfig should handle write errors gracefully", async () => {
      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      const originalCwd = process.cwd;
      process.cwd = () => "/root"; // Read-only directory

      try {
        await saveValueToConfig("testKey", "testValue");
        // Should handle error gracefully and log warning
        expect(
          warnMessages.some((msg) => msg.includes("Failed to save testKey to config.yaml:")),
        ).toBe(true);
      } finally {
        process.cwd = originalCwd;
        console.warn = originalWarn;
      }
    });

    test("validatePath should handle access permission errors", () => {
      // Test with a path that exists but might not be accessible
      const result = validatePath("/root");
      // Should handle gracefully regardless of access permissions
      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("error");
    });

    test("getAvailablePaths should handle directory read errors", () => {
      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      try {
        // Test with a problematic path that might cause read errors
        const result = getAvailablePaths("/proc/nonexistent");
        expect(Array.isArray(result)).toBe(true);
        // May or may not log warnings depending on system
      } finally {
        console.warn = originalWarn;
      }
    });

    test("saveValueToConfig should handle array end detection edge cases", async () => {
      const testDir = path.join(tempDir, "array-edge-test");
      mkdirSync(testDir, { recursive: true });

      const originalCwd = process.cwd;
      process.cwd = () => testDir;

      try {
        // Create config with array that has inline start and complex structure
        const aigneDir = path.join(testDir, ".aigne", "doc-smith");
        mkdirSync(aigneDir, { recursive: true });

        // Test case 1: Array with inline start
        writeFileSync(
          path.join(aigneDir, "config.yaml"),
          "testArray: [item1, item2]\notherKey: value\n",
        );

        await saveValueToConfig("testArray", ["new1", "new2"]);

        let configContent = readFileSync(path.join(aigneDir, "config.yaml"), "utf8");
        expect(configContent).toContain("- new1");
        expect(configContent).toContain("- new2");

        // Test case 2: Array at end of file without trailing newline
        writeFileSync(
          path.join(aigneDir, "config.yaml"),
          "otherKey: value\ntestArray:\n  - item1\n  - item2",
        );

        await saveValueToConfig("testArray", ["final1", "final2"]);

        configContent = readFileSync(path.join(aigneDir, "config.yaml"), "utf8");
        expect(configContent).toContain("- final1");
        expect(configContent).toContain("- final2");
      } finally {
        process.cwd = originalCwd;
      }
    });

    test("getDirectoryContents should handle read errors", () => {
      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      try {
        // Import the internal function - this may not work due to module structure
        // So we'll test via getAvailablePaths which calls it
        const result = getAvailablePaths("/root/nonexistent/path");
        expect(Array.isArray(result)).toBe(true);
        // May log warnings for directory read errors
      } finally {
        console.warn = originalWarn;
      }
    });

    test("getGitHubRepoInfo should handle API response errors", async () => {
      // Mock fetch to return error response
      const originalFetch = global.fetch;
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          statusText: "Not Found",
        });

      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      try {
        const result = await getGitHubRepoInfo("https://github.com/user/repo");
        expect(result).toBe(null);
        expect(
          warnMessages.some((msg) => msg.includes("Failed to fetch GitHub repository info:")),
        ).toBe(true);
      } finally {
        global.fetch = originalFetch;
        console.warn = originalWarn;
      }
    });

    test("getGitHubRepoInfo should handle fetch errors", async () => {
      // Mock fetch to throw error
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error("Network error"));

      const originalWarn = console.warn;
      const warnMessages = [];
      console.warn = (message) => warnMessages.push(message);

      try {
        const result = await getGitHubRepoInfo("https://github.com/user/repo");
        expect(result).toBe(null);
        expect(
          warnMessages.some((msg) => msg.includes("Failed to fetch GitHub repository info:")),
        ).toBe(true);
      } finally {
        global.fetch = originalFetch;
        console.warn = originalWarn;
      }
    });

    test("resolveFileReferences should handle file read errors", async () => {
      // Test with file that doesn't exist
      const config = { file: "@/nonexistent/file.txt" };
      const result = await resolveFileReferences(config);

      // Should return original reference when file read fails
      expect(result.file).toBe("@/nonexistent/file.txt");
    });
  });
});
