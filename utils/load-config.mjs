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

    // Read DOC-SMITH.md if exists in current working directory
    const docSmithVariants = ["DOC-SMITH.md", "doc-smith.md", "DocSmith.md"];
    let docSmithContent = "";
    for (const variant of docSmithVariants) {
      const docSmithPath = path.join(process.cwd(), variant);
      try {
        const content = await fs.readFile(docSmithPath, "utf-8");
        if (content && content.trim()) {
          docSmithContent = content.trim();
          console.log(`✓ Found ${chalk.cyan(variant)}, custom rules loaded`);
          break; // Use the first found file
        }
      } catch (error) {
        if (error.code !== "ENOENT") {
          // File exists but can't be read (permission issue, etc.)
          console.warn(`⚠️  Found ${variant} but failed to read: ${error.message}`);
        }
        // ENOENT means file doesn't exist, continue to next variant
      }
    }

    // Append DOC-SMITH content to rules if found
    if (docSmithContent) {
      const existingRules = parsedConfig.rules || "";
      parsedConfig.rules = existingRules
        ? `${existingRules}\n\n${docSmithContent}`
        : docSmithContent;
    }

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

      const { excluded, notFound } = await findInvalidSourcePaths(sourcesPath, excludePatterns);

      if (excluded.length > 0 || notFound.length > 0) {
        const warnings = [];

        if (excluded.length > 0) {
          warnings.push(
            `⚠️  These paths were excluded (ignored by config):\n${excluded.map((p) => `  - ${chalk.yellow(p)}`).join("\n")}`,
          );
        }

        if (notFound.length > 0) {
          warnings.push(
            `🚫 These paths were skipped because they do not exist:\n${notFound.map((p) => `  - ${chalk.red(p)}`).join("\n")}`,
          );
        }

        warnings.push(
          `💡 Tip: You can remove these paths in ${chalk.cyan(toDisplayPath(configPath))}`,
        );

        console.warn(`${warnings.join("\n\n")}\n`);
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
