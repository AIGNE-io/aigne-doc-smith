import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import findUserPreferencesByPath from "../../../agents/utils/find-user-preferences-by-path.mjs";

import * as preferencesUtils from "../../../utils/preferences-utils.mjs";

describe("findUserPreferencesByPath", () => {
  // Spies for internal utils
  let getActiveRulesForScopeSpy;

  beforeEach(() => {
    // Set up spies for internal utils
    getActiveRulesForScopeSpy = spyOn(preferencesUtils, "getActiveRulesForScope").mockReturnValue(
      [],
    );

    // Clear spy call history
    getActiveRulesForScopeSpy.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    getActiveRulesForScopeSpy?.mockRestore();
  });

  // BASIC FUNCTIONALITY TESTS
  test("should return empty preferences when no rules found", async () => {
    const result = await findUserPreferencesByPath({
      path: "/api/users",
      scope: "document",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledTimes(2);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("document", ["/api/users"]);
    expect(result).toEqual({
      userPreferences: "",
    });
  });

  test("should return global rules when only global rules exist", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [
          { rule: "Always use clear and concise language" },
          { rule: "Include code examples when relevant" },
        ];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/api/users",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences:
        "Always use clear and concise language\n\nInclude code examples when relevant",
    });
  });

  test("should return scope rules when only scope rules exist", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "document") {
        return [
          { rule: "Focus on API documentation standards" },
          { rule: "Include parameter details" },
        ];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/api/users",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences: "Focus on API documentation standards\n\nInclude parameter details",
    });
  });

  test("should combine global and scope rules correctly", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Use consistent terminology" }, { rule: "Maintain professional tone" }];
      }
      if (scope === "document") {
        return [{ rule: "Include version information" }, { rule: "Add deprecation notices" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/api/auth",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences:
        "Use consistent terminology\n\nMaintain professional tone\n\nInclude version information\n\nAdd deprecation notices",
    });
  });

  // SCOPE-SPECIFIC TESTS
  test("should handle document scope correctly", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Global rule" }];
      }
      if (scope === "document") {
        return [{ rule: "Document rule" }];
      }
      return [];
    });

    await findUserPreferencesByPath({
      path: "/docs/getting-started",
      scope: "document",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("document", ["/docs/getting-started"]);
  });

  test("should handle translation scope correctly", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Global rule" }];
      }
      if (scope === "translation") {
        return [{ rule: "Translation rule" }];
      }
      return [];
    });

    await findUserPreferencesByPath({
      path: "/docs/api-reference",
      scope: "translation",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("translation", ["/docs/api-reference"]);
  });

  test("should handle missing path parameter", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Global rule for all" }];
      }
      if (scope === "document") {
        return [{ rule: "Document rule for all" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      scope: "document",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("document", []);
    expect(result).toEqual({
      userPreferences: "Global rule for all\n\nDocument rule for all",
    });
  });

  test("should handle null path parameter", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Global rule" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: null,
      scope: "translation",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("translation", []);
    expect(result).toEqual({
      userPreferences: "Global rule",
    });
  });

  test("should handle empty path parameter", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Global rule" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "",
      scope: "document",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("document", []);
    expect(result).toEqual({
      userPreferences: "Global rule",
    });
  });

  // RULE COMBINATION TESTS
  test("should handle single rule correctly", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Single global rule" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/test",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences: "Single global rule",
    });
  });

  test("should handle multiple rules with proper formatting", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "First rule" }, { rule: "Second rule" }, { rule: "Third rule" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/test",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences: "First rule\n\nSecond rule\n\nThird rule",
    });
  });

  test("should handle rules with complex text", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [
          {
            rule: "When writing API documentation, always include:\n- Request parameters\n- Response examples\n- Error codes",
          },
        ];
      }
      if (scope === "document") {
        return [
          {
            rule: "For authentication endpoints:\n1. Mention security considerations\n2. Include rate limiting info",
          },
        ];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/api/auth/login",
      scope: "document",
    });

    expect(result.userPreferences).toContain("When writing API documentation");
    expect(result.userPreferences).toContain("For authentication endpoints");
    expect(result.userPreferences).toContain("\n\n");
  });

  // EDGE CASES
  test("should handle undefined scope parameter gracefully", async () => {
    const result = await findUserPreferencesByPath({
      path: "/test",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("global", []);
    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith(undefined, ["/test"]);
    expect(result).toEqual({
      userPreferences: "",
    });
  });

  test("should handle rules with empty rule text", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Valid rule" }, { rule: "" }, { rule: "Another valid rule" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/test",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences: "Valid rule\n\n\n\nAnother valid rule",
    });
  });

  test("should preserve rule order (global first, then scope)", async () => {
    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return [{ rule: "Global rule 1" }, { rule: "Global rule 2" }];
      }
      if (scope === "document") {
        return [{ rule: "Document rule 1" }, { rule: "Document rule 2" }];
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/test",
      scope: "document",
    });

    expect(result).toEqual({
      userPreferences: "Global rule 1\n\nGlobal rule 2\n\nDocument rule 1\n\nDocument rule 2",
    });
  });

  // PERFORMANCE AND EFFICIENCY TESTS
  test("should call getActiveRulesForScope exactly twice", async () => {
    await findUserPreferencesByPath({
      path: "/performance/test",
      scope: "translation",
    });

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledTimes(2);
  });

  test("should handle large number of rules efficiently", async () => {
    const manyRules = Array.from({ length: 100 }, (_, i) => ({
      rule: `Rule number ${i + 1}`,
    }));

    getActiveRulesForScopeSpy.mockImplementation((scope) => {
      if (scope === "global") {
        return manyRules.slice(0, 50);
      }
      if (scope === "document") {
        return manyRules.slice(50);
      }
      return [];
    });

    const result = await findUserPreferencesByPath({
      path: "/large/test",
      scope: "document",
    });

    expect(result.userPreferences.split("\n\n")).toHaveLength(100);
    expect(result.userPreferences).toContain("Rule number 1");
    expect(result.userPreferences).toContain("Rule number 100");
  });

  // PARAMETER VALIDATION TESTS
  test("should work with various path formats", async () => {
    const testPaths = [
      "/simple",
      "/nested/path",
      "/deeply/nested/path/here",
      "/with-dashes",
      "/with_underscores",
      "/with.dots",
      "/api/v1/users/123",
    ];

    for (const path of testPaths) {
      await findUserPreferencesByPath({
        path,
        scope: "document",
      });

      expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("document", [path]);
    }
  });
});
