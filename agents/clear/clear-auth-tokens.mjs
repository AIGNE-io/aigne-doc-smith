import chalk from "chalk";
import { createStore } from "../../utils/store/index.mjs";

export default async function clearAuthTokens(_input = {}, options = {}) {
  const store = await createStore();

  try {
    const listMap = await store.listMap();
    // Get all available sites
    const siteHostnames = Object.keys(listMap);

    if (siteHostnames.length === 0) {
      return {
        message: "🔑 No site authorizations found to clear",
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
        message: "🔑 No sites selected for clearing authorization",
      };
    }

    const results = [];
    let clearedCount = 0;

    if (selectedSites.includes("__ALL__")) {
      // Clear all site authorizations
      await store.clear();
      results.push(`✔ Cleared site authorization for all sites (${siteHostnames.length} sites)`);
      clearedCount = siteHostnames.length;
    } else {
      for (const hostname of selectedSites) {
        await store.deleteItem(hostname);
        results.push(`✔ Cleared site authorization for ${chalk.cyan(hostname)}`);
        clearedCount++;
      }
    }

    const header = `🔑 Successfully cleared site authorizations!`;
    const detailLines = results.map((item) => `  ${item}`).join("\n");

    const message = [header, "", detailLines, ""].filter(Boolean).join("\n");

    return {
      message,
      clearedCount,
      clearedSites: selectedSites.includes("__ALL__") ? siteHostnames : selectedSites,
    };
  } catch (error) {
    return {
      message: `⚠️ Failed to clear site authorizations: ${error.message}`,
      error: true,
    };
  }
}

clearAuthTokens.taskTitle = "Clear site authorizations";
clearAuthTokens.description = "Clear site authorizations for document publishing sites";
