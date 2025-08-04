import {
  getCurrentGitHead,
  hasFileChangesBetweenCommits,
} from "../utils/utils.mjs";

export default async function checkStructurePlanning(
  { originalStructurePlan, feedback, lastGitHead, ...rest },
  options
) {
  // Check if we need to regenerate structure plan
  let shouldRegenerate = false;

  // If no feedback and originalStructurePlan exists, check for git changes
  if (originalStructurePlan && !feedback) {
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
  }

  // If no regeneration needed, return original structure plan
  if (originalStructurePlan && !feedback && !shouldRegenerate) {
    return {
      structurePlan: originalStructurePlan,
    };
  }

  const panningAgent = options.context.agents["reflective-structure-planner"];

  const result = await options.context.invoke(panningAgent, {
    feedback: feedback || "",
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
