import chalk from "chalk";
import { getActiveRulesForScope } from "../../utils/preferences-utils.mjs";
import { getProjectInfo, loadConfigFromFile, saveValueToConfig } from "../../utils/utils.mjs";

export default async function checkNeedGenerateStructure(
  { originalDocumentStructure, forceRegenerate, ...rest },
  options,
) {
  // Check if originalDocumentStructure is empty and prompt user
  if (!originalDocumentStructure) {
    const choice = await options.prompts.select({
      message: "Project configured. Generate documentation structure now?",
      choices: [
        {
          name: "Yes, generate now",
          value: "generate",
        },
        {
          name: "No, review configuration first",
          value: "later",
        },
      ],
    });

    if (choice === "later") {
      console.log(`\nConfiguration file: ${chalk.cyan("./.aigne/doc-smith/config.yaml")}`);
      console.log("Review and edit your configuration, then run `aigne doc generate` to continue.");

      // In test environment, return a special result instead of exiting
      if (process.env.NODE_ENV === "test") {
        return {
          userDeferred: true,
          documentStructure: null,
        };
      }

      process.exit(0);
    }
  }

  let finalFeedback = "";

  // User requested regeneration
  if (forceRegenerate) {
    finalFeedback = `
    User requested forced regeneration of documentation structure. Please regenerate based on the latest Data Sources and user requirements, **allowing any modifications**.
    `;
  }

  if (originalDocumentStructure && !forceRegenerate) {
    return {
      documentStructure: originalDocumentStructure,
    };
  }

  const generateStructureAgent = options.context.agents["generateStructure"];

  const structureRules = getActiveRulesForScope("structure", []);
  const globalRules = getActiveRulesForScope("global", []);

  const allApplicableRules = [...structureRules, ...globalRules];
  const ruleTexts = allApplicableRules.map((rule) => rule.rule);

  const userPreferences = ruleTexts.length > 0 ? ruleTexts.join("\n\n") : "";

  const result = await options.context.invoke(generateStructureAgent, {
    ...rest,
    originalDocumentStructure,
    userPreferences,
    feedback: finalFeedback || "",
  });

  let message = "";

  // Check and save project information
  if (result.projectName || result.projectDesc) {
    try {
      const currentConfig = await loadConfigFromFile();
      const projectInfo = await getProjectInfo();

      const userModifiedProjectName =
        currentConfig?.projectName && currentConfig.projectName !== projectInfo.name;
      const userModifiedProjectDesc =
        currentConfig?.projectDesc && currentConfig.projectDesc !== projectInfo.description;

      // Save AI-generated project info if not modified by the user and not from GitHub
      if (!userModifiedProjectName && !userModifiedProjectDesc) {
        let hasUpdated = false;
        // Don't update if the current info is from GitHub
        if (
          result.projectName &&
          result.projectName !== projectInfo.name &&
          !projectInfo.fromGitHub
        ) {
          await saveValueToConfig("projectName", result.projectName);
          message += `Project name: \`${result.projectName}\``;
          hasUpdated = true;
        }

        if (
          result.projectDesc &&
          result.projectDesc !== projectInfo.description &&
          !projectInfo.fromGitHub
        ) {
          await saveValueToConfig("projectDesc", result.projectDesc);
          message += `\nProject description: \`${result.projectDesc}\``;
          hasUpdated = true;
        }

        if (hasUpdated) {
          message = `\n## Project Information Updated\n\nSaved to \`.aigne/doc-smith/config.yaml\`:\n\n${message}\n\n`;
        }
      }
    } catch (error) {
      console.warn("Failed to check/save project information:", error.message);
    }
  }

  return {
    ...result,
    feedback: "", // clear feedback
    projectInfoMessage: message,
    originalDocumentStructure: originalDocumentStructure
      ? originalDocumentStructure
      : JSON.parse(JSON.stringify(result.documentStructure || [])),
  };
}

checkNeedGenerateStructure.taskTitle =
  "Check if documentation structure needs to be generated or updated";
