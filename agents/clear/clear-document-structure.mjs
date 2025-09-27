import { rm } from "node:fs/promises";
import { join } from "node:path";
import { pathExists, toDisplayPath } from "../../utils/file-utils.mjs";

export default async function clearDocumentStructure(input = {}, _options = {}) {
  const { docsDir, workDir } = input;
  const cwd = workDir || process.cwd();

  // Fixed path where structure-plan.json is saved
  const outputDir = join(cwd, ".aigne", "doc-smith", "output");
  const structurePlanPath = join(outputDir, "structure-plan.json");

  const results = [];
  let hasError = false;

  // Clear structure-plan.json
  try {
    const structureExists = await pathExists(structurePlanPath);
    await rm(structurePlanPath, { force: true });

    const structureDisplayPath = toDisplayPath(structurePlanPath);
    const structureMessage = structureExists
      ? `🧹 Cleared document structure plan (${structureDisplayPath})`
      : `📦 Document structure plan already empty (${structureDisplayPath})`;

    results.push({
      type: "structure",
      cleared: structureExists,
      message: structureMessage,
    });
  } catch (error) {
    hasError = true;
    results.push({
      type: "structure",
      error: true,
      message: `❌ Failed to clear document structure plan: ${error.message}`,
    });
  }

  // Clear documents directory if provided
  if (docsDir) {
    try {
      const docsExists = await pathExists(docsDir);
      await rm(docsDir, { recursive: true, force: true });

      const docsDisplayPath = toDisplayPath(docsDir);
      const docsMessage = docsExists
        ? `🧹 Cleared documents directory (${docsDisplayPath})`
        : `📦 Documents directory already empty (${docsDisplayPath})`;

      results.push({
        type: "documents",
        cleared: docsExists,
        message: docsMessage,
      });
    } catch (error) {
      hasError = true;
      results.push({
        type: "documents",
        error: true,
        message: `❌ Failed to clear documents directory: ${error.message}`,
      });
    }
  }

  // Prepare summary message
  const clearedItems = results.filter((r) => r.cleared).length;
  const errorItems = results.filter((r) => r.error).length;

  let header;
  if (errorItems > 0) {
    header = "⚠️ Document structure cleanup finished with some issues.";
  } else if (clearedItems > 0) {
    header = "✅ Document structure cleared successfully!";
  } else {
    header = "📦 Document structure already empty.";
  }

  const detailLines = results.map((item) => `- ${item.message}`).join("\n");
  const message = [header, "", detailLines].filter(Boolean).join("\n");

  return {
    message,
    results,
    hasError,
    clearedCount: clearedItems,
  };
}

clearDocumentStructure.input_schema = {
  type: "object",
  properties: {
    docsDir: {
      type: "string",
      description: "The documents directory to clear (optional)",
    },
    workDir: {
      type: "string",
      description: "The working directory (defaults to current directory)",
    },
  },
};

clearDocumentStructure.taskTitle = "Clear document structure and all generated documents";
clearDocumentStructure.description =
  "Clear the document structure plan (structure-plan.json) and optionally the documents directory";
