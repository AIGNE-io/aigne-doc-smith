import {
  getCurrentGitHead,
  hasFileChangesBetweenCommits,
} from "../utils/utils.mjs";

export default async function checkStructurePlan(
  { originalStructurePlan, feedback, lastGitHead, ...rest },
  options
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
        const hasChanges = hasFileChangesBetweenCommits(
          lastGitHead,
          currentGitHead
        );
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

  return {
    ...result,
    feedback: "", // clear feedback
    originalStructurePlan: originalStructurePlan
      ? originalStructurePlan
      : JSON.parse(JSON.stringify(result.structurePlan || [])),
  };
}
