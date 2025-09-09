import { beforeEach, describe, expect, mock, test } from "bun:test";
import prefs from "../../../agents/prefs/prefs.mjs";

// Mock the preferences utilities
const mockPreferencesUtils = {
  readPreferences: mock(() => ({ rules: [] })),
  removeRule: mock(() => true),
  writePreferences: mock(() => {}),
};

mock.module("../../../utils/preferences-utils.mjs", () => mockPreferencesUtils);

describe("prefs", () => {
  let mockOptions;

  beforeEach(() => {
    mock.restore();

    mockOptions = {
      prompts: {
        checkbox: mock(async () => []),
      },
    };

    // Reset mocks to default behavior
    mockPreferencesUtils.readPreferences.mockImplementation(() => ({ rules: [] }));
    mockPreferencesUtils.removeRule.mockImplementation(() => true);
    mockPreferencesUtils.writePreferences.mockImplementation(() => {});
  });

  test("should return help message when no action specified", async () => {
    const result = await prefs({}, mockOptions);

    expect(result).toBeDefined();
    expect(result.message).toBe("Please specify an action: --list, --remove, or --toggle.");
  });

  // LIST PREFERENCES TESTS
  describe("list preferences", () => {
    test("should return no preferences message when list is empty", async () => {
      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: [] });

      const result = await prefs({ list: true }, mockOptions);

      expect(result.message).toBe("No preferences found.");
    });

    test("should format preferences list with active rules", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Use TypeScript for new files",
          active: true,
        },
        {
          id: "rule2",
          scope: "structure",
          rule: "Organize imports alphabetically",
          active: false,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });

      const result = await prefs({ list: true }, mockOptions);

      expect(result.message).toContain("# User Preferences");
      expect(result.message).toContain("🟢 [global] rule1");
      expect(result.message).toContain("⚪ [structure] rule2");
      expect(result.message).toContain("Use TypeScript for new files");
      expect(result.message).toContain("Organize imports alphabetically");
    });

    test("should include paths information when available", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "document",
          rule: "Add JSDoc comments",
          active: true,
          paths: ["src/**/*.js", "lib/**/*.ts"],
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });

      const result = await prefs({ list: true }, mockOptions);

      expect(result.message).toContain("Paths: src/**/*.js, lib/**/*.ts");
    });

    test("should truncate long rules in list", async () => {
      const longRule = "A".repeat(150); // Longer than 120 chars
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: longRule,
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });

      const result = await prefs({ list: true }, mockOptions);

      expect(result.message).toContain(`${"A".repeat(120)}...`);
      expect(result.message).not.toContain(longRule);
    });
  });

  // REMOVE PREFERENCES TESTS
  describe("remove preferences", () => {
    test("should remove preferences by provided IDs", async () => {
      mockPreferencesUtils.removeRule.mockReturnValue(true);

      const result = await prefs({ remove: true, id: ["rule1", "rule2"] }, mockOptions);

      expect(mockPreferencesUtils.removeRule).toHaveBeenCalledWith("rule1");
      expect(mockPreferencesUtils.removeRule).toHaveBeenCalledWith("rule2");
      expect(result.message).toBe("Successfully removed 2 preferences.");
    });

    test("should handle partial failures when removing", async () => {
      mockPreferencesUtils.removeRule.mockReturnValueOnce(true).mockReturnValueOnce(false);

      const result = await prefs({ remove: true, id: ["rule1", "rule2"] }, mockOptions);

      expect(result.message).toBe("Successfully removed 1 preferences, 1 failed.");
    });

    test("should return message when no preferences exist for removal", async () => {
      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: [] });

      const result = await prefs({ remove: true }, mockOptions);

      expect(result.message).toBe("No preferences found to remove.");
    });

    test("should prompt for interactive selection when no IDs provided", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Use TypeScript for new files",
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);

      const result = await prefs({ remove: true }, mockOptions);

      expect(mockOptions.prompts.checkbox).toHaveBeenCalledWith({
        message: "Select preferences to remove:",
        choices: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining("🟢 [global] Use TypeScript for new files"),
            value: "rule1",
          }),
        ]),
        validate: expect.any(Function),
      });
      expect(result.message).toBe("Successfully removed 1 preferences.");
    });

    test("should handle validation error in interactive selection", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Test rule",
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);

      await prefs({ remove: true }, mockOptions);

      const validateFn = mockOptions.prompts.checkbox.mock.calls[0][0].validate;

      expect(validateFn([])).toBe("Please select at least one preference to remove");
      expect(validateFn(["rule1"])).toBe(true);
    });

    test("should return message when no preferences selected", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Test rule",
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue([]);

      const result = await prefs({ remove: true }, mockOptions);

      expect(result.message).toBe("No preferences selected for removal.");
    });

    test("should truncate long rules in interactive choices", async () => {
      const longRule = "A".repeat(80); // Longer than 60 chars
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: longRule,
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);

      await prefs({ remove: true }, mockOptions);

      const choices = mockOptions.prompts.checkbox.mock.calls[0][0].choices;
      expect(choices[0].name).toContain(`${"A".repeat(60)}...`);
    });
  });

  // TOGGLE PREFERENCES TESTS
  describe("toggle preferences", () => {
    test("should toggle preferences by provided IDs", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Test rule 1",
          active: true,
        },
        {
          id: "rule2",
          scope: "structure",
          rule: "Test rule 2",
          active: false,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });

      const result = await prefs({ toggle: true, id: ["rule1", "rule2"] }, mockOptions);

      expect(mockPreferencesUtils.writePreferences).toHaveBeenCalled();
      expect(result.message).toBe("Successfully toggled 2 preferences.");

      // Check that the active status was toggled
      const writtenPrefs = mockPreferencesUtils.writePreferences.mock.calls[0][0];
      expect(writtenPrefs.rules[0].active).toBe(false); // was true, now false
      expect(writtenPrefs.rules[1].active).toBe(true); // was false, now true
    });

    test("should handle non-existent rule IDs", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Test rule",
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });

      const result = await prefs({ toggle: true, id: ["rule1", "nonexistent"] }, mockOptions);

      expect(result.message).toBe("Successfully toggled 1 preferences, 1 failed.");
    });

    test("should return message when no preferences exist for toggling", async () => {
      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: [] });

      const result = await prefs({ toggle: true }, mockOptions);

      expect(result.message).toBe("No preferences found to toggle.");
    });

    test("should prompt for interactive selection when no IDs provided", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Use TypeScript",
          active: false,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);

      const result = await prefs({ toggle: true }, mockOptions);

      expect(mockOptions.prompts.checkbox).toHaveBeenCalledWith({
        message: "Select preferences to toggle active status:",
        choices: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining("⚪ [global] Use TypeScript"),
            value: "rule1",
          }),
        ]),
        validate: expect.any(Function),
      });
      expect(result.message).toBe("Successfully toggled 1 preferences.");
    });

    test("should handle validation error in toggle interactive selection", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Test rule",
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);

      await prefs({ toggle: true }, mockOptions);

      const validateFn = mockOptions.prompts.checkbox.mock.calls[0][0].validate;

      expect(validateFn([])).toBe("Please select at least one preference to toggle");
      expect(validateFn(["rule1"])).toBe(true);
    });

    test("should return message when no preferences selected for toggling", async () => {
      const mockRules = [
        {
          id: "rule1",
          scope: "global",
          rule: "Test rule",
          active: true,
        },
      ];

      mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
      mockOptions.prompts.checkbox.mockResolvedValue([]);

      const result = await prefs({ toggle: true }, mockOptions);

      expect(result.message).toBe("No preferences selected for toggling.");
    });
  });

  // EDGE CASES
  test("should handle empty ID array", async () => {
    await prefs({ remove: true, id: [] }, mockOptions);

    expect(mockPreferencesUtils.readPreferences).toHaveBeenCalled();
    // Should fall back to interactive selection
  });

  test("should handle null ID array", async () => {
    await prefs({ toggle: true, id: null }, mockOptions);

    expect(mockPreferencesUtils.readPreferences).toHaveBeenCalled();
    // Should fall back to interactive selection
  });

  test("should handle mixed success/failure in operations", async () => {
    mockPreferencesUtils.removeRule
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const result = await prefs({ remove: true, id: ["rule1", "rule2", "rule3"] }, mockOptions);

    expect(result.message).toBe("Successfully removed 2 preferences, 1 failed.");
  });

  test("should handle all operations with same rule format", async () => {
    const mockRules = [
      {
        id: "rule1",
        scope: "translation",
        rule: "Translate technical terms consistently",
        active: true,
        paths: ["docs/**/*.md"],
      },
    ];

    mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });

    // Test list
    const listResult = await prefs({ list: true }, mockOptions);
    expect(listResult.message).toContain("🟢 [translation] rule1");
    expect(listResult.message).toContain("Paths: docs/**/*.md");

    // Test remove
    mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);
    const removeResult = await prefs({ remove: true }, mockOptions);
    expect(removeResult.message).toContain("Successfully removed 1 preferences.");

    // Test toggle
    mockOptions.prompts.checkbox.mockResolvedValue(["rule1"]);
    const toggleResult = await prefs({ toggle: true }, mockOptions);
    expect(toggleResult.message).toContain("Successfully toggled 1 preferences.");
  });

  test("should handle checkbox returning null", async () => {
    const mockRules = [
      {
        id: "rule1",
        scope: "global",
        rule: "Test rule",
        active: true,
      },
    ];

    mockPreferencesUtils.readPreferences.mockReturnValue({ rules: mockRules });
    mockOptions.prompts.checkbox.mockResolvedValue(null);

    const result = await prefs({ remove: true }, mockOptions);

    expect(result.message).toBe("No preferences selected for removal.");
  });
});
