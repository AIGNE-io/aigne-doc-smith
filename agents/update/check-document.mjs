import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TeamAgent } from "@aigne/core";

import checkDetailResult from "../utils/check-detail-result.mjs";

// Get current script directory
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function checkDocument(
  {
    path,
    docsDir,
    sourceIds,
    originalDocumentStructure,
    documentStructure,
    modifiedFiles,
    forceRegenerate,
    locale,
    ...rest
  },
  options,
) {
  // Check if the detail file already exists
  const flatName = path.replace(/^\//, "").replace(/\//g, "-");
  const fileFullName = locale === "en" ? `${flatName}.md` : `${flatName}.${locale}.md`;
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

  // Check if sourceIds have changed by comparing with original documentation structure
  let sourceIdsChanged = false;
  if (originalDocumentStructure && sourceIds) {
    // Find the original node in the documentation structure
    const originalNode = originalDocumentStructure.find((node) => node.path === path);

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

  // If file exists, check content validation
  let contentValidationFailed = false;
  let validationResult = {};
  if (detailGenerated && fileContent && documentStructure) {
    validationResult = await checkDetailResult({
      documentStructure,
      reviewContent: fileContent,
      docsDir,
    });

    if (!validationResult.isApproved) {
      contentValidationFailed = true;
    }
  }

  // If file exists, sourceIds haven't changed, source files haven't changed, and content validation passes, no need to regenerate
  if (detailGenerated && !sourceIdsChanged && !contentValidationFailed && !forceRegenerate) {
    return {
      path,
      docsDir,
      ...rest,
      detailGenerated: true,
    };
  }

  const teamAgent = TeamAgent.from({
    name: "generateDocument",
    skills: [
      options.context.agents["handleDocumentUpdate"],
      options.context.agents["translateMultilingual"],
      options.context.agents["saveSingleDoc"],
    ],
  });
  let openAPIDoc = null;

  if (options.context?.userContext?.openAPIDoc?.sourceId) {
    const hasFind = originalDocumentStructure.find(item => {
      if (item.path === path) {
        return item.sourceIds.find(x => x === options.context.userContext.openAPIDoc.sourceId)
      }
      return false;
    });
    if (hasFind) {
      openAPIDoc = options.context.userContext.openAPIDoc;
    }
  }

  const result = await options.context.invoke(teamAgent, {
    ...rest,
    locale,
    docsDir,
    path,
    sourceIds,
    originalDocumentStructure,
    documentStructure,
    detailFeedback: contentValidationFailed ? validationResult.detailFeedback : "",
    openAPIDoc,
  });

  return {
    path,
    docsDir,
    ...rest,
    result,
  };
}

checkDocument.taskTitle = "Check if '{{ title }}' needs generate or update";
