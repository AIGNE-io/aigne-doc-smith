export default async function reviewDocumentsWithInvalidLinks(input = {}, options = {}) {
  const { documentsWithInvalidLinks = [] } = input;

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
  const selectedDocs = await options.prompts.checkbox({
    message:
      "Select documents with invalid links to fix (all selected by default, press Enter to confirm, or unselect all to skip):",
    choices,
  });

  // Filter documents based on user selection
  const selectedPaths = new Set(selectedDocs.map((doc) => doc.path));
  const filteredDocs = documentsWithInvalidLinks.filter((doc) => selectedPaths.has(doc.path));

  return {
    documentsWithInvalidLinks: filteredDocs,
  };
}
