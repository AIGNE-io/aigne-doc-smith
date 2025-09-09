import { basename, join } from "node:path";
import { publishDocs as publishDocsFn } from "@aigne/publish-docs";
import chalk from "chalk";
import fs from "fs-extra";

import { getAccessToken } from "../utils/auth-utils.mjs";
import { DISCUSS_KIT_STORE_URL, TMP_DIR, TMP_DOCS_DIR } from "../utils/constants.mjs";
import { deploy } from "../utils/deploy.mjs";
import { beforePublishHook, ensureTmpDir } from "../utils/kroki-utils.mjs";
import { getGithubRepoUrl, loadConfigFromFile, saveValueToConfig } from "../utils/utils.mjs";

const DEFAULT_APP_URL = "https://docsmith.aigne.io";

export default async function publishDocs(
  { docsDir: rawDocsDir, appUrl, boardId, projectName, projectDesc, projectLogo },
  options,
) {
  // move work dir to tmp-dir
  await ensureTmpDir();

  const docsDir = join(".aigne", "doc-smith", TMP_DIR, TMP_DOCS_DIR);
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
  const isDefaultAppUrl = appUrl === DEFAULT_APP_URL;
  const hasAppUrlInConfig = config?.appUrl;

  let token = "";

  if (!useEnvAppUrl && isDefaultAppUrl && !hasAppUrlInConfig) {
    const hasCachedCheckoutId = !!config?.checkoutId;
    const choice = await options.prompts.select({
      message: "Select platform to publish your documents:",
      choices: [
        {
          name:
            chalk.blue("Publish to docsmith.aigne.io") +
            " - free, but your documents will be publicly accessible, recommended for open-source projects",
          value: "default",
        },
        {
          name: `${chalk.blue("Publish to your existing website")} - use your current website`,
          value: "custom",
        },
        ...(hasCachedCheckoutId
          ? [
              {
                name:
                  chalk.yellow("Continue your previous website setup") +
                  " - resume from where you left off",
                value: "new-instance-continue",
              },
            ]
          : []),
        {
          name: `${chalk.blue("Publish to a new website")} - we'll help you set up a new website`,
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
      // Deploy a new Discuss Kit service
      try {
        let id = "";
        let paymentUrl = "";
        if (choice === "new-instance-continue") {
          id = config?.checkoutId;
          paymentUrl = config?.paymentUrl;
          console.log(`\nResuming your previous website setup...`);
        } else {
          console.log(`\nCreating a new doc website for your documentation...`);
        }
        const { appUrl: homeUrl, token: ltToken } = (await deploy(id, paymentUrl)) || {};

        appUrl = homeUrl;
        token = ltToken;
      } catch (error) {
        const errorMsg = error?.message || "Unknown error occurred";
        console.error(`${chalk.red("❌ Failed to publish to website:")} ${errorMsg}`);
        return { message: `❌ Publish failed: ${errorMsg}` };
      }
    }
  }

  const accessToken = await getAccessToken(appUrl, token);

  process.env.DOC_ROOT_DIR = docsDir;

  const sidebarPath = join(docsDir, "_sidebar.md");

  // Get project info from config
  const projectInfo = {
    name: projectName || config?.projectName || basename(process.cwd()),
    description: projectDesc || config?.projectDesc || "",
    icon: projectLogo || config?.projectLogo || "",
  };

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

  let message;

  try {
    const { success, boardId: newBoardId } = await publishDocsFn({
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
      cacheFilePath: join(".aigne", "doc-smith", "upload-cache.yaml"),
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
      message = `✅ Documentation Published Successfully!`;
    }
  } catch (error) {
    message = `❌ Failed to publish docs: ${error.message}`;
  }
  saveValueToConfig("checkoutId", "", "Checkout ID for document deployment service");

  // clean up tmp work dir
  await fs.rm(docsDir, { recursive: true, force: true });
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
      default: DEFAULT_APP_URL,
    },
    boardId: {
      type: "string",
      description: "The id of the board",
    },
  },
};

publishDocs.description = "Publish the documentation to Discuss Kit";
