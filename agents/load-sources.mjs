import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_EXCLUDE_PATTERNS, DEFAULT_INCLUDE_PATTERNS } from "../utils/constants.mjs";
import { getFilesWithGlob, loadGitignore } from "../utils/file-utils.mjs";
import { getCurrentGitHead, getModifiedFilesBetweenCommits } from "../utils/utils.mjs";

export default async function loadSources({
  sources = [],
  sourcesPath = [],
  includePatterns,
  excludePatterns,
  outputDir,
  docsDir,
  "doc-path": docPath,
  boardId,
  useDefaultPatterns = true,
  lastGitHead,
} = {}) {
  let files = Array.isArray(sources) ? [...sources] : [];

  if (sourcesPath) {
    const paths = Array.isArray(sourcesPath) ? sourcesPath : [sourcesPath];
    let allFiles = [];

    for (const dir of paths) {
      try {
        // Check if the path is a file or directory
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

            finalIncludePatterns = [...DEFAULT_INCLUDE_PATTERNS, ...userInclude];
            finalExcludePatterns = [...DEFAULT_EXCLUDE_PATTERNS, ...userExclude];
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
        if (err.code !== "ENOENT") throw err;
      }
    }

    files = files.concat(allFiles);
  }

  files = [...new Set(files)];
  let allSources = "";
  const sourceFiles = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, "utf8");
      // Convert absolute path to relative path from project root
      const relativePath = path.relative(process.cwd(), file);
      allSources += `// sourceId: ${relativePath}\n${content}\n`;
      return {
        sourceId: relativePath,
        content,
      };
    }),
  );

  // Get the last structure plan result
  let originalStructurePlan;
  const structurePlanPath = path.join(outputDir, "structure-plan.json");
  try {
    await access(structurePlanPath);
    const structurePlanResult = await readFile(structurePlanPath, "utf8");
    if (structurePlanResult) {
      try {
        originalStructurePlan = JSON.parse(structurePlanResult);
      } catch (err) {
        console.error(`Failed to parse structure-plan.json: ${err.message}`);
      }
    }
  } catch {
    // The file does not exist, originalStructurePlan remains undefined
  }

  // Get the last output result of the specified path
  let content;
  if (docPath) {
    let fileFullName;

    // First try direct path matching (original format)
    const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
    fileFullName = `${flatName}.md`;
    let filePath = path.join(docsDir, fileFullName);

    try {
      await access(filePath);
      content = await readFile(filePath, "utf8");
    } catch {
      // If not found and boardId is provided, try boardId-flattenedPath format
      if (boardId && docPath.startsWith(`${boardId}-`)) {
        // Extract the flattened path part after boardId-
        const flattenedPath = docPath.substring(boardId.length + 1);
        fileFullName = `${flattenedPath}.md`;
        filePath = path.join(docsDir, fileFullName);

        try {
          await access(filePath);
          content = await readFile(filePath, "utf8");
        } catch {
          // The file does not exist, content remains undefined
        }
      }
    }
  }

  // Get git change detection data
  let modifiedFiles = [];
  let currentGitHead = null;

  if (lastGitHead) {
    try {
      currentGitHead = getCurrentGitHead();
      if (currentGitHead && currentGitHead !== lastGitHead) {
        modifiedFiles = getModifiedFilesBetweenCommits(lastGitHead, currentGitHead);
        console.log(`Detected ${modifiedFiles.length} modified files since last generation`);
      }
    } catch (error) {
      console.warn("Failed to detect git changes:", error.message);
    }
  }

  // Count words and lines in allSources
  let totalWords = 0;
  let totalLines = 0;

  for (const source of Object.values(allSources)) {
    if (typeof source === "string") {
      // Count English words (simple regex for words containing a-zA-Z)
      const words = source.match(/[a-zA-Z]+/g) || [];
      totalWords += words.length;

      // Count lines
      totalLines += source.split("\n").length;
    }
  }

  return {
    datasourcesList: sourceFiles,
    datasources: allSources,
    content,
    originalStructurePlan,
    files,
    modifiedFiles,
    totalWords,
    totalLines,
  };
}

loadSources.input_schema = {
  type: "object",
  properties: {
    sources: {
      type: "array",
      items: { type: "string" },
      description: "Array of paths to the sources files",
    },
    sourcesPath: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "Directory or directories to recursively read files from",
    },
    includePatterns: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "Glob patterns to filter files by path or filename. If not set, include all.",
    },
    excludePatterns: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "Glob patterns to exclude files by path or filename. If not set, exclude none.",
    },
    useDefaultPatterns: {
      type: "boolean",
      description: "Whether to use default include/exclude patterns. Defaults to true.",
    },
    "doc-path": {
      type: "string",
      description: "The document path to load content for",
    },
    boardId: {
      type: "string",
      description: "The board ID for boardId-flattenedPath format matching",
    },
    lastGitHead: {
      type: "string",
      description: "The git HEAD from last generation for change detection",
    },
  },
  required: [],
};

loadSources.output_schema = {
  type: "object",
  properties: {
    datasources: {
      type: "string",
    },
    datasourcesList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceId: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    files: {
      type: "array",
      items: { type: "string" },
      description: "Array of file paths that were loaded",
    },
    modifiedFiles: {
      type: "array",
      items: { type: "string" },
      description: "Array of modified files since last generation",
    },
  },
};
