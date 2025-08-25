import { getActiveRulesForScope } from "../utils/preferences-utils.mjs";

export default async function findUserPreferencesByPath({ path, scope }) {
  // Get global rules (always applicable)
  const globalRules = getActiveRulesForScope("global", []);

  // Get scope-specific rules (document/translation based on scope parameter)
  const scopeRules = getActiveRulesForScope(scope, path ? [path] : []);

  // Combine all applicable rules
  const allApplicableRules = [...globalRules, ...scopeRules];

  // Extract only rule text and join with double newlines
  const ruleTexts = allApplicableRules.map((rule) => rule.rule);
  const userPreferences = ruleTexts.length > 0 ? ruleTexts.join("\n\n") : "";

  return {
    userPreferences,
  };
}

findUserPreferencesByPath.input_schema = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "Document path to find preferences for",
    },
    scope: {
      type: "string",
      description:
        "Preference scope: 'document' for update operations, 'translation' for translate operations",
      enum: ["document", "translation"],
    },
  },
  required: ["scope"],
};
