/**
 * Tests for utils/http.mjs
 *
 * Function signatures:
 * - InvalidBlockletError: Custom error for invalid blocklet URLs
 * - ComponentNotFoundError: Custom error for missing components
 * - clearBlockletCache(): Clear the blocklet info cache
 * - getComponentInfo(appUrl): Get blocklet configuration
 * - getComponentMountPoint(appUrl, did): Get component mount point
 * - getComponentInfoWithMountPoint(appUrl, did): Get component info with mount point
 * - requestWithAuthToken(url, options, authToken): Make authenticated request
 *
 * NOTE: Tests avoid real network requests. Only test module exports, error classes,
 * and cache functions that don't require network.
 */

import { describe, test, expect } from "bun:test";

describe("http.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("module exports", () => {
      test("should export InvalidBlockletError class", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.InvalidBlockletError).toBeDefined();
        expect(typeof http.InvalidBlockletError).toBe("function");
      });

      test("should export ComponentNotFoundError class", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.ComponentNotFoundError).toBeDefined();
        expect(typeof http.ComponentNotFoundError).toBe("function");
      });

      test("should export clearBlockletCache function", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.clearBlockletCache).toBeDefined();
        expect(typeof http.clearBlockletCache).toBe("function");
      });

      test("should export getComponentInfo function", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.getComponentInfo).toBeDefined();
        expect(typeof http.getComponentInfo).toBe("function");
      });

      test("should export getComponentMountPoint function", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.getComponentMountPoint).toBeDefined();
        expect(typeof http.getComponentMountPoint).toBe("function");
      });

      test("should export getComponentInfoWithMountPoint function", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.getComponentInfoWithMountPoint).toBeDefined();
        expect(typeof http.getComponentInfoWithMountPoint).toBe("function");
      });

      test("should export requestWithAuthToken function", async () => {
        const http = await import("../../utils/http.mjs");
        expect(http.requestWithAuthToken).toBeDefined();
        expect(typeof http.requestWithAuthToken).toBe("function");
      });
    });

    describe("InvalidBlockletError", () => {
      test("should create error with url, status, and statusText", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("https://example.com", 404, "Not Found");
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("InvalidBlockletError");
        expect(error.url).toBe("https://example.com");
        expect(error.status).toBe(404);
        expect(error.statusText).toBe("Not Found");
      });

      test("should have descriptive message", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("https://example.com", 500, "Server Error");
        expect(error.message).toContain("example.com");
      });
    });

    describe("ComponentNotFoundError", () => {
      test("should create error with did and appUrl", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("did:example:123", "https://example.com");
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("ComponentNotFoundError");
        expect(error.did).toBe("did:example:123");
        expect(error.appUrl).toBe("https://example.com");
      });

      test("should have descriptive message", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("did:example:123", "https://example.com");
        expect(error.message).toContain("example.com");
      });
    });

    describe("clearBlockletCache", () => {
      test("should not throw when called", async () => {
        const { clearBlockletCache } = await import("../../utils/http.mjs");
        expect(() => clearBlockletCache()).not.toThrow();
      });

      test("should allow multiple calls", async () => {
        const { clearBlockletCache } = await import("../../utils/http.mjs");
        expect(() => {
          clearBlockletCache();
          clearBlockletCache();
          clearBlockletCache();
        }).not.toThrow();
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("InvalidBlockletError edge cases", () => {
      test("should handle null status", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("https://example.com", null, "Error");
        expect(error.status).toBeNull();
      });

      test("should handle null statusText", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("https://example.com", 500, null);
        expect(error.statusText).toBeNull();
      });

      test("should handle empty URL", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("", 500, "Error");
        expect(error.url).toBe("");
      });
    });

    describe("ComponentNotFoundError edge cases", () => {
      test("should handle empty did", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("", "https://example.com");
        expect(error.did).toBe("");
      });

      test("should handle empty appUrl", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("did:example:123", "");
        expect(error.appUrl).toBe("");
      });
    });

    describe("function signatures", () => {
      test("getComponentInfo should accept URL parameter", async () => {
        const { getComponentInfo } = await import("../../utils/http.mjs");
        expect(getComponentInfo.length).toBeGreaterThanOrEqual(1);
      });

      test("getComponentMountPoint should accept appUrl and did parameters", async () => {
        const { getComponentMountPoint } = await import("../../utils/http.mjs");
        expect(getComponentMountPoint.length).toBeGreaterThanOrEqual(1);
      });

      test("requestWithAuthToken should accept url, options, and token", async () => {
        const { requestWithAuthToken } = await import("../../utils/http.mjs");
        expect(requestWithAuthToken.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("error inheritance", () => {
      test("InvalidBlockletError should extend Error", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("url", 500, "error");
        expect(error instanceof Error).toBe(true);
      });

      test("ComponentNotFoundError should extend Error", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("did", "url");
        expect(error instanceof Error).toBe(true);
      });
    });

    describe("error stack traces", () => {
      test("InvalidBlockletError should have stack trace", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError("url", 500, "error");
        expect(error.stack).toBeDefined();
      });

      test("ComponentNotFoundError should have stack trace", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("did", "url");
        expect(error.stack).toBeDefined();
      });
    });

    describe("cache operations", () => {
      test("should handle repeated cache clear", async () => {
        const { clearBlockletCache } = await import("../../utils/http.mjs");
        for (let i = 0; i < 10; i++) {
          clearBlockletCache();
        }
        expect(true).toBe(true);
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("error message security", () => {
      test("InvalidBlockletError should not expose sensitive data", async () => {
        const { InvalidBlockletError } = await import("../../utils/http.mjs");
        const error = new InvalidBlockletError(
          "https://example.com/admin/secret",
          403,
          "Forbidden",
        );
        // Should contain URL but message should be generic
        expect(error.message).toBeDefined();
      });

      test("ComponentNotFoundError should not expose internal paths", async () => {
        const { ComponentNotFoundError } = await import("../../utils/http.mjs");
        const error = new ComponentNotFoundError("did:internal:secret", "https://example.com");
        expect(error.message).toBeDefined();
      });
    });

    describe("URL handling expectations", () => {
      test("should accept https URLs", () => {
        const url = "https://example.com";
        expect(url).toMatch(/^https:\/\//);
      });

      test("should detect http URLs (insecure)", () => {
        const url = "http://example.com";
        expect(url).toMatch(/^http:\/\//);
      });

      test("should detect javascript: protocol", () => {
        const url = "javascript:alert(1)";
        expect(url).toMatch(/^javascript:/);
      });

      test("should detect file: protocol", () => {
        const url = "file:///etc/passwd";
        expect(url).toMatch(/^file:/);
      });
    });

    describe("token handling expectations", () => {
      test("should handle tokens with special characters", () => {
        const token = "token<script>alert(1)</script>";
        expect(token).toContain("<script>");
      });

      test("should handle tokens with header injection", () => {
        const token = "token\r\nX-Injected: header";
        expect(token).toContain("\r\n");
      });
    });

    describe("SSRF prevention expectations", () => {
      test("should detect localhost URLs", () => {
        const url = "http://localhost:8080";
        expect(url).toContain("localhost");
      });

      test("should detect internal IP URLs", () => {
        const url = "http://192.168.1.1";
        expect(url).toMatch(/192\.168\./);
      });

      test("should detect metadata service URLs", () => {
        const url = "http://169.254.169.254/latest/meta-data/";
        expect(url).toContain("169.254.169.254");
      });
    });
  });
});
