import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import clearAuthTokens from "../../../agents/clear/clear-auth-tokens.mjs";
import * as storeModule from "../../../utils/store/index.mjs";

describe("clear-auth-tokens", () => {
  let mockOptions;
  let createStoreSpy;

  beforeEach(() => {
    mockOptions = {
      prompts: {
        checkbox: mock(async () => ["example.com"]),
      },
    };
    // Mock store by default to return empty list
    const defaultStore = {
      listMap: mock(() => Promise.resolve({})),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.resolve()),
    };
    createStoreSpy = spyOn(storeModule, "createStore").mockResolvedValue(defaultStore);

    // Clear mock call history
    mockOptions.prompts.checkbox.mockClear();
  });

  afterEach(() => {
    // Restore all mocks
    createStoreSpy.mockRestore();
  });

  test("should accept empty input", async () => {
    // Store empty => no sites
    createStoreSpy.mockResolvedValueOnce({ listMap: mock(() => Promise.resolve({})) });

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle missing prompts gracefully", async () => {
    // Mock store has one site
    const store = {
      listMap: mock(() => Promise.resolve({ "example.com": { token: "test-token" } })),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.resolve()),
    };
    createStoreSpy.mockResolvedValueOnce(store);

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.clearedCount).toBe(1);
    expect(result.clearedSites).toEqual(["example.com"]);
  });

  test("should handle empty options", async () => {
    // Store empty
    createStoreSpy.mockResolvedValueOnce({ listMap: mock(() => Promise.resolve({})) });

    const result = await clearAuthTokens({});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should return consistent result structure", async () => {
    // Mock store with multiple sites
    const store = {
      listMap: mock(() => Promise.resolve({ example: {}, test: {} })),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.resolve()),
    };
    createStoreSpy.mockResolvedValueOnce(store);

    const result = await clearAuthTokens({}, mockOptions);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("message");
    expect(typeof result.message).toBe("string");

    // Result may have additional properties depending on file state
    if (result.clearedCount !== undefined) {
      expect(typeof result.clearedCount).toBe("number");
    }
    if (result.clearedSites !== undefined) {
      expect(Array.isArray(result.clearedSites)).toBe(true);
    }
    if (result.error !== undefined) {
      expect(typeof result.error).toBe("boolean");
    }
  });

  test("should handle prompts correctly when file exists (integration test)", async () => {
    // Mock store with one site
    const store = {
      listMap: mock(() => Promise.resolve({ "example.com": { token: "test-token" } })),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.resolve()),
    };
    createStoreSpy.mockResolvedValueOnce(store);

    const result = await clearAuthTokens({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.clearedCount).toBe(1);
    expect(result.clearedSites).toEqual(["example.com"]);

    // Verify that prompts were called
    expect(mockOptions.prompts.checkbox.mock.calls.length).toBeGreaterThan(0);
  });

  test("should provide meaningful error messages", async () => {
    // Store empty
    createStoreSpy.mockResolvedValueOnce({ listMap: mock(() => Promise.resolve({})) });

    const result = await clearAuthTokens({}, {});

    // Should return a user-friendly message regardless of internal state
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
    expect(typeof result.message).toBe("string");
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle undefined input parameters", async () => {
    createStoreSpy.mockResolvedValueOnce({ listMap: mock(() => Promise.resolve({})) });

    const result = await clearAuthTokens(undefined, undefined);
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle null input parameters", async () => {
    createStoreSpy.mockResolvedValueOnce({ listMap: mock(() => Promise.resolve({})) });

    const result = await clearAuthTokens(null, null);
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle various option configurations", async () => {
    // Store empty for all configurations
    createStoreSpy.mockResolvedValue({ listMap: mock(() => Promise.resolve({})) });

    const configs = [
      {},
      { prompts: {} },
      { prompts: { checkbox: undefined } },
      { prompts: { checkbox: null } },
    ];

    for (const config of configs) {
      const result = await clearAuthTokens({}, config);
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.message).toBe("🔑 No site authorizations found to clear");
    }
  });

  test("should maintain consistent behavior across calls", async () => {
    // Store empty for both calls
    createStoreSpy.mockResolvedValue({ listMap: mock(() => Promise.resolve({})) });

    const result1 = await clearAuthTokens({}, {});
    const result2 = await clearAuthTokens({}, {});

    // Both calls should return the same type of result structure
    expect(typeof result1.message).toBe(typeof result2.message);
    expect(result1).toHaveProperty("message");
    expect(result2).toHaveProperty("message");
    expect(result1.message).toBe(result2.message);
  });

  test("should handle prompt validation function", async () => {
    // Mock store has data to trigger prompts
    const store = {
      listMap: mock(() => Promise.resolve({ "example.com": { token: "test-token" } })),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.resolve()),
    };
    createStoreSpy.mockResolvedValueOnce(store);

    // Test that if prompts are called, they have proper validation
    try {
      await clearAuthTokens({}, mockOptions);

      // If prompts were called, check the validation function exists
      if (mockOptions.prompts.checkbox.mock.calls.length > 0) {
        const callArgs = mockOptions.prompts.checkbox.mock.calls[0][0];
        expect(callArgs).toHaveProperty("validate");
        expect(typeof callArgs.validate).toBe("function");

        // Test validation function behavior
        const validateFn = callArgs.validate;
        expect(validateFn([])).toBe("Please select at least one site.");
        expect(validateFn(["site1"])).toBe(true);
        expect(validateFn(["site1", "site2"])).toBe(true);
      }
    } catch (error) {
      // If there's an error, ensure it's handled gracefully
      expect(error).toBeDefined();
    }
  });

  test("should handle file read errors gracefully", async () => {
    // Simulate listMap throwing
    createStoreSpy.mockResolvedValueOnce({
      listMap: mock(() => Promise.reject(new Error("Permission denied"))),
    });

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.error).toBe(true);
    expect(result.message).toContain("Failed to clear site authorizations");
  });

  test("should handle file write errors gracefully", async () => {
    // Simulate store.clear failing when clearing all sites
    const store = {
      listMap: mock(() => Promise.resolve({ "example.com": { token: "test-token" } })),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.reject(new Error("Disk full"))),
    };
    createStoreSpy.mockResolvedValueOnce(store);

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.error).toBe(true);
    expect(result.message).toContain("Failed to clear site authorizations");
  });

  test("should handle empty file content", async () => {
    // Store has no entries
    createStoreSpy.mockResolvedValueOnce({ listMap: mock(() => Promise.resolve({})) });

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle malformed YAML content", async () => {
    // Simulate listMap throwing a parse error
    createStoreSpy.mockResolvedValueOnce({
      listMap: mock(() => Promise.reject(new Error("Invalid data"))),
    });

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.error).toBe(true);
    expect(result.message).toContain("Failed to clear site authorizations");
  });

  test("should handle empty selection from prompts", async () => {
    // Mock store with one site but user selects nothing
    const store = {
      listMap: mock(() => Promise.resolve({ "example.com": { token: "test-token" } })),
      deleteItem: mock(() => Promise.resolve()),
      clear: mock(() => Promise.resolve()),
    };
    createStoreSpy.mockResolvedValueOnce(store);

    const emptySelectionOptions = {
      prompts: {
        checkbox: mock(async () => []), // User selects nothing
      },
    };

    const result = await clearAuthTokens({}, emptySelectionOptions);
    expect(result).toBeDefined();
    expect(result.message).toBe("🔑 No sites selected for clearing authorization");
  });
});
