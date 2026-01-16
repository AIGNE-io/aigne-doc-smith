import { PATHS } from "../../utils/agent-constants.mjs";

const TARGET_METADATA = {
  authTokens: {
    label: "Authorizations",
    description: () =>
      "Delete authorization information. You will need to re-authorize after clearing.",
    agent: "clearAuthTokens",
  },
  deploymentConfig: {
    label: "Deployment Config",
    description: () =>
      `Delete the appUrl from config file. You will need to re-configure the publish target.`,
    agent: "clearDeploymentConfig",
  },
};

const TARGET_KEYS = Object.keys(TARGET_METADATA);

function normalizeTarget(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (TARGET_METADATA[trimmed]) return trimmed;

  const lowerMatched = TARGET_KEYS.find((key) => key.toLowerCase() === trimmed.toLowerCase());
  return lowerMatched || null;
}

export default async function chooseContents(input = {}, options = {}) {
  const { targets: rawTargets, ...rest } = input;

  const normalizedTargets = Array.isArray(rawTargets)
    ? rawTargets.map(normalizeTarget).filter(Boolean)
    : [];

  let selectedTargets = [...new Set(normalizedTargets)];

  if (selectedTargets.length === 0) {
    if (options?.prompts?.checkbox) {
      const choices = Object.entries(TARGET_METADATA).map(([value, def]) => ({
        name: def.label,
        value,
        description: def.description(),
      }));

      selectedTargets = await options.prompts.checkbox({
        message: "Please select the items you'd like to clear:",
        choices,
        validate: (answer) => (answer.length > 0 ? true : "You must select at least one item."),
      });
    } else {
      return {
        message: `Available options to clear: ${TARGET_KEYS.join(", ")}`,
        availableTargets: TARGET_KEYS,
      };
    }
  }

  if (selectedTargets.length === 0) {
    return {
      message: "You haven't selected any items to clear.",
    };
  }

  const results = [];
  let hasError = false;

  for (const target of selectedTargets) {
    const metadata = TARGET_METADATA[target];
    if (!metadata) {
      results.push({
        status: "error",
        message: `Unknown target: ${target}`,
      });
      hasError = true;
      continue;
    }

    try {
      const clearAgent = options.context?.agents?.[metadata.agent];
      if (!clearAgent) {
        throw new Error(`The clear agent '${metadata.agent}' was not found.`);
      }

      const result = await options.context.invoke(clearAgent, {
        ...rest,
        configPath: PATHS.CONFIG,
      });

      if (result.error) {
        hasError = true;
        results.push({
          status: "error",
          message: result.message,
        });
      } else {
        const status = result.cleared ? "removed" : "noop";
        results.push({
          status,
          message: result.message,
        });
      }
    } catch (error) {
      hasError = true;
      results.push({
        status: "error",
        message: `Failed to clear ${metadata.label}: ${error.message}`,
      });
    }
  }

  const header = hasError
    ? "Cleanup finished with some issues.\n"
    : "Cleanup completed successfully!\n";
  const detailLines = results.map((item) => `${item.message}`).join("\n\n");

  const message = [header, "", detailLines].filter(Boolean).join("\n");

  return {
    message,
  };
}

chooseContents.input_schema = {
  type: "object",
  properties: {
    targets: {
      type: "array",
      description: "A list of items to clear without confirmation.",
      items: {
        type: "string",
        enum: TARGET_KEYS,
      },
    },
  },
};

chooseContents.taskTitle = "Select and clear workspace contents";
chooseContents.description =
  "Select and clear workspace contents, such as authorization tokens and deployment configuration.";
