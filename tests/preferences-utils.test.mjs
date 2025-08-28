import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addPreferenceRule,
  deactivateRule,
  getActiveRulesForScope,
  readPreferences,
  removeRule,
  writePreferences,
} from "../utils/preferences-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("preferences-utils", () => {
  let testDir;
  let originalCwd;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = join(__dirname, "test-preferences");
    await mkdir(testDir, { recursive: true });

    // Change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe("readPreferences", () => {
    test("should return empty rules array when preferences file doesn't exist", () => {
      const preferences = readPreferences();
      expect(preferences).toEqual({ rules: [] });
    });

    test("should read existing preferences file", async () => {
      // Create preferences directory and file
      const prefsDir = join(testDir, ".aigne", "doc-smith");
      await mkdir(prefsDir, { recursive: true });

      await writeFile(
        join(prefsDir, "preferences.yml"),
        `rules:
  - id: test_rule_1
    active: true
    scope: global
    rule: Test rule
    feedback: Test feedback
    createdAt: '2023-01-01T00:00:00.000Z'
`,
        "utf8",
      );

      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(1);
      expect(preferences.rules[0].id).toBe("test_rule_1");
      expect(preferences.rules[0].active).toBe(true);
      expect(preferences.rules[0].scope).toBe("global");
    });

    test("should handle malformed YAML gracefully", async () => {
      // Create preferences directory and invalid file
      const prefsDir = join(testDir, ".aigne", "doc-smith");
      await mkdir(prefsDir, { recursive: true });

      await writeFile(join(prefsDir, "preferences.yml"), "invalid: yaml: content: [", "utf8");

      const preferences = readPreferences();
      expect(preferences).toEqual({ rules: [] });
    });
  });

  describe("writePreferences", () => {
    test("should create preferences directory if it doesn't exist", () => {
      const testPreferences = { rules: [] };

      writePreferences(testPreferences);

      const prefsDir = join(testDir, ".aigne", "doc-smith");
      expect(existsSync(prefsDir)).toBe(true);
      expect(existsSync(join(prefsDir, "preferences.yml"))).toBe(true);
    });

    test("should write preferences to YAML file", () => {
      const testPreferences = {
        rules: [
          {
            id: "test_rule_1",
            active: true,
            scope: "global",
            rule: "Test rule",
            feedback: "Test feedback",
            createdAt: "2023-01-01T00:00:00.000Z",
          },
        ],
      };

      writePreferences(testPreferences);

      // Read back and verify
      const savedPreferences = readPreferences();
      expect(savedPreferences.rules).toHaveLength(1);
      expect(savedPreferences.rules[0]).toEqual(testPreferences.rules[0]);
    });
  });

  describe("addPreferenceRule", () => {
    test("should add a new rule with generated ID", () => {
      const ruleData = {
        rule: "Always use proper punctuation",
        scope: "document",
        limitToInputPaths: false,
      };
      const feedback = "Please ensure proper punctuation";

      const newRule = addPreferenceRule(ruleData, feedback);

      expect(newRule.id).toMatch(/^pref_[a-f0-9]{16}$/);
      expect(newRule.active).toBe(true);
      expect(newRule.scope).toBe("document");
      expect(newRule.rule).toBe("Always use proper punctuation");
      expect(newRule.feedback).toBe("Please ensure proper punctuation");
      expect(newRule.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Verify it was saved
      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(1);
      expect(preferences.rules[0]).toEqual(newRule);
    });

    test("should add paths when limitToInputPaths is true", () => {
      const ruleData = {
        rule: "Use consistent naming",
        scope: "structure",
        limitToInputPaths: true,
      };
      const feedback = "Keep naming consistent";
      const paths = ["/docs/api", "/docs/guide"];

      const newRule = addPreferenceRule(ruleData, feedback, paths);

      expect(newRule.paths).toEqual(["/docs/api", "/docs/guide"]);

      // Verify it was saved with paths
      const preferences = readPreferences();
      expect(preferences.rules[0].paths).toEqual(paths);
    });

    test("should not add paths when limitToInputPaths is false", () => {
      const ruleData = {
        rule: "Global rule",
        scope: "global",
        limitToInputPaths: false,
      };
      const feedback = "Global feedback";
      const paths = ["/docs/api"];

      const newRule = addPreferenceRule(ruleData, feedback, paths);

      expect(newRule.paths).toBeUndefined();
    });

    test("should add new rules to the beginning of the array", () => {
      // Add first rule
      const rule1 = addPreferenceRule(
        { rule: "Rule 1", scope: "global", limitToInputPaths: false },
        "Feedback 1",
      );

      // Add second rule
      const rule2 = addPreferenceRule(
        { rule: "Rule 2", scope: "document", limitToInputPaths: false },
        "Feedback 2",
      );

      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(2);
      expect(preferences.rules[0]).toEqual(rule2); // Most recent first
      expect(preferences.rules[1]).toEqual(rule1);
    });

    test("should handle rules with special characters and colons", () => {
      const ruleData = {
        rule: 'Always use proper punctuation: semicolons, colons, and quotes"like this"',
        scope: "document",
        limitToInputPaths: false,
      };
      const feedback = 'Please ensure proper punctuation: don\'t forget quotes"and colons"';

      const newRule = addPreferenceRule(ruleData, feedback);

      expect(newRule.rule).toBe(
        'Always use proper punctuation: semicolons, colons, and quotes"like this"',
      );
      expect(newRule.feedback).toBe(
        'Please ensure proper punctuation: don\'t forget quotes"and colons"',
      );

      // Verify it was saved and can be read back
      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(1);
      expect(preferences.rules[0].rule).toEqual(newRule.rule);
      expect(preferences.rules[0].feedback).toEqual(newRule.feedback);
    });

    test("should handle rules with multiline content and special YAML characters", () => {
      const ruleData = {
        rule: "Multi-line rule:\\nLine 1: Use proper formatting\\nLine 2: Handle | pipe characters\\nLine 3: And > greater than symbols",
        scope: "structure",
        limitToInputPaths: false,
      };
      const feedback =
        "Multi-line feedback:\\n- Check formatting\\n- Validate | pipes\\n- Handle > symbols\\n- Process 'single quotes' and \"double quotes\"";

      const newRule = addPreferenceRule(ruleData, feedback);

      expect(newRule.rule).toContain("Multi-line rule:\\nLine 1");
      expect(newRule.feedback).toContain("Multi-line feedback:\\n- Check");

      // Verify it was saved and can be read back correctly
      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(1);
      expect(preferences.rules[0].rule).toEqual(ruleData.rule);
      expect(preferences.rules[0].feedback).toEqual(feedback);
    });

    test("should handle rules with Chinese and Unicode characters", () => {
      const ruleData = {
        rule: "使用正确的中文标点符号：逗号，句号。还有emoji 🔥 和特殊符号 @#$%^&*()",
        scope: "document",
        limitToInputPaths: false,
      };
      const feedback = '请确保正确使用标点：引号"这样"和冒号：还有各种符号！@#$%';

      const newRule = addPreferenceRule(ruleData, feedback);

      expect(newRule.rule).toBe(
        "使用正确的中文标点符号：逗号，句号。还有emoji 🔥 和特殊符号 @#$%^&*()",
      );
      expect(newRule.feedback).toBe('请确保正确使用标点：引号"这样"和冒号：还有各种符号！@#$%');

      // Verify it was saved and can be read back
      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(1);
      expect(preferences.rules[0].rule).toEqual(newRule.rule);
      expect(preferences.rules[0].feedback).toEqual(newRule.feedback);
    });

    test("should handle paths with special characters", () => {
      const ruleData = {
        rule: "Path-specific rule for special directories",
        scope: "structure",
        limitToInputPaths: true,
      };
      const feedback = "Apply to special paths only";
      const paths = [
        "/docs/api: advanced",
        "/docs/guide-中文",
        "/path with spaces",
        "/symbols@#$%/file",
      ];

      const newRule = addPreferenceRule(ruleData, feedback, paths);

      expect(newRule.paths).toEqual(paths);

      // Verify it was saved with all special character paths
      const preferences = readPreferences();
      expect(preferences.rules[0].paths).toEqual(paths);
      expect(preferences.rules[0].paths).toContain("/docs/api: advanced");
      expect(preferences.rules[0].paths).toContain("/docs/guide-中文");
      expect(preferences.rules[0].paths).toContain("/path with spaces");
      expect(preferences.rules[0].paths).toContain("/symbols@#$%/file");
    });
  });

  describe("getActiveRulesForScope", () => {
    beforeEach(() => {
      // Set up test preferences
      const testPreferences = {
        rules: [
          {
            id: "rule1",
            active: true,
            scope: "global",
            rule: "Global rule 1",
            feedback: "Global feedback",
            createdAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "rule2",
            active: false,
            scope: "global",
            rule: "Inactive global rule",
            feedback: "Inactive feedback",
            createdAt: "2023-01-02T00:00:00.000Z",
          },
          {
            id: "rule3",
            active: true,
            scope: "document",
            rule: "Document rule",
            feedback: "Document feedback",
            createdAt: "2023-01-03T00:00:00.000Z",
          },
          {
            id: "rule4",
            active: true,
            scope: "global",
            rule: "Path-restricted rule",
            feedback: "Path feedback",
            paths: ["/docs/api", "/docs/guide"],
            createdAt: "2023-01-04T00:00:00.000Z",
          },
        ],
      };

      writePreferences(testPreferences);
    });

    test("should return only active rules for specified scope (excluding path-restricted without matching paths)", () => {
      const rules = getActiveRulesForScope("global");

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe("rule1");
      // rule4 is excluded because it has path restrictions but no matching paths were provided
    });

    test("should return empty array for non-matching scope", () => {
      const rules = getActiveRulesForScope("structure");
      expect(rules).toHaveLength(0);
    });

    test("should filter out inactive rules", () => {
      const rules = getActiveRulesForScope("global");
      const inactiveRule = rules.find((r) => r.id === "rule2");
      expect(inactiveRule).toBeUndefined();
    });

    test("should include path-restricted rules when matching paths provided", () => {
      const rules = getActiveRulesForScope("global", ["/docs/api"]);

      expect(rules).toHaveLength(2);
      const pathRestrictedRule = rules.find((r) => r.id === "rule4");
      expect(pathRestrictedRule).toBeDefined();
    });

    test("should exclude path-restricted rules when no matching paths", () => {
      const rules = getActiveRulesForScope("global", ["/other/path"]);

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe("rule1"); // Only the unrestricted global rule
    });

    test("should exclude path-restricted rules when no paths provided", () => {
      const rules = getActiveRulesForScope("global", []);

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe("rule1"); // Only the unrestricted global rule
    });
  });

  describe("deactivateRule", () => {
    beforeEach(() => {
      const testPreferences = {
        rules: [
          {
            id: "rule1",
            active: true,
            scope: "global",
            rule: "Test rule 1",
            feedback: "Feedback 1",
            createdAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "rule2",
            active: true,
            scope: "document",
            rule: "Test rule 2",
            feedback: "Feedback 2",
            createdAt: "2023-01-02T00:00:00.000Z",
          },
        ],
      };

      writePreferences(testPreferences);
    });

    test("should deactivate existing rule", () => {
      const result = deactivateRule("rule1");

      expect(result).toBe(true);

      const preferences = readPreferences();
      const rule = preferences.rules.find((r) => r.id === "rule1");
      expect(rule.active).toBe(false);

      // Other rule should remain unchanged
      const otherRule = preferences.rules.find((r) => r.id === "rule2");
      expect(otherRule.active).toBe(true);
    });

    test("should return false for non-existent rule", () => {
      const result = deactivateRule("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("removeRule", () => {
    beforeEach(() => {
      const testPreferences = {
        rules: [
          {
            id: "rule1",
            active: true,
            scope: "global",
            rule: "Test rule 1",
            feedback: "Feedback 1",
            createdAt: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "rule2",
            active: true,
            scope: "document",
            rule: "Test rule 2",
            feedback: "Feedback 2",
            createdAt: "2023-01-02T00:00:00.000Z",
          },
        ],
      };

      writePreferences(testPreferences);
    });

    test("should remove existing rule", () => {
      const result = removeRule("rule1");

      expect(result).toBe(true);

      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(1);
      expect(preferences.rules[0].id).toBe("rule2");
    });

    test("should return false for non-existent rule", () => {
      const result = removeRule("nonexistent");
      expect(result).toBe(false);

      // Rules should remain unchanged
      const preferences = readPreferences();
      expect(preferences.rules).toHaveLength(2);
    });
  });
});
