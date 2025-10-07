import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_INCLUDE_PATTERNS,
} from "../../utils/constants/index.mjs";
import {
  calculateFileStats,
  loadFilesFromPaths,
  readFileContents,
} from "../../utils/file-utils.mjs";
import { getCurrentGitHead, getModifiedFilesBetweenCommits } from "../../utils/utils.mjs";

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
  reset = false,
} = {}) {
  let files = Array.isArray(sources) ? [...sources] : [];

  if (sourcesPath) {
    const allFiles = await loadFilesFromPaths(sourcesPath, {
      includePatterns,
      excludePatterns,
      useDefaultPatterns,
      defaultIncludePatterns: DEFAULT_INCLUDE_PATTERNS,
      defaultExcludePatterns: DEFAULT_EXCLUDE_PATTERNS,
    });

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
  const sourceFilesPaths = [];
  const mediaFiles = [];

  for (const file of files) {
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
      sourceFilesPaths.push(file);
    }
  }

  // Read all source files using the utility function
  const sourceFiles = await readFileContents(sourceFilesPaths, process.cwd());

  // Build allSources string
  let allSources = "";
  for (const source of sourceFiles) {
    allSources += `// sourceId: ${source.sourceId}\n${source.content}\n`;
  }

  // Get the last documentation structure
  let originalDocumentStructure;
  if (outputDir) {
    const documentStructurePath = path.join(outputDir, "structure-plan.json");
    try {
      const documentExecutionStructure = await readFile(documentStructurePath, "utf8");
      if (documentExecutionStructure?.trim()) {
        try {
          // Validate that the content looks like JSON before parsing
          const trimmedContent = documentExecutionStructure.trim();
          if (trimmedContent.startsWith("{") || trimmedContent.startsWith("[")) {
            originalDocumentStructure = JSON.parse(documentExecutionStructure);
          } else {
            console.warn(`structure-plan.json contains non-JSON content, skipping parse`);
          }
        } catch (err) {
          console.error(`Failed to parse structure-plan.json: ${err.message}`);
        }
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn(`Error reading structure-plan.json: ${err.message}`);
      }
      // The file does not exist or is not readable, originalDocumentStructure remains undefined
    }
  }

  // Get the last output result of the specified path
  let content;
  if (docPath && !reset && docsDir) {
    // First try direct path matching (original format)
    const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
    const fileFullName = `${flatName}.md`;
    let filePath = path.join(docsDir, fileFullName);

    try {
      content = await readFile(filePath, "utf8");
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn(`Error reading document file ${filePath}: ${err.message}`);
      }

      // If not found and boardId is provided, try boardId-flattenedPath format
      if (boardId && docPath.startsWith(`${boardId}-`)) {
        // Extract the flattened path part after boardId-
        const flattenedPath = docPath.substring(boardId.length + 1);
        const boardIdFileFullName = `${flattenedPath}.md`;
        filePath = path.join(docsDir, boardIdFileFullName);

        try {
          content = await readFile(filePath, "utf8");
        } catch (boardIdErr) {
          if (boardIdErr.code !== "ENOENT") {
            console.warn(`Error reading document file ${filePath}: ${boardIdErr.message}`);
          }
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

  // Count words and lines using utility function
  const { totalWords, totalLines } = calculateFileStats(sourceFiles);

  return {
    datasourcesList: sourceFiles,
    datasources: allSources,
    content,
    originalDocumentStructure,
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
