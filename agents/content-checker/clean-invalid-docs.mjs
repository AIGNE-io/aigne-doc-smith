import { readdir, readFile, rm, stat } from "node:fs/promises";
import { parse as yamlParse } from "yaml";
import path from "node:path";
import { loadDocumentPaths } from "../../utils/document-paths.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * Invalid Document Cleaner
 * Delete document files and folders that should not exist before content checking
 */

/**
 * Recursively scan docs directory, collect all document folder paths
 * @param {string} docsDir - Document root directory
 * @param {string} relativePath - Current relative path
 * @returns {Promise<string[]>} - Document path array (without slash prefix)
 */
async function scanDocsFolders(docsDir, relativePath = "") {
  const folders = [];
  const currentDir = path.join(docsDir, relativePath);

  try {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue; // Skip hidden folders

      const folderRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      const folderFullPath = path.join(currentDir, entry.name);

      // Check if it's a document folder (contains .meta.yaml)
      const metaPath = path.join(folderFullPath, ".meta.yaml");
      try {
        await stat(metaPath);
        // .meta.yaml exists, it's a document folder
        folders.push(folderRelativePath);
      } catch (_error) {
        // .meta.yaml doesn't exist, may be an intermediate directory, continue recursion
      }

      // Recursively scan subdirectories
      const subFolders = await scanDocsFolders(docsDir, folderRelativePath);
      folders.push(...subFolders);
    }
  } catch (_error) {
    // Directory doesn't exist or cannot be read, return empty array
  }

  return folders;
}

/**
 * Get valid language list defined in .meta.yaml
 * @param {string} metaPath - .meta.yaml file path
 * @returns {Promise<Set<string>|null>} - Valid language set, returns null if parsing fails
 */
async function getValidLanguages(metaPath) {
  try {
    const content = await readFile(metaPath, "utf8");
    const meta = yamlParse(content);

    const languages = new Set();

    // Get languages from source and default fields
    if (meta.source) languages.add(meta.source);
    if (meta.default) languages.add(meta.default);

    // If there's a languages field, add those too
    if (meta.languages && Array.isArray(meta.languages)) {
      for (const lang of meta.languages) {
        languages.add(lang);
      }
    }

    return languages.size > 0 ? languages : null;
  } catch (_error) {
    return null;
  }
}

/**
 * Extract language code from filename
 * @param {string} filename - Filename
 * @returns {string|null} - Language code (filename without .md suffix), e.g., "zh", "en", "claude-code"
 */
function extractLanguageFromFilename(filename) {
  if (!filename.endsWith(".md")) return null;
  // Return filename without .md suffix as language identifier
  return filename.slice(0, -3);
}

/**
 * Clean invalid documents
 * @param {Object} options - Clean options
 * @param {string} options.yamlPath - Document structure file path
 * @param {string} options.docsDir - Document directory path
 * @param {boolean} options.dryRun - Whether in preview mode (only report, don't delete)
 * @returns {Promise<Object>} - Clean result
 */
export async function cleanInvalidDocs({
  yamlPath = PATHS.DOCUMENT_STRUCTURE,
  docsDir = PATHS.DOCS_DIR,
  dryRun = false,
} = {}) {
  const result = {
    dryRun,
    deletedFolders: [],
    deletedFiles: [],
    errors: [],
  };

  try {
    // 1. Load valid paths from document structure
    let validPaths;
    try {
      validPaths = await loadDocumentPaths({ yamlPath, includeBothFormats: false });
    } catch (_error) {
      // Document structure file doesn't exist, cannot clean
      return result;
    }

    // 2. Scan docs directory for actually existing document folders
    const existingFolders = await scanDocsFolders(docsDir);

    // 3. Find invalid document folders (exist in filesystem but not in document-structure.yaml)
    const invalidFolders = existingFolders.filter((folder) => !validPaths.has(folder));

    // 4. Delete invalid document folders (or only record in dry-run mode)
    for (const folder of invalidFolders) {
      const folderPath = path.join(docsDir, folder);
      if (dryRun) {
        // dry-run mode: only record, don't delete
        result.deletedFolders.push(folder);
      } else {
        try {
          await rm(folderPath, { recursive: true });
          result.deletedFolders.push(folder);
        } catch (error) {
          result.errors.push({
            type: "DELETE_FOLDER_ERROR",
            path: folder,
            message: error.message,
          });
        }
      }
    }

    // 5. For valid document folders, clean invalid language files
    const validFolders = existingFolders.filter((folder) => validPaths.has(folder));

    for (const folder of validFolders) {
      const folderPath = path.join(docsDir, folder);
      const metaPath = path.join(folderPath, ".meta.yaml");

      // Get valid language list
      const validLanguages = await getValidLanguages(metaPath);
      if (!validLanguages) continue; // Cannot parse meta, skip

      // Scan all .md files in folder
      try {
        const files = await readdir(folderPath);

        for (const file of files) {
          // Skip non-.md files and hidden files
          if (!file.endsWith(".md") || file.startsWith(".")) continue;

          const lang = extractLanguageFromFilename(file);
          if (!lang) continue; // Not a language file format, skip

          // Check if language is in valid list
          if (!validLanguages.has(lang)) {
            const filePath = path.join(folderPath, file);
            if (dryRun) {
              // dry-run mode: only record, don't delete
              result.deletedFiles.push(`${folder}/${file}`);
            } else {
              try {
                await rm(filePath);
                result.deletedFiles.push(`${folder}/${file}`);
              } catch (error) {
                result.errors.push({
                  type: "DELETE_FILE_ERROR",
                  path: `${folder}/${file}`,
                  message: error.message,
                });
              }
            }
          }
        }
      } catch (error) {
        result.errors.push({
          type: "READ_FOLDER_ERROR",
          path: folder,
          message: error.message,
        });
      }
    }
  } catch (error) {
    result.errors.push({
      type: "CLEAN_ERROR",
      message: error.message,
    });
  }

  return result;
}

/**
 * Format clean result as string
 * @param {Object} result - Clean result
 * @returns {string} - Formatted output
 */
export function formatCleanResult(result) {
  const { dryRun, deletedFolders, deletedFiles, errors } = result;

  if (deletedFolders.length === 0 && deletedFiles.length === 0 && errors.length === 0) {
    return "";
  }

  let output = "";
  const actionVerb = dryRun ? "Will delete" : "Deleted";
  const modeIndicator = dryRun ? " [Preview Mode]" : "";

  if (deletedFolders.length > 0 || deletedFiles.length > 0) {
    output += `Layer 0: Invalid document cleanup${modeIndicator}\n`;

    if (deletedFolders.length > 0) {
      output += `  ${actionVerb} invalid document folders: ${deletedFolders.length}\n`;
      for (const folder of deletedFolders) {
        output += `    - ${folder}/\n`;
      }
    }

    if (deletedFiles.length > 0) {
      output += `  ${actionVerb} invalid language files: ${deletedFiles.length}\n`;
      for (const file of deletedFiles) {
        output += `    - ${file}\n`;
      }
    }

    output += "\n";
  }

  if (errors.length > 0) {
    output += "Cleanup errors:\n";
    for (const error of errors) {
      output += `  - ${error.path || ""}: ${error.message}\n`;
    }
    output += "\n";
  }

  return output;
}
