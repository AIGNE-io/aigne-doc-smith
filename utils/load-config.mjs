import fs from "node:fs/promises";
import chalk from "chalk";
import path from "node:path";
import { parse } from "yaml";
import { processConfigFields, resolveFileReferences } from "./utils.mjs";
import { DEFAULT_EXCLUDE_PATTERNS } from "./constants/index.mjs";
import { findInvalidSourcePaths, toDisplayPath } from "./file-utils.mjs";

export default async function loadConfig({ config, appUrl }) {
  const configPath = path.isAbsolute(config) ? config : path.join(process.cwd(), config);

  try {
    // Check if config file exists
    await fs.access(configPath);
  } catch (_error) {
    console.log(`The config file was not found at: ${configPath}`);
    console.log("You can run 'aigne doc init' to create a new config file.");
    throw new Error(`The config file was not found at: ${configPath}`);
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
    const processedConfig = await processConfigFields(parsedConfig);

    // Validate sourcePaths against exclude patterns
    const sourcesPath = processedConfig.sourcesPath || parsedConfig.sourcesPath;
    if (sourcesPath) {
      const excludePatterns = [
        ...DEFAULT_EXCLUDE_PATTERNS,
        ...(processedConfig.excludePatterns || parsedConfig.excludePatterns || []),
      ];

      const invalidPaths = await findInvalidSourcePaths(sourcesPath, excludePatterns);
      if (invalidPaths.length > 0) {
        console.warn(
          `⚠️  Some source paths have been excluded and will not be processed:\n${invalidPaths.map((p) => `  - ${chalk.yellow(p)}`).join("\n")}\n💡 Tip: You can remove these paths in ${toDisplayPath(configPath)}\n`,
        );
      }
    }

    return {
      lastGitHead: parsedConfig.lastGitHead || "",
      ...parsedConfig,
      ...processedConfig,
    };
  } catch (error) {
    console.error(`I encountered an error while parsing the config file: ${error.message}`);
    throw new Error(`I could not parse the config file: ${error.message}`);
  }
}
