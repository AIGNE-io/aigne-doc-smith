import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { parse, stringify } from "yaml";
import { getMediaDescriptionCachePath } from "../../utils/file-utils.mjs";

export default async function clearMediaDescription(_input = {}, options = {}) {
  const cacheFilePath = getMediaDescriptionCachePath();

  // Check if the cache file exists
  if (!existsSync(cacheFilePath)) {
    return {
      message: "No media descriptions found to clear",
    };
  }

  try {
    // Read existing cache
    const cacheContent = await readFile(cacheFilePath, "utf8");
    const parsedCache = parse(cacheContent);
    const cache = parsedCache?.descriptions || {};

    // Get all media files from cache
    const mediaHashes = Object.keys(cache);

    if (mediaHashes.length === 0) {
      return {
        message: "No media descriptions found to clear",
      };
    }

    // Build choices from cache - extract filename from path
    const choices = mediaHashes.map((hash) => {
      const mediaPath = cache[hash]?.path || "unknown";
      const filename = path.basename(mediaPath);
      const description = cache[hash]?.description || "";
      const truncatedDesc =
        description.length > 80 ? `${description.slice(0, 80)}...` : description;

      return {
        name: filename,
        description: truncatedDesc,
        value: hash,
        checked: false,
      };
    });

    // Add an option to clear all media descriptions
    choices.push({
      name: chalk.red("🗑️  Clear ALL media descriptions"),
      value: "__ALL__",
      checked: false,
    });

    let selectedHashes = [];

    if (options?.prompts?.checkbox) {
      selectedHashes = await options.prompts.checkbox({
        message: "Select media files to clear descriptions:",
        choices,
        validate: (answer) => (answer.length > 0 ? true : "Please select at least one item."),
      });
    } else {
      // If no prompts available, clear all
      selectedHashes = ["__ALL__"];
    }

    if (selectedHashes.length === 0) {
      return {
        message: "No media files selected for clearing descriptions",
      };
    }

    const results = [];
    let clearedCount = 0;

    if (selectedHashes.includes("__ALL__")) {
      // Clear all media descriptions
      await writeFile(
        cacheFilePath,
        stringify({
          descriptions: {},
          lastUpdated: new Date().toISOString(),
        }),
      );
      results.push(`Cleared descriptions for all media files (${mediaHashes.length} files)`);
      clearedCount = mediaHashes.length;
    } else {
      // Clear descriptions for selected files
      const updatedCache = { ...cache };

      for (const hash of selectedHashes) {
        if (updatedCache[hash]) {
          const filename = path.basename(updatedCache[hash].path);
          delete updatedCache[hash];
          results.push(`Cleared description for ${chalk.cyan(filename)}`);
          clearedCount++;
        }
      }

      await writeFile(
        cacheFilePath,
        stringify({
          descriptions: updatedCache,
          lastUpdated: new Date().toISOString(),
        }),
      );
    }

    const header = `✨ Successfully cleared media descriptions`;
    const detailLines = results.join("\n");

    const message = [header, "", detailLines, ""].filter(Boolean).join("\n");

    return {
      message,
      clearedCount,
    };
  } catch (error) {
    return {
      message: `Error clearing media descriptions: ${error.message}`,
      error: true,
    };
  }
}

clearMediaDescription.taskTitle = "Clear media file descriptions";
clearMediaDescription.description = "Clear AI-generated descriptions for media files";
