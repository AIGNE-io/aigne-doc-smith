import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

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
