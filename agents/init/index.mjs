import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { stringify as yamlStringify } from "yaml";
import {
  DEFAULT_REASONING_EFFORT_LEVEL,
  DEFAULT_THINKING_EFFORT_LEVEL,
  DIAGRAM_STYLES,
} from "../../utils/constants/index.mjs";
import loadConfig from "../../utils/load-config.mjs";
import { detectSystemLanguage, getProjectInfo } from "../../utils/utils.mjs";
import mapReasoningEffortLevel from "../utils/map-reasoning-effort-level.mjs";
import { validateDocDir } from "./validate.mjs";

/**
 * Guides the user through a multi-turn dialog to generate a YAML configuration file.
 * @param {Object} params
 * @param {string} params.outputPath - The path to the output file.
 * @param {string} params.fileName - The name of the file.
 * @returns {Promise<Object>}
 */
export default async function init(input, options) {
  const config = await _init(input, options);

  // Set thinking effort (lite/standard/pro) and map to reasoningEffort
  options.context.userContext.thinkingEffort =
    config.thinking?.effort || DEFAULT_THINKING_EFFORT_LEVEL;

  // Set global reasoningEffort based on thinkingEffort
  options.context.userContext.reasoningEffort = mapReasoningEffortLevel(
    { level: DEFAULT_REASONING_EFFORT_LEVEL },
    options,
  )?.reasoningEffort;

  // for translation agent
  if (config.translateLanguages) {
    config.translates = config.translateLanguages.map((lang) => ({ language: lang }));
  }

  return {
    ...config,
  };
}

async function _init({
  outputPath = ".aigne/doc-smith",
  fileName = "config.yaml",
  skipIfExists = false,
  appUrl,
  checkOnly = false,
}) {
  // Check if we're in checkOnly mode
  if (checkOnly) {
    const filePath = join(outputPath, fileName);
    const configContent = await readFile(filePath, "utf8").catch(() => null);

    if (!configContent || configContent.trim() === "") {
      console.log("⚠️ No configuration file found.");
      console.log(
        `🚀 Run ${chalk.cyan("aigne doc init")} to set up your documentation configuration.`,
      );
      process.exit(0);
    }

    // Config exists, load and return it
    return loadConfig({ config: filePath, appUrl });
  }

  if (skipIfExists) {
    const filePath = join(outputPath, fileName);
    const configContent = await readFile(filePath, "utf8").catch(() => null);
    // Only skip if file exists AND has non-empty content
    if (configContent && configContent.trim() !== "") {
      // load config from file
      const config = await loadConfig({ config: filePath, appUrl });
      const isValid = validateDocDir(config.docsDir);
      if (typeof isValid === "string") {
        console.log(
          `${chalk.red("Invalid docsDir")}: ${isValid}\nPlease check your configuration.`,
        );
        process.exit(1);
      }
      if (!isValid) {
        console.log(`${chalk.red("Invalid docsDir")}, please check your configuration.`);
        process.exit(1);
      }
      return config;
    }
  }

  const input = {};

  // 5. Language settings - use system language detection as default
  // const systemLanguage = detectSystemLanguage();
  // FIXME: 临时使用中文，框架优化后需要修改
  input.locale = "zh";

  // 6. Translation languages - default to empty
  input.translateLanguages = [];

  // 7. Documentation directory - use default value
  input.docsDir = `${outputPath}/docs`;

  // 8. Content sources - use "./" as default
  input.sourcesPath = ["./"];

  // 9. Custom rules - default to empty
  input.rules = "";

  // Save project info to config
  const projectInfo = await getProjectInfo();
  // Remove leading and trailing spaces (middle spaces are preserved and count toward limit)
  input.projectName = projectInfo.name.trim();
  input.projectDesc = projectInfo.description.trim();
  input.projectLogo = projectInfo.icon;

  // Generate YAML content
  const yamlContent = generateYAML(input, outputPath);

  // Save file
  try {
    const filePath = join(outputPath, fileName);
    const dirPath = dirname(filePath);

    // Create directory if it doesn't exist
    await mkdir(dirPath, { recursive: true });

    await writeFile(filePath, yamlContent, "utf8");
    console.log(
      `\n✅ Setup complete! Your configuration has been saved to: ${chalk.cyan(filePath)}`,
    );
    console.log("💡 You can edit this file at any time to change your settings.\n");
    console.log(`🚀 To generate your documentation, run: ${chalk.cyan("aigne doc create")}\n`);

    if (skipIfExists) {
      return loadConfig({ config: filePath, appUrl });
    }

    return {};
  } catch (error) {
    console.error(
      `❌ Sorry, I encountered an error while saving your configuration file: ${error.message}`,
    );
    return {
      inputGeneratorStatus: false,
      inputGeneratorError: error.message,
    };
  }
}

/**
 * Generate YAML configuration content
 * @param {Object} input - Input object
 * @returns {string} YAML string
 */
export function generateYAML(input) {
  // Create the main configuration object that will be safely serialized
  const config = {
    // Project information (safely handled by yaml library)
    // Remove leading and trailing spaces (middle spaces are preserved and count toward limit)
    projectName: (input.projectName || "").trim(),
    projectDesc: (input.projectDesc || "").trim(),
    projectLogo: input.projectLogo || "",

    thinking: {
      effort: input.thinking?.effort || DEFAULT_THINKING_EFFORT_LEVEL,
    },

    // Custom rules and target audience (empty for user to fill)
    rules: input.rules || "",
    targetAudience: "",

    // Language settings
    locale: input.locale || "en",
    translateLanguages: input.translateLanguages?.filter((lang) => lang.trim()) || [],

    // Paths
    docsDir: input.docsDir || "./aigne/doc-smith/docs",
    sourcesPath: input.sourcesPath || [],
    media: {
      // Image filtering settings
      minImageWidth: input.minImageWidth || 800,
    },
  };

  // Generate comments and structure
  let yaml = "# Project information for documentation publishing\n";

  // Serialize the project info section safely with string quoting
  const projectSection = yamlStringify({
    projectName: config.projectName,
    projectDesc: config.projectDesc,
    projectLogo: config.projectLogo,
  }).trim();

  yaml += `${projectSection}\n\n`;

  const modelSection = yamlStringify({
    thinking: config.thinking,
  }).trim();

  yaml += `\
# AI Thinking Configuration
# thinking.effort: Determines the depth of reasoning and cognitive effort the AI uses when responding, available options:
#   - lite: Fast responses with basic reasoning
#   - standard: Balanced speed and reasoning capability
#   - pro: In-depth reasoning with longer response times
${modelSection}
\n`;

  // Custom Documentation Rules and Requirements
  yaml += "# Custom Rules: Define specific documentation generation rules and requirements\n";
  const rulesSection = yamlStringify({ rules: config.rules }).trim();
  // Use literal style for multiline strings
  yaml += `${rulesSection.replace(/rules: ''/, "rules: |\n  ")}\n\n`;

  // Target Audience Description
  yaml += "# Target Audience: Describe your specific target audience and their characteristics.\n";
  const targetAudienceSection = yamlStringify({ targetAudience: config.targetAudience }).trim();
  // Use literal style for multiline strings
  yaml += `${targetAudienceSection.replace(/targetAudience: ''/, "targetAudience: |\n  ")}\n\n`;

  // Glossary Configuration
  yaml += "# Glossary: Define project-specific terms and definitions.\n";
  yaml +=
    '# glossary: "@glossary.md"  # Path to a markdown file containing glossary definitions.\n\n';

  // Language settings - safely serialize
  const localeSection = yamlStringify({ locale: config.locale }).trim();
  yaml += `${localeSection.replace(/^locale:/, "locale:")}\n`;

  // Translation languages
  if (config.translateLanguages.length > 0) {
    const translateLanguagesSection = yamlStringify({
      translateLanguages: config.translateLanguages,
    }).trim();
    yaml += `${translateLanguagesSection.replace(/^translateLanguages:/, "translateLanguages:")}\n`;
  } else {
    yaml += "# translateLanguages:  # A list of languages to translate the documentation to.\n";
    yaml += "#   - zh  # Example: Chinese translation\n";
    yaml += "#   - en  # Example: English translation\n";
  }

  // Directory and source path configurations - safely serialize
  const docsDirSection = yamlStringify({ docsDir: config.docsDir }).trim();
  yaml += `${docsDirSection}  # The directory where the generated documentation will be saved.\n`;

  const sourcesPathSection = yamlStringify({ sourcesPath: config.sourcesPath }).trim();
  yaml += `${sourcesPathSection.replace(/^sourcesPath:/, "sourcesPath:  # The source code paths to analyze.")}\n`;

  // Image filtering settings
  const mediaInfoSection = yamlStringify({
    media: config.media,
  }).trim();
  yaml += `# minImageWidth: Only images wider than this value (in pixels) will be used in the page generation.\n${mediaInfoSection}\n`;

  // Diagramming configuration
  yaml += "\n# Diagramming Configuration\n";
  yaml +=
    "# diagramming.effort: AI effort level for diagramming, 0-10, larger value means fewer diagrams\n";
  yaml += "diagramming:\n";
  yaml += "  effort: 5  # AI effort level for diagramming, 0-10, large is less diagram\n";
  yaml +=
    "  # Default diagram style: The primary style to use when no style is specified in feedback\n";
  yaml += "  # This style will be applied if feedback doesn't specify a different style\n";
  yaml += "  # Available options:\n";
  Object.entries(DIAGRAM_STYLES).forEach(([key, style]) => {
    yaml += `  #   ${key.padEnd(16)} - ${style.name}: ${style.description}\n`;
  });
  yaml += '  # style: "modern"\n';

  return yaml;
}

init.description = "Create a configuration file for the documentation generation process.";
