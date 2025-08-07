import path from "node:path";
import fs from "node:fs/promises";
import { parse } from "yaml";

export default async function loadConfig({ config }) {
  const configPath = path.join(process.cwd(), config);

  try {
    // Check if config file exists
    await fs.access(configPath);
  } catch (error) {
    console.log(`Config file not found: ${configPath}`);
    console.log("Please run 'aigne doc init' to create the config file.");
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    // Read and parse YAML file
    const configContent = await fs.readFile(configPath, "utf-8");
    const parsedConfig = parse(configContent);
    return {
      nodeName: "Section",
      locale: "en",
      sourcesPath: ["./"],
      docsDir: "./.aigne/doc-smith/docs",
      outputDir: "./.aigne/doc-smith/output",
      lastGitHead: parsedConfig.lastGitHead || "",
      ...parsedConfig,
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
  },
};
