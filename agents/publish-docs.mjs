import fs from "node:fs/promises";
import { basename, join } from "node:path";
import { publishDocs as publishDocsFn } from "@aigne/publish-docs";
import chalk from "chalk";
import { glob } from "glob";
import { getAccessToken } from "../utils/auth-utils.mjs";
import { DISCUSS_KIT_STORE_URL, FILE_CONCURRENCY } from "../utils/constants.mjs";
import { getGithubRepoUrl, loadConfigFromFile, saveValueToConfig } from "../utils/utils.mjs";
import { appendD2ImageRefs, saveD2Assets } from "../utils/kroki-utils.mjs";
import pMap from "p-map";

const DEFAULT_APP_URL = "https://docsmith.aigne.io";

export default async function publishDocs(
  { docsDir: rawDocsDir, appUrl, boardId, projectName, projectDesc, projectLogo },
  options,
) {
  const docsDir = join(".aigne", "doc-smith", ".tmp-docs");
  await fs.rm(docsDir, { recursive: true, force: true });
  await fs.mkdir(docsDir, {
    recursive: true,
  });
  await fs.cp(rawDocsDir, docsDir, { recursive: true });

  // Example: process each markdown file (replace with your logic)
  const mdFilePaths = await glob("**/*.md", { cwd: docsDir });
  await pMap(
    mdFilePaths,
    async (filePath) => {
      let finalContent = await fs.readFile(join(docsDir, filePath), "utf8");
      const docPath = filePath.replace(docsDir, "").replace(".md", "");
      const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
      await saveD2Assets({ markdown: finalContent, baseName: flatName, docsDir });
      finalContent = appendD2ImageRefs(finalContent, flatName);
      await fs.writeFile(join(docsDir, filePath), finalContent, "utf8");
    },
    { concurrency: FILE_CONCURRENCY },
  );

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
      console.log(
        `${chalk.bold("\n💡 Tips")}\n\n` +
          `Start here to run your own website:\n${chalk.cyan(DISCUSS_KIT_STORE_URL)}\n`,
      );
      const userInput = await options.prompts.input({
        message: "Please enter your Discuss Kit platform URL:",
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
    }
  }

  const accessToken = await getAccessToken(appUrl);

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
      mediaFolder: docsDir,
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
      const message = `✅ Documentation Published Successfully!`;
      await fs.rm(docsDir, { recursive: true, force: true });
      return {
        message,
      };
    }
    await fs.rm(docsDir, { recursive: true, force: true });

    return {};
  } catch (error) {
    await fs.rm(docsDir, { recursive: true, force: true });
    return {
      message: `❌ Failed to publish docs: ${error.message}`,
    };
  }
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
