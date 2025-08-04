import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AnthropicChatModel } from "@aigne/anthropic";
import { AIGNE } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";
import { OpenAIChatModel } from "@aigne/openai";
import {
  getCurrentGitHead,
  hasFileChangesBetweenCommits,
} from "../utils/utils.mjs";

// Get current script directory
const __dirname = dirname(fileURLToPath(import.meta.url));

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

  const aigne = await AIGNE.load(join(__dirname, "../"), {
    models: [
      {
        name: OpenAIChatModel.name,
        create: (params) => new OpenAIChatModel({ ...params }),
      },
      {
        name: AnthropicChatModel.name,
        create: (params) => new AnthropicChatModel({ ...params }),
      },
      {
        name: GeminiChatModel.name,
        create: (params) => new GeminiChatModel({ ...params }),
      },
    ],
  });

  const panningAgent = aigne.agents["reflective-structure-planner"];

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
