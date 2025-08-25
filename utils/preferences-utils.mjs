import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse, stringify } from "yaml";

const PREFERENCES_DIR = ".aigne/doc-smith";
const PREFERENCES_FILE = "preferences.yml";

/**
 * Generate a random preference ID
 * @returns {string} Random ID with pref_ prefix
 */
function generatePreferenceId() {
  return `pref_${randomBytes(8).toString("hex")}`;
}

/**
 * Get the full path to the preferences file
 * @returns {string} Full path to preferences.yml
 */
function getPreferencesFilePath() {
  return join(process.cwd(), PREFERENCES_DIR, PREFERENCES_FILE);
}

/**
 * Ensure the preferences directory exists
 */
function ensurePreferencesDir() {
  const preferencesDir = join(process.cwd(), PREFERENCES_DIR);
  if (!existsSync(preferencesDir)) {
    mkdirSync(preferencesDir, { recursive: true });
  }
}

/**
 * Read existing preferences from file
 * @returns {Object} Preferences object with rules array
 */
export function readPreferences() {
  const filePath = getPreferencesFilePath();

  if (!existsSync(filePath)) {
    return { rules: [] };
  }

  try {
    const content = readFileSync(filePath, "utf8");
    const preferences = parse(content);
    return preferences || { rules: [] };
  } catch (error) {
    console.warn(`Warning: Failed to read preferences file at ${filePath}: ${error.message}`);
    return { rules: [] };
  }
}

/**
 * Write preferences to file
 * @param {Object} preferences - Preferences object to save
 */
export function writePreferences(preferences) {
  ensurePreferencesDir();
  const filePath = getPreferencesFilePath();

  try {
    const yamlContent = stringify(preferences, {
      indent: 2,
      lineWidth: 120,
    });

    writeFileSync(filePath, yamlContent, "utf8");
  } catch (error) {
    throw new Error(`Failed to write preferences file: ${error.message}`);
  }
}

/**
 * Add a new preference rule
 * @param {Object} ruleData - Rule data from feedbackRefiner
 * @param {string} ruleData.rule - The rule text
 * @param {string} ruleData.scope - Rule scope (global, structure, document, translation)
 * @param {boolean} ruleData.limitToInputPaths - Whether to limit to input paths
 * @param {string} feedback - Original user feedback
 * @param {string[]} [paths] - Optional paths to save with the rule
 * @returns {Object} The created preference rule
 */
export function addPreferenceRule(ruleData, feedback, paths = []) {
  const preferences = readPreferences();

  const newRule = {
    id: generatePreferenceId(),
    active: true,
    scope: ruleData.scope,
    rule: ruleData.rule,
    feedback: feedback,
    createdAt: new Date().toISOString(),
  };

  // Add paths if limitToInputPaths is true and paths are provided
  if (ruleData.limitToInputPaths && paths && paths.length > 0) {
    newRule.paths = paths;
  }

  // Add the new rule to the beginning of the array (newest first)
  preferences.rules.unshift(newRule);

  writePreferences(preferences);

  return newRule;
}

/**
 * Get all active preference rules for a specific scope
 * @param {string} scope - The scope to filter by (global, structure, document, translation)
 * @param {string[]} [currentPaths] - Current paths to match against rules with path restrictions
 * @returns {Object[]} Array of matching active rules
 */
export function getActiveRulesForScope(scope, currentPaths = []) {
  const preferences = readPreferences();

  return preferences.rules.filter((rule) => {
    // Must be active and match scope
    if (!rule.active || rule.scope !== scope) {
      return false;
    }

    // If rule has path restrictions, check if any current path matches
    if (rule.paths && rule.paths.length > 0) {
      if (currentPaths.length === 0) {
        return false; // Rule has path restrictions but no current paths provided
      }

      // Check if any current path matches any rule path pattern
      return currentPaths.some((currentPath) => rule.paths.includes(currentPath));
    }

    return true; // No path restrictions, include the rule
  });
}

/**
 * Deactivate a preference rule by ID
 * @param {string} ruleId - The ID of the rule to deactivate
 * @returns {boolean} True if rule was found and deactivated
 */
export function deactivateRule(ruleId) {
  const preferences = readPreferences();
  const rule = preferences.rules.find((r) => r.id === ruleId);

  if (rule) {
    rule.active = false;
    writePreferences(preferences);
    return true;
  }

  return false;
}

/**
 * Remove a preference rule by ID
 * @param {string} ruleId - The ID of the rule to remove
 * @returns {boolean} True if rule was found and removed
 */
export function removeRule(ruleId) {
  const preferences = readPreferences();
  const initialLength = preferences.rules.length;

  preferences.rules = preferences.rules.filter((r) => r.id !== ruleId);

  if (preferences.rules.length < initialLength) {
    writePreferences(preferences);
    return true;
  }

  return false;
}
