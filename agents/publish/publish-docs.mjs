import { basename, join, relative } from "node:path";
import { publishDocs as publishDocsFn } from "@aigne/publish-docs";
import { BrokerClient } from "@blocklet/payment-broker-client/node";
import chalk from "chalk";
import fs from "fs-extra";
import { joinURL } from "ufo";

import {
  getAccessToken,
  getCachedAccessToken,
  getDiscussKitMountPoint,
} from "../../utils/auth.mjs";
import { CLOUD_SERVICE_URL_PROD, DISCUSS_KIT_STORE_URL } from "../../utils/constants.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";
import { deploy } from "../../utils/deploy.mjs";
import { loadConfigFromFile, saveValueToConfig } from "../../utils/config.mjs";
import { ensureTmpDir } from "../../utils/files.mjs";
import { getGithubRepoUrl, isValidGithubUrl } from "../../utils/git.mjs";
import updateBranding from "../../utils/branding.mjs";
import { generateSidebar, loadDocumentStructure } from "../../utils/docs.mjs";
import { copyDocumentsToTemp } from "../../utils/docs-converter.mjs";

const BASE_URL = process.env.DOC_SMITH_BASE_URL || CLOUD_SERVICE_URL_PROD;

export default async function publishDocs(
  {
    appUrl,
    outputDir = PATHS.PLANNING_DIR,
    "with-branding": withBrandingOption,
    config,
    translatedMetadata,
  },
  options,
) {
  // Note: Document validation is now done in check.mjs which throws errors on failure

  // Absolute path for file operations (reading docs)
  const docsAbsolutePath = PATHS.DOCS_DIR;
  // Relative path for mediaFolder (relative to cwd for publish-docs library)
  const docsRelativePath = relative(process.cwd(), PATHS.DOCS_DIR) || "./docs";
  // Relative path for tmp directory
  const tmpDirRelative = relative(process.cwd(), PATHS.TMP_DIR) || ".tmp";
  const docsDir = join(tmpDirRelative, "docs");
  let message;
  let shouldWithBranding = withBrandingOption || false;

  try {
    // Load document structure from output directory
    const documentStructure = await loadDocumentStructure(outputDir);
    if (!documentStructure || documentStructure.length === 0) {
      console.warn("⚠️  No document structure found. Sidebar generation may be limited.");
    }

    // move work dir to tmp-dir
    await ensureTmpDir();
    await fs.rm(docsDir, { recursive: true, force: true });
    await fs.mkdir(docsDir, {
      recursive: true,
    });

    // Convert documents from new directory format to publish format
    await copyDocumentsToTemp(docsAbsolutePath, docsDir);

    // Generate _sidebar.md in tmp directory
    const sidebar = generateSidebar(documentStructure || []);
    const tmpSidebarPath = join(docsDir, "_sidebar.md");
    await fs.writeFile(tmpSidebarPath, sidebar, "utf8");

    // ----------------- main publish process flow -----------------------------
    // Check if DOC_DISCUSS_KIT_URL is set in environment variables
    const useEnvAppUrl = !!(process.env.DOC_SMITH_PUBLISH_URL || process.env.DOC_DISCUSS_KIT_URL);

    // Use config from parameters or load from file as fallback
    if (!config) {
      config = await loadConfigFromFile();
    }
    const { projectName, projectDesc, projectLogo, boardId } = config || {};
    appUrl =
      process.env.DOC_SMITH_PUBLISH_URL ||
      process.env.DOC_DISCUSS_KIT_URL ||
      appUrl ||
      config?.appUrl;
    const hasInputAppUrl = !!appUrl;

    let shouldSyncBranding = void 0;
    let token = "";
    let client = null;
    let sessionId = null;
    let locale = config?.locale;

    if (!hasInputAppUrl) {
      const officialAccessToken = await getCachedAccessToken(BASE_URL);

      sessionId = "";
      if (officialAccessToken) {
        client = new BrokerClient({
          baseUrl: BASE_URL,
          authToken: officialAccessToken,
        });
        const info = await client.checkCacheSession({
          needShortUrl: true,
          sessionId: config?.checkoutId,
        });
        sessionId = info.sessionId;
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
        const isNewInstance = choice === "new-instance";
        if (!isNewInstance) {
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
          if (!isNewInstance) {
            id = sessionId;
            console.log(`\nResuming your previous website setup...`);
          } else {
            console.log(`\nCreating a new website for your documentation...`);
          }
          const {
            appUrl: homeUrl,
            token: ltToken,
            sessionId: newSessionId,
            data,
          } = (await deploy(id, isNewInstance ? locale : undefined)) || {};

          sessionId = newSessionId;
          appUrl = homeUrl;
          token = ltToken;
          locale = data?.preferredLocale || locale;
        } catch (error) {
          const errorMsg = error?.message || "Unknown error occurred";
          return {
            message: `${chalk.red("❌ Failed to create website:")} ${errorMsg}`,
          };
        }
      }
    }

    appUrl = appUrl ?? CLOUD_SERVICE_URL_PROD;

    const appUrlInfo = new URL(appUrl);

    const discussKitMountPoint = await getDiscussKitMountPoint(appUrlInfo.origin);
    const discussKitUrl = joinURL(appUrlInfo.origin, discussKitMountPoint);

    console.log(`\nPublishing your documentation to ${chalk.cyan(discussKitUrl)}`);

    const accessToken = await getAccessToken(appUrlInfo.origin, token, locale);

    process.env.DOC_ROOT_DIR = docsDir;

    const sidebarPath = join(docsDir, "_sidebar.md");
    const publishCacheFilePath = join(PATHS.CACHE, "upload-cache.yaml");

    // Get project info from config
    const projectInfo = {
      name: projectName || config?.projectName || basename(process.cwd()),
      description: projectDesc || config?.projectDesc || "",
      icon: projectLogo || config?.projectLogo || "",
    };

    console.log(`Publishing docs collection: ${chalk.cyan(projectInfo.name || boardId)}\n`);

    // Skip image download - use icon URL directly
    if (shouldWithBranding) {
      updateBranding({ appUrl: discussKitUrl, projectInfo, accessToken });
    }

    // Construct boardMeta object
    // In standalone mode, get GitHub URL from git-clone type source in sources array
    // In project mode, use current git repo URL (even if git-clone sources exist as supplements)
    let githubRepoUrl = getGithubRepoUrl();
    if (config?.mode === "standalone") {
      const gitCloneSource = config?.sources?.find((s) => s.type === "git-clone");
      const configUrl = gitCloneSource?.url;
      // Only use config URL if it's a valid GitHub URL
      githubRepoUrl = isValidGithubUrl(configUrl) ? configUrl : "";
    }
    const boardMeta = {
      category: config?.documentPurpose || [],
      githubRepoUrl,
      commitSha: config?.lastGitHead || "",
      languages: [
        ...(config?.locale ? [config.locale] : []),
        ...(config?.translateLanguages || []),
      ].filter((lang, index, arr) => arr.indexOf(lang) === index), // Remove duplicates
    };

    // Add translatedMetadata if available
    if (translatedMetadata) {
      boardMeta.translation = translatedMetadata;
    }

    const {
      success,
      boardId: newBoardId,
      error,
      docsUrl,
    } = await publishDocsFn({
      sidebarPath,
      accessToken,
      appUrl: discussKitUrl,
      boardId,
      autoCreateBoard: true,
      // Pass additional project information if available
      boardName: projectInfo.name,
      boardDesc: projectInfo.description,
      boardCover: projectInfo.icon,
      mediaFolder: docsRelativePath,
      cacheFilePath: publishCacheFilePath,
      boardMeta,
    });

    // Save values to config.yaml if publish was successful
    if (success) {
      // Save appUrl to config only when not using environment variable
      if (!useEnvAppUrl) {
        await saveValueToConfig("appUrl", appUrlInfo.origin);
      }

      // Save boardId to config if it was auto-created
      if (boardId !== newBoardId) {
        await saveValueToConfig("boardId", newBoardId);
      }
      message = `✅ Documentation published successfully!\n📖 Docs available at: ${chalk.cyan(docsUrl)}`;

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
    await fs.rm(tmpDirRelative, { recursive: true, force: true });
  } catch (error) {
    message = `❌ Sorry, I encountered an error while publishing your documentation: \n\n${error.message}`;

    // clean up tmp work dir in case of error
    try {
      await fs.rm(tmpDirRelative, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }

  return message ? { message } : {};
}

publishDocs.input_schema = {
  type: "object",
  properties: {
    config: {
      type: "object",
      description: "Configuration object from check step.",
    },
    docsDir: {
      type: "string",
      description: "The directory of the documentation.",
    },
    outputDir: {
      type: "string",
      description: "Output directory containing document structure file (default: ./planning).",
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
    translatedMetadata: {
      type: "object",
      description: "Translated metadata (title and description) for multiple languages.",
    },
  },
};

publishDocs.description = "Publish the documentation to a website";
