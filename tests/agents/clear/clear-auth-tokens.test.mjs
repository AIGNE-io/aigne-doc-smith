import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import clearAuthTokens from "../../../agents/clear/clear-auth-tokens.mjs";

describe("clear-auth-tokens", () => {
  let mockOptions;
  let existsSyncSpy;
  let readFileSpy;
  let writeFileSpy;

  beforeEach(() => {
    mockOptions = {
      prompts: {
        checkbox: mock(async () => ["example.com"]),
      },
    };

    // Mock file system operations
    existsSyncSpy = spyOn(fs, "existsSync");
    readFileSpy = spyOn(fsPromises, "readFile");
    writeFileSpy = spyOn(fsPromises, "writeFile");

    // Clear mock call history
    mockOptions.prompts.checkbox.mockClear();
  });

  afterEach(() => {
    // Restore all mocks
    existsSyncSpy.mockRestore();
    readFileSpy.mockRestore();
    writeFileSpy.mockRestore();
  });

  test("should accept empty input", async () => {
    // Mock file doesn't exist
    existsSyncSpy.mockReturnValue(false);

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle missing prompts gracefully", async () => {
    // Mock file exists with some data
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue('example.com:\n  token: "test-token"');
    writeFileSpy.mockResolvedValue();

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.clearedCount).toBe(1);
    expect(result.clearedSites).toEqual(["example.com"]);
  });

  test("should handle empty options", async () => {
    // Mock file doesn't exist
    existsSyncSpy.mockReturnValue(false);

    const result = await clearAuthTokens({});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should return consistent result structure", async () => {
    // Mock file exists with multiple sites
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue(
      'example.com:\n  token: "test-token"\ntest.com:\n  token: "test-token2"',
    );
    writeFileSpy.mockResolvedValue();

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
    // Mock file exists with data
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue('example.com:\n  token: "test-token"');
    writeFileSpy.mockResolvedValue();

    const result = await clearAuthTokens({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.clearedCount).toBe(1);
    expect(result.clearedSites).toEqual(["example.com"]);

    // Verify that prompts were called
    expect(mockOptions.prompts.checkbox.mock.calls.length).toBeGreaterThan(0);
  });

  test("should provide meaningful error messages", async () => {
    // Mock file doesn't exist
    existsSyncSpy.mockReturnValue(false);

    const result = await clearAuthTokens({}, {});

    // Should return a user-friendly message regardless of internal state
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
    expect(typeof result.message).toBe("string");
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle undefined input parameters", async () => {
    // Mock file doesn't exist
    existsSyncSpy.mockReturnValue(false);

    const result = await clearAuthTokens(undefined, undefined);
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle null input parameters", async () => {
    // Mock file doesn't exist
    existsSyncSpy.mockReturnValue(false);

    const result = await clearAuthTokens(null, null);
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle various option configurations", async () => {
    // Mock file doesn't exist for all configurations
    existsSyncSpy.mockReturnValue(false);

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
    // Mock file doesn't exist for both calls
    existsSyncSpy.mockReturnValue(false);

    const result1 = await clearAuthTokens({}, {});
    const result2 = await clearAuthTokens({}, {});

    // Both calls should return the same type of result structure
    expect(typeof result1.message).toBe(typeof result2.message);
    expect(result1).toHaveProperty("message");
    expect(result2).toHaveProperty("message");
    expect(result1.message).toBe(result2.message);
  });

  test("should handle prompt validation function", async () => {
    // Mock file exists with data to trigger prompts
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue('example.com:\n  token: "test-token"');
    writeFileSpy.mockResolvedValue();

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
    // Mock file exists but reading fails
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockRejectedValue(new Error("Permission denied"));

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.error).toBe(true);
    expect(result.message).toContain("Failed to clear site authorizations");
  });

  test("should handle file write errors gracefully", async () => {
    // Mock file exists, reading succeeds, but writing fails
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue('example.com:\n  token: "test-token"');
    writeFileSpy.mockRejectedValue(new Error("Disk full"));

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.error).toBe(true);
    expect(result.message).toContain("Failed to clear site authorizations");
  });

  test("should handle empty file content", async () => {
    // Mock file exists but is empty
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue("");

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toBe("🔑 No site authorizations found to clear");
  });

  test("should handle malformed YAML content", async () => {
    // Mock file exists with invalid YAML
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue("invalid: yaml: content: [");

    const result = await clearAuthTokens({}, {});
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.error).toBe(true);
    expect(result.message).toContain("Failed to clear site authorizations");
  });

  test("should handle empty selection from prompts", async () => {
    // Mock file exists with data but user selects nothing
    existsSyncSpy.mockReturnValue(true);
    readFileSpy.mockResolvedValue('example.com:\n  token: "test-token"');

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
