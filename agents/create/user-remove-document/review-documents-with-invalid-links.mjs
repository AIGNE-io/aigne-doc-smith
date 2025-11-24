import {
  buildAllowedLinksFromStructure,
  generateFileName,
  pathToFlatName,
} from "../../../utils/docs-finder-utils.mjs";

/**
 * Generate feedback message for fixing invalid links in a document
 */
function generateInvalidLinksFeedback(invalidLinks, documentPath, documentStructure) {
  const invalidLinksList = invalidLinks.map((link) => `- ${link}`).join("\n");

  // Build allowed links from document structure for replacement suggestions
  const allowedLinks = buildAllowedLinksFromStructure(documentStructure);
  const allowedLinksArray = Array.from(allowedLinks)
    .filter((link) => link !== documentPath) // Exclude current document path
    .sort();

  const allowedLinksList =
    allowedLinksArray.length > 0
      ? allowedLinksArray.map((link) => `- ${link}`).join("\n")
      : "(No available links)";

  return `This document contains invalid links that need to be fixed. Please handle them according to the following instructions:

**Invalid Links Found:**
${invalidLinksList}

**Available Valid Links:**
${allowedLinksList}

**Instructions for fixing invalid links:**

1. For each invalid link found in the document:
   - Using the document context and the list of available valid links, try to find a suitable replacement link from the available valid links.
   - When choosing a replacement, exclude the current document path (${documentPath}); linking to the current document is not logical.
   - **Do not consider the original invalid link or its related text**; they are outdated and should be replaced.

2. If a suitable replacement link is found:
   - Update **all related fields** associated with the invalid link (e.g., link URL, link text, surrounding context) according to the matched link from the available valid links.
   - Ensure that after updating the link, the surrounding content remains consistent and natural. If there is a mismatch, update the corresponding content to keep everything aligned.

3. If no suitable replacement link can be found:
   - Remove the invalid link completely, including the link text and any associated content that only makes sense with that link.
   - **Do not affect other unrelated content** in the document; only remove content that is directly tied to the invalid link.

4. Ensure the document remains coherent and readable after the changes.`;
}

export default async function reviewDocumentsWithInvalidLinks(input = {}, options = {}) {
  const { documentsWithInvalidLinks = [], documentStructure = [], locale = "en" } = input;

  // If no documents with invalid links, return empty array
  if (!Array.isArray(documentsWithInvalidLinks) || documentsWithInvalidLinks.length === 0) {
    return {
      documentsWithInvalidLinks: [],
      documentsToUpdate: [],
    };
  }

  // Create choices for user selection, default all checked
  const choices = documentsWithInvalidLinks.map((doc) => {
    const flatName = pathToFlatName(doc.path);
    const filename = generateFileName(flatName, locale);

    return {
      name: `${doc.title} (${filename})`,
      value: doc.path,
      checked: true, // Default all selected
      description: `Invalid Links(${doc.invalidLinks?.length || 0}): ${doc.invalidLinks?.join(", ")}`,
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
    const structureDoc = documentStructure.find((item) => item.path === doc.path);

    // Generate feedback message for fixing invalid links
    const feedback = generateInvalidLinksFeedback(
      doc.invalidLinks,
      doc.path,
      documentStructure,
    );

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
