import { join } from "node:path";
import chalk from "chalk";
import pLimit from "p-limit";
import { generateFileName, pathToFlatName } from "../../../utils/docs-finder-utils.mjs";
import { pathExists } from "../../../utils/file-utils.mjs";

/**
 * Review documentsWithNewLinks and let user select which documents should be updated
 */
export default async function reviewDocumentsWithNewLinks(
  { documentsWithNewLinks = [], documentExecutionStructure = [], locale = "en", docsDir },
  options,
) {
  // If no documents to review, return empty array
  if (!documentsWithNewLinks || documentsWithNewLinks.length === 0) {
    return { documentsWithNewLinks: [], documentsToUpdate: [] };
  }

  // Build choices with file existence check
  const limit = pLimit(50);
  const choices = await Promise.all(
    documentsWithNewLinks.map((document, index) =>
      limit(async () => {
        // Find corresponding document in documentStructure to get title
        const structureDoc = documentExecutionStructure.find((item) => item.path === document.path);
        const title = structureDoc?.title || document.path;

        // Generate filename from document path
        const flatName = pathToFlatName(document.path);
        const filename = generateFileName(flatName, locale);

        // Check file existence if docsDir is provided
        let fileExists = true;
        let missingFileText = "";
        if (docsDir) {
          const filePath = join(docsDir, filename);
          fileExists = await pathExists(filePath);
          if (!fileExists) {
            missingFileText = chalk.red(" - file not found");
          }
        }

        return {
          name: `${title} (${filename})${missingFileText}`,
          value: index,
          checked: fileExists, // Only check if file exists
          disabled: !fileExists, // Disable if file doesn't exist
          description: `New Links: ${document.newLinks.join(", ")}`,
        };
      }),
    ),
  );

  // Let user select which documents to update (default: all selected)
  const selectedDocs = await options.prompts.checkbox({
    message:
      "Select documents that need new links added (all selected by default, press Enter to confirm, or unselect all to skip):",
    choices,
  });

  // Filter documentsWithNewLinks based on user selection
  const filteredDocs = selectedDocs.map((index) => documentsWithNewLinks[index]).filter(Boolean);

  if (filteredDocs.length === 0) {
    console.log(`\n⚠️  No documents selected. Skipping link updates.\n`);
  } else {
    console.log(
      `\n✅ Selected ${filteredDocs.length} out of ${documentsWithNewLinks.length} documents to update.\n`,
    );
  }

  // save original documentsWithNewLinks to user context
  options.context.userContext.originalDocumentsWithNewLinks = filteredDocs;

  if (filteredDocs.length === 0) {
    return {
      documentsWithNewLinks: [],
      documentsToUpdate: [],
    };
  }

  // Prepare documents: add necessary fields for update (e.g. feedback)
  const preparedDocs = [];

  for (const doc of filteredDocs) {
    if (!doc.path) continue;

    // Find corresponding document in documentStructure to get additional fields
    const structureDoc = documentExecutionStructure.find((item) => item.path === doc.path);

    // Generate feedback message for adding new links
    const newLinksList = doc.newLinks.join(", ");
    const feedback = `Add the following links to this document: ${newLinksList}. Identify suitable places within the existing content — such as relevant sections, navigation items — and insert the links naturally to maintain context and readability.`;

    preparedDocs.push({
      ...structureDoc,
      feedback,
      newLinks: doc.newLinks,
    });
  }

  return {
    documentsWithNewLinks: preparedDocs, // for print summary
    documentsToUpdate: JSON.parse(JSON.stringify(preparedDocs)), // for batch update
  };
}

reviewDocumentsWithNewLinks.taskTitle = "Review documents to update";
reviewDocumentsWithNewLinks.description =
  "Let the user review and select which documents should be updated with new links";
