import { readFile, access, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";

/**
 * Check if a path exists
 * @param {string} path - Path to check
 * @returns {Promise<boolean>} - True if path exists
 */
async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert YAML structure to array structure
 * @param {Object} yamlData - Parsed YAML data
 * @returns {Array} - Array of document structure items
 */
function convertYamlToStructure(yamlData) {
  if (!yamlData || !yamlData.documents) {
    return [];
  }

  const result = [];
  const processNode = (node, parentId = null) => {
    const item = {
      path: node.path,
      title: node.title,
      parentId,
    };

    if (node.icon) {
      item.icon = node.icon;
    }

    result.push(item);

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        processNode(child, node.path);
      }
    }
  };

  for (const doc of yamlData.documents) {
    processNode(doc);
  }
  return result;
}

/**
 * Load document structure from output directory
 * @param {string} outputDir - Output directory path
 * @returns {Promise<Array|null>} - Document structure array or null
 */
export async function loadDocumentStructure(outputDir) {
  if (!outputDir) {
    return null;
  }

  // Try loading document-structure.yaml as fallback
  try {
    const yamlPath = join(outputDir, "document-structure.yaml");
    const yamlExists = await pathExists(yamlPath);

    if (yamlExists) {
      const yamlContent = await readFile(yamlPath, "utf8");
      if (yamlContent?.trim()) {
        try {
          const parsed = yamlParse(yamlContent);
          if (parsed?.documents) {
            return convertYamlToStructure(parsed);
          }
        } catch (parseError) {
          console.error(`Failed to parse document-structure.yaml: ${parseError.message}`);
        }
      }
    }
  } catch (readError) {
    if (readError.code !== "ENOENT") {
      console.warn(`Error reading document-structure.yaml: ${readError.message}`);
    }
  }

  return null;
}

/**
 * Build a tree structure from a flat document structure array
 * @param {Array} documentStructure - Flat document structure array
 * @returns {Object} - Object with rootNodes array and nodeMap
 */
export function buildDocumentTree(documentStructure) {
  const nodeMap = new Map();
  const rootNodes = [];

  documentStructure.forEach((node) => {
    nodeMap.set(node.path, {
      ...node,
      children: [],
    });
  });

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
 * Recursively generate sidebar text from document tree nodes
 * @param {Array} nodes - Array of tree nodes
 * @param {string} indent - Current indentation level
 * @returns {string} - Formatted sidebar text
 */
function walk(nodes, indent = "") {
  let out = "";
  for (const node of nodes) {
    const realIndent = node.parentId === null ? "" : indent;

    // Convert path to .md file path
    // Keep directory structure instead of flattening
    let linkPath;
    if (node.path.endsWith(".md")) {
      linkPath = node.path.startsWith("/") ? node.path : `/${node.path}`;
    } else {
      // Add .md suffix while preserving directory structure
      const relPath = node.path.replace(/^\//, "");
      linkPath = `/${relPath}.md`;
    }

    out += `${realIndent}* [${node.title}](${linkPath})\n`;

    if (node.children && node.children.length > 0) {
      out += walk(node.children, `${indent}  `);
    }
  }
  return out;
}

/**
 * Generate sidebar markdown from document structure
 * @param {Array} documentStructure - Flat document structure array
 * @returns {string} - Formatted sidebar markdown
 */
export function generateSidebar(documentStructure) {
  const { rootNodes } = buildDocumentTree(documentStructure);
  return walk(rootNodes).replace(/\n+$/, "");
}

/**
 * Get main language files from docs directory
 * @param {string} docsDir - Documentation directory
 * @returns {Promise<Array>} - Array of markdown files
 */
export async function getMainLanguageFiles(docsDir) {
  try {
    await access(docsDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const files = await readdir(docsDir);

  const filteredFiles = [];
  const filesSet = new Set(files);
  const processedBaseNames = new Set();

  for (const file of files) {
    if (!file.endsWith(".md") || file === "_sidebar.md") {
      continue;
    }

    const localeMatch = file.match(/^(.+)\.\w{2}(-\w+)?\.md$/);

    if (localeMatch) {
      const baseName = localeMatch[1];
      const baseFileName = `${baseName}.md`;

      if (!filesSet.has(baseFileName) && !processedBaseNames.has(baseName)) {
        filteredFiles.push(file);
        processedBaseNames.add(baseName);
      }
    } else {
      const baseName = file.replace(/\.md$/, "");
      if (!processedBaseNames.has(baseName)) {
        filteredFiles.push(file);
        processedBaseNames.add(baseName);
      }
    }
  }

  return filteredFiles;
}
