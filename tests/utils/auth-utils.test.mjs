import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as yaml from "yaml";
import { getAccessToken } from "../../utils/auth-utils.mjs";
import * as blockletUtils from "../../utils/blocklet.mjs";

// Mock external modules that involve network requests
const mockCreateConnect = mock(() => Promise.resolve({ accessKeySecret: "new-access-token" }));
const mockOpen = mock(() => Promise.resolve());
const mockJoinURL = mock((base, path) => `${base}${path}`);

mock.module("@aigne/cli/utils/aigne-hub/credential.js", () => ({
  createConnect: mockCreateConnect,
}));
mock.module("open", () => ({ default: mockOpen }));
mock.module("join-url", () => ({ default: mockJoinURL }));

describe("auth-utils", () => {
  let originalEnv;
  let existsSyncSpy;
  let readFileSpy;
  let writeFileSpy;
  let mkdirSyncSpy;
  let homedirSpy;
  let joinSpy;
  let parseSpy;
  let stringifySpy;
  let getComponentMountPointSpy;
  let consoleWarnSpy;
  let consoleDebugSpy;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN;

    // Reset mock implementations
    mockCreateConnect.mockClear();
    mockCreateConnect.mockImplementation(() =>
      Promise.resolve({ accessKeySecret: "new-access-token" }),
    );
    mockOpen.mockClear();
    mockOpen.mockImplementation(() => Promise.resolve());
    mockJoinURL.mockClear();
    mockJoinURL.mockImplementation((base, path) => `${base}${path}`);

    // Spy on filesystem operations
    existsSyncSpy = spyOn(fs, "existsSync").mockReturnValue(false);
    readFileSpy = spyOn(fsPromises, "readFile").mockResolvedValue("");
    writeFileSpy = spyOn(fsPromises, "writeFile").mockResolvedValue();
    mkdirSyncSpy = spyOn(fs, "mkdirSync").mockImplementation(() => {});

    // Spy on path operations
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/mock/home");
    joinSpy = spyOn(path, "join").mockImplementation((...paths) => paths.join("/"));

    // Spy on YAML operations
    parseSpy = spyOn(yaml, "parse").mockReturnValue({});
    stringifySpy = spyOn(yaml, "stringify").mockReturnValue("mock yaml");

    // Spy on blocklet operations
    getComponentMountPointSpy = spyOn(blockletUtils, "getComponentMountPoint").mockResolvedValue();

    // Spy on console methods
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
    consoleDebugSpy = spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;

    // Restore all spies
    existsSyncSpy?.mockRestore();
    readFileSpy?.mockRestore();
    writeFileSpy?.mockRestore();
    mkdirSyncSpy?.mockRestore();
    homedirSpy?.mockRestore();
    joinSpy?.mockRestore();
    parseSpy?.mockRestore();
    stringifySpy?.mockRestore();
    getComponentMountPointSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
    consoleDebugSpy?.mockRestore();
  });

  test("should return access token from environment variable", async () => {
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = "env-token";

    const result = await getAccessToken("https://example.com");

    expect(result).toBe("env-token");
  });

  test("should handle different URL formats", async () => {
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = "test-token";

    // Test different URL formats
    const urls = [
      "https://example.com",
      "http://example.com",
      "https://example.com:8080",
      "https://sub.example.com/path",
    ];

    for (const url of urls) {
      const result = await getAccessToken(url);
      expect(result).toBe("test-token");
    }
  });

  test("should handle invalid URL", async () => {
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = "test-token";

    await expect(getAccessToken("invalid-url")).rejects.toThrow();
  });

  test("should work with localhost URLs", async () => {
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = "local-token";

    const result = await getAccessToken("http://localhost:3000");

    expect(result).toBe("local-token");
  });

  test("should preserve environment variable after function call", async () => {
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = "persistent-token";

    await getAccessToken("https://example.com");

    expect(process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN).toBe("persistent-token");
  });

  // CONFIG FILE READING TESTS
  test("should read access token from config file", async () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue("DOC_DISCUSS_KIT_ACCESS_TOKEN: config-token");
    parseSpy.mockReturnValue({
      "example.com": {
        DOC_DISCUSS_KIT_ACCESS_TOKEN: "config-token",
      },
    });

    const result = await getAccessToken("https://example.com");

    expect(result).toBe("config-token");
    expect(joinSpy).toHaveBeenCalledWith("/mock/home", ".aigne", "doc-smith-connected.yaml");
    expect(existsSyncSpy).toHaveBeenCalledWith("/mock/home/.aigne/doc-smith-connected.yaml");
    expect(readFileSpy).toHaveBeenCalledWith("/mock/home/.aigne/doc-smith-connected.yaml", "utf8");
    expect(parseSpy).toHaveBeenCalled();
  });

  test("should handle config file without token field", async () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue("other: value");
    parseSpy.mockReturnValue({
      "example.com": {
        other: "value",
      },
    });

    // Since we now have successful authorization flow mocked, this should succeed
    const result = await getAccessToken("https://example.com");
    expect(result).toBe("new-access-token");
    expect(getComponentMountPointSpy).toHaveBeenCalled();
  });

  test("should handle missing hostname in config", async () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue("DOC_DISCUSS_KIT_ACCESS_TOKEN: token");
    parseSpy.mockReturnValue({
      "other-domain.com": {
        DOC_DISCUSS_KIT_ACCESS_TOKEN: "other-token",
      },
    });

    // Since we now have successful authorization flow mocked, this should succeed
    const result = await getAccessToken("https://example.com");
    expect(result).toBe("new-access-token");
    expect(getComponentMountPointSpy).toHaveBeenCalled();
  });

  test("should handle config file read errors", async () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockRejectedValue(new Error("File read error"));
    // Make createConnect fail to test the error path
    mockCreateConnect.mockRejectedValueOnce(new Error("Network error"));

    await expect(getAccessToken("https://example.com")).rejects.toThrow(
      "Failed to obtain access token. Please check your network connection and try again later.",
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith("Failed to read config file:", "File read error");
  });

  test("should handle config file without DOC_DISCUSS_KIT_ACCESS_TOKEN keyword", async () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue("some other content");

    // Should succeed with authorization flow
    const result = await getAccessToken("https://example.com");
    expect(result).toBe("new-access-token");
    // Verify that the config file was read but the flow proceeded to authorization
    expect(readFileSpy).toHaveBeenCalled();
  });

  // ERROR HANDLING TESTS
  test("should throw error for invalid blocklet", async () => {
    const InvalidBlockletError = (await import("../../utils/blocklet.mjs")).InvalidBlockletError;
    getComponentMountPointSpy.mockRejectedValue(new InvalidBlockletError());

    await expect(getAccessToken("https://example.com")).rejects.toThrow(
      "The provided URL is not a valid website on ArcBlock platform",
    );
  });

  test("should throw error for missing component", async () => {
    const ComponentNotFoundError = (await import("../../utils/blocklet.mjs"))
      .ComponentNotFoundError;
    getComponentMountPointSpy.mockRejectedValue(new ComponentNotFoundError());

    await expect(getAccessToken("https://example.com")).rejects.toThrow(
      "This website does not have required components for publishing",
    );
  });

  test("should throw error for network issues", async () => {
    getComponentMountPointSpy.mockRejectedValue(new Error("Network error"));

    await expect(getAccessToken("https://example.com")).rejects.toThrow("Unable to connect to:");
  });

  // AUTHORIZATION FLOW TESTS
  test("should successfully complete authorization flow", async () => {
    // Mock successful component check
    getComponentMountPointSpy.mockResolvedValue({ endpoint: "https://example.com/api" });

    const result = await getAccessToken("https://example.com");

    expect(result).toBe("new-access-token");

    // Verify the authorization flow
    expect(getComponentMountPointSpy).toHaveBeenCalledWith(
      "https://example.com",
      expect.any(String),
    );
    expect(mockCreateConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        connectAction: "gen-simple-access-key",
        source: "AIGNE DocSmith connect to Discuss Kit",
        closeOnSuccess: true,
        appName: "AIGNE DocSmith",
        openPage: expect.any(Function),
      }),
    );

    // Verify environment variable is set
    expect(process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN).toBe("new-access-token");

    // Verify config file is saved
    expect(writeFileSpy).toHaveBeenCalledWith(
      "/mock/home/.aigne/doc-smith-connected.yaml",
      "mock yaml",
    );
    expect(stringifySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        "example.com": {
          DOC_DISCUSS_KIT_ACCESS_TOKEN: "new-access-token",
          DOC_DISCUSS_KIT_URL: "https://example.com",
        },
      }),
    );
  });

  test("should create .aigne directory if it doesn't exist", async () => {
    getComponentMountPointSpy.mockResolvedValue({ endpoint: "https://example.com/api" });
    existsSyncSpy.mockReturnValueOnce(false); // .aigne directory doesn't exist

    const result = await getAccessToken("https://example.com");

    expect(result).toBe("new-access-token");
    expect(mkdirSyncSpy).toHaveBeenCalledWith("/mock/home/.aigne", { recursive: true });
  });

  test("should merge with existing config file", async () => {
    getComponentMountPointSpy.mockResolvedValue({ endpoint: "https://example.com/api" });
    existsSyncSpy
      .mockReturnValueOnce(true) // .aigne directory exists
      .mockReturnValueOnce(true); // config file exists at save time
    readFileSpy.mockResolvedValue("other.com:\n  token: other-token");
    parseSpy.mockReturnValue({ "other.com": { token: "other-token" } });

    const result = await getAccessToken("https://example.com");

    expect(result).toBe("new-access-token");
    expect(stringifySpy).toHaveBeenCalled();
    // Verify that config file writing was attempted
    expect(writeFileSpy).toHaveBeenCalled();
  });

  test("should call openPage function with correct URL", async () => {
    getComponentMountPointSpy.mockResolvedValue({ endpoint: "https://example.com/api" });

    let capturedOpenPage;
    mockCreateConnect.mockImplementation((options) => {
      capturedOpenPage = options.openPage;
      return Promise.resolve({ accessKeySecret: "new-access-token" });
    });

    const result = await getAccessToken("https://example.com");

    expect(result).toBe("new-access-token");
    expect(typeof capturedOpenPage).toBe("function");

    // Test that openPage calls the mock open function
    await capturedOpenPage("https://auth.example.com");
    expect(mockOpen).toHaveBeenCalledWith("https://auth.example.com/");
  });

  test("should handle authorization failure", async () => {
    getComponentMountPointSpy.mockResolvedValue({ endpoint: "https://example.com/api" });
    mockCreateConnect.mockRejectedValue(new Error("Authorization failed"));

    await expect(getAccessToken("https://example.com")).rejects.toThrow(
      "Failed to obtain access token. Please check your network connection and try again later.",
    );
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  test("should handle createConnect with different error types", async () => {
    getComponentMountPointSpy.mockResolvedValue({ endpoint: "https://example.com/api" });
    mockCreateConnect.mockRejectedValue(new TypeError("Network error"));

    await expect(getAccessToken("https://example.com")).rejects.toThrow(
      "Failed to obtain access token. Please check your network connection and try again later.",
    );
  });
});
