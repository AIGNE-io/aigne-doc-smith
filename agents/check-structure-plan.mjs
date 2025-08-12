import {
  getCurrentGitHead,
  getProjectInfo,
  hasFileChangesBetweenCommits,
  loadConfigFromFile,
  saveValueToConfig,
} from "../utils/utils.mjs";

export default async function checkStructurePlan(
  { originalStructurePlan, feedback, lastGitHead, ...rest },
  options,
) {
  // Check if we need to regenerate structure plan
  let shouldRegenerate = false;
  let finalFeedback = feedback;

  // If no feedback and originalStructurePlan exists, check for git changes
  if (originalStructurePlan) {
    // If no lastGitHead, regenerate by default
    if (!lastGitHead) {
      shouldRegenerate = true;
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
        4. 根据最新的 Data Sources 按需要更新节点的 sourceIds，如没有大的变化，可以不更新。
      `;
    }
  }

  // If no regeneration needed, return original structure plan
  if (originalStructurePlan && !feedback && !shouldRegenerate) {
    return {
      structurePlan: originalStructurePlan,
    };
  }

  const panningAgent = options.context.agents["reflectiveStructurePlanner"];

  const result = await options.context.invoke(panningAgent, {
    feedback: finalFeedback || "",
    originalStructurePlan,
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
    projectInfoMessage: message,
    originalStructurePlan: originalStructurePlan
      ? originalStructurePlan
      : JSON.parse(JSON.stringify(result.structurePlan || [])),
  };
}

checkStructurePlan.taskTitle = "Check if structure plan needs regeneration";
