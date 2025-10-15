import { basename, extname, join, relative } from "node:path";
import slugify from "slugify";
import { publishDocs as publishDocsFn } from "@aigne/publish-docs";
import { BrokerClient } from "@blocklet/payment-broker-client/node";
import chalk from "chalk";
import fs from "fs-extra";

import { getExtnameFromContentType } from "../../utils/file-utils.mjs";
import { isHttp } from "../../utils/utils.mjs";
import { getAccessToken, getOfficialAccessToken } from "../../utils/auth-utils.mjs";
import {
  CLOUD_SERVICE_URL_PROD,
  DISCUSS_KIT_STORE_URL,
  DOC_SMITH_DIR,
  TMP_DIR,
  TMP_DOCS_DIR,
} from "../../utils/constants/index.mjs";
import { beforePublishHook, ensureTmpDir } from "../../utils/d2-utils.mjs";
import { deploy } from "../../utils/deploy.mjs";
import { getGithubRepoUrl, loadConfigFromFile, saveValueToConfig } from "../../utils/utils.mjs";
import updateBranding from "../utils/update-branding.mjs";

const BASE_URL = process.env.DOC_SMITH_BASE_URL || CLOUD_SERVICE_URL_PROD;

export default async function publishDocs(
  {
    docsDir: rawDocsDir,
    appUrl,
    boardId,
    projectName,
    projectDesc,
    projectLogo,
    "with-branding": withBrandingOption,
  },
  options,
) {
  let message;
  let shouldWithBranding = withBrandingOption || false;

  try {
    // move work dir to tmp-dir
    await ensureTmpDir();

    const docsDir = join(DOC_SMITH_DIR, TMP_DIR, TMP_DOCS_DIR);
    await fs.rm(docsDir, { recursive: true, force: true });
    await fs.mkdir(docsDir, {
      recursive: true,
    });
    await fs.cp(rawDocsDir, docsDir, { recursive: true });

    // ----------------- trigger beforePublishHook -----------------------------
    await beforePublishHook({ docsDir });

    // ----------------- main publish process flow -----------------------------
    // Check if DOC_DISCUSS_KIT_URL is set in environment variables
    const envAppUrl = process.env.DOC_DISCUSS_KIT_URL;
    const useEnvAppUrl = !!envAppUrl;

    // Use environment variable if available, otherwise use the provided appUrl
    if (useEnvAppUrl) {
      appUrl = envAppUrl;
    }

    // Check if appUrl is default and not saved in config (only when not using env variable)
    const config = await loadConfigFromFile();
    const isDefaultAppUrl = appUrl === CLOUD_SERVICE_URL_PROD;
    const hasAppUrlInConfig = config?.appUrl;

    let token = "";

    if (!useEnvAppUrl && isDefaultAppUrl && !hasAppUrlInConfig) {
      const authToken = await getOfficialAccessToken(BASE_URL, false);

      let sessionId = "";
      let paymentLink = "";

      if (authToken) {
        const client = new BrokerClient({ baseUrl: BASE_URL, authToken });
        const info = await client.checkCacheSession({
          needShortUrl: true,
          sessionId: config?.checkoutId,
        });
        sessionId = info.sessionId;
        paymentLink = info.paymentLink;
      }

      const choice = await options.prompts.select({
        message: "Select platform to publish your documents:",
        choices: [
          {
            name: `${chalk.blue("DocSmith Cloud (docsmith.aigne.io)")} – ${chalk.green("Free")} hosting. Your documents will be publicly accessible. Best for open-source projects or community sharing.`,
            value: "default",
          },
          {
            name: `${chalk.blue("Your existing website")} - Integrate and publish directly on your current site (setup required)`,
            value: "custom",
          },
          ...(sessionId
            ? [
                {
                  name: `${chalk.yellow("Resume previous website setup")} - ${chalk.green("Already paid.")} Continue where you left off. Your payment has already been processed.`,
                  value: "new-instance-continue",
                },
              ]
            : []),
          {
            name: `${chalk.blue("New website")} - ${chalk.yellow("Paid service.")} We'll help you set up a brand-new website with custom domain and hosting. Great if you want a professional presence.`,
            value: "new-instance",
          },
        ],
      });

      if (choice === "custom") {
        console.log(
          `${chalk.bold("\n💡 Tips")}\n\n` +
            `Start here to run your own website:\n${chalk.cyan(DISCUSS_KIT_STORE_URL)}\n`,
        );
        const userInput = await options.prompts.input({
          message: "Please enter your website URL:",
          validate: (input) => {
            try {
              // Check if input contains protocol, if not, prepend https://
              const urlWithProtocol = input.includes("://") ? input : `https://${input}`;
              new URL(urlWithProtocol);
              return true;
            } catch {
              return "Please enter a valid URL";
            }
          },
        });
        // Ensure appUrl has protocol
        appUrl = userInput.includes("://") ? userInput : `https://${userInput}`;
      } else if (["new-instance", "new-instance-continue"].includes(choice)) {
        if (options?.prompts?.confirm) {
          shouldWithBranding = await options.prompts.confirm({
            message: "Upload project branding (title, description, logo) to the website?",
            default: true,
          });
        }
        // Deploy a new Discuss Kit service
        let id = "";
        let paymentUrl = "";
        if (choice === "new-instance-continue") {
          id = sessionId;
          paymentUrl = paymentLink;
          console.log(`\nResuming your previous website setup...`);
        } else {
          console.log(`\nCreating new website for your documentation...`);
        }
        const { appUrl: homeUrl, token: ltToken } = (await deploy(id, paymentUrl)) || {};

        appUrl = homeUrl;
        token = ltToken;
      }
    }

    console.log(`\nPublishing docs to ${chalk.cyan(appUrl)}\n`);

    const accessToken = await getAccessToken(appUrl, token);

    process.env.DOC_ROOT_DIR = docsDir;

    const sidebarPath = join(docsDir, "_sidebar.md");

    // Get project info from config
    const projectInfo = {
      name: projectName || config?.projectName || basename(process.cwd()),
      description: projectDesc || config?.projectDesc || "",
      icon: projectLogo || config?.projectLogo || "",
    };

    // Handle project logo download if it's a URL
    if (projectInfo.icon && isHttp(projectInfo.icon)) {
      const tempFilePath = join(docsDir, slugify(basename(projectInfo.icon)));
      const initialExt = extname(projectInfo.icon);
      let ext = initialExt;

      try {
        const response = await fetch(projectInfo.icon);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (response.ok) {
          if (!ext) {
            const contentType = response.headers.get("content-type");
            ext = getExtnameFromContentType(contentType);
          }

          const finalPath = ext ? `${tempFilePath}.${ext}` : tempFilePath;
          fs.writeFileSync(finalPath, buffer);

          // Update to relative path
          projectInfo.icon = relative(join(process.cwd(), DOC_SMITH_DIR), finalPath);
        }
      } catch (error) {
        console.warn(`Failed to download project logo: ${error.message}`);
      }
    }

    if (shouldWithBranding) {
      updateBranding({ appUrl, projectInfo, accessToken });
    }

    // Construct boardMeta object
    const boardMeta = {
      category: config?.documentPurpose || [],
      githubRepoUrl: getGithubRepoUrl(),
      commitSha: config?.lastGitHead || "",
      languages: [
        ...(config?.locale ? [config.locale] : []),
        ...(config?.translateLanguages || []),
      ].filter((lang, index, arr) => arr.indexOf(lang) === index), // Remove duplicates
    };

    const {
      success,
      boardId: newBoardId,
      error,
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
      mediaFolder: rawDocsDir,
      cacheFilePath: join(DOC_SMITH_DIR, "upload-cache.yaml"),
      boardMeta,
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
      message = `✅ Documentation published successfully!`;
    } else {
      // If the error is 401 or 403, it means the access token is invalid
      if (error?.includes("401") || error?.includes("403")) {
        message = `❌ Publishing failed: you don't have valid authorization.\n   Run ${chalk.cyan("aigne doc clear")} to reset it, then publish again.`;
      }
    }

    // clean up tmp work dir
    await fs.rm(docsDir, { recursive: true, force: true });
  } catch (error) {
    message = `❌ Failed to publish docs: ${error.message}`;

    // clean up tmp work dir in case of error
    try {
      const docsDir = join(DOC_SMITH_DIR, TMP_DIR, TMP_DOCS_DIR);
      await fs.rm(docsDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }

  await saveValueToConfig("checkoutId", "", "Checkout ID for document deployment service");
  return message ? { message } : {};
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
      default: CLOUD_SERVICE_URL_PROD,
    },
    boardId: {
      type: "string",
      description: "The id of the board",
    },
    "with-branding": {
      type: "boolean",
      description: "Upload project branding (title, description, logo) to website",
    },
    projectName: {
      type: "string",
      description: "The name of the project",
    },
    projectDesc: {
      type: "string",
      description: "The description of the project",
    },
    projectLogo: {
      type: "string",
      description: "The logo/icon of the project",
    },
  },
};

publishDocs.description = "Publish the documentation to website";
