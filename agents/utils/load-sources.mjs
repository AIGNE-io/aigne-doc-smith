import { readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";
import imageSize from "image-size";
import {
  buildSourcesContent,
  calculateFileStats,
  loadFilesFromPaths,
  readFileContents,
  getMimeType,
  checkIsHttpFile,
} from "../../utils/file-utils.mjs";
import {
  getCurrentGitHead,
  getModifiedFilesBetweenCommits,
  toRelativePath,
} from "../../utils/utils.mjs";
import {
  INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD,
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_INCLUDE_PATTERNS,
} from "../../utils/constants/index.mjs";
import { isOpenAPIFile } from "../../utils/openapi/index.mjs";


export default async function loadSources(
  {
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
    media,
  } = {},
  options,
) {
  let files = Array.isArray(sources) ? [...sources] : [];
  const { minImageWidth } = media || { minImageWidth: 800 };

  if (sourcesPath) {
    const pickSourcesPath = [];
    const omitSourcesPath = [];
    sourcesPath.forEach(x => {
      if (x.startsWith("!")) {
        omitSourcesPath.push(x.substring(1));
      } else {
        pickSourcesPath.push(x);
      }
    })

    const customExcludePatterns = omitSourcesPath.map(x => {
      const stats = statSync(x);
      if (stats.isFile()) {
        return x;
      }
      if (stats.isDirectory()) {
        return `${x}/**`;
      }
      return null;
    }).filter(Boolean);
    const allFiles = await loadFilesFromPaths(pickSourcesPath, {
      includePatterns,
      excludePatterns: [...(excludePatterns || []), ...customExcludePatterns],
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
    ".heic",
    ".heif",
    ".mp4",
    ".mpeg",
    ".mpg",
    ".mov",
    ".avi",
    ".flv",
    ".mkv",
    ".webm",
    ".wmv",
    ".m4v",
    ".3gpp",
  ];

  // Separate source files from media files
  const sourceFilesPaths = [];
  const mediaFiles = [];

  // Helper function to determine file type from extension
  const getFileType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".heic", ".heif"];
    const videoExts = [
      ".mp4",
      ".mpeg",
      ".mpg",
      ".mov",
      ".avi",
      ".flv",
      ".mkv",
      ".webm",
      ".wmv",
      ".m4v",
      ".3gpp",
    ];

    if (imageExts.includes(ext)) return "image";
    if (videoExts.includes(ext)) return "video";
    return "media";
  };

  let filteredImageCount = 0;

  await Promise.all(
    files.map(async (file) => {
      const ext = path.extname(file).toLowerCase();

      if (mediaExtensions.includes(ext) && !checkIsHttpFile(file)) {
        // This is a media file
        const relativePath = path.relative(docsDir, file);
        const fileName = path.basename(file);
        const description = path.parse(fileName).name;

        const mediaItem = {
          name: fileName,
          path: relativePath,
          type: getFileType(relativePath),
          description,
          mimeType: getMimeType(file),
        };

        // For image files, get dimensions and filter by width
        if (mediaItem.type === "image") {
          try {
            const buffer = await readFile(file);
            const dimensions = imageSize(buffer);
            mediaItem.width = dimensions.width;
            mediaItem.height = dimensions.height;

            // Filter out images with width less than minImageWidth
            if (dimensions.width < minImageWidth) {
              filteredImageCount++;
              console.log(
                `Filtered image: ${fileName} (${dimensions.width}x${dimensions.height}px < ${minImageWidth}px minimum)`,
              );
              return;
            }
          } catch (err) {
            console.warn(`⚠️  Failed to get dimensions for ${fileName}: ${err.message}`);
          }
        }

        mediaFiles.push(mediaItem);
      } else {
        // This is a source file
        sourceFilesPaths.push(file);
      }
    }),
  );

  // Log summary of filtered images
  if (filteredImageCount > 0) {
    console.log(
      `\nTotal ${filteredImageCount} low-resolution image(s) filtered for better documentation quality (minimum width: ${minImageWidth}px)\n`,
    );
  }

  // Read all source files using the utility function
  let sourceFiles = await readFileContents(sourceFilesPaths, process.cwd());

  // Count tokens and lines using utility function
  const { totalTokens, totalLines } = calculateFileStats(sourceFiles);

  // check if totalTokens is too large
  const isLargeContext = totalTokens > INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD;

  // filter OpenAPI doc should after check isLargeContext
  sourceFiles = sourceFiles.filter((file) => {
    if (options?.context?.userContext.openAPIDoc) return true;

    const isOpenAPI = isOpenAPIFile(file.content);
    if (isOpenAPI) {
      options.context.userContext.openAPIDoc = file;
    }
    return !isOpenAPI;
  });

  const httpFileList = [];

  sourceFiles.forEach((file) => {
    if (checkIsHttpFile(file.sourceId)) {
      httpFileList.push(file);
    }
  });
  options.context.userContext.httpFileList = httpFileList;

  // Build allSources string using utility function
  const allSources = buildSourcesContent(sourceFiles, isLargeContext);
  // all files path
  const allFilesPaths = sourceFiles.map((x) => `- ${toRelativePath(x.sourceId)}`).join("\n");

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

  return {
    datasources: allSources,
    content,
    originalDocumentStructure,
    files,
    modifiedFiles,
    totalTokens,
    totalLines,
    mediaFiles,
    isLargeContext,
    allFilesPaths,
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
    mediaFiles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          path: { type: "string" },
          type: { type: "string" },
          width: { type: "number" },
          height: { type: "number" },
          mimeType: { type: "string" },
        },
      },
      description: "Array of media file objects (images/videos)",
    },
  },
};

loadSources.task_render_mode = "hide";
