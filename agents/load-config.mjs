import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { processConfigFields, resolveFileReferences } from "../utils/utils.mjs";

export default async function loadConfig({ config, appUrl }) {
  const configPath = path.join(process.cwd(), config);

  try {
    // Check if config file exists
    await fs.access(configPath);
  } catch (_error) {
    console.log(`Config file not found: ${configPath}`);
    console.log("Please run 'aigne doc init' to create the config file.");
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    // Read and parse YAML file
    const configContent = await fs.readFile(configPath, "utf-8");
    let parsedConfig = parse(configContent);

    // Resolve file references (@ prefixed values)
    parsedConfig = await resolveFileReferences(parsedConfig);

    if (appUrl) {
      parsedConfig.appUrl = appUrl.includes("://") ? appUrl : `https://${appUrl}`;
    }

    // Parse new configuration fields and convert keys to actual content
    const processedConfig = processConfigFields(parsedConfig);

    return {
      lastGitHead: parsedConfig.lastGitHead || "",
      ...parsedConfig,
      ...processedConfig,
    };
  } catch (error) {
    console.error(`Error parsing config file: ${error.message}`);
    throw new Error(`Failed to parse config file: ${error.message}`);
  }
}

loadConfig.input_schema = {
  type: "object",
  properties: {
    config: {
      type: "string",
      default: "./.aigne/doc-smith/config.yaml",
    },
    appUrl: {
      type: "string",
      description: "Application URL to override config",
    },
  },
};

loadConfig.task_render_mode = "hide";
