import { basename, join } from "node:path";
import { publishDocs as publishDocsFn } from "@aigne/publish-docs";
import { BrokerClient } from "@blocklet/payment-broker-client/node";
import chalk from "chalk";
import fs from "fs-extra";

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
import { isRemoteFile, downloadAndUploadImage } from "../../utils/file-utils.mjs";

const BASE_URL = process.env.DOC_SMITH_BASE_URL || CLOUD_SERVICE_URL_PROD;

export default async function publishDocs(
  {
    docsDir: rawDocsDir,
    appUrl,
    boardId,
    projectName,
    projectDesc,
    projectLogo,
    translatedMetadata,
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
    const useEnvAppUrl = !!(
      process.env.DOC_DISCUSS_KIT_URL ||
      process.env.DOC_SMITH_PUBLISH_URL ||
      appUrl
    );

    // Check if appUrl is default and not saved in config (only when not using env variable)
    const config = await loadConfigFromFile();
    appUrl =
      process.env.DOC_DISCUSS_KIT_URL ||
      process.env.DOC_SMITH_PUBLISH_URL ||
      appUrl ||
      config?.appUrl;
    const hasInputAppUrl = !!appUrl;

    let shouldSyncBranding = void 0;
    let token = "";
    let client = null;
    let authToken = null;
    let sessionId = null;

    if (!hasInputAppUrl) {
      authToken = await getOfficialAccessToken(BASE_URL, false);

      sessionId = "";
      let paymentLink = "";

      if (authToken) {
        client = new BrokerClient({ baseUrl: BASE_URL, authToken });
        const info = await client.checkCacheSession({
          needShortUrl: true,
          sessionId: config?.checkoutId,
        });
        sessionId = info.sessionId;
        paymentLink = info.paymentLink;
      }

      const choice = await options.prompts.select({
        message: "Please select a platform to publish your documents:",
        choices: [
          ...(sessionId
            ? [
                {
                  name: `${chalk.yellow("Resume previous website setup")} - ${chalk.green("Already paid.")} Continue where you left off. Your payment has already been processed.`,
                  value: "new-instance-continue",
                },
              ]
            : []),
          {
            name: `${chalk.blue("DocSmith Cloud (docsmith.aigne.io)")} – ${chalk.green("Free")} hosting. Your documents will be publicly accessible. Best for open-source projects or community sharing.`,
            value: "default",
          },
          {
            name: `${chalk.blue("Your existing website")} - Integrate and publish directly on your current site (setup required)`,
            value: "custom",
          },
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
          message: "Please enter the URL of your website:",
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
        // resume previous website setup
        if (choice === "new-instance-continue") {
          shouldSyncBranding = config?.shouldSyncBranding ?? void 0;
          if (shouldSyncBranding !== void 0) {
            shouldWithBranding = shouldWithBranding ?? shouldSyncBranding;
          }
        }

        if (options?.prompts?.confirm) {
          if (shouldSyncBranding === void 0) {
            shouldSyncBranding = await options.prompts.confirm({
              message: "Would you like to update the project branding (title, description, logo)?",
              default: true,
            });
            await saveValueToConfig(
              "shouldSyncBranding",
              shouldSyncBranding,
              "Should sync branding for documentation",
            );
            shouldWithBranding = shouldSyncBranding;
          } else {
            console.log(
              `Would you like to update the project branding (title, description, logo)? ${chalk.cyan(shouldSyncBranding ? "Yes" : "No")}`,
            );
          }
        }

        try {
          let id = "";
          if (choice === "new-instance-continue") {
            id = sessionId;
            console.log(`\nResuming your previous website setup...`);
          } else {
            console.log(`\nCreating a new website for your documentation...`);
          }
          const {
            appUrl: homeUrl,
            token: ltToken,
            sessionId: newSessionId,
          } = (await deploy(id, paymentLink)) || {};

          sessionId = newSessionId;
          appUrl = homeUrl;
          token = ltToken;
        } catch (error) {
          const errorMsg = error?.message || "Unknown error occurred";
          return { message: `${chalk.red("❌ Failed to create website:")} ${errorMsg}` };
        }
      }
    }

    appUrl = appUrl ?? CLOUD_SERVICE_URL_PROD;

    console.log(`\nPublishing your documentation to ${chalk.cyan(appUrl)}\n`);

    const accessToken = await getAccessToken(appUrl, token);

    process.env.DOC_ROOT_DIR = docsDir;

    const sidebarPath = join(docsDir, "_sidebar.md");
    const publishCacheFilePath = join(DOC_SMITH_DIR, "upload-cache.yaml");

    // Get project info from config
    const projectInfo = {
      name: projectName || config?.projectName || basename(process.cwd()),
      description: projectDesc || config?.projectDesc || "",
      icon: projectLogo || config?.projectLogo || "",
    };
    let finalPath = null;

    // Handle project logo download if it's a URL
    if (projectInfo.icon && isRemoteFile(projectInfo.icon)) {
      const { url: uploadedImageUrl, downloadFinalPath } = await downloadAndUploadImage(
        projectInfo.icon,
        docsDir,
        appUrl,
        accessToken,
      );
      projectInfo.icon = uploadedImageUrl;
      finalPath = downloadFinalPath;
    }

    if (shouldWithBranding) {
      updateBranding({ appUrl, projectInfo, accessToken, finalPath });
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
    if (translatedMetadata) {
      boardMeta.translation = translatedMetadata;
    }

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
      cacheFilePath: publishCacheFilePath,
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
      await saveValueToConfig("checkoutId", "", "Checkout ID for document deployment service");
      await saveValueToConfig("shouldSyncBranding", "", "Should sync branding for documentation");
    } else {
      // If the error is 401 or 403, it means the access token is invalid
      try {
        const obj = JSON.parse(error);
        message = `❌ Publishing failed with error: \n💡 ${obj.message || error}`;
      } catch {
        if (error?.includes("401")) {
          message = `❌ Publishing failed due to an authorization error: \n💡 Please run ${chalk.cyan("aigne doc clear")} to reset your credentials and try again.`;
        } else if (error?.includes("403")) {
          message = `❌ Publishing failed due to an authorization error: \n💡 You’re not the creator of this document (Board ID: ${boardId}). You can change the board ID and try again. \n💡  Or run ${chalk.cyan("aigne doc clear")} to reset your credentials and try again.`;
        }
      }
    }

    // clean up tmp work dir
    await fs.rm(docsDir, { recursive: true, force: true });
  } catch (error) {
    message = `❌ Sorry, I encountered an error while publishing your documentation: ${error.message}`;

    // clean up tmp work dir in case of error
    try {
      const docsDir = join(DOC_SMITH_DIR, TMP_DIR, TMP_DOCS_DIR);
      await fs.rm(docsDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }

  return message ? { message } : {};
}

publishDocs.input_schema = {
  type: "object",
  properties: {
    docsDir: {
      type: "string",
      description: "The directory of the documentation.",
    },
    appUrl: {
      type: "string",
      description: "The URL of the app.",
    },
    boardId: {
      type: "string",
      description: "The ID of the board.",
    },
    "with-branding": {
      type: "boolean",
      description: "Update the website branding (title, description, and logo).",
    },
    projectName: {
      type: "string",
      description: "The name of the project.",
    },
    projectDesc: {
      type: "string",
      description: "A description of the project.",
    },
    projectLogo: {
      type: "string",
      description: "The logo or icon of the project.",
    },
  },
};

publishDocs.description = "Publish the documentation to a website";
