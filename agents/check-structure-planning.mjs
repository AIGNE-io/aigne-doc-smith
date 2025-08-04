import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Get current script directory
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function checkStructurePlanning(
  { originalStructurePlan, feedback, ...rest },
  options
) {
  // If originalStructurePlan exists, return directly
  if (originalStructurePlan && !feedback) {
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
