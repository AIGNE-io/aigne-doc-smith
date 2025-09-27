import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";
import { parse, stringify } from "yaml";

export default async function clearAuthTokens(_input = {}, options = {}) {
  const DOC_SMITH_ENV_FILE = join(homedir(), ".aigne", "doc-smith-connected.yaml");

  // Check if the file exists
  if (!existsSync(DOC_SMITH_ENV_FILE)) {
    return {
      message: "No site authorizations found to clear",
    };
  }

  try {
    // Read existing configuration
    const data = await readFile(DOC_SMITH_ENV_FILE, "utf8");
    const envs = parse(data) || {};

    // Get all available sites
    const siteHostnames = Object.keys(envs);

    if (siteHostnames.length === 0) {
      return {
        message: "No site authorizations found to clear",
      };
    }

    // Display all sites with their URLs for user selection
    const choices = siteHostnames.map((hostname) => {
      return {
        name: `${chalk.cyan(hostname)}`,
        value: hostname,
        checked: false, // Allow multiple selection
      };
    });

    // Add an option to clear all site authorizations
    choices.push({
      name: chalk.red("🗑️  Clear ALL site authorizations"),
      value: "__ALL__",
      checked: false,
    });

    let selectedSites = [];

    if (options?.prompts?.checkbox) {
      selectedSites = await options.prompts.checkbox({
        message: "Select sites to clear authorization from:",
        choices,
        validate: (answer) => (answer.length > 0 ? true : "Please select at least one site."),
      });
    } else {
      // If no prompts available, clear all site authorizations
      selectedSites = ["__ALL__"];
    }

    if (selectedSites.length === 0) {
      return {
        message: "No sites selected for clearing authorization",
      };
    }

    const results = [];
    let clearedCount = 0;

    if (selectedSites.includes("__ALL__")) {
      // Clear all site authorizations
      await writeFile(DOC_SMITH_ENV_FILE, stringify({}));
      results.push(`Cleared site authorization for all sites (${siteHostnames.length} sites)`);
      clearedCount = siteHostnames.length;
    } else {
      // Clear site authorizations for selected sites
      const updatedEnvs = { ...envs };

      for (const hostname of selectedSites) {
        if (updatedEnvs[hostname]) {
          // Remove the entire site object
          delete updatedEnvs[hostname];

          results.push(`Cleared site authorization for ${chalk.cyan(hostname)}`);
          clearedCount++;
        }
      }

      await writeFile(DOC_SMITH_ENV_FILE, stringify(updatedEnvs));
    }

    const header = `Successfully cleared site authorizations!`;
    const detailLines = results.join("\n");

    const message = [header, "", detailLines, ""].filter(Boolean).join("\n");

    return {
      message,
      clearedCount,
      clearedSites: selectedSites.includes("__ALL__") ? siteHostnames : selectedSites,
    };
  } catch (error) {
    return {
      message: `Failed to clear site authorizations: ${error.message}`,
      error: true,
    };
  }
}

clearAuthTokens.taskTitle = "Clear site authorizations";
clearAuthTokens.description = "Clear site authorizations for document publishing sites";
