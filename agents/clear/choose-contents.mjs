import { getDocSmithEnvFilePath } from "../../utils/auth-utils.mjs";
import {
  getConfigFilePath,
  getMediaDescriptionCachePath,
  getStructurePlanPath,
  toDisplayPath,
} from "../../utils/file-utils.mjs";

const TARGET_METADATA = {
  generatedDocs: {
    label: "Generated Documents",
    description: ({ docsDir }) =>
      `Delete all generated documents in './${toDisplayPath(docsDir)}'. The documentation structure will be preserved.`,
    agent: "clearGeneratedDocs",
  },
  documentStructure: {
    label: "Documentation Structure",
    description: ({ docsDir, workDir }) =>
      `Delete all generated documents in './${toDisplayPath(docsDir)}' and the documentation structure in './${toDisplayPath(
        getStructurePlanPath(workDir),
      )}'.`,
    agent: "clearDocumentStructure",
  },
  documentConfig: {
    label: "Document Configuration",
    description: ({ workDir }) =>
      `Delete the configuration file in './${toDisplayPath(
        getConfigFilePath(workDir),
      )}'. You will need to run \`aigne doc init\` to regenerate it.`,
    agent: "clearDocumentConfig",
  },
  authTokens: {
    label: "Authorizations",
    description: () =>
      `Delete authorization information in '${getDocSmithEnvFilePath()}'. You will need to re-authorize after clearing.`,
    agent: "clearAuthTokens",
  },
  deploymentConfig: {
    label: "Deployment Config",
    description: ({ workDir }) =>
      `Delete the appUrl from './${toDisplayPath(getConfigFilePath(workDir))}'.`,
    agent: "clearDeploymentConfig",
  },
  mediaDescription: {
    label: "Media File Descriptions",
    description: () =>
      `Delete AI-generated descriptions in './${toDisplayPath(
        getMediaDescriptionCachePath(),
      )}'. They will be regenerated on the next run.`,
    agent: "clearMediaDescription",
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
        description: def.description({ docsDir: input.docsDir, workDir: input.workDir }),
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
  let configCleared = false;

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

  const header = hasError
    ? "Cleanup finished with some issues."
    : "Cleanup completed successfully!";
  const detailLines = results.map((item) => `- ${item.message}`).join("\n");

  const suggestions = [];
  results.forEach((result) => {
    if (result.suggestions) {
      suggestions.push(...result.suggestions);
    }
  });

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
      description: "A list of items to clear without confirmation.",
      items: {
        type: "string",
        enum: TARGET_KEYS,
      },
    },
  },
};

chooseContents.taskTitle = "Select and clear project contents";
chooseContents.description =
  "Select and clear project contents, such as generated documents, configuration, and authorization tokens.";
