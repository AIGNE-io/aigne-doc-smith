import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import yaml from "yaml";

export default async function clearDeploymentConfig(input = {}) {
  const { configPath } = input;

  if (!configPath) {
    return {
      error: true,
      message: "Config path is required.",
    };
  }

  try {
    if (!existsSync(configPath)) {
      return {
        message: "Config file not found. No need to clear appUrl.",
        cleared: false,
      };
    }

    const configContent = await readFile(configPath, "utf-8");
    const doc = yaml.parseDocument(configContent);

    if (!doc.has("appUrl")) {
      return {
        message: "No appUrl found in config file. Nothing to clear.",
        cleared: false,
      };
    }

    doc.delete("appUrl");
    await writeFile(
      configPath,
      doc.toString({
        keepSourceTokens: true,
        indent: 2,
        lineWidth: 0,
        minContentWidth: 0,
      }),
      "utf-8",
    );

    return {
      message: "Cleared appUrl from config file.",
      cleared: true,
    };
  } catch (error) {
    return {
      error: true,
      message: `Failed to clear deployment config: ${error.message}`,
    };
  }
}

clearDeploymentConfig.taskTitle = "Clear deployment configuration";
clearDeploymentConfig.description = "Clear appUrl from the config file";
