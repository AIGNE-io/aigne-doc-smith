import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import {
  clearBlockletCache,
  ComponentNotFoundError,
  getComponentInfo,
  getComponentInfoWithMountPoint,
  getComponentMountPoint,
  InvalidBlockletError,
} from "../../utils/blocklet.mjs";

describe("blocklet", () => {
  let mockFetch;
  let originalDateNow;

  beforeEach(() => {
    // Clear cache before each test
    clearBlockletCache();

    // Mock global fetch
    mockFetch = spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "test-repo", description: "Test repo" }),
      statusText: "OK",
    });

    // Mock Date.now for cache testing
    originalDateNow = Date.now;
    Date.now = () => 1000000000;
  });

  afterEach(() => {
    mockFetch?.mockRestore();
    Date.now = originalDateNow;

    // Clear cache after each test
    clearBlockletCache();
  });

  // ERROR CLASSES TESTS
  describe("InvalidBlockletError", () => {
    test("should create error with correct properties", () => {
      const url = "https://example.com";
      const status = 404;
      const statusText = "Not Found";

      const error = new InvalidBlockletError(url, status, statusText);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InvalidBlockletError");
      expect(error.message).toBe(
        'The application URL "https://example.com" is invalid. I was unable to fetch the configuration.',
      );
      expect(error.url).toBe(url);
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    });

    test("should handle null status and statusText", () => {
      const url = "https://example.com";

      const error = new InvalidBlockletError(url, null, "Network error");

      expect(error.url).toBe(url);
      expect(error.status).toBeNull();
      expect(error.statusText).toBe("Network error");
    });

    test("should be instanceof Error", () => {
      const error = new InvalidBlockletError("https://example.com");
      expect(error instanceof Error).toBe(true);
      expect(error instanceof InvalidBlockletError).toBe(true);
    });
  });

  describe("ComponentNotFoundError", () => {
    test("should create error with correct properties", () => {
      const did = "z8ia28nJVd6UMcS4dcJf5NLhv3rLmrFCK";
      const appUrl = "https://example.com";

      const error = new ComponentNotFoundError(did, appUrl);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ComponentNotFoundError");
      expect(error.message).toBe(
        'Your website "https://example.com" is missing a required component to host your documentation.',
      );
      expect(error.did).toBe(did);
      expect(error.appUrl).toBe(appUrl);
    });

    test("should be instanceof Error", () => {
      const error = new ComponentNotFoundError("test-did", "https://example.com");
      expect(error instanceof Error).toBe(true);
      expect(error instanceof ComponentNotFoundError).toBe(true);
    });
  });

  // GETCOMPONENTINFO FUNCTION TESTS
  describe("getComponentInfo", () => {
    const testAppUrl = "https://example.com";
    const expectedUrl = "https://example.com/__blocklet__.js?type=json";

    test("should fetch and return blocklet info", async () => {
      const mockConfig = {
        name: "test-blocklet",
        version: "1.0.0",
        componentMountPoints: [{ did: "test-did", mountPoint: "/api" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentInfo(testAppUrl);

      expect(result).toEqual(mockConfig);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    });

    test("should cache blocklet info for 10 minutes", async () => {
      const mockConfig = {
        name: "test-blocklet",
        componentMountPoints: [{ did: "test-did", mountPoint: "/api" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      // First call - should fetch
      const result1 = await getComponentInfo(testAppUrl);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1.name).toBe("test-blocklet");

      // Second call - should use cache
      const result2 = await getComponentInfo(testAppUrl);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, no new fetch
      expect(result2.name).toBe("test-blocklet");

      // Cache should not include the timestamp in returned object
      expect(result2.__blocklet_info_cache_timestamp).toBeUndefined();
    });

    test("should refresh cache after 10 minutes", async () => {
      const mockConfig1 = { name: "test-blocklet-v1" };
      const mockConfig2 = { name: "test-blocklet-v2" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig1),
      });

      // First call
      const result1 = await getComponentInfo(testAppUrl);
      expect(result1.name).toBe("test-blocklet-v1");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time by 11 minutes
      Date.now = () => 1000000000 + 11 * 60 * 1000;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig2),
      });

      // Second call - should fetch again due to cache expiration
      const result2 = await getComponentInfo(testAppUrl);
      expect(result2.name).toBe("test-blocklet-v2");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test("should not refresh cache within 10 minutes", async () => {
      const mockConfig = { name: "test-blocklet" };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      // First call
      await getComponentInfo(testAppUrl);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time by 5 minutes (within cache window)
      Date.now = () => 1000000000 + 5 * 60 * 1000;

      // Second call - should use cache
      await getComponentInfo(testAppUrl);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("should cache different URLs separately", async () => {
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";

      const mockConfig1 = { name: "blocklet-1" };
      const mockConfig2 = { name: "blocklet-2" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig1),
      });

      const result1 = await getComponentInfo(url1);
      expect(result1.name).toBe("blocklet-1");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig2),
      });

      const result2 = await getComponentInfo(url2);
      expect(result2.name).toBe("blocklet-2");

      // Both should have been fetched
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Calling again should use cache for each URL
      await getComponentInfo(url1);
      await getComponentInfo(url2);
      expect(mockFetch).toHaveBeenCalledTimes(2); // No additional fetches
    });

    test("should throw InvalidBlockletError when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network timeout"));

      await expect(getComponentInfo(testAppUrl)).rejects.toThrow(InvalidBlockletError);

      try {
        await getComponentInfo(testAppUrl);
      } catch (error) {
        expect(error.url).toBe(testAppUrl);
        expect(error.status).toBeNull();
        expect(error.statusText).toBe("Network timeout");
      }
    });

    test("should throw InvalidBlockletError when response is not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getComponentInfo(testAppUrl)).rejects.toThrow(InvalidBlockletError);

      try {
        await getComponentInfo(testAppUrl);
      } catch (error) {
        expect(error.url).toBe(testAppUrl);
        expect(error.status).toBe(404);
        expect(error.statusText).toBe("Not Found");
      }
    });

    test("should throw InvalidBlockletError when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(getComponentInfo(testAppUrl)).rejects.toThrow(InvalidBlockletError);

      try {
        await getComponentInfo(testAppUrl);
      } catch (error) {
        expect(error.url).toBe(testAppUrl);
        expect(error.status).toBeNull();
        expect(error.statusText).toBe("The server returned an invalid JSON response.");
      }
    });

    test("should not cache failed requests", async () => {
      // First call - network error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getComponentInfo(testAppUrl)).rejects.toThrow(InvalidBlockletError);

      // Second call - should try to fetch again (not use a cached error)
      const mockConfig = { name: "test-blocklet" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentInfo(testAppUrl);
      expect(result.name).toBe("test-blocklet");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  // GETCOMPONENTMOUNTPOINT FUNCTION TESTS
  describe("getComponentMountPoint", () => {
    const testAppUrl = "https://example.com";
    const testDid = "z8ia28nJVd6UMcS4dcJf5NLhv3rLmrFCK";
    const expectedUrl = "https://example.com/__blocklet__.js?type=json";

    test("should return mount point for existing component", async () => {
      const mockConfig = {
        componentMountPoints: [
          { did: "other-did", mountPoint: "/other" },
          { did: testDid, mountPoint: "/api/discuss" },
          { did: "another-did", mountPoint: "/another" },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);

      expect(result).toBe("/api/discuss");
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    });

    test("should use cached component info", async () => {
      const mockConfig = {
        componentMountPoints: [{ did: testDid, mountPoint: "/api/discuss" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      // First call
      await getComponentMountPoint(testAppUrl, testDid);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await getComponentMountPoint(testAppUrl, testDid);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // NETWORK ERROR TESTS
    test("should throw InvalidBlockletError when fetch fails", async () => {
      mockFetch.mockRejectedValue(new Error("Network timeout"));

      await expect(getComponentMountPoint(testAppUrl, testDid)).rejects.toThrow(
        InvalidBlockletError,
      );

      try {
        await getComponentMountPoint(testAppUrl, testDid);
      } catch (error) {
        expect(error.url).toBe(testAppUrl);
        expect(error.status).toBeNull();
        expect(error.statusText).toBe("Network timeout");
      }
    });

    test("should throw InvalidBlockletError when response is not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getComponentMountPoint(testAppUrl, testDid)).rejects.toThrow(
        InvalidBlockletError,
      );

      try {
        await getComponentMountPoint(testAppUrl, testDid);
      } catch (error) {
        expect(error.url).toBe(testAppUrl);
        expect(error.status).toBe(404);
        expect(error.statusText).toBe("Not Found");
      }
    });

    test("should throw InvalidBlockletError when JSON parsing fails", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(getComponentMountPoint(testAppUrl, testDid)).rejects.toThrow(
        InvalidBlockletError,
      );

      try {
        await getComponentMountPoint(testAppUrl, testDid);
      } catch (error) {
        expect(error.url).toBe(testAppUrl);
        expect(error.status).toBeNull();
        expect(error.statusText).toBe("The server returned an invalid JSON response.");
      }
    });

    // COMPONENT NOT FOUND TESTS
    test("should throw ComponentNotFoundError when component is not found", async () => {
      const mockConfig = {
        componentMountPoints: [
          { did: "other-did", mountPoint: "/other" },
          { did: "another-did", mountPoint: "/another" },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      await expect(getComponentMountPoint(testAppUrl, testDid)).rejects.toThrow(
        ComponentNotFoundError,
      );

      try {
        await getComponentMountPoint(testAppUrl, testDid);
      } catch (error) {
        expect(error.did).toBe(testDid);
        expect(error.appUrl).toBe(testAppUrl);
      }
    });

    test("should throw ComponentNotFoundError when componentMountPoints is undefined", async () => {
      const mockConfig = {};

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      await expect(getComponentMountPoint(testAppUrl, testDid)).rejects.toThrow(
        ComponentNotFoundError,
      );
    });

    test("should throw ComponentNotFoundError when componentMountPoints is empty", async () => {
      const mockConfig = {
        componentMountPoints: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      await expect(getComponentMountPoint(testAppUrl, testDid)).rejects.toThrow(
        ComponentNotFoundError,
      );
    });

    // EDGE CASES
    test("should handle component at the beginning of array", async () => {
      const mockConfig = {
        componentMountPoints: [
          { did: testDid, mountPoint: "/first" },
          { did: "other-did", mountPoint: "/other" },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);
      expect(result).toBe("/first");
    });

    test("should handle component at the end of array", async () => {
      const mockConfig = {
        componentMountPoints: [
          { did: "other-did", mountPoint: "/other" },
          { did: testDid, mountPoint: "/last" },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);
      expect(result).toBe("/last");
    });

    test("should handle single component", async () => {
      const mockConfig = {
        componentMountPoints: [{ did: testDid, mountPoint: "/single" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);
      expect(result).toBe("/single");
    });

    test("should handle complex mount points", async () => {
      const mockConfig = {
        componentMountPoints: [{ did: testDid, mountPoint: "/api/v1/discuss-kit/endpoint" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);
      expect(result).toBe("/api/v1/discuss-kit/endpoint");
    });

    test("should handle empty mount point", async () => {
      const mockConfig = {
        componentMountPoints: [{ did: testDid, mountPoint: "" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);
      expect(result).toBe("");
    });

    test("should handle null/undefined mount point", async () => {
      const mockConfig = {
        componentMountPoints: [{ did: testDid, mountPoint: null }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentMountPoint(testAppUrl, testDid);
      expect(result).toBeNull();
    });

    // NETWORK TIMEOUT AND RETRY SCENARIOS
    test("should handle network errors with different error types", async () => {
      const errorTypes = [
        new TypeError("Failed to fetch"),
        new Error("Connection refused"),
        new Error("Timeout"),
        new ReferenceError("Network error"),
      ];

      for (const error of errorTypes) {
        mockFetch.mockRejectedValueOnce(error);

        try {
          await getComponentMountPoint(testAppUrl, testDid);
          expect(true).toBe(false); // Should not reach here
        } catch (caughtError) {
          expect(caughtError).toBeInstanceOf(InvalidBlockletError);
          expect(caughtError.url).toBe(testAppUrl);
          expect(caughtError.status).toBeNull();
          expect(caughtError.statusText).toBe(error.message);
        }
      }
    });
  });

  // GETCOMPONENTINFOWITHMOUNTPOINT FUNCTION TESTS
  describe("getComponentInfoWithMountPoint", () => {
    const testAppUrl = "https://example.com";
    const testDid = "z8ia28nJVd6UMcS4dcJf5NLhv3rLmrFCK";

    test("should return config with mount point", async () => {
      const mockConfig = {
        name: "test-blocklet",
        version: "1.0.0",
        componentMountPoints: [
          { did: "other-did", mountPoint: "/other" },
          { did: testDid, mountPoint: "/api/discuss" },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await getComponentInfoWithMountPoint(testAppUrl, testDid);

      expect(result.name).toBe("test-blocklet");
      expect(result.version).toBe("1.0.0");
      expect(result.mountPoint).toBe("/api/discuss");
      expect(result.componentMountPoints).toBeDefined();
    });

    test("should use cached component info", async () => {
      const mockConfig = {
        name: "test-blocklet",
        componentMountPoints: [{ did: testDid, mountPoint: "/api" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      // First call
      await getComponentInfoWithMountPoint(testAppUrl, testDid);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await getComponentInfoWithMountPoint(testAppUrl, testDid);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test("should throw ComponentNotFoundError when component not found", async () => {
      const mockConfig = {
        name: "test-blocklet",
        componentMountPoints: [{ did: "other-did", mountPoint: "/other" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      await expect(getComponentInfoWithMountPoint(testAppUrl, testDid)).rejects.toThrow(
        ComponentNotFoundError,
      );
    });

    test("should throw InvalidBlockletError on fetch failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(getComponentInfoWithMountPoint(testAppUrl, testDid)).rejects.toThrow(
        InvalidBlockletError,
      );
    });
  });
});
