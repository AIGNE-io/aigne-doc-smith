import { promises as fs } from "node:fs";
import { join } from "node:path";
import { loadConfigFromFile, processConfigFields } from "../../utils/utils.mjs";

/**
 * Ensure all root-level document entries have icons
 * Batch processing: Collects all entries without icons and generates them in a single call
 * Conditionally saves the updated structure if icons were generated
 * This is a reusable agent that can be used in structure planning and before publishing
 */
export default async function ensureDocumentIcons(inputOrParams, options) {
  // Handle multiple calling patterns:
  // 1. As function skill: (input, options) where input.documentStructure exists
  // 2. As function skill: (input, options) where input.originalDocumentStructure exists
  // 3. As standalone function: ({ documentStructure }, options)
  const documentStructure =
    inputOrParams?.documentStructure ||
    inputOrParams?.originalDocumentStructure ||
    (Array.isArray(inputOrParams) ? inputOrParams : null);

  if (!documentStructure || !Array.isArray(documentStructure)) {
    // Return input unchanged if no documentStructure to process
    return inputOrParams || {};
  }

  // Batch collect all root-level items that need icon generation
  // Only process root-level items (parentId is null, undefined, or empty string)
  // Only generate icons for items that don't have one
  const itemsNeedingIcon = documentStructure.filter((item) => {
    // Only process root-level items
    const isRootLevel = !item.parentId || item.parentId === "null" || item.parentId === "";
    if (!isRootLevel) return false;

    // Must have title and description for icon generation
    if (!item.title || !item.description) return false;

    // Only generate if icon is missing
    const hasNoIcon = !item.icon || !item.icon.trim();
    return hasNoIcon;
  });

  // If all items already have icons, skip
  if (itemsNeedingIcon.length === 0) {
    return inputOrParams || {};
  }

  // Prepare batch list for icon generation
  const documentList = itemsNeedingIcon.map((item) => ({
    path: item.path,
    title: item.title,
    description: item.description,
  }));

  const iconAgent = options?.context?.agents?.["documentIconGenerate"];
  if (!iconAgent) {
    console.warn("⚠️  documentIconGenerate agent not found. Skipping icon generation.");
    return inputOrParams || {};
  }

  let iconsGenerated = false;

  try {
    // Batch generate all missing icons in a single call
    const iconResult = await options.context.invoke(iconAgent, {
      documentList,
    });

    // Batch update all document items with generated icons using path as the key
    if (iconResult.documentList && Array.isArray(iconResult.documentList)) {
      const iconMap = new Map(iconResult.documentList.map((item) => [item.path, item.icon]));

      for (const item of documentStructure) {
        const generatedIcon = iconMap.get(item.path);
        if (generatedIcon) {
          item.icon = generatedIcon;
          iconsGenerated = true;
        }
      }
    }

    // Conditionally save the updated structure if icons were generated
    // Use the same save pattern as save-output.mjs for consistency
    if (iconsGenerated) {
      // Try to get outputDir from multiple sources (same as create flow)
      let outputDir =
        inputOrParams?.outputDir ||
        options?.context?.userContext?.outputDir ||
        options?.context?.config?.outputDir;

      // If still not found, load from config file and process defaults
      if (!outputDir) {
        try {
          const config = await loadConfigFromFile();
          const processedConfig = await processConfigFields(config || {});
          outputDir = processedConfig?.outputDir;
        } catch {
          // Ignore config load errors
        }
      }

      if (outputDir) {
        try {
          // Use the same save pattern as save-output.mjs
          const savePath = outputDir;
          const fileName = "structure-plan.json";
          const content = JSON.stringify(documentStructure, null, 2);

          await fs.mkdir(savePath, { recursive: true });
          const filePath = join(savePath, fileName);
          await fs.writeFile(filePath, content, "utf8");
        } catch (saveError) {
          console.warn("⚠️  Failed to save updated structure:", saveError.message);
          // Continue even if save fails
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

ensureDocumentIcons.taskTitle = "Ensure document icons";
ensureDocumentIcons.description =
  "Check each root-level document entry for icons - if missing, generate one; if present, skip";
ensureDocumentIcons.task_render_mode = "hide";
