import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_EXCLUDE_PATTERNS, DEFAULT_INCLUDE_PATTERNS } from "../utils/constants.mjs";
import { getFilesWithGlob, loadGitignore } from "../utils/file-utils.mjs";
import {
  getCurrentGitHead,
  getModifiedFilesBetweenCommits,
  isGlobPattern,
} from "../utils/utils.mjs";

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
        if (err.code === "ENOENT") {
          // Path doesn't exist as file or directory, try as glob pattern
          try {
            // Check if it looks like a glob pattern
            const isGlobPatternResult = isGlobPattern(dir);

            if (isGlobPatternResult) {
              // Use glob to find matching files from current working directory
              const { glob } = await import("glob");
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

    files = files.concat(allFiles);
  }

  files = [...new Set(files)];

  // Define media file extensions
  const mediaExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".m4v",
  ];

  // Separate source files from media files
  const sourceFiles = [];
  const mediaFiles = [];
  let allSources = "";

  await Promise.all(
    files.map(async (file) => {
      const ext = path.extname(file).toLowerCase();

      if (mediaExtensions.includes(ext)) {
        // This is a media file
        const relativePath = path.relative(docsDir, file);
        const fileName = path.basename(file);
        const description = path.parse(fileName).name;

        mediaFiles.push({
          name: fileName,
          path: relativePath,
          description,
        });
      } else {
        // This is a source file
        const content = await readFile(file, "utf8");
        const relativePath = path.relative(process.cwd(), file);
        allSources += `// sourceId: ${relativePath}\n${content}\n`;

        sourceFiles.push({
          sourceId: relativePath,
          content,
        });
      }
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

  // Generate assets content from media files
  let assetsContent = "# Available Media Assets for Documentation\n\n";

  if (mediaFiles.length > 0) {
    // Helper function to determine file type from extension
    const getFileType = (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
      const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];

      if (imageExts.includes(ext)) return "image";
      if (videoExts.includes(ext)) return "video";
      return "media";
    };

    const mediaYaml = mediaFiles.map((file) => ({
      name: file.name,
      path: file.path,
      type: getFileType(file.path),
    }));

    assetsContent += "```yaml\n";
    assetsContent += "assets:\n";
    mediaYaml.forEach((asset) => {
      assetsContent += `  - name: "${asset.name}"\n`;
      assetsContent += `    path: "${asset.path}"\n`;
      assetsContent += `    type: "${asset.type}"\n`;
    });
    assetsContent += "```\n";
  }

  // Count words and lines in allSources
  let totalWords = 0;
  let totalLines = 0;

  for (const source of Object.values(allSources)) {
    if (typeof source === "string") {
      // Count English words (simple regex for words containing a-zA-Z)
      const words = source.match(/[a-zA-Z]+/g) || [];
      totalWords += words.length;

      // Count lines (excluding empty lines)
      totalLines += source.split("\n").filter((line) => line.trim() !== "").length;
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
    assetsContent,
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
    assetsContent: {
      type: "string",
      description: "Markdown content for available media assets",
    },
  },
};

loadSources.task_render_mode = "hide";
