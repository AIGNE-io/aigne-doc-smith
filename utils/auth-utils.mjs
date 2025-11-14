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
  PAYMENT_KIT_DID,
} from "./constants/index.mjs";
import { requestWithAuthToken } from "./request.mjs";
import { withQuery } from "ufo";

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";

const TIMEOUT_MINUTES = 5; // Just wait 5 min
const FETCH_INTERVAL = 3000; // 3 seconds

const RETRY_COUNT = (TIMEOUT_MINUTES * 60 * 1000) / FETCH_INTERVAL;

export function getDocSmithEnvFilePath() {
  return join(homedir(), ".aigne", "doc-smith-connected.yaml");
}

/**
 * Get access token from environment, config file, or prompt user for authorization
 * @param {string} baseUrl - The application URL
 * @returns {Promise<string>} - The access token
 */
export async function getCachedAccessToken(baseUrl) {
  const { hostname: targetHostname } = new URL(baseUrl);
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
          if (envs?.[targetHostname]?.DOC_DISCUSS_KIT_ACCESS_TOKEN) {
            accessToken = envs[targetHostname].DOC_DISCUSS_KIT_ACCESS_TOKEN;
          }
        }
      }
    } catch (error) {
      console.warn("Could not read the configuration file:", error.message);
    }
  }

  return accessToken;
}

export const getDiscussKitMountPoint = async (origin) => {
  try {
    const mountPoint = await getComponentMountPoint(origin, DISCUSS_KIT_DID);
    return mountPoint;
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
        `❌ Could not connect to: ${chalk.cyan(origin)}\n\n` +
          `${chalk.bold("Possible causes:")}\n` +
          `• There may be a network issue.\n` +
          `• The server may be temporarily unavailable.\n` +
          `• The URL may be incorrect.\n\n` +
          `${chalk.green("Suggestion:")} Please check your network connection and the URL, then try again.`,
      );
    }
  }
};

/**
 * Get access token from environment, config file, or prompt user for authorization
 * @param {string} appUrl - The application URL
 * @returns {Promise<string>} - The access token
 */
export async function getAccessToken(appUrl, ltToken = "", locale = "en") {
  const { hostname: targetHostname, origin: targetOrigin } = new URL(appUrl);

  let accessToken = await getCachedAccessToken(targetOrigin);

  // If still no access token, prompt user to authorize
  if (accessToken) {
    return accessToken;
  }

  const connectUrl = joinURL(targetOrigin, WELLKNOWN_SERVICE_PATH_PREFIX);

  try {
    const result = await createConnect({
      connectUrl: connectUrl,
      connectAction: "gen-simple-access-key",
      source: `AIGNE DocSmith connect to website`,
      closeOnSuccess: true,
      appName: "AIGNE DocSmith",
      appLogo: "https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg",
      retry: RETRY_COUNT,
      fetchInterval: FETCH_INTERVAL,
      openPage: async (pageUrl) => {
        const url = new URL(pageUrl);
        const isOfficial = [CLOUD_SERVICE_URL_PROD, CLOUD_SERVICE_URL_STAGING].includes(url.origin);
        if (!isOfficial) {
          url.searchParams.set("required_roles", "owner,admin");
        }
        if (ltToken) {
          url.searchParams.set("__lt", ltToken);
        }
        url.searchParams.set("locale", locale);

        let connectUrl = url.toString();
        open(connectUrl);

        try {
          const officialBaseUrl = process.env.DOC_SMITH_BASE_URL || CLOUD_SERVICE_URL_PROD;
          const officialAccessToken = await getCachedAccessToken(officialBaseUrl);
          if (officialAccessToken) {
            const mountPoint = await getComponentMountPoint(officialBaseUrl, PAYMENT_KIT_DID);
            const data = await requestWithAuthToken(
              withQuery(joinURL(officialBaseUrl, mountPoint, "/api/tool/short-url"), {
                url: connectUrl,
              }),
              {},
              officialAccessToken,
            );
            connectUrl = data.url;
          }
        } catch {
          // Ignore error
        }

        console.log(
          "🔗 Please open the following URL in your browser to authorize access: ",
          chalk.cyan(connectUrl),
          "\n",
        );
      },
    });

    accessToken = result.accessKeySecret;
    process.env.DOC_SMITH_PUBLISH_ACCESS_TOKEN = accessToken;
    process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN = accessToken;

    // Save the access token to config file
    await saveTokenToConfigFile(targetHostname, { DOC_DISCUSS_KIT_ACCESS_TOKEN: accessToken });
  } catch {
    throw new Error(
      `${chalk.yellow("⚠️ Failed to obtain access token. This may be due to network issues or authorization timeout.")}\n\n` +
        `${chalk.bold("💡 Solution:")}\n` +
        `  • Step 1: Ensure your network can access the service URL: ${chalk.cyan(targetOrigin)}\n` +
        `  • Step 2: Run ${chalk.cyan("aigne doc publish")} again\n` +
        `  • Step 3: If prompted, select ${chalk.cyan("Resume previous website setup")} to continue from where you left off\n\n`,
    );
  }

  return accessToken;
}

/**
 * Gets the official access token from the environment, config file, or prompts the user to authorize.
 * @param {string} baseUrl - The official service URL.
 * @returns {Promise<string>} The access token.
 */
export async function getOfficialAccessToken(baseUrl, openPage = true, locale = "en") {
  if (!baseUrl) {
    throw new Error("The baseUrl parameter is required for getOfficialAccessToken.");
  }

  // Parse URL once and reuse
  const { hostname: targetHostname, origin: targetOrigin } = new URL(baseUrl);

  // 1. Check environment variable
  let accessToken = await getCachedAccessToken(targetOrigin);

  // If token is found, return it
  if (accessToken || !openPage) {
    return accessToken;
  }

  // Generate new access token
  const connectUrl = joinURL(targetOrigin, WELLKNOWN_SERVICE_PATH_PREFIX);

  try {
    const result = await createConnect({
      connectUrl,
      connectAction: "gen-simple-access-key",
      source: "AIGNE DocSmith connect to official service",
      closeOnSuccess: true,
      retry: RETRY_COUNT,
      fetchInterval: FETCH_INTERVAL,
      appName: "AIGNE DocSmith",
      appLogo: "https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg",
      openPage: (pageUrl) => {
        const url = new URL(pageUrl);
        if (locale) {
          url.searchParams.set("locale", locale);
        }
        open(url.toString());

        console.log(
          "🔗 Please open the following URL in your browser to authorize access: ",
          chalk.cyan(url.toString()),
          "\n",
        );
      },
    });

    accessToken = result.accessKeySecret;

    // Save the access token to config file
    await saveTokenToConfigFile(targetHostname, { DOC_DISCUSS_KIT_ACCESS_TOKEN: accessToken });
  } catch {
    throw new Error(
      `${chalk.yellow("⚠️ Failed to obtain official access token. This may be due to network issues or authorization timeout.")}\n\n` +
        `${chalk.bold("💡 Solution:")}\n` +
        `  • Step 1: Ensure your network can access the official service URL: ${chalk.cyan(targetOrigin)}\n` +
        `  • Step 2: Run ${chalk.cyan("aigne doc publish")} again\n\n`,
    );
  }

  return accessToken;
}

/**
 * Saves the access token and related fields to the configuration file.
 * @param {string} configFile - The path to the config file.
 * @param {string} hostname - The hostname key.
 * @param {Object} fields - Fields to save (e.g., { DOC_DISCUSS_KIT_ACCESS_TOKEN: "..." }).
 */
async function saveTokenToConfigFile(hostname, fields) {
  try {
    const configFile = getDocSmithEnvFilePath();

    const aigneDir = join(homedir(), ".aigne");
    if (!existsSync(aigneDir)) {
      mkdirSync(aigneDir, { recursive: true });
    }

    let existingConfig = {};
    if (existsSync(configFile)) {
      const fileContent = await readFile(configFile, "utf8");
      const parsedConfig = fileContent.trim() ? parse(fileContent) : null;
      existingConfig = parsedConfig || {};
    }

    await writeFile(
      configFile,
      stringify({
        ...existingConfig,
        [hostname]: fields,
      }),
    );
  } catch (error) {
    console.warn(`Could not save the token to the configuration file: ${error.message}`, error);
    // The token is already in the environment, so we don't need to throw an error here.
  }
}
