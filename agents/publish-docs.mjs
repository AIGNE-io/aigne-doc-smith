import { join } from "node:path";
import { joinURL } from "ufo";
import open from "open";
import { publishDocs as publishDocsFn } from "@aigne/publish-docs";
import { createConnect } from "@aigne/cli/utils/load-aigne.js";
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { parse, stringify } from "yaml";
import { execSync } from "node:child_process";
import { basename } from "node:path";
import { loadConfigFromFile, saveValueToConfig } from "../utils/utils.mjs";

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";
const DEFAULT_APP_URL = "https://docsmith.aigne.io";

/**
 * Get GitHub repository information
 * @param {string} repoUrl - The repository URL
 * @returns {Promise<Object>} - Repository information
 */
async function getGitHubRepoInfo(repoUrl) {
  try {
    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(
      /github\.com[\/:]([^\/]+)\/([^\/]+?)(?:\.git)?$/
    );
    if (!match) return null;

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    const response = await fetch(apiUrl);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name,
      description: data.description || "",
      icon: data.owner?.avatar_url || "",
    };
  } catch (error) {
    console.warn("Failed to fetch GitHub repository info:", error.message);
    return null;
  }
}

/**
 * Get project information with user confirmation
 * @param {Object} options - Options object containing prompts
 * @returns {Promise<Object>} - Project information including name, description, and icon
 */
async function getProjectInfo(options) {
  let repoInfo = null;
  let defaultName = basename(process.cwd());
  let defaultDescription = "";
  let defaultIcon = "";

  // Check if we're in a git repository
  try {
    const gitRemote = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    // Extract repository name from git remote URL
    const repoName = gitRemote.split("/").pop().replace(".git", "");
    defaultName = repoName;

    // If it's a GitHub repository, try to get additional info
    if (gitRemote.includes("github.com")) {
      repoInfo = await getGitHubRepoInfo(gitRemote);
      if (repoInfo) {
        defaultDescription = repoInfo.description;
        defaultIcon = repoInfo.icon;
      }
    }
  } catch (error) {
    // Not in git repository or no origin remote, use current directory name
    console.warn("No git repository found, using current directory name");
  }

  // Prompt user for project information
  console.log("\n📋 Project Information for Documentation Platform");

  const projectName = await options.prompts.input({
    message: "Project name:",
    default: defaultName,
    validate: (input) => {
      if (!input || input.trim() === "") {
        return "Project name cannot be empty";
      }
      return true;
    },
  });

  const projectDescription = await options.prompts.input({
    message: "Project description (optional):",
    default: defaultDescription,
  });

  const projectIcon = await options.prompts.input({
    message: "Project icon URL (optional):",
    default: defaultIcon,
    validate: (input) => {
      if (!input || input.trim() === "") return true;
      try {
        new URL(input);
        return true;
      } catch {
        return "Please enter a valid URL";
      }
    },
  });

  return {
    name: projectName.trim(),
    description: projectDescription.trim(),
    icon: projectIcon.trim(),
  };
}

/**
 * Get access token from environment, config file, or prompt user for authorization
 * @param {string} appUrl - The application URL
 * @returns {Promise<string>} - The access token
 */
async function getAccessToken(appUrl) {
  const DOC_SMITH_ENV_FILE = join(
    homedir(),
    ".aigne",
    "doc-smith-connected.yaml"
  );
  const { hostname } = new URL(appUrl);

  let accessToken = process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN;

  // Check if access token exists in environment or config file
  if (!accessToken) {
    try {
      if (existsSync(DOC_SMITH_ENV_FILE)) {
        const data = await readFile(DOC_SMITH_ENV_FILE, "utf8");
        if (data.includes("DOC_DISCUSS_KIT_ACCESS_TOKEN")) {
          const envs = parse(data);
          if (envs[hostname] && envs[hostname].DOC_DISCUSS_KIT_ACCESS_TOKEN) {
            accessToken = envs[hostname].DOC_DISCUSS_KIT_ACCESS_TOKEN;
          }
        }
      }
    } catch (error) {
      console.warn("Failed to read config file:", error.message);
    }
  }

  // If still no access token, prompt user to authorize
  if (!accessToken) {
    const DISCUSS_KIT_URL = appUrl;
    const connectUrl = joinURL(
      new URL(DISCUSS_KIT_URL).origin,
      WELLKNOWN_SERVICE_PATH_PREFIX
    );

    try {
      const result = await createConnect({
        connectUrl: connectUrl,
        connectAction: "gen-simple-access-key",
        source: `AIGNE DocSmith connect to Discuss Kit`,
        closeOnSuccess: true,
        appName: "AIGNE DocSmith",
        appLogo:
          "https://www.aigne.io/image-bin/uploads/a7910a71364ee15a27e86f869ad59009.svg",
        openPage: (pageUrl) => open(pageUrl),
      });

      accessToken = result.accessKeySecret;
      process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = accessToken;

      // Save the access token to config file
      const aigneDir = join(homedir(), ".aigne");
      if (!existsSync(aigneDir)) {
        mkdirSync(aigneDir, { recursive: true });
      }

      const existingConfig = existsSync(DOC_SMITH_ENV_FILE)
        ? parse(await readFile(DOC_SMITH_ENV_FILE, "utf8"))
        : {};

      await writeFile(
        DOC_SMITH_ENV_FILE,
        stringify({
          ...existingConfig,
          [hostname]: {
            DOC_DISCUSS_KIT_ACCESS_TOKEN: accessToken,
            DOC_DISCUSS_KIT_URL: DISCUSS_KIT_URL,
          },
        })
      );
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw new Error(
        "Failed to obtain access token. Please check your network connection and try again later."
      );
    }
  }

  return accessToken;
}

export default async function publishDocs(
  { docsDir, appUrl, boardId, boardName, boardDesc, boardCover },
  options
) {
  // Check if DOC_DISCUSS_KIT_URL is set in environment variables
  const envAppUrl = process.env.DOC_DISCUSS_KIT_URL;
  const useEnvAppUrl = !!envAppUrl;

  // Use environment variable if available, otherwise use the provided appUrl
  if (useEnvAppUrl) {
    appUrl = envAppUrl;
  }

  // Check if appUrl is default and not saved in config (only when not using env variable)
  const config = await loadConfigFromFile();
  const isDefaultAppUrl = appUrl === DEFAULT_APP_URL;
  const hasAppUrlInConfig = config && config.appUrl;

  if (!useEnvAppUrl && isDefaultAppUrl && !hasAppUrlInConfig) {
    const choice = await options.prompts.select({
      message: "Select platform to publish your documents:",
      choices: [
        {
          name: "Publish to docsmith.aigne.io - free, but your documents will be public accessible, recommended for open-source projects",
          value: "default",
        },
        {
          name: "Publish to your own website - you will need to run Discuss Kit by your self ",
          value: "custom",
        },
      ],
    });

    if (choice === "custom") {
      appUrl = await options.prompts.input({
        message: "Please enter your Discuss Kit platform URL:",
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return "Please enter a valid URL";
          }
        },
      });
    }
  }

  const accessToken = await getAccessToken(appUrl);

  process.env.DOC_ROOT_DIR = docsDir;

  const sidebarPath = join(docsDir, "_sidebar.md");

  let projectInfo = {
    name: boardName,
    description: boardDesc,
    icon: boardCover,
  };

  // Only get project info if we need to create a new board
  if (!boardName) {
    projectInfo = await getProjectInfo(options);

    // save project info to config
    await saveValueToConfig("boardName", projectInfo.name);
    await saveValueToConfig("boardDesc", projectInfo.description);
    await saveValueToConfig("boardCover", projectInfo.icon);
  }

  const {
    success,
    boardId: newBoardId,
    docsUrl,
  } = await publishDocsFn({
    sidebarPath,
    accessToken,
    appUrl,
    boardId,
    autoCreateBoard: true,
    // Pass additional project information if available
    boardName: projectInfo.name,
    boardDesc: projectInfo.description,
    boardCover: projectInfo.icon,
  });

  // Save values to config.yaml if publish was successful
  if (success) {
    // Save appUrl to config only when not using environment variable
    if (!useEnvAppUrl) {
      await saveValueToConfig("appUrl", appUrl);
    }

    // Save boardId to config if it was auto-created
    if (boardId !== newBoardId) {
      await saveValueToConfig("boardId", newBoardId);
    }
  }

  const message = `## ✅ Documentation Published Successfully!

Documentation is now available at: \`${docsUrl}\`
  `;
  return {
    message,
  };
}

publishDocs.input_schema = {
  type: "object",
  properties: {
    docsDir: {
      type: "string",
      description: "The directory of the docs",
    },
    appUrl: {
      type: "string",
      description: "The url of the app",
      default: DEFAULT_APP_URL,
    },
    boardId: {
      type: "string",
      description: "The id of the board",
    },
  },
};

publishDocs.description = "Publish the documentation to Discuss Kit";
