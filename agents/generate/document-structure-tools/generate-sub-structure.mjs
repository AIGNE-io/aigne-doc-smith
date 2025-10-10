import {
  buildSourcesContent,
  calculateFileStats,
  loadFilesFromPaths,
  readFileContents,
} from "../../../utils/file-utils.mjs";
import {
  INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD,
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_INCLUDE_PATTERNS,
} from "../../../utils/constants/index.mjs";
import { toRelativePath } from "../../../utils/utils.mjs";

export default async function generateSubStructure(
  {
    parentDocument,
    subSourcePaths,
    includePatterns,
    excludePatterns,
    useDefaultPatterns = true,
    ...rest
  },
  options,
) {
  const sourcePaths = subSourcePaths?.map((item) => item.path);
  if (!sourcePaths || sourcePaths.length === 0) {
    return {
      subStructure: [],
    };
  }

  let files = await loadFilesFromPaths(sourcePaths, {
    includePatterns,
    excludePatterns,
    useDefaultPatterns,
    defaultIncludePatterns: DEFAULT_INCLUDE_PATTERNS,
    defaultExcludePatterns: DEFAULT_EXCLUDE_PATTERNS,
  });
  files = [...new Set(files)];

  // all files path
  const allFilesPaths = files.map((file) => `- ${toRelativePath(file)}`).join("\n");

  // Read all source files using the utility function
  const sourceFiles = await readFileContents(files, process.cwd());

  // Count tokens and lines using utility function
  const { totalTokens } = calculateFileStats(sourceFiles);

  // check if totalTokens is too large
  let isLargeContext = false;
  if (totalTokens > INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD) {
    isLargeContext = true;
  }

  // Build allSources string using utility function
  const allSources = buildSourcesContent(sourceFiles, isLargeContext);

  // Performance optimization:
  // Using both structured output and Tool with Gemini model causes redundant calls
  // Only use Tool when context is very large
  const generateStructureAgent = isLargeContext
    ? options.context.agents["generateStructure"]
    : options.context.agents["generateStructureWithoutTools"];
  const result = await options.context.invoke(generateStructureAgent, {
    ...rest,
    isSubStructure: true,
    parentDocument,
    datasources: allSources,
    allFilesPaths,
    isLargeContext,
    files,
    totalTokens,
  });

  return {
    subStructure: result.documentStructure || [],
    message: `Generated a sub structure for '${parentDocument.path}' successfully. Please merge all sub-structures to output the complete document structure.`,
  };
}

generateSubStructure.description = `
Generates a sub-structure 
Handles large file sets by splitting them into smaller sub-document structures when the context size exceeds limits. This approach ensures more focused and complete documentation generation.
`;

generateSubStructure.inputSchema = {
  type: "object",
  properties: {
    parentDocument: {
      type: "object",
      description: "The parent node to generate a sub structure for",
      properties: {
        title: { type: "string", description: "The title of the parent node" },
        description: { type: "string", description: "The description of the parent node" },
        path: {
          type: "string",
          description:
            "The path of the parent node, Path in URL format, cannot be empty, cannot contain spaces or special characters, must start with /, no need to include language level, e.g., /zh/about should return /about ",
        },
        parentId: { type: "string", description: "The parent ID of the parent node" },
        sourceIds: { type: "array", description: "The source IDs of the parent node" },
      },
    },
    subSourcePaths: {
      type: "array",
      description: "The source paths of the sub structure",
      items: {
        type: "object",
        properties: {
          path: { type: "string", description: "The source path of the sub structure" },
          reason: { type: "string", description: "The reason for selecting the source path" },
        },
        required: ["path", "reason"],
      },
    },
  },
};

generateSubStructure.outputSchema = {
  type: "object",
  properties: {
    subStructure: {
      type: "array",
      description:
        "The sub structure of the parent node, need merge all sub-structures and output the complete document structure.",
    },
    message: { type: "string", description: "The message of the sub structure" },
  },
  required: ["subStructure"],
};
