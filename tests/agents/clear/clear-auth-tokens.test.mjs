import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import clearAuthTokens from "../../../agents/clear/clear-auth-tokens.mjs";

// Mock file system utilities
const mockFs = {
  existsSync: mock(() => true),
};

const mockFsPromises = {
  readFile: mock(() =>
    Promise.resolve("example.com:\n  token: token1\ntest.com:\n  token: token2"),
  ),
  writeFile: mock(() => Promise.resolve()),
};

const mockOs = {
  homedir: mock(() => "/mock/home"),
};

const mockYaml = {
  parse: mock(() => ({
    "example.com": { token: "token1" },
    "test.com": { token: "token2" },
  })),
  stringify: mock((obj) => JSON.stringify(obj)),
};

const mockChalk = {
  cyan: mock((text) => text),
  red: mock((text) => text),
};

describe("clear-auth-tokens", () => {
  let mockOptions;

  beforeEach(() => {
    // Apply module mocks
    mock.module("node:fs", () => mockFs);
    mock.module("node:fs/promises", () => mockFsPromises);
    mock.module("node:os", () => mockOs);
    mock.module("yaml", () => mockYaml);
    mock.module("chalk", () => ({ default: mockChalk }));

    mockOptions = {
      prompts: {
        checkbox: mock(async () => ["example.com"]),
      },
    };

    // Reset mocks
    mockFs.existsSync.mockClear();
    mockFsPromises.readFile.mockClear();
    mockFsPromises.writeFile.mockClear();
    mockOs.homedir.mockClear();
    mockYaml.parse.mockClear();
    mockYaml.stringify.mockClear();
    mockChalk.cyan.mockClear();
    mockChalk.red.mockClear();
    mockOptions.prompts.checkbox.mockClear();

    // Set default implementations
    mockFs.existsSync.mockReturnValue(true);
    mockFsPromises.readFile.mockResolvedValue(
      "example.com:\n  token: token1\ntest.com:\n  token: token2",
    );
    mockFsPromises.writeFile.mockResolvedValue();
    mockOs.homedir.mockReturnValue("/mock/home");
    mockYaml.parse.mockReturnValue({
      "example.com": { token: "token1" },
      "test.com": { token: "token2" },
    });
    mockYaml.stringify.mockImplementation((obj) => JSON.stringify(obj));
  });

  afterEach(() => {
    mock.restore();
  });

  test("should return message when no auth file exists", async () => {
    mockFs.existsSync.mockReturnValue(false);

    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toBe("No site authorizations found to clear");
  });

  test("should return message when auth file is empty", async () => {
    mockYaml.parse.mockReturnValue({});

    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toBe("No site authorizations found to clear");
  });

  test("should clear selected site authorizations", async () => {
    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toContain("Successfully cleared site authorizations!");
    expect(result.clearedCount).toBe(1);
    expect(result.clearedSites).toEqual(["example.com"]);
  });

  test("should clear all site authorizations when __ALL__ selected", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue(["__ALL__"]);

    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toContain("Successfully cleared site authorizations!");
    expect(result.clearedCount).toBe(2);
    expect(result.clearedSites).toEqual(["example.com", "test.com"]);
  });

  test("should prompt user for site selection", async () => {
    await clearAuthTokens({}, mockOptions);

    expect(mockOptions.prompts.checkbox).toHaveBeenCalledWith({
      message: "Select sites to clear authorization from:",
      choices: expect.arrayContaining([
        expect.objectContaining({ value: "example.com" }),
        expect.objectContaining({ value: "test.com" }),
        expect.objectContaining({ value: "__ALL__" }),
      ]),
      validate: expect.any(Function),
    });
  });

  test("should handle no sites selected", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue([]);

    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toBe("No sites selected for clearing authorization");
  });

  test("should clear all sites when no prompts available", async () => {
    const result = await clearAuthTokens({}, {});

    expect(result.message).toContain("Cleared site authorization for all sites (2 sites)");
  });

  test("should handle file read errors", async () => {
    mockFsPromises.readFile.mockRejectedValue(new Error("File read failed"));

    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toBe("Failed to clear site authorizations: File read failed");
    expect(result.error).toBe(true);
  });

  test("should handle file write errors", async () => {
    mockFsPromises.writeFile.mockRejectedValue(new Error("File write failed"));

    const result = await clearAuthTokens({}, mockOptions);

    expect(result.message).toBe("Failed to clear site authorizations: File write failed");
    expect(result.error).toBe(true);
  });
});
