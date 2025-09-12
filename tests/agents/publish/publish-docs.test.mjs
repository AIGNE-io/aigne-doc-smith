import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import publishDocs from "../../../agents/publish/publish-docs.mjs";

// Import internal utils for selective spying
import * as authUtils from "../../../utils/auth-utils.mjs";
import * as krokiUtils from "../../../utils/kroki-utils.mjs";
import * as utils from "../../../utils/utils.mjs";

// Mock all external dependencies
const mockPublishDocs = {
  publishDocs: mock(() => Promise.resolve({ success: true, boardId: "new-board-id" })),
};

const mockChalk = {
  bold: mock((text) => text),
  cyan: mock((text) => text),
  blue: mock((text) => text),
  green: mock((text) => text),
  yellow: mock((text) => text),
};

const mockFsExtra = {
  rm: mock(() => Promise.resolve()),
  mkdir: mock(() => Promise.resolve()),
  cp: mock(() => Promise.resolve()),
};

const mockPath = {
  basename: mock(() => "test-project"),
  join: mock((...paths) => paths.join("/")),
};

describe("publish-docs", () => {
  let mockOptions;
  let originalEnv;

  // Spies for internal utils
  let getAccessTokenSpy;
  let beforePublishHookSpy;
  let ensureTmpDirSpy;
  let getGithubRepoUrlSpy;
  let loadConfigFromFileSpy;
  let saveValueToConfigSpy;

  beforeAll(() => {
    // Apply mocks for external dependencies only
    mock.module("@aigne/publish-docs", () => mockPublishDocs);
    mock.module("chalk", () => ({ default: mockChalk }));
    mock.module("fs-extra", () => ({ default: mockFsExtra }));
    mock.module("node:path", () => mockPath);
  });

  afterAll(() => {
    // Restore all mocks when this test file is complete
    mock.restore();
  });

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Reset external mocks and clear call history
    mockPublishDocs.publishDocs.mockClear();
    mockPublishDocs.publishDocs.mockImplementation(() =>
      Promise.resolve({ success: true, boardId: "new-board-id" }),
    );
    mockFsExtra.rm.mockClear();
    mockFsExtra.rm.mockImplementation(() => Promise.resolve());
    mockFsExtra.mkdir.mockClear();
    mockFsExtra.mkdir.mockImplementation(() => Promise.resolve());
    mockFsExtra.cp.mockClear();
    mockFsExtra.cp.mockImplementation(() => Promise.resolve());
    mockPath.basename.mockClear();
    mockPath.basename.mockImplementation(() => "test-project");
    mockPath.join.mockClear();
    mockPath.join.mockImplementation((...paths) => paths.join("/"));
    mockChalk.bold.mockClear();
    mockChalk.bold.mockImplementation((text) => text);
    mockChalk.cyan.mockClear();
    mockChalk.cyan.mockImplementation((text) => text);

    // Set up spies for internal utils
    getAccessTokenSpy = spyOn(authUtils, "getAccessToken").mockResolvedValue("mock-token");
    beforePublishHookSpy = spyOn(krokiUtils, "beforePublishHook").mockResolvedValue();
    ensureTmpDirSpy = spyOn(krokiUtils, "ensureTmpDir").mockResolvedValue();
    getGithubRepoUrlSpy = spyOn(utils, "getGithubRepoUrl").mockReturnValue(
      "https://github.com/user/repo",
    );
    loadConfigFromFileSpy = spyOn(utils, "loadConfigFromFile").mockResolvedValue({});
    saveValueToConfigSpy = spyOn(utils, "saveValueToConfig").mockResolvedValue();

    mockOptions = {
      prompts: {
        select: mock(async () => "default"),
        input: mock(async () => "https://example.com"),
      },
    };

    // Clear prompts mock call history
    mockOptions.prompts.select.mockClear();
    mockOptions.prompts.input.mockClear();

    // Clear environment variable
    delete process.env.DOC_DISCUSS_KIT_URL;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;

    // Restore all spies
    getAccessTokenSpy?.mockRestore();
    beforePublishHookSpy?.mockRestore();
    ensureTmpDirSpy?.mockRestore();
    getGithubRepoUrlSpy?.mockRestore();
    loadConfigFromFileSpy?.mockRestore();
    saveValueToConfigSpy?.mockRestore();
  });

  // BASIC FUNCTIONALITY TESTS
  test("should publish docs successfully with default settings", async () => {
    loadConfigFromFileSpy.mockResolvedValue({ appUrl: "https://docsmith.aigne.io" });

    const result = await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
        boardId: "board-123",
      },
      mockOptions,
    );

    expect(ensureTmpDirSpy).toHaveBeenCalled();
    expect(mockFsExtra.cp).toHaveBeenCalled();
    expect(beforePublishHookSpy).toHaveBeenCalled();
    expect(getAccessTokenSpy).toHaveBeenCalledWith("https://docsmith.aigne.io", "");
    expect(mockPublishDocs.publishDocs).toHaveBeenCalled();
    expect(result.message).toBe("✅ Documentation Published Successfully!");
  });

  // ENVIRONMENT VARIABLE TESTS
  test("should use environment variable DOC_DISCUSS_KIT_URL when set", async () => {
    process.env.DOC_DISCUSS_KIT_URL = "https://env.example.com";

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
      },
      mockOptions,
    );

    expect(getAccessTokenSpy).toHaveBeenCalledWith("https://env.example.com", "");
    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        appUrl: "https://env.example.com",
      }),
    );
    // Should not save appUrl when using environment variable
    expect(saveValueToConfigSpy).not.toHaveBeenCalledWith("appUrl", expect.anything());
  });

  // USER INTERACTION TESTS
  test("should prompt user to select platform when using default URL without config", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});
    mockOptions.prompts.select.mockResolvedValue("default");

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
      },
      mockOptions,
    );

    expect(mockOptions.prompts.select).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Select platform"),
        choices: expect.any(Array),
      }),
    );
  });

  test("should handle custom platform selection", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});
    mockOptions.prompts.select.mockResolvedValue("custom");
    mockOptions.prompts.input.mockResolvedValue("https://custom.example.com");

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
      },
      mockOptions,
    );

    expect(consoleSpy).toHaveBeenCalled();
    expect(mockOptions.prompts.input).toHaveBeenCalledWith({
      message: "Please enter your website URL:",
      validate: expect.any(Function),
    });
    expect(getAccessTokenSpy).toHaveBeenCalledWith("https://custom.example.com", "");
  });

  test("should validate URL input and accept valid URLs", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});
    mockOptions.prompts.select.mockResolvedValue("custom");
    mockOptions.prompts.input.mockResolvedValue("https://valid.example.com");

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
      },
      mockOptions,
    );

    const validateFn = mockOptions.prompts.input.mock.calls[0][0].validate;

    expect(validateFn("https://valid.com")).toBe(true);
    expect(validateFn("valid.com")).toBe(true); // Should work without protocol
    expect(validateFn("")).toBe("Please enter a valid URL");
  });

  test("should add https protocol when not provided in URL", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});
    mockOptions.prompts.select.mockResolvedValue("custom");
    mockOptions.prompts.input.mockResolvedValue("example.com");

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
      },
      mockOptions,
    );

    expect(getAccessTokenSpy).toHaveBeenCalledWith("https://example.com", "");
  });

  // PROJECT INFO TESTS
  test("should use provided project info parameters", async () => {
    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
        projectName: "Test Project",
        projectDesc: "Test Description",
        projectLogo: "logo.png",
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardName: "Test Project",
        boardDesc: "Test Description",
        boardCover: "logo.png",
      }),
    );
  });

  test("should fallback to config values for project info", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      projectName: "Config Project",
      projectDesc: "Config Description",
      projectLogo: "config-logo.png",
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardName: "Config Project",
        boardDesc: "Config Description",
        boardCover: "config-logo.png",
      }),
    );
  });

  test("should use default project name from current directory", async () => {
    mockPath.basename.mockReturnValue("default-project");

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardName: "default-project",
        boardDesc: "",
        boardCover: "",
      }),
    );
  });

  // BOARD META TESTS
  test("should construct board meta correctly", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      documentPurpose: ["API", "Tutorial"],
      locale: "en",
      translateLanguages: ["zh", "ja"],
      lastGitHead: "abc123",
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardMeta: {
          category: ["API", "Tutorial"],
          githubRepoUrl: "https://github.com/user/repo",
          commitSha: "abc123",
          languages: ["en", "zh", "ja"],
        },
      }),
    );
  });

  test("should handle duplicate languages in board meta", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      locale: "en",
      translateLanguages: ["en", "zh", "en"], // Duplicates
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardMeta: expect.objectContaining({
          languages: ["en", "zh"], // Duplicates removed
        }),
      }),
    );
  });

  // CONFIG SAVING TESTS
  test("should save appUrl when not using environment variable", async () => {
    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://custom.example.com",
      },
      mockOptions,
    );

    expect(saveValueToConfigSpy).toHaveBeenCalledWith("appUrl", "https://custom.example.com");
  });

  test("should save new boardId when auto-created", async () => {
    mockPublishDocs.publishDocs.mockResolvedValue({
      success: true,
      boardId: "auto-created-id",
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
        boardId: "original-id",
      },
      mockOptions,
    );

    expect(saveValueToConfigSpy).toHaveBeenCalledWith("boardId", "auto-created-id");
  });

  test("should not save boardId when it hasn't changed", async () => {
    mockPublishDocs.publishDocs.mockResolvedValue({
      success: true,
      boardId: "same-id",
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
        boardId: "same-id",
      },
      mockOptions,
    );

    expect(saveValueToConfigSpy).not.toHaveBeenCalledWith("boardId", expect.anything());
  });

  // ERROR HANDLING TESTS
  test("should handle publish failure", async () => {
    mockPublishDocs.publishDocs.mockRejectedValue(new Error("Publish failed"));

    const result = await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(result.message).toBe("❌ Failed to publish docs: Publish failed");
  });

  test("should handle unsuccessful publish", async () => {
    mockPublishDocs.publishDocs.mockResolvedValue({
      success: false,
      boardId: "failed-id",
    });

    const result = await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(result).toEqual({});
  });

  test("should clean up temporary directory on success", async () => {
    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockFsExtra.rm).toHaveBeenCalledWith(
      expect.stringContaining(".aigne/doc-smith/.tmp/docs"),
      expect.objectContaining({
        recursive: true,
        force: true,
      }),
    );
  });

  test("should clean up temporary directory on error", async () => {
    mockPublishDocs.publishDocs.mockRejectedValue(new Error("Test error"));

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockFsExtra.rm).toHaveBeenCalledWith(
      expect.stringContaining(".aigne/doc-smith/.tmp/docs"),
      expect.objectContaining({
        recursive: true,
        force: true,
      }),
    );
  });

  // FILESYSTEM OPERATION TESTS
  test("should set up temporary directory correctly", async () => {
    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(ensureTmpDirSpy).toHaveBeenCalled();
    expect(mockFsExtra.rm).toHaveBeenCalledWith(
      expect.stringContaining(".aigne/doc-smith/.tmp/docs"),
      expect.objectContaining({ recursive: true, force: true }),
    );
    expect(mockFsExtra.mkdir).toHaveBeenCalledWith(
      expect.stringContaining(".aigne/doc-smith/.tmp/docs"),
      expect.objectContaining({ recursive: true }),
    );
    expect(mockFsExtra.cp).toHaveBeenCalledWith(
      "./docs",
      expect.stringContaining(".aigne/doc-smith/.tmp/docs"),
      expect.objectContaining({ recursive: true }),
    );
  });

  test("should call beforePublishHook with correct docsDir", async () => {
    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(beforePublishHookSpy).toHaveBeenCalledWith({
      docsDir: expect.stringContaining(".aigne/doc-smith/.tmp/docs"),
    });
  });

  test("should set DOC_ROOT_DIR environment variable", async () => {
    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(process.env.DOC_ROOT_DIR).toContain(".aigne/doc-smith/.tmp/docs");
  });

  // EDGE CASES
  test("should handle missing config file", async () => {
    loadConfigFromFileSpy.mockResolvedValue(null);

    const result = await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(result.message).toBe("✅ Documentation Published Successfully!");
  });

  test("should handle empty config", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardMeta: {
          category: [],
          githubRepoUrl: "https://github.com/user/repo",
          commitSha: "",
          languages: [],
        },
      }),
    );
  });

  test("should skip platform selection when appUrl is in config", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      appUrl: "https://existing.com",
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io", // Default URL
      },
      mockOptions,
    );

    expect(mockOptions.prompts.select).not.toHaveBeenCalled();
  });

  test("should handle URL validation edge cases", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});
    mockOptions.prompts.select.mockResolvedValue("custom");

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://docsmith.aigne.io",
      },
      mockOptions,
    );

    const validateFn = mockOptions.prompts.input.mock.calls[0][0].validate;

    expect(validateFn("")).toBe("Please enter a valid URL");
    expect(validateFn(" ")).toBe("Please enter a valid URL");
    expect(validateFn("http://valid.com")).toBe(true);
    expect(validateFn("https://valid.com")).toBe(true);
    expect(validateFn("valid.com")).toBe(true);
  });

  test("should handle parameters priority correctly", async () => {
    // Parameters > Config > Defaults
    loadConfigFromFileSpy.mockResolvedValue({
      projectName: "Config Name",
      projectDesc: "Config Desc",
    });

    await publishDocs(
      {
        docsDir: "./docs",
        appUrl: "https://example.com",
        projectName: "Param Name", // Should override config
        // projectDesc not provided - should use config
      },
      mockOptions,
    );

    expect(mockPublishDocs.publishDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        boardName: "Param Name", // From parameter
        boardDesc: "Config Desc", // From config
        boardCover: "", // Default (empty)
      }),
    );
  });
});
