import { readPreferences, removeRule, writePreferences } from "../../utils/preferences-utils.mjs";

/**
 * List all user preferences with formatted display
 * @returns {Object} Result with formatted message
 */
function listPreferences() {
  const preferences = readPreferences();

  if (preferences.rules.length === 0) {
    return { message: "No saved preferences found." };
  }

  let message = "# User Preferences\n\n";

  // Add format explanation
  message += "**Format explanation:**\n";
  message += "- 🟢 = Active preference, ⚪ = Inactive preference\n";
  message += "- [scope] = Preference scope (global, structure, document, translation)\n";
  message += "- ID = Unique preference identifier\n";
  message += "- Paths = Specific file paths (if applicable)\n\n";

  preferences.rules.forEach((rule) => {
    const status = rule.active ? "🟢" : "⚪";
    const pathsInfo = rule.paths ? ` | Paths: ${rule.paths.join(", ")}` : "";

    // First line: status, scope, ID and paths info
    message += `${status} [${rule.scope}] ${rule.id}${pathsInfo}\n`;

    // Second line: rule content (truncated if too long)
    const maxRuleLength = 120;
    const ruleText =
      rule.rule.length > maxRuleLength ? `${rule.rule.substring(0, maxRuleLength)}...` : rule.rule;
    message += `   ${ruleText}\n `;

    // Add blank line after each record
    message += `\n`;
  });

  return { message };
}

/**
 * Remove preferences by IDs or interactive selection
 * @param {string[]} id - Array of preference IDs to remove
 * @param {Object} options - Options with prompts interface
 * @returns {Object} Result with success message
 */
async function removePreferences(id, options) {
  const preferences = readPreferences();
  let targetIds = id;

  if (!targetIds || targetIds.length === 0) {
    // Interactive selection
    if (preferences.rules.length === 0) {
      return { message: "No preferences available to remove." };
    }

    const choices = preferences.rules.map((rule) => ({
      name: `${rule.active ? "🟢" : "⚪"} [${rule.scope}] ${rule.rule.substring(0, 60)}${rule.rule.length > 60 ? "..." : ""}`,
      value: rule.id,
      description: `ID: ${rule.id}`,
    }));

    targetIds = await options.prompts.checkbox({
      message: "Choose preferences to delete:",
      choices,
      validate: (answer) => {
        if (answer.length === 0) {
          return "Please choose at least one preference to delete";
        }
        return true;
      },
    });

    if (!targetIds || targetIds.length === 0) {
      return { message: "No preferences selected for deletion." };
    }
  }

  // Process the target IDs
  const results = [];
  for (const ruleId of targetIds) {
    const success = removeRule(ruleId);
    results.push({ id: ruleId, success });
  }

  const successCount = results.filter((r) => r.success).length;
  const failedCount = targetIds.length - successCount;
  const message =
    failedCount > 0
      ? `Successfully removed ${successCount} preferences, ${failedCount} failed.`
      : `Successfully removed ${successCount} preferences.`;

  return { message };
}

/**
 * Toggle preferences active status by IDs or interactive selection
 * @param {string[]} id - Array of preference IDs to toggle
 * @param {Object} options - Options with prompts interface
 * @returns {Object} Result with success message
 */
async function togglePreferences(id, options) {
  const preferences = readPreferences();
  let targetIds = id;

  if (!targetIds || targetIds.length === 0) {
    // Interactive selection
    if (preferences.rules.length === 0) {
      return { message: "No preferences available to toggle." };
    }

    const choices = preferences.rules.map((rule) => ({
      name: `${rule.active ? "🟢" : "⚪"} [${rule.scope}] ${rule.rule.substring(0, 60)}${rule.rule.length > 60 ? "..." : ""}`,
      value: rule.id,
      description: `ID: ${rule.id}`,
    }));

    targetIds = await options.prompts.checkbox({
      message: "Choose preferences to enable/disable:",
      choices,
      validate: (answer) => {
        if (answer.length === 0) {
          return "Please choose at least one preference to toggle";
        }
        return true;
      },
    });

    if (!targetIds || targetIds.length === 0) {
      return { message: "No preferences selected to toggle." };
    }
  }

  // Process the target IDs
  const results = [];
  const prefs = readPreferences();

  for (const ruleId of targetIds) {
    const rule = prefs.rules.find((r) => r.id === ruleId);
    if (rule) {
      rule.active = !rule.active;
      results.push({ id: ruleId, success: true, newStatus: rule.active });
    } else {
      results.push({ id: ruleId, success: false, error: "Rule not found" });
    }
  }

  writePreferences(prefs);

  const successCount = results.filter((r) => r.success).length;
  const failedCount = targetIds.length - successCount;
  const message =
    failedCount > 0
      ? `Successfully toggled ${successCount} preferences, ${failedCount} failed.`
      : `Successfully toggled ${successCount} preferences.`;

  return { message };
}

export default async function prefs({ list, remove, toggle, id }, options) {
  if (list) {
    return listPreferences();
  }

  if (remove) {
    return await removePreferences(id, options);
  }

  if (toggle) {
    return await togglePreferences(id, options);
  }

  return { message: "Please choose an action: --list, --remove, or --toggle." };
}

prefs.input_schema = {
  type: "object",
  properties: {
    list: {
      type: "boolean",
      description: "Show all saved preferences",
    },
    remove: {
      type: "boolean",
      description: "Delete saved preferences",
    },
    toggle: {
      type: "boolean",
      description: "Enable/disable preferences",
    },
    id: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Specific preference IDs to work with",
    },
  },
};

prefs.description = "Manage your saved documentation preferences";
