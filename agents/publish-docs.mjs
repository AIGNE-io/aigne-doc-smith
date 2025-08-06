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
 * Get project name from git repository or current directory
 * @returns {string} - The project name
 */
function getProjectName() {
  // Check if we're in a git repository
  try {
    const gitRemote = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    // Extract repository name from git remote URL
    const repoName = gitRemote.split("/").pop().replace(".git", "");
    return repoName;
  } catch (error) {
    // Not in git repository or no origin remote, use current directory name
    return basename(process.cwd());
  }
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
  { docsDir, appUrl, boardId },
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

  const boardName = boardId ? "" : getProjectName();

  const { success, boardId: newBoardId } = await publishDocsFn({
    sidebarPath,
    accessToken,
    appUrl,
    boardId,
    // If boardId is empty, use project name as boardName and auto create board
    boardName,
    autoCreateBoard: !boardId,
  });

  // Save values to config.yaml if publish was successful
  if (success) {
    // Save appUrl to config only when not using environment variable
    if (!useEnvAppUrl) {
      await saveValueToConfig("appUrl", appUrl);
    }

    // Save boardId to config if it was auto-created
    if (!boardId && newBoardId) {
      await saveValueToConfig("boardId", newBoardId);
    }
  }

  return {};
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
