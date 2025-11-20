/**
 * Review documentsWithNewLinks and let user select which documents should be updated
 */
export default async function reviewDocumentsWithNewLinks(
  { documentsWithNewLinks = [], documentExecutionStructure = [] },
  options,
) {
  // If no documents to review, return empty array
  if (!documentsWithNewLinks || documentsWithNewLinks.length === 0) {
    return { documentsWithNewLinks: [], documentsToUpdate: [] };
  }

  // Let user select which documents to update (default: all selected)
  const selectedDocs = await options.prompts.checkbox({
    message:
      "Select documents that need new links added (all selected by default, press Enter to confirm, or unselect all to skip):",
    choices: documentsWithNewLinks.map((document, index) => ({
      name: `${document.path} → ${document.newLinks.join(", ")}`,
      value: index,
      checked: true, // Default to all selected
    })),
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

  // Prepare documents: add necessary fields for update (without content)
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
