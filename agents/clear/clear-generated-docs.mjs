import { rm } from "node:fs/promises";
import { pathExists, resolveToAbsolute, toDisplayPath } from "../../utils/file-utils.mjs";

export default async function clearGeneratedDocs(input = {}, _options = {}) {
  const { docsDir } = input;

  if (!docsDir) {
    return {
      message: "⚠️ No generated documents directory specified",
    };
  }

  const generatedDocsPath = resolveToAbsolute(docsDir);

  const displayPath = toDisplayPath(generatedDocsPath);

  try {
    const existed = await pathExists(generatedDocsPath);
    await rm(generatedDocsPath, { recursive: true, force: true });

    const message = existed
      ? `🧹 Cleared generated documents (${displayPath})`
      : `📦 Generated documents already empty (${displayPath})`;

    return {
      message,
      cleared: existed,
      path: displayPath,
    };
  } catch (error) {
    return {
      message: `❌ Failed to clear generated documents: ${error.message}`,
      error: true,
      path: displayPath,
    };
  }
}

clearGeneratedDocs.input_schema = {
  type: "object",
  properties: {
    docsDir: {
      type: "string",
      description: "The generated documents directory to clear",
    },
  },
  required: ["docsDir"],
};

clearGeneratedDocs.taskTitle = "Clear all generated documents";
clearGeneratedDocs.description = "Clear the generated documents directory";
