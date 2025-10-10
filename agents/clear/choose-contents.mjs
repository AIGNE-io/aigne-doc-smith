const TARGET_METADATA = {
  generatedDocs: {
    label: "generated documents",
    description: "Delete all generated documents.",
    agent: "clearGeneratedDocs",
  },
  documentStructure: {
    label: "documentation structure",
    description: "Delete the documentation structure and all generated documents.",
    agent: "clearDocumentStructure",
  },
  documentConfig: {
    label: "document configuration",
    description: "Delete the document configuration.",
    agent: "clearDocumentConfig",
  },
  authTokens: {
    label: "authorizations",
    description: "Clear published site authorizations.",
    agent: "clearAuthTokens",
  },
  deploymentConfig: {
    label: "deployment config",
    description: "Clear deployment configuration (appUrl).",
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
        description: def.description,
      }));

      selectedTargets = await options.prompts.checkbox({
        message: "Select items to clear:",
        choices,
        validate: (answer) => (answer.length > 0 ? true : "Please select at least one item."),
      });
    } else {
      // If no prompts available, show available options
      return {
        message: `Available options to clear: ${TARGET_KEYS.join(", ")}`,
        availableTargets: TARGET_KEYS,
      };
    }
  }

  if (selectedTargets.length === 0) {
    return {
      message: "No items selected to clear.",
    };
  }

  const results = [];
  let hasError = false;
  let configCleared = false;

  // Process each target using its dedicated agent
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
      // Get and invoke the specific agent using context
      const clearAgent = options.context?.agents?.[metadata.agent];
      if (!clearAgent) {
        throw new Error(`Clear agent '${metadata.agent}' not found in context`);
      }

      const result = await options.context.invoke(clearAgent, rest);

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
          path: result.path,
          suggestions: result.suggestions,
        });

        // Track if document config was cleared
        if (target === "documentConfig" && result.cleared) {
          configCleared = true;
        }
      }
    } catch (error) {
      hasError = true;
      results.push({
        status: "error",
        message: `Failed to clear ${metadata.label}: ${error.message}`,
      });
    }
  }

  // Prepare response message
  const header = hasError
    ? "Cleanup finished with some issues."
    : "Cleanup completed successfully!";
  const detailLines = results.map((item) => `- ${item.message}`).join("\n");

  // Collect suggestions
  const suggestions = [];
  results.forEach((result) => {
    if (result.suggestions) {
      suggestions.push(...result.suggestions);
    }
  });

  // Add default suggestion if config was cleared
  if (configCleared && !suggestions.some((s) => s.includes("aigne doc init"))) {
    suggestions.push("Run `aigne doc init` to generate a fresh configuration file.");
  }

  const message = [header, "", detailLines, suggestions.length ? "" : null, suggestions.join("\n")]
    .filter(Boolean)
    .join("\n");

  return {
    message,
  };
}

chooseContents.input_schema = {
  type: "object",
  properties: {
    targets: {
      type: "array",
      description: "Items to clear without confirmation",
      items: {
        type: "string",
        enum: TARGET_KEYS,
      },
    },
  },
};

chooseContents.taskTitle = "Choose contents to clear";
chooseContents.description =
  "Choose contents to clear and execute the appropriate clearing operations";
