import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TeamAgent } from "@aigne/core";
import fs from "fs-extra";
import pMap from "p-map";

import { getFileName } from "../../utils/utils.mjs";
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
    translates,
    ...rest
  },
  options,
) {
  // Check if the detail file already exists
  const fileFullName = getFileName(path, locale);
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
  const languages = translates.map((x) => x.language);
  const lackLanguages = new Set(languages);
  const skills = [];

  // If file exists, sourceIds haven't changed, source files haven't changed, and content validation passes, no need to regenerate
  if (detailGenerated && !sourceIdsChanged && !contentValidationFailed && !forceRegenerate) {
    await pMap(
      languages,
      async (x) => {
        const languageFileName = getFileName(path, x);
        const languageFilePath = join(docsDir, languageFileName);
        if (await fs.exists(languageFilePath)) {
          lackLanguages.delete(x);
        }
      },
      { concurrency: 5 },
    );
    if (lackLanguages.size === 0) {
      return {
        path,
        docsDir,
        ...rest,
        detailGenerated: true,
      };
    }
    // translations during generation don't need feedback, content is satisfactory
    rest.content = fileContent;
  } else {
    skills.push(options.context.agents["handleDocumentUpdate"]);
  }

  skills.push(options.context.agents["translateMultilingual"]);

  const teamAgent = TeamAgent.from({
    name: "generateDocument",
    skills,
  });
  let openAPISpec = null;

  if (options.context?.userContext?.openAPISpec?.sourceId) {
    const matchingDocument = originalDocumentStructure.find((item) => {
      if (item.path === path) {
        return item.sourceIds.find((x) => x === options.context.userContext.openAPISpec.sourceId);
      }
      return false;
    });
    if (matchingDocument) {
      openAPISpec = options.context.userContext.openAPISpec;
    }
  }

  const result = await options.context.invoke(teamAgent, {
    ...rest,
    translates: translates.filter((x) => lackLanguages.has(x.language)),
    locale,
    docsDir,
    path,
    sourceIds,
    originalDocumentStructure,
    documentStructure,
    detailFeedback: contentValidationFailed ? validationResult.detailFeedback : "",
    openAPISpec,
  });

  return {
    path,
    docsDir,
    ...rest,
    result,
  };
}

checkDocument.taskTitle = "Check if '{{ title }}' needs generate or update";
