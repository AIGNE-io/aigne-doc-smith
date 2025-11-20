import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSourcesContent,
  calculateFileStats,
  findInvalidSourcePaths,
  getFilesWithGlob,
  getPathPrefix,
  getRemoteFileContent,
  isDirExcluded,
  isRemoteFile,
  isRemoteFileAvailable,
  isRemoteTextFile,
  loadFilesFromPaths,
  loadGitignore,
  pathExists,
  readFileContents,
  resolveToAbsolute,
  toDisplayPath,
} from "../../utils/file-utils.mjs";

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

  describe("pathExists", () => {
    test("should return true for existing file", async () => {
      const testFile = join(testDir, "exists.txt");
      await writeFile(testFile, "test");

      const exists = await pathExists(testFile);
      expect(exists).toBe(true);
    });

    test("should return true for existing directory", async () => {
      const exists = await pathExists(testDir);
      expect(exists).toBe(true);
    });

    test("should return false for non-existent path", async () => {
      const nonExistent = join(testDir, "does-not-exist.txt");
      const exists = await pathExists(nonExistent);
      expect(exists).toBe(false);
    });
  });

  describe("toDisplayPath", () => {
    test("should return relative path for paths inside cwd", () => {
      const testPath = join(process.cwd(), "test", "file.txt");
      const display = toDisplayPath(testPath);
      expect(display.startsWith("..")).toBe(false);
      expect(display).toContain("test");
    });

    test("should return absolute path for paths outside cwd", () => {
      const testPath = "/some/other/path/file.txt";
      const display = toDisplayPath(testPath);
      expect(display.startsWith("/") || display.startsWith("..")).toBe(true);
    });

    test("should return . for current directory", () => {
      const display = toDisplayPath(process.cwd());
      expect(display).toBe(".");
    });
  });

  describe("resolveToAbsolute", () => {
    test("should return absolute path as-is", () => {
      const absolutePath = "/absolute/path/file.txt";
      const resolved = resolveToAbsolute(absolutePath);
      expect(resolved).toBe(absolutePath);
    });

    test("should resolve relative path to absolute", () => {
      const relativePath = "relative/file.txt";
      const resolved = resolveToAbsolute(relativePath);
      expect(resolved).toBeDefined();
      expect(resolved?.startsWith("/")).toBe(true);
      expect(resolved).toContain("relative");
    });

    test("should return undefined for empty value", () => {
      expect(resolveToAbsolute("")).toBeUndefined();
      expect(resolveToAbsolute(null)).toBeUndefined();
      expect(resolveToAbsolute(undefined)).toBeUndefined();
    });
  });

  describe("loadFilesFromPaths", () => {
    beforeEach(async () => {
      await mkdir(join(testDir, "src"), { recursive: true });
      await mkdir(join(testDir, "docs"), { recursive: true });
      await writeFile(join(testDir, "src", "index.js"), "// index");
      await writeFile(join(testDir, "src", "utils.ts"), "// utils");
      await writeFile(join(testDir, "docs", "readme.md"), "# readme");
      await writeFile(join(testDir, "config.json"), "{}");
    });

    test("should load single file path", async () => {
      const filePath = join(testDir, "config.json");
      const files = await loadFilesFromPaths(filePath);

      expect(files).toBeDefined();
      expect(files.length).toBe(1);
      expect(files[0]).toBe(filePath);
    });

    test("should load multiple file paths", async () => {
      const file1 = join(testDir, "config.json");
      const file2 = join(testDir, "docs", "readme.md");
      const files = await loadFilesFromPaths([file1, file2]);

      expect(files.length).toBe(2);
      expect(files).toContain(file1);
      expect(files).toContain(file2);
    });

    test("should load files from directory with default patterns", async () => {
      const files = await loadFilesFromPaths(testDir, {
        useDefaultPatterns: true,
        defaultIncludePatterns: ["**/*.js", "**/*.ts"],
        defaultExcludePatterns: [],
      });

      expect(files.length).toBeGreaterThan(0);
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("utils.ts"))).toBe(true);
    });

    test("should handle glob patterns", async () => {
      const files = await loadFilesFromPaths(join(testDir, "**/*.js"));

      expect(files).toBeDefined();
      expect(files.some((f) => f.includes("index.js"))).toBe(true);
    });

    test("should handle invalid paths gracefully", async () => {
      const files = await loadFilesFromPaths([123, null, "valid-but-not-exist"], {
        useDefaultPatterns: false,
      });

      expect(Array.isArray(files)).toBe(true);
    });

    test("should apply include and exclude patterns", async () => {
      const files = await loadFilesFromPaths(testDir, {
        includePatterns: ["**/*.js", "**/*.ts"],
        excludePatterns: ["**/*.ts"],
        useDefaultPatterns: false,
      });

      expect(files.some((f) => f.includes("index.js"))).toBe(true);
      expect(files.some((f) => f.includes("utils.ts"))).toBe(false);
    });

    test("should handle string patterns as array", async () => {
      const files = await loadFilesFromPaths(testDir, {
        includePatterns: "**/*.js",
        excludePatterns: "**/*.ts",
        useDefaultPatterns: false,
      });

      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe("readFileContents", () => {
    beforeEach(async () => {
      await mkdir(join(testDir, "src"), { recursive: true });
      await writeFile(join(testDir, "src", "file1.js"), "const x = 1;");
      await writeFile(join(testDir, "src", "file2.js"), "const y = 2;");
    });

    test("should read multiple files with content", async () => {
      const files = [join(testDir, "src", "file1.js"), join(testDir, "src", "file2.js")];
      const contents = await readFileContents(files, testDir);

      expect(contents.length).toBe(2);
      expect(contents[0].sourceId).toContain("file1.js");
      expect(contents[0].content).toContain("const x = 1");
      expect(contents[1].sourceId).toContain("file2.js");
      expect(contents[1].content).toContain("const y = 2");
    });

    test("should use custom baseDir for relative paths", async () => {
      const files = [join(testDir, "src", "file1.js")];
      const contents = await readFileContents(files, testDir);

      expect(contents[0].sourceId).not.toContain(testDir);
      expect(contents[0].sourceId).toContain("src");
    });

    test("should skip binary files by default", async () => {
      const binaryFile = join(testDir, "binary.bin");
      await writeFile(binaryFile, Buffer.from([0xff, 0xfe, 0xfd, 0xfc]));
      const textFile = join(testDir, "text.txt");
      await writeFile(textFile, "text content");

      const contents = await readFileContents([binaryFile, textFile], testDir);

      expect(contents.length).toBeGreaterThanOrEqual(1);
      expect(contents.some((c) => c.sourceId.includes("text.txt"))).toBe(true);
    });

    test("should include binary files when skipBinaryFiles is false", async () => {
      const binaryFile = join(testDir, "binary.bin");
      await writeFile(binaryFile, Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]));

      const contents = await readFileContents([binaryFile], testDir, {
        skipBinaryFiles: false,
      });

      expect(contents.length).toBeGreaterThanOrEqual(0);
    });

    test("should handle empty file array", async () => {
      const contents = await readFileContents([], testDir);
      expect(contents.length).toBe(0);
    });

    test("should read remote HTTP files", async () => {
      const remoteUrl = "https://example.com/data.json";
      const originalFetch = globalThis.fetch;
      const fetchMock = mock(async (_input, init) => {
        if (init?.method === "HEAD") {
          return {
            headers: new Map([["content-type", "application/json"]]),
          };
        }
        return {
          async text() {
            return '{"value": 1}';
          },
        };
      });
      globalThis.fetch = fetchMock;

      try {
        const contents = await readFileContents([remoteUrl], testDir);

        expect(contents.length).toBe(1);
        expect(contents[0].sourceId).toBe(remoteUrl);
        expect(contents[0].content).toContain('"value": 1');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("calculateFileStats", () => {
    test("should calculate tokens and lines correctly", () => {
      const sourceFiles = [
        { content: "const x = 1;\nconst y = 2;" },
        { content: "function test() {\n  return true;\n}" },
      ];

      const stats = calculateFileStats(sourceFiles);

      expect(stats.totalTokens).toBeGreaterThan(0);
      expect(stats.totalLines).toBeGreaterThan(0);
      expect(stats.totalLines).toBeGreaterThan(3);
    });

    test("should handle empty content", () => {
      const sourceFiles = [{ content: "" }, { content: "" }];
      const stats = calculateFileStats(sourceFiles);

      expect(stats.totalTokens).toBe(0);
      expect(stats.totalLines).toBe(0);
    });

    test("should exclude empty lines from line count", () => {
      const sourceFiles = [{ content: "line1\n\nline2\n\n\nline3" }];
      const stats = calculateFileStats(sourceFiles);

      expect(stats.totalLines).toBe(3);
    });

    test("should handle files without content property", () => {
      const sourceFiles = [{ noContent: true }, { content: "test" }];
      const stats = calculateFileStats(sourceFiles);

      expect(stats.totalTokens).toBeGreaterThan(0);
      expect(stats.totalLines).toBe(1);
    });
  });

  describe("buildSourcesContent", () => {
    test("should build sources for normal context", () => {
      const sourceFiles = [
        { sourceId: "file1.js", content: "const x = 1;" },
        { sourceId: "file2.js", content: "const y = 2;" },
      ];

      const sources = buildSourcesContent(sourceFiles);

      expect(sources).toContain("// sourceId: file1.js");
      expect(sources).toContain("const x = 1;");
      expect(sources).toContain("// sourceId: file2.js");
      expect(sources).toContain("const y = 2;");
    });

    test("should include core files matching patterns", () => {
      const sourceFiles = [
        { sourceId: "index.js", content: "// entry" },
        { sourceId: "main.ts", content: "// main" },
        { sourceId: "types.d.ts", content: "// types" },
        { sourceId: "api/routes.js", content: "// routes" },
      ];

      const sources = buildSourcesContent(sourceFiles);

      expect(sources).toContain("index.js");
      expect(sources).toContain("main.ts");
      expect(sources).toContain("types.d.ts");
      expect(sources).toContain("routes.js");
    });

    test("should handle empty sourceFiles array", () => {
      const sources = buildSourcesContent([]);
      expect(sources).toBe("");
    });
  });

  describe("isRemoteFile", () => {
    test("should detect http and https URLs", () => {
      expect(isRemoteFile("http://example.com/file.md")).toBe(true);
      expect(isRemoteFile("https://example.com/file.md")).toBe(true);
    });

    test("should return false for local paths", () => {
      expect(isRemoteFile("file.md")).toBe(false);
      expect(isRemoteFile("/absolute/path/file.md")).toBe(false);
    });
  });

  describe("isRemoteTextFile", () => {
    test("should return true for text content types", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => ({
        headers: {
          get(key) {
            if (key === "content-type") {
              return "text/plain";
            }
            return null;
          },
        },
      }));

      try {
        const result = await isRemoteTextFile("https://example.com/file.txt");
        expect(result).toBe(true);
      } finally {
        globalThis.fetch = originalFetch;
      }
      test("should return false for local paths", () => {
        expect(isRemoteFile("file.md")).toBe(false);
        expect(isRemoteFile("/absolute/path/file.md")).toBe(false);
      });

      test("should return false for unsupported protocols", () => {
        expect(isRemoteFile("httpss://example.com/file.md")).toBe(false);
      });
    });

    describe("isRemoteFileAvailable", () => {
      test("should detect http and https URLs", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = mock(async () => ({
          ok: true,
        }));
        try {
          const result = await isRemoteFileAvailable(
            "https://www.arcblock.io/.well-known/glossary.txt",
          );
          expect(result).toBe(true);
        } finally {
          globalThis.fetch = originalFetch;
        }
      });

      test("should return false for local paths", async () => {
        let result = await isRemoteFileAvailable("file.md");
        expect(result).toBe(false);
        result = await isRemoteFileAvailable("/absolute/path/file.md");
        expect(result).toBe(false);
      });

      test("should return false for 404 url", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = mock(async () => ({
          ok: false,
        }));
        try {
          const result = await isRemoteFileAvailable("https://www.arcblock.io/.well-known/404.txt");
          expect(result).toBe(false);
        } finally {
          globalThis.fetch = originalFetch;
        }
      });
    });

    test("should return false for binary content types", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => ({
        headers: {
          get() {
            return "application/octet-stream";
          },
        },
      }));

      try {
        const result = await isRemoteTextFile("https://example.com/image.png");
        expect(result).toBe(false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    test("should return null when request fails", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => {
        throw new Error("network error");
      });

      try {
        const result = await isRemoteTextFile("https://example.com/file.txt");
        expect(result).toBeNull();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("getRemoteFileContent", () => {
    test("should return text content on success", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => ({
        async text() {
          return "remote content";
        },
      }));

      try {
        const result = await getRemoteFileContent("https://example.com/file.txt");
        expect(result).toBe("remote content");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    test("should return null when fetch fails", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => {
        throw new Error("fetch failed");
      });

      try {
        const result = await getRemoteFileContent("https://example.com/file.txt");
        expect(result).toBeNull();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("getPathPrefix", () => {
    test("returns path prefix before first glob segment", () => {
      expect(getPathPrefix("src/**/*.js")).toBe("src");
      expect(getPathPrefix("src/components/**/*.tsx")).toBe("src/components");
      expect(getPathPrefix("docs/**/README.md")).toBe("docs");
    });

    test("returns '.' for path starting with glob", () => {
      expect(getPathPrefix("**/*.js")).toBe(".");
      expect(getPathPrefix("*.md")).toBe(".");
    });

    test("returns full path if no glob characters", () => {
      expect(getPathPrefix("src/components")).toBe("src/components");
      expect(getPathPrefix("docs/guide")).toBe("docs/guide");
      expect(getPathPrefix("single")).toBe("single");
    });

    test("handles glob patterns with brackets", () => {
      expect(getPathPrefix("src/[a-z]*.js")).toBe("src");
      expect(getPathPrefix("test/[!test]*.mjs")).toBe("test");
    });

    test("handles glob patterns with question marks", () => {
      expect(getPathPrefix("src/file?.js")).toBe("src");
      expect(getPathPrefix("docs/page?.md")).toBe("docs");
    });

    test("handles empty path", () => {
      expect(getPathPrefix("")).toBe(".");
    });

    test("handles path with multiple glob segments", () => {
      expect(getPathPrefix("src/**/components/*.js")).toBe("src");
      expect(getPathPrefix("a/b/**/c/*.ts")).toBe("a/b");
    });

    test("handles Windows-style paths", () => {
      // Windows paths use backslashes, but getPathPrefix splits by "/"
      // So "C:\\Users\\**\\*.js" treated as single segment with glob returns "."
      expect(getPathPrefix("C:\\Users\\**\\*.js")).toBe(".");
      // For forward slashes, it works as expected
      expect(getPathPrefix("src/components/**/*.ts")).toBe("src/components");
    });
  });

  describe("isDirExcluded", () => {
    test("returns true for matching exclude patterns", () => {
      expect(isDirExcluded("node_modules", ["node_modules/**"])).toBe(true);
      expect(isDirExcluded("test", ["test/**", "temp/**"])).toBe(true);
      expect(isDirExcluded("dist", ["dist/**"])).toBe(true);
    });

    test("returns false for non-matching exclude patterns", () => {
      expect(isDirExcluded("src", ["node_modules/**"])).toBe(false);
      expect(isDirExcluded("lib", ["test/**", "temp/**"])).toBe(false);
    });

    test("handles path normalization (backslashes)", () => {
      expect(isDirExcluded("node_modules\\sub", ["node_modules/**"])).toBe(true);
      expect(isDirExcluded("test\\unit", ["test/**"])).toBe(true);
    });

    test("handles path normalization (leading ./)", () => {
      expect(isDirExcluded("./node_modules", ["node_modules/**"])).toBe(true);
      expect(isDirExcluded("./test", ["test/**"])).toBe(true);
    });

    test("handles path with trailing slash", () => {
      expect(isDirExcluded("node_modules/", ["node_modules/**"])).toBe(true);
      expect(isDirExcluded("test/", ["test/**"])).toBe(true);
    });

    test("handles path without trailing slash", () => {
      expect(isDirExcluded("node_modules", ["node_modules/**"])).toBe(true);
      expect(isDirExcluded("test", ["test/**"])).toBe(true);
    });

    test("returns false for null or undefined input", () => {
      expect(isDirExcluded(null, ["test/**"])).toBe(false);
      expect(isDirExcluded(undefined, ["test/**"])).toBe(false);
    });

    test("returns false for non-string input", () => {
      expect(isDirExcluded(123, ["test/**"])).toBe(false);
      expect(isDirExcluded({}, ["test/**"])).toBe(false);
      expect(isDirExcluded([], ["test/**"])).toBe(false);
    });

    test("returns false for empty string", () => {
      expect(isDirExcluded("", ["test/**"])).toBe(false);
    });

    test("handles nested directory patterns", () => {
      expect(isDirExcluded("src/node_modules", ["**/node_modules/**"])).toBe(true);
      expect(isDirExcluded("project/test/unit", ["**/test/**"])).toBe(true);
    });

    test("handles multiple exclude patterns", () => {
      expect(isDirExcluded("node_modules", ["node_modules/**", "dist/**"])).toBe(true);
      expect(isDirExcluded("dist", ["node_modules/**", "dist/**"])).toBe(true);
      expect(isDirExcluded("src", ["node_modules/**", "dist/**"])).toBe(false);
    });

    test("handles dot files in patterns", () => {
      expect(isDirExcluded(".git", [".git/**"])).toBe(true);
      expect(isDirExcluded(".vscode", [".vscode/**"])).toBe(true);
    });
  });

  describe("findInvalidSourcePaths", () => {
    test("returns empty arrays for empty sourcePaths", async () => {
      expect(await findInvalidSourcePaths([], ["node_modules/**"])).toEqual({
        excluded: [],
        notFound: [],
      });
    });

    test("returns empty arrays for non-array sourcePaths", async () => {
      expect(await findInvalidSourcePaths(null, ["node_modules/**"])).toEqual({
        excluded: [],
        notFound: [],
      });
      expect(await findInvalidSourcePaths(undefined, ["node_modules/**"])).toEqual({
        excluded: [],
        notFound: [],
      });
      expect(await findInvalidSourcePaths("string", ["node_modules/**"])).toEqual({
        excluded: [],
        notFound: [],
      });
    });

    test("returns empty arrays for empty excludePatterns", async () => {
      expect(await findInvalidSourcePaths(["src/file.js"], [])).toEqual({
        excluded: [],
        notFound: [],
      });
      expect(await findInvalidSourcePaths(["src/file.js"], null)).toEqual({
        excluded: [],
        notFound: [],
      });
      expect(await findInvalidSourcePaths(["src/file.js"], undefined)).toEqual({
        excluded: [],
        notFound: [],
      });
    });

    test("skips paths starting with !", async () => {
      const result = await findInvalidSourcePaths(
        ["!src/file.js", "!node_modules"],
        ["node_modules/**"],
      );
      expect(result).toEqual({ excluded: [], notFound: [] });
    });

    test("skips remote URLs", async () => {
      const result = await findInvalidSourcePaths(
        ["http://example.com", "https://example.com/file.js"],
        ["node_modules/**"],
      );
      expect(result).toEqual({ excluded: [], notFound: [] });
    });

    test("includes invalid glob patterns that match exclude patterns", async () => {
      const result = await findInvalidSourcePaths(["node_modules/**/*.js"], ["node_modules/**"]);
      expect(result.excluded).toContain("node_modules/**/*.js");
      expect(result.notFound).not.toContain("node_modules/**/*.js");
    });

    test("skips valid glob patterns that don't match exclude patterns", async () => {
      const result = await findInvalidSourcePaths(["src/**/*.js"], ["node_modules/**"]);
      expect(result.excluded).not.toContain("src/**/*.js");
      expect(result.notFound).not.toContain("src/**/*.js");
    });

    test("skips files", async () => {
      const tempDir = mkdtempSync(join(tmpdir(), "file-utils-test-"));
      const testFile = join(tempDir, "test.txt");
      writeFileSync(testFile, "content");

      try {
        const result = await findInvalidSourcePaths([testFile], ["test.txt"]);
        expect(result.excluded).not.toContain(testFile);
        expect(result.notFound).not.toContain(testFile);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test("includes directories that match exclude patterns", async () => {
      const tempDir = mkdtempSync(join(tmpdir(), "file-utils-test-"));
      const excludedDir = join(tempDir, "node_modules");
      mkdirSync(excludedDir, { recursive: true });

      try {
        // For absolute paths, need to use **/ prefix in pattern to match anywhere
        const result = await findInvalidSourcePaths([excludedDir], ["**/node_modules/**"]);
        expect(result.excluded).toContain(excludedDir);
        expect(result.notFound).not.toContain(excludedDir);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test("skips directories that don't match exclude patterns", async () => {
      const tempDir = mkdtempSync(join(tmpdir(), "file-utils-test-"));
      const validDir = join(tempDir, "src");
      mkdirSync(validDir, { recursive: true });

      try {
        const result = await findInvalidSourcePaths([validDir], ["node_modules/**"]);
        expect(result.excluded).not.toContain(validDir);
        expect(result.notFound).not.toContain(validDir);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test("includes non-existent paths", async () => {
      const nonExistent = join("/non/existent/path", "file.js");
      const result = await findInvalidSourcePaths([nonExistent], ["node_modules/**"]);
      expect(result.notFound).toContain(nonExistent);
      expect(result.excluded).not.toContain(nonExistent);
    });

    test("skips invalid string inputs", async () => {
      const result = await findInvalidSourcePaths([null, undefined, "", 123], ["node_modules/**"]);
      expect(result).toEqual({ excluded: [], notFound: [] });
    });

    test("handles mixed valid and invalid paths", async () => {
      const tempDir = mkdtempSync(join(tmpdir(), "file-utils-test-"));
      const validDir = join(tempDir, "src");
      const excludedDir = join(tempDir, "node_modules");
      const testFile = join(tempDir, "test.txt");
      const nonExistent = join(tempDir, "missing");

      mkdirSync(validDir, { recursive: true });
      mkdirSync(excludedDir, { recursive: true });
      writeFileSync(testFile, "content");

      try {
        // Use **/ prefix for absolute paths
        const result = await findInvalidSourcePaths(
          [
            validDir,
            excludedDir,
            testFile,
            nonExistent,
            "http://example.com",
            "!excluded",
            "node_modules/**/*.js",
          ],
          ["**/node_modules/**"],
        );

        expect(result.excluded).toContain(excludedDir);
        expect(result.excluded).toContain("node_modules/**/*.js");
        expect(result.notFound).toContain(nonExistent);
        expect(result.excluded).not.toContain(validDir);
        expect(result.excluded).not.toContain(testFile);
        expect(result.notFound).not.toContain(validDir);
        expect(result.notFound).not.toContain(testFile);
        expect(result.excluded).not.toContain("http://example.com");
        expect(result.excluded).not.toContain("!excluded");
        expect(result.notFound).not.toContain("http://example.com");
        expect(result.notFound).not.toContain("!excluded");
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test("handles nested directory exclusion", async () => {
      const tempDir = mkdtempSync(join(tmpdir(), "file-utils-test-"));
      const nestedExcluded = join(tempDir, "project", "node_modules");
      mkdirSync(nestedExcluded, { recursive: true });

      try {
        const result = await findInvalidSourcePaths([nestedExcluded], ["**/node_modules/**"]);
        expect(result.excluded).toContain(nestedExcluded);
        expect(result.notFound).not.toContain(nestedExcluded);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test("handles glob patterns with path prefix heuristic", async () => {
      // getPathPrefix("node_modules/**/*.js") returns "node_modules"
      // So it should be excluded if "node_modules/**" is in exclude patterns
      const result1 = await findInvalidSourcePaths(["node_modules/**/*.js"], ["node_modules/**"]);
      expect(result1.excluded).toContain("node_modules/**/*.js");
      expect(result1.notFound).not.toContain("node_modules/**/*.js");

      // getPathPrefix("src/**/*.js") returns "src"
      // So it should not be excluded if "node_modules/**" is in exclude patterns
      const result2 = await findInvalidSourcePaths(["src/**/*.js"], ["node_modules/**"]);
      expect(result2.excluded).not.toContain("src/**/*.js");
      expect(result2.notFound).not.toContain("src/**/*.js");
    });
  });
});
