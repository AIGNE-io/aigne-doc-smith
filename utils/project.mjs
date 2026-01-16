import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { SUPPORTED_LANGUAGES } from "./constants.mjs";
import { getGitHubRepoInfo } from "./git.mjs";

/**
 * Get project information from Git or directory
 * @returns {Promise<Object>} - Project information
 */
export async function getProjectInfo() {
  let repoInfo = null;
  let defaultName = path.basename(process.cwd());
  let defaultDescription = "";
  let defaultIcon = "";
  let fromGitHub = false;
  let sourceDir = null;

  try {
    // Get the first folder in sources directory
    const sourcesPath = path.join(process.cwd(), "sources");

    if (fs.existsSync(sourcesPath)) {
      const entries = fs.readdirSync(sourcesPath, { withFileTypes: true });
      const firstFolder = entries.find((entry) => entry.isDirectory());

      if (firstFolder) {
        sourceDir = path.join(sourcesPath, firstFolder.name);
        defaultName = firstFolder.name;
      }
    }

    // If no source directory found, fall back to current directory
    const targetDir = sourceDir || process.cwd();

    const gitRemote = execSync("git remote get-url origin", {
      encoding: "utf8",
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    const repoName = gitRemote.split("/").pop().replace(".git", "");
    defaultName = repoName;

    if (gitRemote.includes("github.com")) {
      repoInfo = await getGitHubRepoInfo(gitRemote);
      if (repoInfo) {
        defaultDescription = repoInfo.description;
        defaultIcon = repoInfo.icon;
        fromGitHub = true;
      }
    }
  } catch (_error) {
    console.warn("No git repository found, using current directory name");
  }

  return {
    name: defaultName,
    description: defaultDescription,
    icon: defaultIcon,
    fromGitHub,
  };
}

/**
 * Detect system language
 * @returns {string} - Language code (e.g., 'en', 'zh')
 */
export function detectSystemLanguage() {
  try {
    let systemLocale = null;

    systemLocale = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL;

    if (!systemLocale) {
      try {
        systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
      } catch (_error) {
        // Intl API failed
      }
    }

    if (!systemLocale) {
      return "en";
    }

    const languageCode = systemLocale.split(/[_.-]/)[0].toLowerCase();
    const supportedCode = SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);

    return supportedCode ? supportedCode.code : "en";
  } catch (error) {
    console.warn("Failed to detect system language:", error.message);
    return "en";
  }
}
