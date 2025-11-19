export default async function reviewDocumentsWithInvalidLinks(input = {}, options = {}) {
  const { documentsWithInvalidLinks = [], documentExecutionStructure = [] } = input;

  // If no documents with invalid links, return empty array
  if (!Array.isArray(documentsWithInvalidLinks) || documentsWithInvalidLinks.length === 0) {
    return {
      documentsWithInvalidLinks: [],
    };
  }

  // Create choices for user selection, default all checked
  const choices = documentsWithInvalidLinks.map((doc) => {
    const invalidLinksText =
      doc.invalidLinks && doc.invalidLinks.length > 0
        ? ` (${doc.invalidLinks.length} invalid link${doc.invalidLinks.length > 1 ? "s" : ""})`
        : "";

    return {
      name: `${doc.title || doc.path}${invalidLinksText}`,
      value: doc.path,
      checked: true, // Default all selected
      description: `Invalid Links: ${doc.invalidLinks.join(", ")}`,
    };
  });

  // Let user select documents (default all selected)
  const selectedPaths = await options.prompts.checkbox({
    message:
      "Select documents with invalid links to fix (all selected by default, press Enter to confirm, or unselect all to skip):",
    choices,
  });

  // Filter documents based on user selection
  const selectedPathsSet = new Set(selectedPaths);
  const filteredDocs = documentsWithInvalidLinks.filter((doc) => selectedPathsSet.has(doc.path));

  if (filteredDocs.length === 0) {
    return {
      documentsWithInvalidLinks: [],
      documentsToUpdate: [],
    };
  }

  // Prepare documents: add necessary fields for update (without content)
  const preparedDocs = [];

  for (const doc of filteredDocs) {
    if (!doc.path) continue;

    // Find corresponding document in documentStructure to get additional fields
    const structureDoc = documentExecutionStructure.find((item) => item.path === doc.path);

    // Generate feedback message for removing invalid links
    const invalidLinksList = doc.invalidLinks.map((link) => `- ${link}`).join("\n");
    const feedback = `Please remove the following invalid links from this document:\n\n${invalidLinksList}\n`;

    preparedDocs.push({
      ...structureDoc,
      feedback,
      invalidLinks: doc.invalidLinks,
    });
  }

  return {
    documentsWithInvalidLinks: preparedDocs, // for print summary
    documentsToUpdate: JSON.parse(JSON.stringify(preparedDocs)), // for batch update
  };
}
