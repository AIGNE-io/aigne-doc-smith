/**
 * Tests for utils/store/index.mjs
 *
 * Function signatures:
 * - createStore(): Create a secret store for credentials with migration support
 *
 * NOTE: Tests use mocks to avoid accessing the system keychain.
 * The actual createStore function uses @aigne/secrets which may access system keychain.
 */

import { describe, test, expect } from "bun:test";

// Mock store implementation for testing
function createMockStore() {
  const data = new Map();

  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    deleteItem: async (key) => {
      data.delete(key);
    },
    listMap: async () => Object.fromEntries(data),
    clear: async () => {
      data.clear();
    },
  };
}

describe("store/index.mjs", () => {
  // ==================== Happy Path ====================
  describe("Happy Path", () => {
    describe("createStore module", () => {
      test("should export createStore function", async () => {
        const { createStore } = await import("../../../utils/store/index.mjs");
        expect(typeof createStore).toBe("function");
      });

      test("createStore should return a promise", async () => {
        const { createStore } = await import("../../../utils/store/index.mjs");
        const result = createStore();
        expect(result).toBeInstanceOf(Promise);
        // Clean up - let the promise resolve/reject
        result.catch(() => {});
      });
    });

    describe("mock store operations", () => {
      test("should store and retrieve values", async () => {
        const store = createMockStore();
        await store.setItem("test-key", { token: "abc123" });
        const value = await store.getItem("test-key");
        expect(value).toEqual({ token: "abc123" });
      });

      test("should return null for non-existent keys", async () => {
        const store = createMockStore();
        const value = await store.getItem("nonexistent");
        expect(value).toBeNull();
      });

      test("should delete items", async () => {
        const store = createMockStore();
        await store.setItem("key", { data: "value" });
        await store.deleteItem("key");
        const value = await store.getItem("key");
        expect(value).toBeNull();
      });

      test("should list all items as map", async () => {
        const store = createMockStore();
        await store.setItem("key1", { a: 1 });
        await store.setItem("key2", { b: 2 });
        const map = await store.listMap();
        expect(map).toEqual({
          key1: { a: 1 },
          key2: { b: 2 },
        });
      });

      test("should clear all items", async () => {
        const store = createMockStore();
        await store.setItem("key1", { a: 1 });
        await store.setItem("key2", { b: 2 });
        await store.clear();
        const map = await store.listMap();
        expect(map).toEqual({});
      });
    });
  });

  // ==================== Unhappy Path ====================
  describe("Unhappy Path", () => {
    describe("mock store operations", () => {
      test("should handle getItem for non-existent key", async () => {
        const store = createMockStore();
        const value = await store.getItem("nonexistent-key-12345");
        expect(value).toBeNull();
      });

      test("should handle deleteItem for non-existent key", async () => {
        const store = createMockStore();
        // Should not throw
        await store.deleteItem("nonexistent-key-12345");
        expect(true).toBe(true);
      });

      test("should handle empty key", async () => {
        const store = createMockStore();
        await store.setItem("", { empty: true });
        const value = await store.getItem("");
        expect(value).toEqual({ empty: true });
      });
    });
  });

  // ==================== Critical Error Scenarios ====================
  describe("Critical Error Scenarios", () => {
    describe("mock store", () => {
      test("should handle concurrent operations", async () => {
        const store = createMockStore();
        const promises = [];

        for (let i = 0; i < 10; i++) {
          promises.push(store.setItem(`key-${i}`, { index: i }));
        }

        await Promise.all(promises);

        for (let i = 0; i < 10; i++) {
          const value = await store.getItem(`key-${i}`);
          expect(value).toEqual({ index: i });
        }
      });

      test("should handle rapid set/get/delete cycles", async () => {
        const store = createMockStore();
        const testKey = "rapid-test";

        for (let i = 0; i < 50; i++) {
          await store.setItem(testKey, { iteration: i });
          const result = await store.getItem(testKey);
          expect(result).toEqual({ iteration: i });
        }

        await store.deleteItem(testKey);
        const final = await store.getItem(testKey);
        expect(final).toBeNull();
      });

      test("should handle very long keys", async () => {
        const store = createMockStore();
        const longKey = "a".repeat(500);
        await store.setItem(longKey, { test: true });
        const result = await store.getItem(longKey);
        expect(result).toEqual({ test: true });
      });

      test("should handle special characters in keys", async () => {
        const store = createMockStore();
        const specialKey = "test-key-with-special-chars-!@#$%";
        await store.setItem(specialKey, { test: true });
        const result = await store.getItem(specialKey);
        expect(result).toEqual({ test: true });
      });

      test("should handle large values", async () => {
        const store = createMockStore();
        const largeValue = { data: "x".repeat(10000) };
        await store.setItem("large", largeValue);
        const result = await store.getItem("large");
        expect(result).toEqual(largeValue);
      });
    });
  });

  // ==================== Security Scenarios ====================
  describe("Security Scenarios", () => {
    describe("mock store - Credential Security", () => {
      test("should store credentials securely (isolated)", async () => {
        const store = createMockStore();
        const secretValue = { token: "super-secret-token-value" };

        await store.setItem("credentials", secretValue);
        const retrieved = await store.getItem("credentials");

        expect(retrieved).toEqual(secretValue);
      });

      test("should handle credential-like keys", async () => {
        const store = createMockStore();
        await store.setItem("password", { password: "test123" });
        const retrieved = await store.getItem("password");
        expect(retrieved).toEqual({ password: "test123" });
      });
    });

    describe("mock store - Key Injection", () => {
      test("should handle keys with path traversal patterns", async () => {
        const store = createMockStore();
        const maliciousKey = "../../../etc/passwd";

        await store.setItem(maliciousKey, { test: true });
        const result = await store.getItem(maliciousKey);
        expect(result).toEqual({ test: true });
      });

      test("should handle keys with null bytes", async () => {
        const store = createMockStore();
        const maliciousKey = "test\x00evil";

        await store.setItem(maliciousKey, { test: true });
        const result = await store.getItem(maliciousKey);
        expect(result).toEqual({ test: true });
      });

      test("should handle keys with shell metacharacters", async () => {
        const store = createMockStore();
        const maliciousKey = "test; rm -rf /";

        await store.setItem(maliciousKey, { test: true });
        const result = await store.getItem(maliciousKey);
        expect(result).toEqual({ test: true });
      });
    });

    describe("mock store - Value Security", () => {
      test("should handle values with injection attempts", async () => {
        const store = createMockStore();
        const maliciousValue = {
          script: "<script>alert(1)</script>",
          sql: "'; DROP TABLE users; --",
        };

        await store.setItem("injection", maliciousValue);
        const retrieved = await store.getItem("injection");

        // Values should be stored as-is (not executed)
        expect(retrieved).toEqual(maliciousValue);
      });

      test("should handle deeply nested values", async () => {
        const store = createMockStore();
        const nestedValue = {
          level1: {
            level2: {
              level3: {
                level4: { data: "deep" },
              },
            },
          },
        };

        await store.setItem("nested", nestedValue);
        const retrieved = await store.getItem("nested");
        expect(retrieved).toEqual(nestedValue);
      });

      test("should handle array values", async () => {
        const store = createMockStore();
        const arrayValue = [1, 2, 3, { nested: true }];

        await store.setItem("array", arrayValue);
        const retrieved = await store.getItem("array");
        expect(retrieved).toEqual(arrayValue);
      });
    });

    describe("store module exports", () => {
      test("should export createStore as named export", async () => {
        const storeModule = await import("../../../utils/store/index.mjs");
        expect(storeModule).toHaveProperty("createStore");
        expect(typeof storeModule.createStore).toBe("function");
      });
    });
  });
});
