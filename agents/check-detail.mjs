import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TeamAgent } from "@aigne/core";
import { hasSourceFilesChanged } from "../utils/utils.mjs";
import checkDetailResult from "./check-detail-result.mjs";

// Get current script directory
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function checkDetail(
  {
    path,
    docsDir,
    sourceIds,
    originalStructurePlan,
    structurePlan,
    modifiedFiles,
    forceRegenerate,
    ...rest
  },
  options,
) {
  // Check if the detail file already exists
  const flatName = path.replace(/^\//, "").replace(/\//g, "-");
  const fileFullName = `${flatName}.md`;
  const filePath = join(docsDir, fileFullName);
  let detailGenerated = true;
  let fileContent = null;

  try {
    await access(filePath);
    // If file exists, read its content for validation
    fileContent = await readFile(filePath, "utf8");
  } catch {
    detailGenerated = false;
  }

  // Check if sourceIds have changed by comparing with original structure plan
  let sourceIdsChanged = false;
  if (originalStructurePlan && sourceIds) {
    // Find the original node in the structure plan
    const originalNode = originalStructurePlan.find((node) => node.path === path);

    if (originalNode?.sourceIds) {
      const originalSourceIds = originalNode.sourceIds;
      const currentSourceIds = sourceIds;

      // Compare arrays (order doesn't matter, but content does)
      if (originalSourceIds.length !== currentSourceIds.length) {
        sourceIdsChanged = true;
      } else {
        // Check if any sourceId is different
        const originalSet = new Set(originalSourceIds);
        const currentSet = new Set(currentSourceIds);

        if (originalSet.size !== currentSet.size) {
          sourceIdsChanged = true;
        } else {
          // Check if any element is different
          for (const sourceId of originalSourceIds) {
            if (!currentSet.has(sourceId)) {
              sourceIdsChanged = true;
              break;
            }
          }
        }
      }
    }
  }

  // Check if source files have changed since last generation
  let sourceFilesChanged = false;
  if (sourceIds && sourceIds.length > 0 && modifiedFiles) {
    sourceFilesChanged = hasSourceFilesChanged(sourceIds, modifiedFiles);

    if (sourceFilesChanged) {
      console.log(`Source files changed for ${path}, will regenerate`);
    }
  }

  // If file exists, check content validation
  let contentValidationFailed = false;
  if (detailGenerated && fileContent && structurePlan) {
    const validationResult = await checkDetailResult({
      structurePlan,
      reviewContent: fileContent,
      docsDir,
    });

    if (!validationResult.isApproved) {
      contentValidationFailed = true;
    }
  }

  // If file exists, sourceIds haven't changed, source files haven't changed, and content validation passes, no need to regenerate
  if (
    detailGenerated &&
    !sourceIdsChanged &&
    !sourceFilesChanged &&
    !contentValidationFailed &&
    !forceRegenerate
  ) {
    return {
      path,
      docsDir,
      ...rest,
      detailGenerated: true,
    };
  }

  const teamAgent = TeamAgent.from({
    name: "generateDetail",
    skills: [options.context.agents["detailGeneratorAndTranslate"]],
  });

  const result = await options.context.invoke(teamAgent, {
    ...rest,
    docsDir,
    path,
    sourceIds,
    originalStructurePlan,
    structurePlan,
  });

  return {
    path,
    docsDir,
    ...rest,
    result,
  };
}

checkDetail.taskTitle = "Check if '{{ title }}' needs regeneration";
