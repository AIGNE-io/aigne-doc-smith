import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "yaml";
import { pathExists, toDisplayPath } from "../../utils/file-utils.mjs";

export default async function clearDeploymentConfig(input = {}) {
  const { workDir } = input;

  // Fixed path where config.yaml is saved by init command
  const cwd = workDir || process.cwd();
  const configFilePath = join(cwd, ".aigne", "doc-smith", "config.yaml");
  const displayPath = toDisplayPath(configFilePath);

  try {
    // Check if config file exists
    const exists = await pathExists(configFilePath);
    if (!exists) {
      return {
        message: `📦 Config file not found (${displayPath}). No need to clear appUrl.`,
      };
    }

    // Remove appUrl field while preserving comments
    const configContent = await readFile(configFilePath, "utf-8");
    const doc = yaml.parseDocument(configContent);

    if (doc.has("appUrl")) {
      doc.delete("appUrl");
      await writeFile(
        configFilePath,
        doc.toString({
          keepSourceTokens: true,
          indent: 2,
          lineWidth: 0,
          minContentWidth: 0,
        }),
        "utf-8",
      );
    }

    return {
      message: `🧹 Cleared appUrl from config file (${displayPath})`,
    };
  } catch (error) {
    return {
      error: true,
      message: `❌ Failed to clear deployment config: ${error.message}`,
    };
  }
}

clearDeploymentConfig.taskTitle = "Clear deployment configuration";
