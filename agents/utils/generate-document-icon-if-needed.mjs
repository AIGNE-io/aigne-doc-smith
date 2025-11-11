/**
 * Generate icons for root-level document structure items if they don't have one or if title/description changed
 * Reusable function for generating document icons in various contexts
 * Can be called as a standalone function with { documentStructure, originalItems? } or as a function skill with (input, options)
 * @param {Object|Array} inputOrParams - Either input from previous step (with documentStructure) or params object with documentStructure and optional originalItems
 * @param {Object} options - Agent options with context
 * @param {Array<{path: string, title?: string, description?: string}>} [inputOrParams.originalItems] - Original items for comparison (optional, used to detect title/description changes)
 * @returns {Promise<Object>} - Returns input unchanged (modifies documentStructure in place)
 */
export default async function generateDocumentIconIfNeeded(inputOrParams, options) {
  // Handle both calling patterns:
  // 1. As function skill: (input, options) where input.documentStructure exists
  // 2. As standalone function: ({ documentStructure, originalItems? }, options)
  const documentStructure =
    inputOrParams?.documentStructure || (Array.isArray(inputOrParams) ? inputOrParams : null);
  const originalItems = inputOrParams?.originalItems || [];

  if (!documentStructure || !Array.isArray(documentStructure)) {
    // Return input unchanged if no documentStructure to process
    return inputOrParams || {};
  }

  // Create a map of original items by path for quick lookup
  const originalItemsMap = new Map(
    originalItems.map((item) => [item.path, { title: item.title, description: item.description }]),
  );

  // Filter root-level items that need icon generation or update
  const itemsNeedingIcon = documentStructure.filter((item) => {
    // Only process root-level items (parentId is null, undefined, or empty string)
    const isRootLevel = !item.parentId || item.parentId === "null" || item.parentId === "";
    if (!isRootLevel) return false;

    // Must have title and description for icon generation
    if (!item.title || !item.description) return false;

    // Check if icon is missing
    const hasNoIcon = !item.icon;

    // Check if title or description changed (if original item exists)
    const originalItem = originalItemsMap.get(item.path);
    const titleChanged = originalItem && originalItem.title !== item.title;
    const descriptionChanged = originalItem && originalItem.description !== item.description;
    const contentChanged = titleChanged || descriptionChanged;

    // Generate/update icon if: missing icon OR content changed
    return hasNoIcon || contentChanged;
  });

  if (itemsNeedingIcon.length === 0) {
    return;
  }

  const documentList = itemsNeedingIcon.map((item) => ({
    path: item.path,
    title: item.title,
    description: item.description,
  }));

  const iconAgent = options?.context?.agents?.["documentIconGenerate"];
  if (!iconAgent) {
    console.warn("⚠️  documentIconGenerate agent not found. Skipping icon generation.");
    return;
  }

  try {
    const iconResult = await options.context.invoke(iconAgent, {
      documentList,
    });

    // Update the document items with generated icons using path as the key
    if (iconResult.documentList && Array.isArray(iconResult.documentList)) {
      const iconMap = new Map(iconResult.documentList.map((item) => [item.path, item]));

      for (const item of documentStructure) {
        const iconData = iconMap.get(item.path);
        if (iconData?.icon) {
          item.icon = iconData.icon;
        }
      }
    }
  } catch (error) {
    console.warn("⚠️  Failed to generate document icons:", error.message);
    console.warn("Continuing without icons.");
  }

  // Return input unchanged (documentStructure is modified in place)
  return inputOrParams || {};
}

generateDocumentIconIfNeeded.taskTitle = "Generate document icons if needed";
generateDocumentIconIfNeeded.description =
  "Generate appropriate Lucide icons for root-level document structure items based on their title and description, or update icon if title/description changed";

