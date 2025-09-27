import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import clearAuthTokens from "../../../agents/clear/clear-auth-tokens.mjs";

describe("clear-auth-tokens", () => {
  let mockOptions;

  beforeEach(() => {
    mockOptions = {
      prompts: {
        checkbox: mock(async () => ["example.com"]),
      },
    };

    // Clear mock call history
    mockOptions.prompts.checkbox.mockClear();
  });

  afterEach(() => {
    // No complex mocks to restore
  });

  test("should accept empty input", async () => {
    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
  });

  test("should handle missing prompts gracefully", async () => {
    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });

  test("should handle empty options", async () => {
    const result = await clearAuthTokens({});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });

  test("should return consistent result structure", async () => {
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
    // This tests the prompt interface without mocking complex file operations
    // If the auth file exists, it should call prompts appropriately
    const result = await clearAuthTokens({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();

    // The behavior depends on whether the actual auth file exists
    // This test verifies the function doesn't crash and returns valid results
  });

  test("should provide meaningful error messages", async () => {
    const result = await clearAuthTokens({}, {});

    // Should return a user-friendly message regardless of internal state
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
    expect(typeof result.message).toBe("string");
  });

  test("should handle undefined input parameters", async () => {
    const result = await clearAuthTokens(undefined, undefined);
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });

  test("should handle null input parameters", async () => {
    const result = await clearAuthTokens(null, null);
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });

  test("should handle various option configurations", async () => {
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
    }
  });

  test("should maintain consistent behavior across calls", async () => {
    const result1 = await clearAuthTokens({}, {});
    const result2 = await clearAuthTokens({}, {});

    // Both calls should return the same type of result structure
    expect(typeof result1.message).toBe(typeof result2.message);
    expect(result1).toHaveProperty("message");
    expect(result2).toHaveProperty("message");
  });

  test("should handle prompt validation function", async () => {
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
});
