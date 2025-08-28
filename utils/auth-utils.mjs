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
  DISCUSS_KIT_DID,
  DISCUSS_KIT_STORE_URL,
} from "./constants.mjs";

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";

/**
 * Get access token from environment, config file, or prompt user for authorization
 * @param {string} appUrl - The application URL
 * @returns {Promise<string>} - The access token
 */
export async function getAccessToken(appUrl) {
  const DOC_SMITH_ENV_FILE = join(homedir(), ".aigne", "doc-smith-connected.yaml");
  const { hostname } = new URL(appUrl);

  let accessToken = process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN;

  // Check if access token exists in environment or config file
  if (!accessToken) {
    try {
      if (existsSync(DOC_SMITH_ENV_FILE)) {
        const data = await readFile(DOC_SMITH_ENV_FILE, "utf8");
        if (data.includes("DOC_DISCUSS_KIT_ACCESS_TOKEN")) {
          const envs = parse(data);
          if (envs[hostname]?.DOC_DISCUSS_KIT_ACCESS_TOKEN) {
            accessToken = envs[hostname].DOC_DISCUSS_KIT_ACCESS_TOKEN;
          }
        }
      }
    } catch (error) {
      console.warn("Failed to read config file:", error.message);
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
        `${chalk.yellow("⚠️  The provided URL is not a valid website on ArcBlock platform")}\n\n` +
          `${chalk.bold("💡 Solution:")} Start here to run your own website that can host your docs:\n${storeLink}\n\n`,
      );
    } else if (error instanceof ComponentNotFoundError) {
      const docsLink = chalk.cyan(BLOCKLET_ADD_COMPONENT_DOCS);
      throw new Error(
        `${chalk.yellow("⚠️  This website does not have required components for publishing")}\n\n` +
          `${chalk.bold("💡 Solution:")} Please refer to the documentation to add Discuss Kit component:\n${docsLink}\n\n`,
      );
    } else {
      throw new Error(
        `❌ Unable to connect to: ${chalk.cyan(appUrl)}\n\n` +
          `${chalk.bold("Possible causes:")}\n` +
          `• Network connection issues\n` +
          `• Server temporarily unavailable\n` +
          `• Incorrect URL address\n\n` +
          `${chalk.green("Suggestion:")} Please check your network connection and URL address, then try again`,
      );
    }
  }

  const DISCUSS_KIT_URL = appUrl;
  const connectUrl = joinURL(new URL(DISCUSS_KIT_URL).origin, WELLKNOWN_SERVICE_PATH_PREFIX);

  try {
    const result = await createConnect({
      connectUrl: connectUrl,
      connectAction: "gen-simple-access-key",
      source: `AIGNE DocSmith connect to Discuss Kit`,
      closeOnSuccess: true,
      appName: "AIGNE DocSmith",
      appLogo: "https://docsmith.aigne.io/image-bin/uploads/a7910a71364ee15a27e86f869ad59009.svg",
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
      }),
    );
  } catch (error) {
    console.debug(error);
    throw new Error(
      "Failed to obtain access token. Please check your network connection and try again later.",
    );
  }

  return accessToken;
}
