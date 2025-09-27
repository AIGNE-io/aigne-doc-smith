import { access } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { getActiveRulesForScope } from "../../utils/preferences-utils.mjs";
import {
  getCurrentGitHead,
  getProjectInfo,
  hasFileChangesBetweenCommits,
  loadConfigFromFile,
  saveValueToConfig,
} from "../../utils/utils.mjs";

export default async function checkNeedGenerateStructure(
  { originalDocumentStructure, feedback, lastGitHead, docsDir, forceRegenerate, ...rest },
  options,
) {
  // Check if originalDocumentStructure is empty and prompt user
  if (!originalDocumentStructure) {
    const choice = await options.prompts.select({
      message:
        "Your project configuration is complete. Would you like to generate the document structure now?",
      choices: [
        {
          name: "Generate now - Start generating the document structure",
          value: "generate",
        },
        {
          name: "Review configuration first - Edit configuration before generating",
          value: "later",
        },
      ],
    });

    if (choice === "later") {
      console.log(`\nConfiguration file: ${chalk.cyan("./.aigne/doc-smith/config.yaml")}`);
      console.log(
        "Review and edit your configuration as needed, then run 'aigne doc generate' to continue.",
      );

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

  // Check if we need to regenerate document structure
  let shouldRegenerate = false;
  let finalFeedback = feedback;

  // If no feedback and originalDocumentStructure exists, check for git changes
  if (originalDocumentStructure) {
    // If no lastGitHead, check if _sidebar.md exists to determine if we should regenerate
    if (!lastGitHead) {
      try {
        // Check if _sidebar.md exists in docsDir
        const sidebarPath = join(docsDir, "_sidebar.md");
        await access(sidebarPath);
        // If _sidebar.md exists, it means last execution was completed, need to regenerate
        shouldRegenerate = true;
      } catch {
        // If _sidebar.md doesn't exist, it means last execution was interrupted, no need to regenerate
        shouldRegenerate = false;
      }
    } else {
      // Check if there are relevant file changes since last generation
      const currentGitHead = getCurrentGitHead();
      if (currentGitHead && currentGitHead !== lastGitHead) {
        const hasChanges = hasFileChangesBetweenCommits(lastGitHead, currentGitHead);
        if (hasChanges) {
          shouldRegenerate = true;
        }
      }
    }

    if (shouldRegenerate) {
      finalFeedback = `
      ${finalFeedback || ""}

      Update document structure based on the latest DataSources:
        1. For new content, add new sections as needed or supplement existing section displays
        2. Be cautious when deleting sections, unless all associated sourceIds have been removed
        3. Do not modify the path of existing sections
        4. Update section sourceIds as needed based on the latest Data Sources
      `;
    }
  }

  // user requested regeneration
  if (forceRegenerate) {
    shouldRegenerate = true;
    finalFeedback = `
    ${finalFeedback || ""}

    User requested forced regeneration of document structure. Please regenerate based on the latest Data Sources and user requirements, **allowing any modifications**.
    `;
  }

  // If no regeneration needed, return original document structure
  if (originalDocumentStructure && !finalFeedback && !shouldRegenerate) {
    return {
      documentStructure: originalDocumentStructure,
    };
  }

  const planningAgent = options.context.agents["refineDocumentStructure"];

  // Get user preferences for document structure and global scope
  const structureRules = getActiveRulesForScope("structure", []);
  const globalRules = getActiveRulesForScope("global", []);

  // Combine structure and global rules, extract only rule text
  const allApplicableRules = [...structureRules, ...globalRules];
  const ruleTexts = allApplicableRules.map((rule) => rule.rule);

  // Convert rule texts to string format for passing to the agent
  const userPreferences = ruleTexts.length > 0 ? ruleTexts.join("\n\n") : "";

  const result = await options.context.invoke(planningAgent, {
    ...rest,
    originalDocumentStructure,
    userPreferences,
    feedback: finalFeedback || "",
  });

  let message = "";

  // Check and save project information if user hasn't modified it
  if (result.projectName || result.projectDesc) {
    try {
      const currentConfig = await loadConfigFromFile();
      const projectInfo = await getProjectInfo();

      // Check if user has modified project information
      const userModifiedProjectName =
        currentConfig?.projectName && currentConfig.projectName !== projectInfo.name;
      const userModifiedProjectDesc =
        currentConfig?.projectDesc && currentConfig.projectDesc !== projectInfo.description;

      // If user hasn't modified project info and it's not from GitHub, save AI output
      if (!userModifiedProjectName && !userModifiedProjectDesc) {
        let hasUpdated = false;
        // Don't update if the current info is from GitHub (meaningful repository info)
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

checkNeedGenerateStructure.taskTitle = "Check if document structure needs generate or update";
