import { execSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

/**
 * Check if a directory is inside a git repository using git command
 * @param {string} dir - Directory path to check
 * @returns {boolean} True if inside a git repository
 */
function isInGitRepository(dir) {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd: dir,
      stdio: "pipe",
      encoding: "utf8",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Find git repository root directory using git command
 * @param {string} startDir - Starting directory path
 * @returns {string|null} Git repository root path or null if not found
 */
function findGitRoot(startDir) {
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      cwd: startDir,
      stdio: "pipe",
      encoding: "utf8",
    }).trim();
    return gitRoot;
  } catch {
    return null;
  }
}

/**
 * Convert gitignore patterns to glob-compatible patterns
 * @param {string} pattern - A single gitignore pattern
 * @returns {string[]} Array of glob patterns that match gitignore behavior
 */
function gitignoreToGlobPatterns(pattern) {
  const patterns = [];

  // Remove leading slash (already handled by gitignore parsing)
  const cleanPattern = pattern.replace(/^\//, "");

  // If pattern doesn't contain wildcards and doesn't end with /
  // it could match both files and directories
  if (!cleanPattern.includes("*") && !cleanPattern.includes("?") && !cleanPattern.endsWith("/")) {
    // Add patterns to match both file and directory
    patterns.push(cleanPattern); // Exact match
    patterns.push(`${cleanPattern}/**`); // Directory contents
    patterns.push(`**/${cleanPattern}`); // Nested exact match
    patterns.push(`**/${cleanPattern}/**`); // Nested directory contents
  } else if (cleanPattern.endsWith("/")) {
    // Directory-only pattern
    const dirPattern = cleanPattern.slice(0, -1);
    patterns.push(`${dirPattern}/**`);
    patterns.push(`**/${dirPattern}/**`);
  } else {
    // Pattern with wildcards or specific file
    patterns.push(cleanPattern);
    if (!cleanPattern.startsWith("**/")) {
      patterns.push(`**/${cleanPattern}`);
    }
  }

  return patterns;
}

/**
 * Parse .gitignore content into patterns
 * @param {string} content - .gitignore file content
 * @returns {string[]} Array of ignore patterns converted to glob format
 */
function parseGitignoreContent(content) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.replace(/^\//, "")); // Remove leading slash

  // Convert each gitignore pattern to glob patterns
  const allPatterns = [];
  for (const line of lines) {
    allPatterns.push(...gitignoreToGlobPatterns(line));
  }

  return [...new Set(allPatterns)]; // Remove duplicates
}

/**
 * Load .gitignore patterns from multiple directories (current + all parent directories up to git root)
 * @param {string} dir - Directory path (will search up to find all .gitignore files)
 * @returns {string[]|null} Array of merged ignore patterns or null if no .gitignore found
 */
export async function loadGitignore(dir) {
  // First, check if we're in a git repository
  const inGitRepo = isInGitRepository(dir);
  if (!inGitRepo) {
    // Not in a git repository, just check the current directory
    const gitignorePath = path.join(dir, ".gitignore");
    try {
      await access(gitignorePath);
      const gitignoreContent = await readFile(gitignorePath, "utf8");
      const ignorePatterns = parseGitignoreContent(gitignoreContent);
      return ignorePatterns.length > 0 ? ignorePatterns : null;
    } catch {
      return null;
    }
  }

  // We're in a git repository, collect all .gitignore files from current dir to git root
  const gitRoot = findGitRoot(dir);
  if (!gitRoot) {
    return null;
  }

  const allPatterns = [];
  let currentDir = path.resolve(dir);

  // Collect .gitignore patterns from current directory up to git root
  while (currentDir.startsWith(gitRoot)) {
    const gitignorePath = path.join(currentDir, ".gitignore");
    try {
      await access(gitignorePath);
      const gitignoreContent = await readFile(gitignorePath, "utf8");
      const patterns = parseGitignoreContent(gitignoreContent);

      // Add patterns with context of which directory they came from
      // Patterns from deeper directories take precedence
      allPatterns.unshift(...patterns);
    } catch {
      // .gitignore doesn't exist in this directory, continue
    }

    // Move up one directory
    if (currentDir === gitRoot) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }

  return allPatterns.length > 0 ? [...new Set(allPatterns)] : null;
}

/**
 * Get files using glob patterns
 * @param {string} dir - Directory to search
 * @param {string[]} includePatterns - Include patterns
 * @param {string[]} excludePatterns - Exclude patterns
 * @param {string[]} gitignorePatterns - .gitignore patterns
 * @returns {Promise<string[]>} Array of file paths
 */
export async function getFilesWithGlob(dir, includePatterns, excludePatterns, gitignorePatterns) {
  // Prepare all ignore patterns
  const allIgnorePatterns = [];

  if (excludePatterns) {
    allIgnorePatterns.push(...excludePatterns);
  }

  if (gitignorePatterns) {
    allIgnorePatterns.push(...gitignorePatterns);
  }

  // Add default exclusions if not already present
  const defaultExclusions = ["node_modules/**", "test/**", "temp/**"];
  for (const exclusion of defaultExclusions) {
    if (!allIgnorePatterns.includes(exclusion)) {
      allIgnorePatterns.push(exclusion);
    }
  }

  // Convert patterns to be relative to the directory
  const patterns = includePatterns.map((pattern) => {
    // If pattern doesn't start with / or **, make it relative to dir
    if (!pattern.startsWith("/") && !pattern.startsWith("**")) {
      return `**/${pattern}`; // Use ** to search recursively
    }
    return pattern;
  });

  try {
    const files = await glob(patterns, {
      cwd: dir,
      ignore: allIgnorePatterns.length > 0 ? allIgnorePatterns : undefined,
      absolute: true,
      nodir: true, // Only return files, not directories
      dot: false, // Don't include dot files by default
      gitignore: true, // Enable .gitignore support
    });

    return files;
  } catch (error) {
    console.warn(`Warning: Error during glob search in ${dir}: ${error.message}`);
    return [];
  }
}
