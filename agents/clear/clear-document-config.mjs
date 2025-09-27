import { rm } from "node:fs/promises";
import { join } from "node:path";
import { pathExists, toDisplayPath } from "../../utils/file-utils.mjs";

export default async function clearDocumentConfig({ workDir }) {
  // Fixed path where config.yaml is saved by init command
  const cwd = workDir || process.cwd();
  const documentConfigPath = join(cwd, ".aigne", "doc-smith", "config.yaml");
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
