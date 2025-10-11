import { rm } from "node:fs/promises";
import { pathExists, toDisplayPath, getConfigFilePath } from "../../utils/file-utils.mjs";

export default async function clearDocumentConfig({ workDir }) {
  const documentConfigPath = getConfigFilePath(workDir);
  const displayPath = toDisplayPath(documentConfigPath);

  try {
    const existed = await pathExists(documentConfigPath);
    await rm(documentConfigPath, { recursive: true, force: true });

    const message = existed
      ? `Cleared document configuration (${displayPath})`
      : `Document configuration already empty (${displayPath})`;

    const suggestions = existed
      ? ["Run `aigne doc init` to generate a fresh configuration file."]
      : [];

    return {
      message,
      cleared: existed,
      path: displayPath,
      suggestions,
    };
  } catch (error) {
    return {
      message: `Failed to clear document configuration: ${error.message}`,
      error: true,
      path: displayPath,
    };
  }
}

clearDocumentConfig.taskTitle = "Clear document configuration";
clearDocumentConfig.description = "Clear the document configuration file";
