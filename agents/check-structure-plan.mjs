import { access } from "node:fs/promises";
import { join } from "node:path";
import { getActiveRulesForScope } from "../utils/preferences-utils.mjs";
import {
  getCurrentGitHead,
  getProjectInfo,
  hasFileChangesBetweenCommits,
  loadConfigFromFile,
  saveValueToConfig,
} from "../utils/utils.mjs";

export default async function checkStructurePlan(
  { originalStructurePlan, feedback, lastGitHead, docsDir, forceRegenerate, ...rest },
  options,
) {
  // Check if we need to regenerate structure plan
  let shouldRegenerate = false;
  let finalFeedback = feedback;
  let submittedFeedback = feedback;

  // Prompt for feedback if originalStructurePlan exists and no feedback provided
  if (originalStructurePlan && !feedback) {
    const userFeedback = await options.prompts.input({
      message: "Please provide feedback for structure planning (press Enter to skip):",
    });

    if (userFeedback?.trim()) {
      finalFeedback = userFeedback.trim();
      submittedFeedback = userFeedback.trim();
    }
  }

  // If no feedback and originalStructurePlan exists, check for git changes
  if (originalStructurePlan) {
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
      
      根据最新的 DataSources 更新结构规划：
        1. 对于新增的内容，可以根据需要新增节点，或补充到原有节点展示
        2. 谨慎删除节点，除非节点关联 sourceIds 都被删除了
        3. 不能修改原有节点的 path
        4. 根据最新的 Data Sources 可以按需要更新节点的 sourceIds。
      `;
    }
  }

  // user requested regeneration
  if (forceRegenerate) {
    shouldRegenerate = true;
    finalFeedback = `
    ${finalFeedback || ""}

    用户请求强制重新生成结构规划，请根据最新的 Data Sources 和用户要求重生生成，**允许任何修改**。
    `;
  }

  // If no regeneration needed, return original structure plan
  if (originalStructurePlan && !finalFeedback && !shouldRegenerate) {
    return {
      structurePlan: originalStructurePlan,
    };
  }

  const panningAgent = options.context.agents["structurePlanning"];

  // Get user preferences for structure planning and global scope
  const structureRules = getActiveRulesForScope("structure", []);
  const globalRules = getActiveRulesForScope("global", []);

  // Combine structure and global rules, extract only rule text
  const allApplicableRules = [...structureRules, ...globalRules];
  const ruleTexts = allApplicableRules.map((rule) => rule.rule);

  // Convert rule texts to string format for passing to the agent
  const userPreferences = ruleTexts.length > 0 ? ruleTexts.join("\n\n") : "";

  const result = await options.context.invoke(panningAgent, {
    feedback: finalFeedback || "",
    originalStructurePlan,
    userPreferences,
    ...rest,
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
          message = `\n### Auto-updated Project Info to \`.aigne/doc-smith/config.yaml\`\n\n${message}\n\n`;
        }
      }
    } catch (error) {
      console.warn("Failed to check/save project information:", error.message);
    }
  }

  return {
    ...result,
    feedback: "", // clear feedback
    structurePlanFeedback: submittedFeedback,
    projectInfoMessage: message,
    originalStructurePlan: originalStructurePlan
      ? originalStructurePlan
      : JSON.parse(JSON.stringify(result.structurePlan || [])),
  };
}

checkStructurePlan.taskTitle = "Check if structure plan needs regeneration";
