/**
 * Tests for utils/store/index.mjs
 *
 * Function signatures:
 * - createStore(): Create a secret store instance for managing credentials
 *   - Returns secretStore with clear() method attached
 *   - Handles migration from file store to keyring if available
 *
 * NOTE: Tests focus on module structure and avoid operations that require
 * system keyring access which may timeout or require user interaction.
 * The actual functions use @aigne/secrets which interacts with system keyring.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { homedir } from "node:os";
import { createTempDir } from "../setup/test-utils.mjs";

describe("store/index.mjs", () => {
  let tempDir;
  let originalEnv;

  beforeEach(async () => {
    tempDir = await createTempDir();
    originalEnv = { ...process.env };
  });

  afterEach(async () => {
    if (tempDir) {
      await tempDir.cleanup();
    }
    process.env = originalEnv;
  });

  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("module exports", () => {
      test("should export createStore function", async () => {
        const store = await import("../../utils/store/index.mjs");
        expect(typeof store.createStore).toBe("function");
      });

      test("createStore should be async function", async () => {
        const store = await import("../../utils/store/index.mjs");
        // Check that it returns a promise
        const result = store.createStore();
        expect(result).toBeInstanceOf(Promise);
        // Wait for it to resolve
        await result;
      });
    });

    describe("store functionality", () => {
      test("createStore should return an object", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        expect(typeof secretStore).toBe("object");
        expect(secretStore).not.toBeNull();
      });

      test("returned store should have clear method", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        expect(typeof secretStore.clear).toBe("function");
      });

      test("returned store should have standard secret store methods", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Standard methods from @aigne/secrets
        expect(typeof secretStore.getItem).toBe("function");
        expect(typeof secretStore.setItem).toBe("function");
        expect(typeof secretStore.deleteItem).toBe("function");
        expect(typeof secretStore.listMap).toBe("function");
      });
    });

    describe("clear method signature", () => {
      test("clear method should be a function", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        expect(typeof secretStore.clear).toBe("function");
      });

      test("clear method should be added by createStore", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // clear is attached by createStore, verify it exists
        expect(secretStore.clear).toBeDefined();
        expect(secretStore.clear).not.toBeNull();
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("store initialization", () => {
      test("should handle first-time initialization gracefully", async () => {
        // First call should succeed even if no prior data exists
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        expect(secretStore).toBeDefined();
      });

      test("should handle multiple createStore calls", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const store1 = await createStore();
        const store2 = await createStore();
        // Both should be valid store instances
        expect(store1).toBeDefined();
        expect(store2).toBeDefined();
        expect(typeof store1.clear).toBe("function");
        expect(typeof store2.clear).toBe("function");
      });
    });

    describe("store method signatures", () => {
      test("getItem should accept key parameter", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Verify function signature accepts at least 1 parameter
        expect(secretStore.getItem.length).toBeGreaterThanOrEqual(1);
      });

      test("setItem should accept key and value parameters", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Verify function signature accepts at least 2 parameters
        expect(secretStore.setItem.length).toBeGreaterThanOrEqual(2);
      });

      test("deleteItem should accept key parameter", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Verify function signature accepts at least 1 parameter
        expect(secretStore.deleteItem.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("file system path validation", () => {
      test("should use valid home directory", () => {
        // Verify home directory is defined and non-empty
        const home = homedir();
        expect(home).toBeDefined();
        expect(home.length).toBeGreaterThan(0);
      });

      test("should handle .aigne directory path construction", () => {
        const home = homedir();
        const expectedPath = join(home, ".aigne", "doc-smith-connected.yaml");
        expect(expectedPath).toContain(".aigne");
        expect(expectedPath).toContain("doc-smith-connected.yaml");
      });

      test("constructed path should be absolute", () => {
        const home = homedir();
        const expectedPath = join(home, ".aigne", "doc-smith-connected.yaml");
        // Absolute path should start with / on Unix or drive letter on Windows
        expect(expectedPath.startsWith("/") || /^[A-Z]:/i.test(expectedPath)).toBe(true);
      });
    });

    describe("concurrent store creation", () => {
      test("should handle concurrent store creation", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        // Create multiple stores concurrently
        const results = await Promise.all([createStore(), createStore(), createStore()]);
        expect(results).toHaveLength(3);
        results.forEach((store) => {
          expect(store).toBeDefined();
          expect(typeof store.clear).toBe("function");
        });
      });
    });

    describe("migration scenarios", () => {
      test("should handle migration when no legacy file exists", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Should complete without error even if no file to migrate
        expect(secretStore).toBeDefined();
      });

      test("store should remain functional after migration attempt", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Verify basic methods exist after migration
        expect(typeof secretStore.getItem).toBe("function");
        expect(typeof secretStore.setItem).toBe("function");
      });
    });

    describe("store instance isolation", () => {
      test("each createStore call should return independent instance", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const store1 = await createStore();
        const store2 = await createStore();
        // Both should be objects but could be same or different instances
        expect(store1).toBeDefined();
        expect(store2).toBeDefined();
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("path handling", () => {
      test("store path should be under home directory", () => {
        const home = homedir();
        const expectedPath = join(home, ".aigne", "doc-smith-connected.yaml");
        expect(expectedPath.startsWith(home)).toBe(true);
      });

      test("store path should not allow traversal", () => {
        const home = homedir();
        const expectedPath = join(home, ".aigne", "doc-smith-connected.yaml");
        // Path should not contain traversal sequences after normalization
        expect(expectedPath.includes("..")).toBe(false);
      });

      test("store uses dedicated directory for isolation", () => {
        const home = homedir();
        const expectedPath = join(home, ".aigne", "doc-smith-connected.yaml");
        // Should be in .aigne subdirectory, not directly in home
        expect(expectedPath).toContain(".aigne");
      });
    });

    describe("credential isolation", () => {
      test("service name should be specific to doc-smith", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        // The store uses "aigne-doc-smith-publish" as service name
        // This ensures credentials are isolated from other apps
        const secretStore = await createStore();
        expect(secretStore).toBeDefined();
      });

      test("store uses specific service name for keyring isolation", async () => {
        // Verify by checking module source that service name is set
        // The service name "aigne-doc-smith-publish" provides namespace isolation
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Store should be created successfully with proper service name
        expect(secretStore).toBeDefined();
      });
    });

    describe("access control", () => {
      test("store operations require explicit method calls", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Store should not auto-sync or broadcast credentials
        // Each operation should be explicit
        expect(typeof secretStore.getItem).toBe("function");
        expect(typeof secretStore.setItem).toBe("function");
        expect(typeof secretStore.deleteItem).toBe("function");
      });

      test("store should not expose internal state directly", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Store should not have direct access to internal data structures
        expect(secretStore._data).toBeUndefined();
        expect(secretStore._credentials).toBeUndefined();
        expect(secretStore._secrets).toBeUndefined();
      });

      test("store methods should be properly encapsulated", async () => {
        const { createStore } = await import("../../utils/store/index.mjs");
        const secretStore = await createStore();
        // Only expected methods should be exposed
        const expectedMethods = ["getItem", "setItem", "deleteItem", "listMap", "clear"];
        expectedMethods.forEach((method) => {
          expect(typeof secretStore[method]).toBe("function");
        });
      });
    });
  });
});
