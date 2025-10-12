import { execSync } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { isBinaryFile } from "isbinaryfile";
import { encode } from "gpt-tokenizer";
import { isGlobPattern } from "./utils.mjs";
import { INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD } from "./constants/index.mjs";

/**
 * Check if a directory is inside a git repository using git command
 * @param {string} dir - Directory path to check
 * @returns {boolean} True if inside a git repository
 */
export function isInGitRepository(dir) {
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
  if (!includePatterns || includePatterns.length === 0) {
    console.warn("No include patterns provided");
    return [];
  }

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

/**
 * Check if a path exists
 * @param {string} targetPath - Path to check
 * @returns {Promise<boolean>} True if path exists
 */
export async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

/**
 * Convert absolute path to display path relative to current working directory
 * @param {string} targetPath - Absolute path to convert
 * @returns {string} Display path (relative or absolute)
 */
export function toDisplayPath(targetPath) {
  const rel = path.relative(process.cwd(), targetPath);
  return rel.startsWith("..") ? targetPath : rel || ".";
}

/**
 * Resolve path to absolute path
 * @param {string} value - Path to resolve
 * @returns {string|undefined} Absolute path or undefined if no value provided
 */
export function resolveToAbsolute(value) {
  if (!value) return undefined;
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

/**
 * Load files from sourcesPath array
 * Supports file paths, directory paths, and glob patterns
 * @param {string|string[]} sourcesPath - Single path or array of paths
 * @param {object} options - Options for file loading
 * @param {string|string[]} options.includePatterns - Include patterns for directories
 * @param {string|string[]} options.excludePatterns - Exclude patterns for directories
 * @param {boolean} options.useDefaultPatterns - Whether to use default patterns (default: true)
 * @param {string[]} options.defaultIncludePatterns - Default include patterns
 * @param {string[]} options.defaultExcludePatterns - Default exclude patterns
 * @returns {Promise<string[]>} Array of absolute file paths
 */
export async function loadFilesFromPaths(sourcesPath, options = {}) {
  const {
    includePatterns,
    excludePatterns,
    useDefaultPatterns = true,
    defaultIncludePatterns = [],
    defaultExcludePatterns = [],
  } = options;

  const paths = Array.isArray(sourcesPath) ? sourcesPath : [sourcesPath];
  let allFiles = [];

  for (const dir of paths) {
    try {
      if (typeof dir !== "string") {
        console.warn(`Invalid source path: ${dir}`);
        continue;
      }

      // First try to access as a file or directory
      const stats = await stat(dir);

      if (stats.isFile()) {
        // If it's a file, add it directly without filtering
        allFiles.push(dir);
      } else if (stats.isDirectory()) {
        // If it's a directory, use the existing glob logic
        // Load .gitignore for this directory
        const gitignorePatterns = await loadGitignore(dir);

        // Prepare patterns
        let finalIncludePatterns = null;
        let finalExcludePatterns = null;

        if (useDefaultPatterns) {
          // Merge with default patterns
          const userInclude = includePatterns
            ? Array.isArray(includePatterns)
              ? includePatterns
              : [includePatterns]
            : [];
          const userExclude = excludePatterns
            ? Array.isArray(excludePatterns)
              ? excludePatterns
              : [excludePatterns]
            : [];

          finalIncludePatterns = [...defaultIncludePatterns, ...userInclude];
          finalExcludePatterns = [...defaultExcludePatterns, ...userExclude];
        } else {
          // Use only user patterns
          if (includePatterns) {
            finalIncludePatterns = Array.isArray(includePatterns)
              ? includePatterns
              : [includePatterns];
          }
          if (excludePatterns) {
            finalExcludePatterns = Array.isArray(excludePatterns)
              ? excludePatterns
              : [excludePatterns];
          }
        }

        // Get files using glob
        const filesInDir = await getFilesWithGlob(
          dir,
          finalIncludePatterns,
          finalExcludePatterns,
          gitignorePatterns,
        );
        allFiles = allFiles.concat(filesInDir);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        // Path doesn't exist as file or directory, try as glob pattern
        try {
          // Check if it looks like a glob pattern
          const isGlobPatternResult = isGlobPattern(dir);

          if (isGlobPatternResult) {
            // Use glob to find matching files from current working directory
            const matchedFiles = await glob(dir, {
              absolute: true,
              nodir: true, // Only files, not directories
              dot: false, // Don't include hidden files
            });

            if (matchedFiles.length > 0) {
              allFiles = allFiles.concat(matchedFiles);
            }
          }
        } catch (globErr) {
          console.warn(`Failed to process glob pattern "${dir}": ${globErr.message}`);
        }
      } else {
        throw err;
      }
    }
  }

  return allFiles;
}

/**
 * Check if a file is likely a text file by checking if it's binary
 * @param {string} filePath - File path to check
 * @returns {Promise<boolean>} True if file appears to be a text file
 */
async function isTextFile(filePath) {
  try {
    const isBinary = await isBinaryFile(filePath);
    return !isBinary;
  } catch (_error) {
    // If we can't read the file, assume it might be binary to be safe
    return false;
  }
}

/**
 * Read and parse file contents from an array of file paths
 * @param {string[]} files - Array of file paths to read
 * @param {string} baseDir - Base directory for calculating relative paths (defaults to cwd)
 * @param {object} options - Options for reading files
 * @param {boolean} options.skipBinaryFiles - Whether to skip binary files (default: true)
 * @returns {Promise<{sourceId: string, content: string}[]>} Array of file objects with sourceId and content
 */
export async function readFileContents(files, baseDir = process.cwd(), options = {}) {
  const { skipBinaryFiles = true } = options;

  const results = await Promise.all(
    files.map(async (file) => {
      // Skip binary files if enabled
      if (skipBinaryFiles) {
        const isText = await isTextFile(file);
        if (!isText) {
          return null;
        }
      }

      try {
        const content = await readFile(file, "utf8");
        const relativePath = path.relative(baseDir, file);
        return {
          sourceId: relativePath,
          content,
        };
      } catch (error) {
        // If reading as text fails (e.g., binary file), skip it
        console.warn(`Failed to read file as text: ${file} - ${error.message}`);
        return null;
      }
    }),
  );

  // Filter out null results
  return results.filter((result) => result !== null);
}

/**
 * Calculate total lines and tokens from file contents
 * @param {Array<{content: string}>} sourceFiles - Array of objects containing content property
 * @returns {{totalTokens: number, totalLines: number}} Object with totalTokens and totalLines
 */
export function calculateFileStats(sourceFiles) {
  let totalTokens = 0;
  let totalLines = 0;

  for (const source of sourceFiles) {
    const { content } = source;
    if (content) {
      // Count tokens using gpt-tokenizer
      const tokens = encode(content);
      totalTokens += tokens.length;

      // Count lines (excluding empty lines)
      totalLines += content.split("\n").filter((line) => line.trim() !== "").length;
    }
  }

  return { totalTokens, totalLines };
}

/**
 * Build sources content string based on context size
 * For large contexts, only include core project files to avoid token limit issues
 * @param {Array<{sourceId: string, content: string}>} sourceFiles - Array of source file objects
 * @param {boolean} isLargeContext - Whether the context is large
 * @returns {string} Concatenated sources content with sourceId comments
 */
export function buildSourcesContent(sourceFiles, isLargeContext = false) {
  // Define core file patterns that represent project structure and key information
  const coreFilePatterns = [
    // Configuration files
    /package\.json$/,
    /tsconfig\.json$/,
    /jsconfig\.json$/,
    /\.env\.example$/,
    /Cargo\.toml$/,
    /go\.mod$/,
    /pom\.xml$/,
    /build\.gradle$/,
    /Gemfile$/,
    /requirements\.txt$/,
    /Pipfile$/,
    /composer\.json$/,
    /pyproject\.toml$/,

    // Documentation
    /README\.md$/i,
    /CHANGELOG\.md$/i,
    /CONTRIBUTING\.md$/i,
    /\.github\/.*\.md$/i,

    // Entry points and main files
    /index\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /main\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /app\.(js|ts|jsx|tsx|py)$/,
    /server\.(js|ts|jsx|tsx|py)$/,

    // API definitions
    /api\/.*\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /routes\/.*\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /controllers\/.*\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,

    // Type definitions and schemas
    /types\.(ts|d\.ts)$/,
    /schema\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /.*\.d\.ts$/,

    // Core utilities
    /utils\/.*\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /lib\/.*\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
    /helpers\/.*\.(js|ts|jsx|tsx|py|go|rs|java|rb|php)$/,
  ];

  // Function to check if a file is a core file
  const isCoreFile = (filePath) => {
    return coreFilePatterns.some((pattern) => pattern.test(filePath));
  };

  // Build sources string
  let allSources = "";

  if (isLargeContext) {
    // Only include core files for large contexts
    const coreFiles = sourceFiles.filter((source) => isCoreFile(source.sourceId));

    // Determine which files to use and set appropriate message
    const filesToInclude = coreFiles.length > 0 ? coreFiles : sourceFiles;
    const noteMessage =
      coreFiles.length > 0
        ? "// Note: Context is large, showing only core project files.\n"
        : "// Note: Context is large, showing a sample of files.\n";

    allSources += noteMessage;
    let accumulatedTokens = 0;

    for (const source of filesToInclude) {
      const fileContent = `// sourceId: ${source.sourceId}\n${source.content}\n`;
      const fileTokens = encode(fileContent);

      // Check if adding this file would exceed the token limit
      if (accumulatedTokens + fileTokens.length > INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD) {
        break;
      }

      allSources += fileContent;
      accumulatedTokens += fileTokens.length;
    }
  } else {
    // Include all files for normal contexts
    for (const source of sourceFiles) {
      allSources += `// sourceId: ${source.sourceId}\n${source.content}\n`;
    }
  }

  return allSources;
}

/**
 * Get doc-smith configuration file path
 * @param {string} workDir - Working directory (defaults to current directory)
 * @returns {string} Absolute path to config.yaml
 */
export function getConfigFilePath(workDir) {
  const cwd = workDir || process.cwd();
  return path.join(cwd, ".aigne", "doc-smith", "config.yaml");
}

/**
 * Get doc-smith structure plan file path
 * @param {string} workDir - Working directory (defaults to current directory)
 * @returns {string} Absolute path to structure-plan.json
 */
export function getStructurePlanPath(workDir) {
  const cwd = workDir || process.cwd();
  return path.join(cwd, ".aigne", "doc-smith", "output", "structure-plan.json");
}
