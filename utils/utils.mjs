import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  accessSync,
  constants,
  statSync,
} from "node:fs";
import { parse } from "yaml";
import {
  DEFAULT_INCLUDE_PATTERNS,
  DEFAULT_EXCLUDE_PATTERNS,
} from "./constants.mjs";

/**
 * Normalize path to absolute path for consistent comparison
 * @param {string} filePath - The path to normalize
 * @returns {string} - Absolute path
 */
export function normalizePath(filePath) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
}

/**
 * Convert path to relative path from current working directory
 * @param {string} filePath - The path to convert
 * @returns {string} - Relative path
 */
export function toRelativePath(filePath) {
  return path.isAbsolute(filePath)
    ? path.relative(process.cwd(), filePath)
    : filePath;
}

export function processContent({ content }) {
  // Match markdown regular links [text](link), exclude images ![text](link)
  return content.replace(
    /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, link) => {
      const trimLink = link.trim();
      // Exclude external links and mailto
      if (/^(https?:\/\/|mailto:)/.test(trimLink)) return match;
      // Preserve anchors
      const [path, hash] = trimLink.split("#");
      // Skip if already has extension
      if (/\.[a-zA-Z0-9]+$/.test(path)) return match;
      // Only process relative paths or paths starting with /
      if (!path) return match;
      // Flatten to ./xxx-yyy.md
      let finalPath = path;
      if (path.startsWith(".")) {
        finalPath = path.replace(/^\./, "");
      }
      let flatPath = finalPath.replace(/^\//, "").replace(/\//g, "-");
      flatPath = `./${flatPath}.md`;
      const newLink = hash ? `${flatPath}#${hash}` : flatPath;
      return `[${text}](${newLink})`;
    }
  );
}

/**
 * Save a single document and its translations to files
 * @param {Object} params
 * @param {string} params.path - Relative path (without extension)
 * @param {string} params.content - Main document content
 * @param {string} params.docsDir - Root directory
 * @param {string} params.locale - Main content language (e.g., 'en', 'zh', 'fr')
 * @param {Array<{language: string, translation: string}>} [params.translates] - Translation content
 * @param {Array<string>} [params.labels] - Document labels for front matter
 * @returns {Promise<Array<{ path: string, success: boolean, error?: string }>>}
 */
export async function saveDocWithTranslations({
  path: docPath,
  content,
  docsDir,
  locale,
  translates = [],
  labels,
}) {
  const results = [];
  try {
    // Flatten path: remove leading /, replace all / with -
    const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
    await fs.mkdir(docsDir, { recursive: true });

    // Helper function to generate filename based on language
    const getFileName = (language) => {
      const isEnglish = language === "en";
      return isEnglish ? `${flatName}.md` : `${flatName}.${language}.md`;
    };

    // Save main content with appropriate filename based on locale
    const mainFileName = getFileName(locale);
    const mainFilePath = path.join(docsDir, mainFileName);

    // Add labels front matter if labels are provided
    let finalContent = processContent({ content });
    if (labels && labels.length > 0) {
      const frontMatter = `---\nlabels: ${JSON.stringify(labels)}\n---\n\n`;
      finalContent = frontMatter + finalContent;
    }

    await fs.writeFile(mainFilePath, finalContent, "utf8");
    results.push({ path: mainFilePath, success: true });

    // Process all translations
    for (const translate of translates) {
      const translateFileName = getFileName(translate.language);
      const translatePath = path.join(docsDir, translateFileName);

      // Add labels front matter to translation content if labels are provided
      let finalTranslationContent = processContent({
        content: translate.translation,
      });
      if (labels && labels.length > 0) {
        const frontMatter = `---\nlabels: ${JSON.stringify(labels)}\n---\n\n`;
        finalTranslationContent = frontMatter + finalTranslationContent;
      }

      await fs.writeFile(translatePath, finalTranslationContent, "utf8");
      results.push({ path: translatePath, success: true });
    }
  } catch (err) {
    results.push({ path: docPath, success: false, error: err.message });
  }
  return results;
}

/**
 * Get current git HEAD commit hash
 * @returns {string} - The current git HEAD commit hash
 */
export function getCurrentGitHead() {
  try {
    return execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch (error) {
    // Not in git repository or git command failed
    console.warn("Failed to get git HEAD:", error.message);
    return null;
  }
}

/**
 * Save git HEAD to config.yaml file
 * @param {string} gitHead - The current git HEAD commit hash
 */
export async function saveGitHeadToConfig(gitHead) {
  if (!gitHead) {
    return; // Skip if no git HEAD available
  }

  try {
    const docSmithDir = path.join(process.cwd(), "doc-smith");
    if (!existsSync(docSmithDir)) {
      mkdirSync(docSmithDir, { recursive: true });
    }

    const inputFilePath = path.join(docSmithDir, "config.yaml");
    let fileContent = "";

    // Read existing file content if it exists
    if (existsSync(inputFilePath)) {
      fileContent = await fs.readFile(inputFilePath, "utf8");
    }

    // Check if lastGitHead already exists in the file
    const lastGitHeadRegex = /^lastGitHead:\s*.*$/m;
    const newLastGitHeadLine = `lastGitHead: ${gitHead}`;

    if (lastGitHeadRegex.test(fileContent)) {
      // Replace existing lastGitHead line
      fileContent = fileContent.replace(lastGitHeadRegex, newLastGitHeadLine);
    } else {
      // Add lastGitHead to the end of file
      if (fileContent && !fileContent.endsWith("\n")) {
        fileContent += "\n";
      }
      fileContent += newLastGitHeadLine + "\n";
    }

    await fs.writeFile(inputFilePath, fileContent);
  } catch (error) {
    console.warn("Failed to save git HEAD to config.yaml:", error.message);
  }
}

/**
 * Check if files have been modified between two git commits
 * @param {string} fromCommit - Starting commit hash
 * @param {string} toCommit - Ending commit hash (defaults to HEAD)
 * @param {Array<string>} filePaths - Array of file paths to check
 * @returns {Array<string>} - Array of modified file paths
 */
export function getModifiedFilesBetweenCommits(
  fromCommit,
  toCommit = "HEAD",
  filePaths = []
) {
  try {
    // Get all modified files between commits
    const modifiedFiles = execSync(
      `git diff --name-only ${fromCommit}..${toCommit}`,
      {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      }
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    // Filter to only include files we care about
    if (filePaths.length === 0) {
      return modifiedFiles;
    }

    return modifiedFiles.filter((file) =>
      filePaths.some((targetPath) => {
        const absoluteFile = normalizePath(file);
        const absoluteTarget = normalizePath(targetPath);
        return absoluteFile === absoluteTarget;
      })
    );
  } catch (error) {
    console.warn(
      `Failed to get modified files between ${fromCommit} and ${toCommit}:`,
      error.message
    );
    return [];
  }
}

/**
 * Check if any source files have changed based on modified files list
 * @param {Array<string>} sourceIds - Source file paths
 * @param {Array<string>} modifiedFiles - List of modified files between commits
 * @returns {boolean} - True if any source files have changed
 */
export function hasSourceFilesChanged(sourceIds, modifiedFiles) {
  if (!sourceIds || sourceIds.length === 0 || !modifiedFiles) {
    return false; // No source files or no modified files
  }

  return modifiedFiles.some((modifiedFile) =>
    sourceIds.some((sourceId) => {
      const absoluteModifiedFile = normalizePath(modifiedFile);
      const absoluteSourceId = normalizePath(sourceId);
      return absoluteModifiedFile === absoluteSourceId;
    })
  );
}

/**
 * Check if there are any added or deleted files between two git commits that match the include/exclude patterns
 * @param {string} fromCommit - Starting commit hash
 * @param {string} toCommit - Ending commit hash (defaults to HEAD)
 * @param {Array<string>} includePatterns - Include patterns to match files
 * @param {Array<string>} excludePatterns - Exclude patterns to filter files
 * @returns {boolean} - True if there are relevant added/deleted files
 */
export function hasFileChangesBetweenCommits(
  fromCommit,
  toCommit = "HEAD",
  includePatterns = DEFAULT_INCLUDE_PATTERNS,
  excludePatterns = DEFAULT_EXCLUDE_PATTERNS
) {
  try {
    // Get file changes with status (A=added, D=deleted, M=modified)
    const changes = execSync(
      `git diff --name-status ${fromCommit}..${toCommit}`,
      {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      }
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    // Only check for added (A) and deleted (D) files
    const addedOrDeletedFiles = changes
      .filter((line) => {
        const [status, filePath] = line.split(/\s+/);
        return (status === "A" || status === "D") && filePath;
      })
      .map((line) => line.split(/\s+/)[1]);

    if (addedOrDeletedFiles.length === 0) {
      return false;
    }

    // Check if any of the added/deleted files match the include patterns and don't match exclude patterns
    return addedOrDeletedFiles.some((filePath) => {
      // Check if file matches any include pattern
      const matchesInclude = includePatterns.some((pattern) => {
        // Convert glob pattern to regex for matching
        const regexPattern = pattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*")
          .replace(/\?/g, ".");
        const regex = new RegExp(regexPattern);
        return regex.test(filePath);
      });

      if (!matchesInclude) {
        return false;
      }

      // Check if file matches any exclude pattern
      const matchesExclude = excludePatterns.some((pattern) => {
        // Convert glob pattern to regex for matching
        const regexPattern = pattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, ".*")
          .replace(/\?/g, ".");
        const regex = new RegExp(regexPattern);
        return regex.test(filePath);
      });

      return !matchesExclude;
    });
  } catch (error) {
    console.warn(
      `Failed to check file changes between ${fromCommit} and ${toCommit}:`,
      error.message
    );
    return false;
  }
}

/**
 * Load config from config.yaml file
 * @returns {Promise<Object|null>} - The config object or null if file doesn't exist
 */
export async function loadConfigFromFile() {
  const configPath = path.join(process.cwd(), "doc-smith", "config.yaml");

  try {
    if (!existsSync(configPath)) {
      return null;
    }

    const configContent = await fs.readFile(configPath, "utf8");
    return parse(configContent);
  } catch (error) {
    console.warn("Failed to read config file:", error.message);
    return null;
  }
}

/**
 * Save value to config.yaml file
 * @param {string} key - The config key to save
 * @param {string} value - The value to save
 */
export async function saveValueToConfig(key, value) {
  if (!value) {
    return; // Skip if no value provided
  }

  try {
    const docSmithDir = path.join(process.cwd(), "doc-smith");
    if (!existsSync(docSmithDir)) {
      mkdirSync(docSmithDir, { recursive: true });
    }

    const configPath = path.join(docSmithDir, "config.yaml");
    let fileContent = "";

    // Read existing file content if it exists
    if (existsSync(configPath)) {
      fileContent = await fs.readFile(configPath, "utf8");
    }

    // Check if key already exists in the file
    const keyRegex = new RegExp(`^${key}:\\s*.*$`, "m");
    const newKeyLine = `${key}: ${value}`;

    if (keyRegex.test(fileContent)) {
      // Replace existing key line
      fileContent = fileContent.replace(keyRegex, newKeyLine);
    } else {
      // Add key to the end of file
      if (fileContent && !fileContent.endsWith("\n")) {
        fileContent += "\n";
      }
      fileContent += newKeyLine + "\n";
    }

    await fs.writeFile(configPath, fileContent);
  } catch (error) {
    console.warn(`Failed to save ${key} to config.yaml:`, error.message);
  }
}

/**
 * Validate if a path exists and is accessible
 * @param {string} filePath - The path to validate (can be absolute or relative)
 * @returns {Object} - Validation result with isValid boolean and error message
 */
export function validatePath(filePath) {
  try {
    const absolutePath = normalizePath(filePath);

    // Check if path exists
    if (!existsSync(absolutePath)) {
      return {
        isValid: false,
        error: `Path does not exist: ${filePath}`,
      };
    }

    // Check if path is accessible (readable)
    try {
      accessSync(absolutePath, constants.R_OK);
    } catch (accessError) {
      return {
        isValid: false,
        error: `Path is not accessible: ${filePath}`,
      };
    }

    return {
      isValid: true,
      error: null,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid path format: ${filePath}`,
    };
  }
}

/**
 * Validate multiple paths and return validation results
 * @param {Array<string>} paths - Array of paths to validate
 * @returns {Object} - Validation results with validPaths array and errors array
 */
export function validatePaths(paths) {
  const validPaths = [];
  const errors = [];

  for (const path of paths) {
    const validation = validatePath(path);
    if (validation.isValid) {
      validPaths.push(path);
    } else {
      errors.push({
        path: path,
        error: validation.error,
      });
    }
  }

  return {
    validPaths,
    errors,
  };
}

/**
 * Check if input is a valid directory and add it to results if so
 * @param {string} searchTerm - The search term to check
 * @param {Array} results - The results array to modify
 */
function addExactDirectoryMatch(searchTerm, results) {
  const inputValidation = validatePath(searchTerm);
  if (inputValidation.isValid) {
    const stats = statSync(normalizePath(searchTerm));
    if (stats.isDirectory()) {
      results.unshift({
        name: searchTerm,
        value: searchTerm,
      });
    }
  }
}

/**
 * Get available paths for search suggestions based on user input
 * @param {string} userInput - User's input string
 * @returns {Array<Object>} - Array of path objects with name, value, and description
 */
export function getAvailablePaths(userInput = "") {
  try {
    const searchTerm = userInput.trim();

    // If no input, return current directory contents
    if (!searchTerm) {
      return getDirectoryContents("./");
    }

    let results = [];

    // Handle absolute paths
    if (searchTerm.startsWith("/")) {
      const dirPath = path.dirname(searchTerm);
      const fileName = path.basename(searchTerm);
      results = getDirectoryContents(dirPath, fileName);
      addExactDirectoryMatch(searchTerm, results);
    }
    // Handle relative paths
    else if (searchTerm.startsWith("./") || searchTerm.startsWith("../")) {
      // Extract directory path and search term
      const lastSlashIndex = searchTerm.lastIndexOf("/");
      if (lastSlashIndex === -1) {
        // No slash found, treat as current directory search
        results = getDirectoryContents("./", searchTerm);
        addExactDirectoryMatch(searchTerm, results);
      } else {
        const dirPath = searchTerm.substring(0, lastSlashIndex + 1);
        const fileName = searchTerm.substring(lastSlashIndex + 1);

        // Validate directory path
        const validation = validatePath(dirPath);
        if (!validation.isValid) {
          return [
            {
              name: dirPath,
              value: dirPath,
              description: validation.error,
            },
          ];
        }

        results = getDirectoryContents(dirPath, fileName);
        addExactDirectoryMatch(searchTerm, results);
      }
    }
    // Handle simple file/directory names (search in current directory)
    else {
      results = getDirectoryContents("./", searchTerm);
      addExactDirectoryMatch(searchTerm, results);
    }

    // Remove duplicates based on value (path)
    const uniqueResults = [];
    const seenPaths = new Set();

    for (const item of results) {
      if (!seenPaths.has(item.value)) {
        seenPaths.add(item.value);
        uniqueResults.push(item);
      }
    }

    return uniqueResults;
  } catch (error) {
    console.warn(
      `Failed to get available paths for "${userInput}":`,
      error.message
    );
    return [];
  }
}

/**
 * Get directory contents for a specific path
 * @param {string} dirPath - Directory path to search in
 * @param {string} searchTerm - Optional search term to filter results
 * @returns {Array<Object>} - Array of path objects
 */
function getDirectoryContents(dirPath, searchTerm = "") {
  try {
    const absoluteDirPath = normalizePath(dirPath);

    // Check if directory exists
    if (!existsSync(absoluteDirPath)) {
      return [
        {
          name: dirPath,
          value: dirPath,
          description: "Directory does not exist",
        },
      ];
    }

    const items = [];

    // Read directory contents
    const entries = readdirSync(absoluteDirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryName = entry.name;
      const relativePath = path.join(dirPath, entryName);

      // Filter by search term if provided
      if (
        searchTerm &&
        !entryName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        continue;
      }

      // Skip hidden files and common ignore patterns
      if (
        entryName.startsWith(".") ||
        entryName === "node_modules" ||
        entryName === ".git" ||
        entryName === "dist" ||
        entryName === "build"
      ) {
        continue;
      }

      const isDirectory = entry.isDirectory();

      // Only include directories, skip files
      if (isDirectory) {
        items.push({
          name: relativePath,
          value: relativePath,
        });
      }
    }

    // Sort alphabetically (all items are directories now)
    items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  } catch (error) {
    console.warn(
      `Failed to get directory contents from ${dirPath}:`,
      error.message
    );
    return [];
  }
}
