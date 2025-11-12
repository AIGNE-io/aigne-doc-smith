import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createConnect } from "@aigne/cli/utils/aigne-hub/credential.js";
import chalk from "chalk";
import open from "open";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";

import {
  ComponentNotFoundError,
  getComponentMountPoint,
  InvalidBlockletError,
} from "./blocklet.mjs";
import {
  BLOCKLET_ADD_COMPONENT_DOCS,
  CLOUD_SERVICE_URL_PROD,
  CLOUD_SERVICE_URL_STAGING,
  DISCUSS_KIT_DID,
  DISCUSS_KIT_STORE_URL,
  DOC_OFFICIAL_ACCESS_TOKEN,
} from "./constants/index.mjs";

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";

export function getDocSmithEnvFilePath() {
  return join(homedir(), ".aigne", "doc-smith-connected.yaml");
}

/**
 * Get access token from environment, config file, or prompt user for authorization
 * @param {string} appUrl - The application URL
 * @returns {Promise<string>} - The access token
 */
export async function getAccessToken(appUrl, ltToken = "") {
  const { hostname } = new URL(appUrl);
  const DOC_SMITH_ENV_FILE = getDocSmithEnvFilePath();

  let accessToken =
    process.env.DOC_SMITH_PUBLISH_ACCESS_TOKEN || process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN;

  // Check if access token exists in environment or config file
  if (!accessToken) {
    try {
      if (existsSync(DOC_SMITH_ENV_FILE)) {
        const data = await readFile(DOC_SMITH_ENV_FILE, "utf8");
        if (data.includes("DOC_DISCUSS_KIT_ACCESS_TOKEN")) {
          // Handle empty or invalid YAML files
          const envs = data.trim() ? parse(data) : null;
          if (envs?.[hostname]?.DOC_DISCUSS_KIT_ACCESS_TOKEN) {
            accessToken = envs[hostname].DOC_DISCUSS_KIT_ACCESS_TOKEN;
          }
        }
      }
    } catch (error) {
      console.warn("Could not read the configuration file:", error.message);
    }
  }

  // If still no access token, prompt user to authorize
  if (accessToken) {
    return accessToken;
  }

  // Check if Discuss Kit is running at the provided URL
  try {
    await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);
  } catch (error) {
    const storeLink = chalk.cyan(DISCUSS_KIT_STORE_URL);
    if (error instanceof InvalidBlockletError) {
      throw new Error(
        `${chalk.yellow("⚠️  The provided URL is not a valid ArcBlock-powered website.")}\n\n` +
          `${chalk.bold("💡 Solution:")} To host your documentation, you can get a website from the ArcBlock store:\n${storeLink}\n\n`,
      );
    } else if (error instanceof ComponentNotFoundError) {
      const docsLink = chalk.cyan(BLOCKLET_ADD_COMPONENT_DOCS);
      throw new Error(
        `${chalk.yellow("⚠️ This website is missing the required components for publishing.")}\n\n` +
          `${chalk.bold(
            "💡 Solution:",
          )} Please refer to the documentation to add the Discuss Kit component:\n${docsLink}\n\n`,
      );
    } else {
      throw new Error(
        `❌ Could not connect to: ${chalk.cyan(appUrl)}\n\n` +
          `${chalk.bold("Possible causes:")}\n` +
          `• There may be a network issue.\n` +
          `• The server may be temporarily unavailable.\n` +
          `• The URL may be incorrect.\n\n` +
          `${chalk.green("Suggestion:")} Please check your network connection and the URL, then try again.`,
      );
    }
  }

  const DISCUSS_KIT_URL = appUrl;
  const connectUrl = joinURL(new URL(DISCUSS_KIT_URL).origin, WELLKNOWN_SERVICE_PATH_PREFIX);

  try {
    const result = await createConnect({
      connectUrl: connectUrl,
      connectAction: "gen-simple-access-key",
      source: `AIGNE DocSmith connect to website`,
      closeOnSuccess: true,
      appName: "AIGNE DocSmith",
      appLogo: "https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg",
      openPage: (pageUrl) => {
        const url = new URL(pageUrl);
        if ([CLOUD_SERVICE_URL_PROD, CLOUD_SERVICE_URL_STAGING].includes(url.origin) === false) {
          url.searchParams.set("required_roles", "owner,admin");
        }
        if (ltToken) {
          url.searchParams.set("__lt", ltToken);
        }

        open(url.toString());
      },
    });

    accessToken = result.accessKeySecret;
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = accessToken;
    process.env.DOC_SMITH_PUBLISH_ACCESS_TOKEN = accessToken;

    // Save the access token to config file
    const aigneDir = join(homedir(), ".aigne");
    if (!existsSync(aigneDir)) {
      mkdirSync(aigneDir, { recursive: true });
    }

    let existingConfig = {};
    if (existsSync(DOC_SMITH_ENV_FILE)) {
      const fileContent = await readFile(DOC_SMITH_ENV_FILE, "utf8");
      const parsedConfig = fileContent.trim() ? parse(fileContent) : null;
      existingConfig = parsedConfig || {};
    }

    await writeFile(
      DOC_SMITH_ENV_FILE,
      stringify({
        ...existingConfig,
        [hostname]: {
          DOC_DISCUSS_KIT_ACCESS_TOKEN: accessToken,
          DOC_DISCUSS_KIT_URL: DISCUSS_KIT_URL,
        },
      }),
    );
  } catch (error) {
    console.debug(error);
    throw new Error(
      "Could not get an access token. Please check your network connection and try again.",
    );
  }

  return accessToken;
}

/**
 * Gets the official access token from the environment, config file, or prompts the user to authorize.
 * @param {string} baseUrl - The official service URL.
 * @returns {Promise<string>} The access token.
 */
export async function getOfficialAccessToken(baseUrl, openPage = true) {
  if (!baseUrl) {
    throw new Error("The baseUrl parameter is required for getOfficialAccessToken.");
  }

  // Parse URL once and reuse
  const urlObj = new URL(baseUrl);
  const { hostname, origin } = urlObj;
  const DOC_SMITH_ENV_FILE = getDocSmithEnvFilePath();

  // 1. Check environment variable
  let accessToken = process.env[DOC_OFFICIAL_ACCESS_TOKEN];

  // 2. Check config file if not in env
  if (!accessToken) {
    try {
      if (existsSync(DOC_SMITH_ENV_FILE)) {
        const data = await readFile(DOC_SMITH_ENV_FILE, "utf8");
        // Handle empty or invalid YAML files
        const envs = data.trim() ? parse(data) : null;
        if (envs) {
          accessToken = envs[hostname]?.[DOC_OFFICIAL_ACCESS_TOKEN];
        }
      }
    } catch (_error) {
      // Ignore errors
    }
  }

  // If token is found, return it
  if (accessToken || !openPage) {
    return accessToken;
  }

  // Generate new access token
  const connectUrl = joinURL(origin, WELLKNOWN_SERVICE_PATH_PREFIX);

  try {
    const result = await createConnect({
      connectUrl,
      connectAction: "gen-simple-access-key",
      source: "AIGNE DocSmith connect to official service",
      closeOnSuccess: true,
      appName: "AIGNE DocSmith",
      appLogo: "https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg",
      openPage: (pageUrl) => {
        console.log(
          "🔗 Please open the following URL in your browser to authorize access: ",
          chalk.cyan(pageUrl),
          "\n",
        );
        open(pageUrl);
      },
    });

    accessToken = result.accessKeySecret;
    process.env[DOC_OFFICIAL_ACCESS_TOKEN] = accessToken;

    // Save the access token to config file
    await saveTokenToConfigFile(
      DOC_SMITH_ENV_FILE,
      hostname,
      DOC_OFFICIAL_ACCESS_TOKEN,
      accessToken,
    );
  } catch (error) {
    console.debug(error);
    throw new Error(
      "Could not get an official access token. Please check your network connection and try again.",
    );
  }

  return accessToken;
}

/**
 * Saves the access token to the configuration file.
 * @param {string} configFile - The path to the config file.
 * @param {string} hostname - The hostname key.
 * @param {string} tokenKey - The token key name.
 * @param {string} tokenValue - The token value.
 */
async function saveTokenToConfigFile(configFile, hostname, tokenKey, tokenValue) {
  try {
    const aigneDir = join(homedir(), ".aigne");
    if (!existsSync(aigneDir)) {
      mkdirSync(aigneDir, { recursive: true });
    }

    let existingConfig = {};
    if (existsSync(configFile)) {
      const fileContent = await readFile(configFile, "utf8");
      // Handle empty or invalid YAML files
      const parsedConfig = fileContent.trim() ? parse(fileContent) : null;
      existingConfig = parsedConfig || {};
    }

    await writeFile(
      configFile,
      stringify({
        ...existingConfig,
        [hostname]: {
          ...existingConfig[hostname],
          [tokenKey]: tokenValue,
        },
      }),
    );
  } catch (error) {
    console.warn(`Could not save the token to the configuration file: ${error.message}`, error);
    // The token is already in the environment, so we don't need to throw an error here.
  }
}
