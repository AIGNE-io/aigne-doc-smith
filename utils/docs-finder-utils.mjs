import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import pLimit from "p-limit";
import yaml from "yaml";
import { pathExists } from "./file-utils.mjs";

/**
 * Get action-specific text based on isTranslate flag
 * @param {string} baseText - Base text template with {action} placeholder
 * @param {string} action - doc action type
 * @returns {string} Text with action replaced
 */
export function getActionText(baseText, action) {
  return baseText.replace("{action}", action);
}

/**
 * Convert path to flattened name format
 * @param {string} path - Document path (e.g., "/api/users")
 * @returns {string} Flattened name (e.g., "api-users")
 */
export function pathToFlatName(path) {
  return path.replace(/^\//, "").replace(/\//g, "-");
}

/**
 * Generate filename based on flattened path and locale
 * @param {string} flatName - Flattened path name
 * @param {string} locale - Main language locale (e.g., 'en', 'zh', 'fr')
 * @returns {string} Generated filename
 */
export function generateFileName(flatName, locale) {
  const isEnglish = locale === "en";
  return isEnglish ? `${flatName}.md` : `${flatName}.${locale}.md`;
}

/**
 * Find a single item by path in documentation structure result and read its content
 * @param {Array} documentStructure - Array of documentation structure items
 * @param {string} docPath - Document path to find (supports .md filenames)
 * @param {string} boardId - Board ID for fallback matching
 * @param {string} docsDir - Docs directory path for reading content
 * @param {string} locale - Main language locale (e.g., 'en', 'zh', 'fr')
 * @returns {Promise<Object|null>} Found item with content or null
 */
export async function findItemByPath(documentStructure, docPath, boardId, docsDir, locale = "en") {
  let foundItem = null;
  let fileName = null;

  // Check if docPath is a .md filename
  if (docPath.endsWith(".md")) {
    fileName = docPath;
    const flatName = fileNameToFlatPath(docPath);
    foundItem = findItemByFlatName(documentStructure, flatName);
  } else {
    // First try direct path matching
    foundItem = documentStructure.find((item) => item.path === docPath);

    // If not found and boardId is provided, try boardId-flattenedPath format matching
    if (!foundItem && boardId) {
      // Check if path starts with boardId followed by a dash
      if (docPath.startsWith(`${boardId}-`)) {
        // Extract the flattened path part after boardId-
        const flattenedPath = docPath.substring(boardId.length + 1);

        // Find item by comparing flattened paths
        foundItem = documentStructure.find((item) => {
          // Convert item.path to flattened format (replace / with -)
          const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
          return itemFlattenedPath === flattenedPath;
        });
      }
    }

    // Generate filename from found item path
    if (foundItem) {
      const itemFlattenedPath = foundItem.path.replace(/^\//, "").replace(/\//g, "-");
      fileName = generateFileName(itemFlattenedPath, locale);
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
/**
 * Remove base64 encoded images from markdown content
 * This prevents large binary data from being included in document content
 * Base64 images are completely removed (not replaced with placeholders) because:
 * 1. They significantly increase token usage without providing useful information to LLM
 * 2. Normal image references (file paths) are preserved and should be used instead
 * 3. Base64 images are typically temporary or erroneous entries
 * @param {string} content - Markdown content that may contain base64 images
 * @returns {string} - Content with base64 images completely removed
 */
function removeBase64Images(content) {
  if (!content || typeof content !== "string") {
    return content;
  }

  // Match markdown image syntax with data URLs: ![alt](data:image/...;base64,...)
  // This regex matches:
  // - ![alt text](data:image/type;base64,base64data...)
  // - ![alt](data:image/type;base64,base64data...)
  // - [![alt](data:image/type;base64,base64data...)](link)
  const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/[^)]+\)/g;

  // Completely remove base64 images (including the entire markdown image syntax)
  // This maximizes token reduction while preserving normal image references
  const cleanedContent = content.replace(base64ImageRegex, "");

  return cleanedContent;
}

export async function readFileContent(docsDir, fileName) {
  try {
    const filePath = join(docsDir, fileName);
    const content = await readFile(filePath, "utf-8");

    // Remove base64 encoded images to reduce token usage
    // Base64 image data is not useful for LLM processing and significantly increases token count
    return removeBase64Images(content);
  } catch (readError) {
    console.warn(`⚠️  Could not read content from ${fileName}:`, readError.message);
    return null;
  }
}

/**
 * Get main language markdown files from docs directory
 * @param {string} docsDir - Docs directory path
 * @param {string} locale - Main language locale (e.g., 'en', 'zh', 'fr')
 * @param {Array} documentStructure - Array of documentation structure items to determine file order
 * @returns {Promise<string[]>} Array of main language .md files ordered by documentStructure
 */
export async function getMainLanguageFiles(docsDir, locale, documentStructure = null) {
  // Check if docsDir exists
  try {
    await access(docsDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const files = await readdir(docsDir);

  // Filter for main language .md files (exclude _sidebar.md)
  const filteredFiles = files.filter((file) => {
    // Skip non-markdown files and _sidebar.md
    if (!file.endsWith(".md") || file === "_sidebar.md") {
      return false;
    }

    // If main language is English, return files without language suffix
    // FIXME: 临时修改为 zh，后续需要优化
    if (locale === "zh") {
      // Return files that don't have language suffixes (e.g., overview.md, not overview.zh.md)
      return !file.match(/\.\w+(-\w+)?\.md$/);
    } else {
      // For non-English main language, return files with the exact locale suffix
      const localePattern = new RegExp(`\\.${locale}\\.md$`);
      return localePattern.test(file);
    }
  });

  // If documentStructure is provided, sort files according to the order in documentStructure
  if (documentStructure && Array.isArray(documentStructure)) {
    // Create a map from flat file name to documentation structure order
    const orderMap = new Map();
    documentStructure.forEach((item, index) => {
      const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
      const expectedFileName = generateFileName(itemFlattenedPath, locale);
      orderMap.set(expectedFileName, index);
    });

    // Sort filtered files based on their order in documentStructure
    return filteredFiles.sort((a, b) => {
      const orderA = orderMap.get(a);
      const orderB = orderMap.get(b);

      // If both files are in the documentation structure, sort by order
      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }

      // If only one file is in the documentation structure, it comes first
      if (orderA !== undefined) return -1;
      if (orderB !== undefined) return 1;

      // If neither file is in the documentation structure, maintain alphabetical order
      return a.localeCompare(b);
    });
  }

  // If no documentStructure provided, return files in alphabetical order
  return filteredFiles.sort();
}

/**
 * Convert filename to flattened path format
 * @param {string} fileName - File name to convert
 * @returns {string} Flattened path without .md extension and language suffix
 */
export function fileNameToFlatPath(fileName) {
  // Remove .md extension first
  let flatName = fileName.replace(/\.md$/, "");

  // Remove language suffix if present (e.g., .zh, .zh-CN, .fr, etc.)
  flatName = flatName.replace(/\.\w+(-\w+)?$/, "");

  return flatName;
}

/**
 * Find documentation structure item by flattened file name
 * @param {Array} documentStructure - Array of documentation structure items
 * @param {string} flatName - Flattened file name
 * @returns {Object|null} Found item or null
 */
export function findItemByFlatName(documentStructure, flatName) {
  return documentStructure.find((item) => {
    const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
    return itemFlattenedPath === flatName;
  });
}

/**
 * Process selected files and convert to found items with content
 * @param {string[]} selectedFiles - Array of selected file names
 * @param {Array} documentStructure - Array of documentation structure items
 * @param {string} docsDir - Docs directory path
 * @returns {Promise<Object[]>} Array of found items with content
 */
export async function processSelectedFiles(selectedFiles, documentStructure, docsDir) {
  const foundItems = [];

  for (const selectedFile of selectedFiles) {
    // Read the selected .md file content
    const selectedFileContent = await readFileContent(docsDir, selectedFile);

    // Convert filename back to path
    const flatName = fileNameToFlatPath(selectedFile);

    // Try to find matching item by comparing flattened paths
    const foundItemByFile = findItemByFlatName(documentStructure, flatName);

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
      console.warn(`⚠️  No documentation structure item found for file: ${selectedFile}`);
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

/**
 * Convert YAML document structure to flat array format
 * @param {Object} yamlData - Parsed YAML data with documents array
 * @returns {Array} Flat array of document structure items
 */
function convertYamlToStructure(yamlData) {
  const result = [];

  function flattenDocuments(documents, parentId = null) {
    if (!Array.isArray(documents)) {
      return;
    }

    for (const doc of documents) {
      if (!doc.path || !doc.title) {
        continue;
      }

      // Create structure item
      const item = {
        title: doc.title,
        description: doc.description || "",
        path: doc.path,
      };

      if (parentId) {
        item.parentId = parentId;
      }

      if (doc.icon) {
        item.icon = doc.icon;
      }

      if (doc.sourcePaths) {
        item.sourcePaths = doc.sourcePaths;
      }

      result.push(item);

      // Recursively process children
      if (doc.children && Array.isArray(doc.children)) {
        flattenDocuments(doc.children, doc.path);
      }
    }
  }

  flattenDocuments(yamlData.documents);
  return result;
}

/**
 * Load document execution structure from structure-plan.json or document_structure.yaml
 * @param {string} outputDir - Output directory containing structure files
 * @returns {Promise<Array|null>} Document execution structure array or null if not found/failed
 */
export async function loadDocumentStructure(outputDir) {
  if (!outputDir) {
    return null;
  }

  // Try loading structure-plan.json first
  try {
    const structurePlanPath = join(outputDir, "structure-plan.json");
    const structureExists = await pathExists(structurePlanPath);

    if (structureExists) {
      const structureContent = await readFile(structurePlanPath, "utf8");
      if (structureContent?.trim()) {
        try {
          // Validate that the content looks like JSON before parsing
          const trimmedContent = structureContent.trim();
          if (trimmedContent.startsWith("[") || trimmedContent.startsWith("{")) {
            const parsed = JSON.parse(structureContent);
            // Return array if it's an array, otherwise return null
            if (Array.isArray(parsed)) {
              return parsed;
            }
          } else {
            console.warn("structure-plan.json contains non-JSON content, skipping parse");
          }
        } catch (parseError) {
          console.error(`Failed to parse structure-plan.json: ${parseError.message}`);
        }
      }
    }
  } catch (readError) {
    // Only warn if it's not a "file not found" error
    if (readError.code !== "ENOENT") {
      console.warn(`Error reading structure-plan.json: ${readError.message}`);
    }
  }

  // Try loading document_structure.yaml as fallback
  try {
    const yamlPath = join(outputDir, "document_structure.yaml");
    const yamlExists = await pathExists(yamlPath);

    if (yamlExists) {
      const yamlContent = await readFile(yamlPath, "utf8");
      if (yamlContent?.trim()) {
        try {
          const parsed = yaml.parse(yamlContent);
          if (parsed && parsed.documents) {
            return convertYamlToStructure(parsed);
          }
        } catch (parseError) {
          console.error(`Failed to parse document_structure.yaml: ${parseError.message}`);
        }
      }
    }
  } catch (readError) {
    // Only warn if it's not a "file not found" error
    if (readError.code !== "ENOENT") {
      console.warn(`Error reading document_structure.yaml: ${readError.message}`);
    }
  }

  return null;
}

/**
 * Build allowed links set from document structure
 * Includes both original paths and processed .md paths for link validation
 * @param {Array} documentStructure - Array of documentation structure items with path property
 * @returns {Set<string>} Set of allowed link paths
 */
export function buildAllowedLinksFromStructure(documentStructure) {
  const allowedLinks = new Set();

  if (!Array.isArray(documentStructure)) {
    return allowedLinks;
  }

  documentStructure.forEach((item) => {
    if (!item?.path) {
      return;
    }

    // Add original path
    allowedLinks.add(item.path);

    // Add processed .md path (same logic as processContent in utils.mjs)
    let processedPath = item.path;
    if (processedPath.startsWith(".")) {
      processedPath = processedPath.replace(/^\./, "");
    }
    let flatPath = processedPath.replace(/^\//, "").replace(/\//g, "-");
    flatPath = `./${flatPath}.md`;
    allowedLinks.add(flatPath);
  });

  return allowedLinks;
}

/**
 * Build a tree structure from a flat document structure array using parentId
 * @param {Array} documentStructure - Flat array of document structure items with path and parentId
 * @returns {Object} Object containing rootNodes (array of root nodes) and nodeMap (Map for lookups)
 */
export function buildDocumentTree(documentStructure) {
  // Create a map of nodes for easy lookup
  const nodeMap = new Map();
  const rootNodes = [];

  // First pass: create node map
  documentStructure.forEach((node) => {
    nodeMap.set(node.path, {
      ...node,
      children: [],
    });
  });

  // Build the tree structure using parentId
  documentStructure.forEach((node) => {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(nodeMap.get(node.path));
      } else {
        rootNodes.push(nodeMap.get(node.path));
      }
    } else {
      rootNodes.push(nodeMap.get(node.path));
    }
  });

  return { rootNodes, nodeMap };
}

/**
 * Build checkbox choices from tree structure with visual hierarchy
 * @param {Array} nodes - Array of tree nodes
 * @param {string} prefix - Current prefix for indentation
 * @param {number} depth - Current depth level (0 for root)
 * @param {Object} context - Context object containing locale, docsDir, etc.
 * @param {string} context.locale - Main language locale (e.g., 'en', 'zh', 'fr')
 * @param {string} [context.docsDir] - Docs directory path for file existence check
 * @returns {Promise<Array>} Array of choice objects
 */
export async function buildChoicesFromTree(nodes, prefix = "", depth = 0, context = {}) {
  const { locale = "en", docsDir } = context;
  const choices = [];

  // Limit concurrent file checks to 50 per level to avoid overwhelming the file system
  const limit = pLimit(50);

  // Process nodes with controlled concurrency while maintaining order
  const nodePromises = nodes.map((node, i) =>
    limit(async () => {
      const isLastSibling = i === nodes.length - 1;
      const hasChildren = node.children && node.children.length > 0;

      // Build the tree prefix - top level nodes don't have ├─ or └─
      const treePrefix = depth === 0 ? "" : prefix + (isLastSibling ? "└─ " : "├─ ");
      const flatName = pathToFlatName(node.path);
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

      // warningText only shows when file exists, missingFileText has higher priority
      const warningText =
        fileExists && hasChildren ? chalk.yellow(" - will cascade delete all child documents") : "";

      const displayName = `${treePrefix}${node.title} (${filename})${warningText}${missingFileText}`;

      const choice = {
        name: displayName,
        value: node.path,
        short: node.title,
        disabled: !fileExists,
      };

      // Recursively process children
      let childChoices = [];
      if (hasChildren) {
        const childPrefix = depth === 0 ? "" : prefix + (isLastSibling ? "   " : "│  ");
        childChoices = await buildChoicesFromTree(node.children, childPrefix, depth + 1, context);
      }

      return { choice, childChoices };
    }),
  );

  // Wait for all nodes at this level to complete, maintaining order
  const results = await Promise.all(nodePromises);

  // Build choices array in order
  for (const { choice, childChoices } of results) {
    choices.push(choice);
    if (childChoices.length > 0) {
      choices.push(...childChoices);
    }
  }

  return choices;
}

/**
 * Format document structure for printing
 * @param {Array} structure - Document structure array
 * @returns {Object} Object containing rootNodes and printNode function
 */
function formatDocumentStructure(structure) {
  const { rootNodes } = buildDocumentTree(structure);

  function printNode(node, depth = 0) {
    const INDENT_SPACES = "  ";
    const FOLDER_ICON = "  📁";
    const FILE_ICON = "  📄";
    const indent = INDENT_SPACES.repeat(depth);
    const prefix = depth === 0 ? FOLDER_ICON : FILE_ICON;

    console.log(`${indent}${prefix} ${node.title}`);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        printNode(child, depth + 1);
      });
    }
  }

  return { rootNodes, printNode };
}

/**
 * Print document structure in a user-friendly format
 * @param {Array} structure - Document structure array
 */
export function printDocumentStructure(structure) {
  console.log(`\n  ${"-".repeat(50)}`);
  console.log("  Current Documentation Structure");
  console.log(`  ${"-".repeat(50)}`);

  const { rootNodes, printNode } = formatDocumentStructure(structure);

  if (rootNodes.length === 0) {
    console.log("  No documentation structure found.");
  } else {
    rootNodes.forEach((node) => {
      printNode(node);
    });
  }
  console.log();
}
