import { stringify } from "yaml";
import { addPreferenceRule, readPreferences } from "../utils/preferences-utils.mjs";

export default async function checkFeedbackRefiner(
  { feedback, stage, selectedPaths, structurePlanFeedback },
  options,
) {
  // If feedback is empty, no need to save user preferences
  if (!feedback && !structurePlanFeedback) {
    return {};
  }

  // Read existing preferences as context for deduplication
  const existingPreferences = readPreferences();
  const activePreferences = existingPreferences.rules?.filter((rule) => rule.active) || [];

  // Convert active preferences to YAML string format for passing
  const activePreferencesYaml =
    activePreferences.length > 0 ? stringify({ rules: activePreferences }, { indent: 2 }) : "";

  const feedbackToUse = feedback || structurePlanFeedback;
  const result = await options.context.invoke(options.context.agents["feedbackRefiner"], {
    feedback: feedbackToUse,
    stage,
    paths: selectedPaths,
    existingPreferences: activePreferencesYaml,
  });

  // If preferences need to be saved, save them to the preference file
  if (result?.save) {
    try {
      const savedRule = addPreferenceRule(result, feedbackToUse, selectedPaths);

      // Add saved preference information to the return result
      result.savedPreference = {
        id: savedRule.id,
        saved: true,
      };
    } catch (error) {
      console.error(
        "Failed to save user preference rule:",
        error.message,
        "\nFeedback:",
        feedbackToUse,
      );
      result.savedPreference = {
        saved: false,
        error: error.message,
      };
    }
  }

  return result;
}

checkFeedbackRefiner.input_schema = {
  type: "object",
  properties: {
    feedback: {
      type: "string",
      description: "User feedback to refine",
    },
    structurePlanFeedback: {
      type: "string",
      description: "Feedback from structure planning stage",
    },
    stage: {
      type: "string",
      description: "Stage of the feedback",
    },
    selectedPaths: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Selected paths of documents",
    },
  },
};
