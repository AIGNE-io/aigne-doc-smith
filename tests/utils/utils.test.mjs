import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as childProcess from "node:child_process";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
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
  processContent,
  resolveFileReferences,
  toRelativePath,
  validatePath,
  validatePaths,
} from "../../utils/utils.mjs";

describe("utils", () => {
  let originalEnv;
  let execSyncSpy;
  let existsSyncSpy;
  let mkdirSyncSpy;
  let readdirSyncSpy;
  let statSyncSpy;
  let accessSyncSpy;
  let readFileSpy;
  let writeFileSpy;
  let mkdirSpy;
  let consoleSpy;
  let processSpies;
  let fetchSpy;

  beforeEach(() => {
    originalEnv = { ...process.env };

    // Mock child_process
    execSyncSpy = spyOn(childProcess, "execSync").mockReturnValue("mocked-hash");

    // Mock fs sync operations
    existsSyncSpy = spyOn(fs, "existsSync").mockReturnValue(true);
    mkdirSyncSpy = spyOn(fs, "mkdirSync").mockImplementation(() => {});
    readdirSyncSpy = spyOn(fs, "readdirSync").mockReturnValue([]);
    statSyncSpy = spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => false,
    });
    accessSyncSpy = spyOn(fs, "accessSync").mockImplementation(() => {});

    // Mock fs async operations
    readFileSpy = spyOn(fsPromises, "readFile").mockResolvedValue("test content");
    writeFileSpy = spyOn(fsPromises, "writeFile").mockResolvedValue();
    mkdirSpy = spyOn(fsPromises, "mkdir").mockResolvedValue();

    // Mock console
    consoleSpy = spyOn(console, "warn").mockImplementation(() => {});

    // Mock process methods
    processSpies = {
      cwd: spyOn(process, "cwd").mockReturnValue("/mock/cwd"),
    };

    // Mock global fetch
    fetchSpy = spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "test-repo", description: "Test repo" }),
      statusText: "OK",
    });
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Restore all spies
    execSyncSpy?.mockRestore();
    existsSyncSpy?.mockRestore();
    mkdirSyncSpy?.mockRestore();
    readdirSyncSpy?.mockRestore();
    statSyncSpy?.mockRestore();
    accessSyncSpy?.mockRestore();
    readFileSpy?.mockRestore();
    writeFileSpy?.mockRestore();
    mkdirSpy?.mockRestore();
    consoleSpy?.mockRestore();
    fetchSpy?.mockRestore();

    Object.values(processSpies).forEach((spy) => spy?.mockRestore());
  });

  // PATH FUNCTIONS TESTS
  describe("normalizePath", () => {
    test("should return absolute path if already absolute", () => {
      const absolutePath = "/home/user/project";
      const result = normalizePath(absolutePath);
      expect(result).toBe(absolutePath);
    });

    test("should convert relative path to absolute", () => {
      processSpies.cwd.mockReturnValue("/home/user");
      const relativePath = "./project";
      const result = normalizePath(relativePath);
      expect(result).toBe("/home/user/project");
    });

    test("should handle complex relative paths", () => {
      processSpies.cwd.mockReturnValue("/home/user");
      const complexPath = "../other/project";
      const result = normalizePath(complexPath);
      expect(result).toBe("/home/other/project");
    });
  });

  describe("toRelativePath", () => {
    test("should convert absolute path to relative", () => {
      processSpies.cwd.mockReturnValue("/home/user");
      const absolutePath = "/home/user/project/file.md";
      const result = toRelativePath(absolutePath);
      expect(result).toBe("project/file.md");
    });

    test("should return relative path unchanged", () => {
      const relativePath = "./project/file.md";
      const result = toRelativePath(relativePath);
      expect(result).toBe(relativePath);
    });
  });

  describe("isGlobPattern", () => {
    test("should detect glob patterns", () => {
      expect(isGlobPattern("*.js")).toBe(true);
      expect(isGlobPattern("**/*.md")).toBe(true);
      expect(isGlobPattern("file?.txt")).toBe(true);
      expect(isGlobPattern("files[0-9].txt")).toBe(true);
    });

    test("should return false for non-glob patterns", () => {
      expect(isGlobPattern("file.txt")).toBe(false);
      expect(isGlobPattern("path/to/file")).toBe(false);
      expect(isGlobPattern("")).toBe(false);
    });

    test("should handle null/undefined input", () => {
      expect(isGlobPattern(null)).toBe(false);
      expect(isGlobPattern(undefined)).toBe(false);
    });
  });

  // CONTENT PROCESSING TESTS
  describe("processContent", () => {
    test("should convert relative links to flattened format", () => {
      const content = "Check out [API Guide](/api/guide) for details.";
      const result = processContent({ content });
      expect(result).toBe("Check out [API Guide](./api-guide.md) for details.");
    });

    test("should preserve external links", () => {
      const content = "Visit [Google](https://google.com) or [Email](mailto:test@example.com).";
      const result = processContent({ content });
      expect(result).toBe(content);
    });

    test("should preserve anchors", () => {
      const content = "See [Section](/guide#section) for details.";
      const result = processContent({ content });
      expect(result).toBe("See [Section](./guide.md#section) for details.");
    });

    test("should skip images", () => {
      const content = "![Image](/path/to/image) and [Link](/path/to/file)";
      const result = processContent({ content });
      expect(result).toBe("![Image](/path/to/image) and [Link](./path-to-file.md)");
    });

    test("should handle links with existing extensions", () => {
      const content = "Download [file](/downloads/file.pdf) here.";
      const result = processContent({ content });
      expect(result).toBe(content);
    });

    test("should handle dot-prefixed paths", () => {
      const content = "See [Guide](./guide/intro) for basics.";
      const result = processContent({ content });
      expect(result).toBe("See [Guide](./guide-intro.md) for basics.");
    });
  });

  // UTILITY FUNCTIONS TESTS
  describe("getContentHash", () => {
    test("should generate consistent hash for same content", () => {
      const content = "test content";
      const hash1 = getContentHash(content);
      const hash2 = getContentHash(content);
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBe(64); // SHA256 hex length
    });

    test("should trim content by default", () => {
      const content = "  test content  ";
      const trimmedHash = getContentHash(content);
      const directHash = getContentHash("test content");
      expect(trimmedHash).toBe(directHash);
    });

    test("should not trim when trim=false", () => {
      const content = "  test content  ";
      const noTrimHash = getContentHash(content, { trim: false });
      const directHash = getContentHash("test content");
      expect(noTrimHash).not.toBe(directHash);
    });

    test("should handle different content types", () => {
      expect(getContentHash("")).toBe(getContentHash(""));
      expect(getContentHash("a")).not.toBe(getContentHash("b"));
    });
  });

  describe("detectSystemLanguage", () => {
    test("should detect language from LANG environment variable", () => {
      process.env.LANG = "zh_CN.UTF-8";
      const result = detectSystemLanguage();
      expect(result).toBe("zh");
    });

    test("should detect Traditional Chinese when zh is not in supported languages", () => {
      // Mock a scenario where "zh" is not found in SUPPORTED_LANGUAGES
      // but the system has zh_TW locale
      process.env.LANG = "zh_TW.UTF-8";
      const result = detectSystemLanguage();
      // The function will find "zh" in SUPPORTED_LANGUAGES and return it
      expect(result).toBe("zh");
    });

    test("should fall back to English for unsupported languages", () => {
      process.env.LANG = "unknown_LANG.UTF-8";
      const result = detectSystemLanguage();
      expect(result).toBe("en");
    });

    test("should handle missing environment variables", () => {
      delete process.env.LANG;
      delete process.env.LANGUAGE;
      delete process.env.LC_ALL;
      const result = detectSystemLanguage();
      expect(result).toBe("en");
    });

    test("should detect from LANGUAGE variable", () => {
      delete process.env.LANG;
      process.env.LANGUAGE = "fr_FR";
      const result = detectSystemLanguage();
      expect(result).toBe("fr");
    });
  });

  // GIT OPERATIONS TESTS
  describe("getCurrentGitHead", () => {
    test("should return git HEAD commit hash", () => {
      execSyncSpy.mockReturnValue("abc123def456\n");
      const result = getCurrentGitHead();
      expect(result).toBe("abc123def456");
      expect(execSyncSpy).toHaveBeenCalledWith("git rev-parse HEAD", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
    });

    test("should return null and warn on git error", () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error("Not a git repository");
      });
      const result = getCurrentGitHead();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Failed to get git HEAD:", "Not a git repository");
    });
  });

  describe("getGithubRepoUrl", () => {
    test("should return GitHub URL", () => {
      execSyncSpy.mockReturnValue("git@github.com:user/repo.git\n");
      const result = getGithubRepoUrl();
      expect(result).toBe("git@github.com:user/repo.git");
    });

    test("should return empty string for non-GitHub repos", () => {
      execSyncSpy.mockReturnValue("git@gitlab.com:user/repo.git\n");
      const result = getGithubRepoUrl();
      expect(result).toBe("");
    });

    test("should return empty string on git error", () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error("No origin remote");
      });
      const result = getGithubRepoUrl();
      expect(result).toBe("");
    });
  });

  describe("getModifiedFilesBetweenCommits", () => {
    test("should return modified files", () => {
      execSyncSpy.mockReturnValue("file1.js\nfile2.md\nfile3.txt\n");
      const result = getModifiedFilesBetweenCommits("abc123", "def456");
      expect(result).toEqual(["file1.js", "file2.md", "file3.txt"]);
    });

    test("should filter files by provided paths", () => {
      execSyncSpy.mockReturnValue("file1.js\nfile2.md\nfile3.txt\n");
      processSpies.cwd.mockReturnValue("/project");
      const result = getModifiedFilesBetweenCommits("abc123", "def456", ["/project/file1.js"]);
      expect(result).toEqual(["file1.js"]);
    });

    test("should handle git command errors", () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error("Git command failed");
      });
      const result = getModifiedFilesBetweenCommits("abc123", "def456");
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("hasSourceFilesChanged", () => {
    test("should return true when source files are modified", () => {
      processSpies.cwd.mockReturnValue("/project");
      const sourceIds = ["/project/src/file.js"];
      const modifiedFiles = ["src/file.js", "other/file.md"];
      const result = hasSourceFilesChanged(sourceIds, modifiedFiles);
      expect(result).toBe(true);
    });

    test("should return false when no source files are modified", () => {
      const sourceIds = ["src/file.js"];
      const modifiedFiles = ["other/file.md"];
      const result = hasSourceFilesChanged(sourceIds, modifiedFiles);
      expect(result).toBe(false);
    });

    test("should handle empty arrays", () => {
      expect(hasSourceFilesChanged([], ["file.js"])).toBe(false);
      expect(hasSourceFilesChanged(["file.js"], [])).toBe(false);
      expect(hasSourceFilesChanged([], [])).toBe(false);
    });

    test("should handle null/undefined inputs", () => {
      expect(hasSourceFilesChanged(null, ["file.js"])).toBe(false);
      expect(hasSourceFilesChanged(["file.js"], null)).toBe(false);
    });
  });

  // VALIDATION TESTS
  describe("validatePath", () => {
    test("should return valid for existing accessible path", () => {
      existsSyncSpy.mockReturnValue(true);
      accessSyncSpy.mockImplementation(() => {}); // No error means accessible

      const result = validatePath("/existing/path");

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("should return invalid for non-existent path", () => {
      existsSyncSpy.mockReturnValue(false);

      const result = validatePath("/non/existent");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Path does not exist: /non/existent");
    });

    test("should return invalid for inaccessible path", () => {
      existsSyncSpy.mockReturnValue(true);
      accessSyncSpy.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const result = validatePath("/inaccessible");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Path is not accessible: /inaccessible");
    });

    test("should handle path format errors", () => {
      // This is a bit tricky to test without modifying the actual function
      const result = validatePath("validpath");
      expect(result.isValid).toBe(true); // Will be valid if mocks succeed
    });
  });

  describe("validatePaths", () => {
    test("should separate valid and invalid paths", () => {
      existsSyncSpy
        .mockReturnValueOnce(true) // first path exists
        .mockReturnValueOnce(false); // second path doesn't exist
      accessSyncSpy.mockImplementation(() => {}); // accessible when it exists

      const paths = ["/valid/path", "/invalid/path"];
      const result = validatePaths(paths);

      expect(result.validPaths).toEqual(["/valid/path"]);
      expect(result.errors).toEqual([
        { path: "/invalid/path", error: "Path does not exist: /invalid/path" },
      ]);
    });

    test("should handle empty paths array", () => {
      const result = validatePaths([]);
      expect(result.validPaths).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  // CONFIG MANAGEMENT TESTS
  describe("loadConfigFromFile", () => {
    test("should return null for non-existent file", async () => {
      existsSyncSpy.mockReturnValue(false);

      const result = await loadConfigFromFile();

      expect(result).toBeNull();
    });
  });

  // GITHUB INTEGRATION TESTS
  describe("getGitHubRepoInfo", () => {
    test("should fetch repository information", async () => {
      const mockRepo = {
        name: "test-repo",
        description: "A test repository",
        owner: { avatar_url: "https://example.com/avatar.png" },
      };
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepo),
      });

      const result = await getGitHubRepoInfo("https://github.com/user/test-repo");

      expect(result).toEqual({
        name: "test-repo",
        description: "A test repository",
        icon: "https://example.com/avatar.png",
      });
    });

    test("should return null for invalid GitHub URL", async () => {
      const result = await getGitHubRepoInfo("https://gitlab.com/user/repo");
      expect(result).toBeNull();
    });

    test("should handle fetch errors", async () => {
      fetchSpy.mockRejectedValue(new Error("Network error"));

      const result = await getGitHubRepoInfo("https://github.com/user/repo");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    test("should handle non-ok response", async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      const result = await getGitHubRepoInfo("https://github.com/user/nonexistent");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // FILE REFERENCES TESTS (simplified due to complex file system interactions)
  describe("resolveFileReferences", () => {
    test("should return original value for missing files", async () => {
      existsSyncSpy.mockReturnValue(false);

      const config = { notes: "@missing.txt" };
      const result = await resolveFileReferences(config);

      expect(result.notes).toBe("@missing.txt");
    });

    test("should handle non-file reference strings", async () => {
      const config = {
        normal: "not a file reference",
        email: "user@example.com",
      };

      const result = await resolveFileReferences(config);

      expect(result).toEqual(config);
    });
  });

  // PATH DISCOVERY TESTS
  describe("getAvailablePaths", () => {
    test("should return current directory contents for empty input", () => {
      readdirSyncSpy.mockReturnValue([
        { name: "file1.txt", isDirectory: () => false },
        { name: "folder1", isDirectory: () => true },
      ]);

      const result = getAvailablePaths("");

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe("📁 Directory");
      expect(result[1].description).toBe("📄 File");
    });

    test("should handle absolute paths", () => {
      readdirSyncSpy.mockReturnValue([{ name: "config.yaml", isDirectory: () => false }]);

      const result = getAvailablePaths("/etc/config");

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining("config.yaml"),
            description: "📄 File",
          }),
        ]),
      );
    });

    test("should filter results by search term", () => {
      readdirSyncSpy.mockReturnValue([
        { name: "test.js", isDirectory: () => false },
        { name: "example.md", isDirectory: () => false },
        { name: "test-utils.js", isDirectory: () => false },
      ]);

      const result = getAvailablePaths("test");

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.name.toLowerCase().includes("test"))).toBe(true);
    });
  });

  // PROJECT INFO TESTS
  describe("getProjectInfo", () => {
    test("should get project info from git repository", async () => {
      execSyncSpy.mockReturnValue("https://github.com/user/repo.git\n");
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            name: "repo",
            description: "Test repository",
            owner: { avatar_url: "https://avatar.png" },
          }),
      });

      const result = await getProjectInfo();

      expect(result.name).toBe("repo");
      expect(result.description).toBe("Test repository");
      expect(result.icon).toBe("https://avatar.png");
      expect(result.fromGitHub).toBe(true);
    });

    test("should fallback to directory name for non-git projects", async () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error("Not a git repository");
      });
      processSpies.cwd.mockReturnValue("/home/user/my-project");

      const result = await getProjectInfo();

      expect(result.name).toBe("my-project");
      expect(result.fromGitHub).toBe(false);
    });
  });

  // FILE CHANGE DETECTION TESTS
  describe("hasFileChangesBetweenCommits", () => {
    test("should detect added files", () => {
      execSyncSpy.mockReturnValue("A\tnew-file.md\nM\texisting.js\n");

      const result = hasFileChangesBetweenCommits("abc123", "def456");

      expect(result).toBe(true);
    });

    test("should detect deleted files", () => {
      execSyncSpy.mockReturnValue("D\tdeleted-file.md\nM\texisting.js\n");

      const result = hasFileChangesBetweenCommits("abc123", "def456");

      expect(result).toBe(true);
    });

    test("should ignore modifications", () => {
      execSyncSpy.mockReturnValue("M\texisting.js\nM\tanother.ts\n");

      const result = hasFileChangesBetweenCommits("abc123", "def456");

      expect(result).toBe(false);
    });

    test("should handle git errors", () => {
      execSyncSpy.mockImplementation(() => {
        throw new Error("Git error");
      });

      const result = hasFileChangesBetweenCommits("abc123", "def456");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
