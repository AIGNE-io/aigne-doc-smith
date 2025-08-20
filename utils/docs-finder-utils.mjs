import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Get action-specific text based on isTranslate flag
 * @param {boolean} isTranslate - Whether this is a translation action
 * @param {string} baseText - Base text template with {action} placeholder
 * @returns {string} Text with action replaced
 */
export function getActionText(isTranslate, baseText) {
  const action = isTranslate ? "translate" : "update";
  return baseText.replace("{action}", action);
}

/**
 * Find a single item by path in structure plan result and read its content
 * @param {Array} structurePlanResult - Array of structure plan items
 * @param {string} docPath - Document path to find (supports .md filenames)
 * @param {string} boardId - Board ID for fallback matching
 * @param {string} docsDir - Docs directory path for reading content
 * @returns {Promise<Object|null>} Found item with content or null
 */
export async function findItemByPath(structurePlanResult, docPath, boardId, docsDir) {
  let foundItem = null;
  let fileName = null;

  // Check if docPath is a .md filename
  if (docPath.endsWith(".md")) {
    fileName = docPath;
    const flatName = fileNameToFlatPath(docPath);
    foundItem = findItemByFlatName(structurePlanResult, flatName);
  } else {
    // First try direct path matching
    foundItem = structurePlanResult.find((item) => item.path === docPath);

    // If not found and boardId is provided, try boardId-flattenedPath format matching
    if (!foundItem && boardId) {
      // Check if path starts with boardId followed by a dash
      if (docPath.startsWith(`${boardId}-`)) {
        // Extract the flattened path part after boardId-
        const flattenedPath = docPath.substring(boardId.length + 1);

        // Find item by comparing flattened paths
        foundItem = structurePlanResult.find((item) => {
          // Convert item.path to flattened format (replace / with -)
          const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
          return itemFlattenedPath === flattenedPath;
        });
      }
    }

    // Generate filename from found item path
    if (foundItem) {
      const itemFlattenedPath = foundItem.path.replace(/^\//, "").replace(/\//g, "-");
      fileName = `${itemFlattenedPath}.md`;
    }
  }

  if (!foundItem) {
    return null;
  }

  // Read file content if docsDir is provided
  let content = null;
  if (docsDir && fileName) {
    content = await readFileContent(docsDir, fileName);
  }

  // Return item with content
  const result = {
    ...foundItem,
  };

  if (content !== null) {
    result.content = content;
  }

  return result;
}

/**
 * Read file content from docs directory
 * @param {string} docsDir - Docs directory path
 * @param {string} fileName - File name to read
 * @returns {Promise<string|null>} File content or null if failed
 */
export async function readFileContent(docsDir, fileName) {
  try {
    const filePath = join(docsDir, fileName);
    return await readFile(filePath, "utf-8");
  } catch (readError) {
    console.warn(`⚠️  Could not read content from ${fileName}:`, readError.message);
    return null;
  }
}

/**
 * Get main language markdown files from docs directory
 * @param {string} docsDir - Docs directory path
 * @returns {Promise<string[]>} Array of main language .md files
 */
export async function getMainLanguageFiles(docsDir) {
  const files = await readdir(docsDir);

  // Filter for main language .md files (exclude _sidebar.md and language-specific files)
  return files.filter(
    (file) => file.endsWith(".md") && file !== "_sidebar.md" && !file.match(/\.\w+(-\w+)?\.md$/), // Exclude language-specific files like .en.md, .zh-CN.md, etc.
  );
}

/**
 * Convert filename to flattened path format
 * @param {string} fileName - File name to convert
 * @returns {string} Flattened path without .md extension
 */
export function fileNameToFlatPath(fileName) {
  return fileName.replace(/\.md$/, "");
}

/**
 * Find structure plan item by flattened file name
 * @param {Array} structurePlanResult - Array of structure plan items
 * @param {string} flatName - Flattened file name
 * @returns {Object|null} Found item or null
 */
export function findItemByFlatName(structurePlanResult, flatName) {
  return structurePlanResult.find((item) => {
    const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
    return itemFlattenedPath === flatName;
  });
}

/**
 * Process selected files and convert to found items with content
 * @param {string[]} selectedFiles - Array of selected file names
 * @param {Array} structurePlanResult - Array of structure plan items
 * @param {string} docsDir - Docs directory path
 * @returns {Promise<Object[]>} Array of found items with content
 */
export async function processSelectedFiles(selectedFiles, structurePlanResult, docsDir) {
  const foundItems = [];

  for (const selectedFile of selectedFiles) {
    // Read the selected .md file content
    const selectedFileContent = await readFileContent(docsDir, selectedFile);

    // Convert filename back to path
    const flatName = fileNameToFlatPath(selectedFile);

    // Try to find matching item by comparing flattened paths
    const foundItemByFile = findItemByFlatName(structurePlanResult, flatName);

    if (foundItemByFile) {
      const result = {
        ...foundItemByFile,
      };

      // Add content if we read it from user selection
      if (selectedFileContent !== null) {
        result.content = selectedFileContent;
      }

      foundItems.push(result);
    } else {
      console.warn(`⚠️  No structure plan item found for file: ${selectedFile}`);
    }
  }

  return foundItems;
}

/**
 * Add feedback to all items in the array
 * @param {Object[]} items - Array of items to add feedback to
 * @param {string} feedback - Feedback text to add
 * @returns {Object[]} Items with feedback added
 */
export function addFeedbackToItems(items, feedback) {
  if (!feedback?.trim()) {
    return items;
  }

  return items.map((item) => ({
    ...item,
    feedback: feedback.trim(),
  }));
}
