import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { stringify as yamlStringify } from "yaml";
import { getFilteredOptions } from "../../utils/conflict-detector.mjs";
import {
  DEPTH_RECOMMENDATION_LOGIC,
  DOCUMENT_STYLES,
  DOCUMENTATION_DEPTH,
  PURPOSE_TO_KNOWLEDGE_MAPPING,
  READER_KNOWLEDGE_LEVELS,
  SUPPORTED_LANGUAGES,
  TARGET_AUDIENCES,
} from "../../utils/constants/index.mjs";
import loadConfig from "../../utils/load-config.mjs";
import {
  detectSystemLanguage,
  getAvailablePaths,
  getProjectInfo,
  isGlobPattern,
  validatePath,
} from "../../utils/utils.mjs";
import { isRemoteFile } from "../../utils/file-utils.mjs";
import { validateDocDir } from "./validate.mjs";

const _PRESS_ENTER_TO_FINISH = "Press Enter to finish";

/**
 * Guides the user through a multi-turn dialog to generate a YAML configuration file.
 * @param {Object} params
 * @param {string} params.outputPath - The path to the output file.
 * @param {string} params.fileName - The name of the file.
 * @returns {Promise<Object>}
 */
export default async function init(
  {
    outputPath = ".aigne/doc-smith",
    fileName = "config.yaml",
    skipIfExists = false,
    appUrl,
    checkOnly = false,
  },
  options,
) {
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
        console.log(`${chalk.red('Invalid docsDir')}: ${isValid}\nPlease check your configuration.`);
        process.exit(1);
      }
      if (!isValid) {
        console.log(`${chalk.red('Invalid docsDir')}, please check your configuration.`);
        process.exit(1);
      }
      return config;
    }
  }

  console.log("🚀 Welcome to AIGNE DocSmith!");
  console.log("Let's set up your documentation preferences.\n");

  const input = {};

  const purposeChoices = await options.prompts.checkbox({
    message: "📝 [1/9]: What should your documentation help readers achieve?",
    choices: Object.entries(DOCUMENT_STYLES)
      .filter(([key]) => key !== "custom")
      .map(([key, style]) => ({
        name: `${style.name}`,
        description: style.description,
        value: key,
      })),
    validate: (input) => {
      if (input.length === 0) {
        return "You must choose at least one goal for your documentation.";
      }
      return true;
    },
  });

  let prioritizedPurposes = purposeChoices;
  if (purposeChoices.length === 1 && purposeChoices.includes("mixedPurpose")) {
    const topPriorities = await options.prompts.checkbox({
      message: "🎯 Which is most important? (Select up to 2 priorities)",
      choices: Object.entries(DOCUMENT_STYLES)
        .filter(([key]) => key !== "custom" && key !== "mixedPurpose")
        .map(([key, style]) => ({
          name: `${style.name}`,
          description: style.description,
          value: key,
        })),
      validate: (input) => {
        if (input.length === 0) {
          return "You must choose at least one priority.";
        }
        if (input.length > 2) {
          return "You may only choose up to 2 priorities.";
        }
        return true;
      },
    });

    prioritizedPurposes = topPriorities;
  }

  input.documentPurpose = prioritizedPurposes;

  const audienceChoices = await options.prompts.checkbox({
    message: "👥 [2/9]: Who will be reading your documentation?",
    choices: Object.entries(TARGET_AUDIENCES)
      .filter(([key]) => key !== "custom")
      .map(([key, audience]) => ({
        name: `${audience.name}`,
        description: audience.description,
        value: key,
      })),
    validate: (input) => {
      if (input.length === 0) {
        return "You must choose at least one audience.";
      }
      return true;
    },
  });

  input.targetAudienceTypes = audienceChoices;

  const mappedPurpose = prioritizedPurposes.find(
    (purpose) => PURPOSE_TO_KNOWLEDGE_MAPPING[purpose],
  );
  const defaultKnowledge = mappedPurpose ? PURPOSE_TO_KNOWLEDGE_MAPPING[mappedPurpose] : null;

  const { filteredOptions: filteredKnowledgeOptions } = getFilteredOptions(
    "readerKnowledgeLevel",
    { documentPurpose: prioritizedPurposes, targetAudienceTypes: audienceChoices },
    READER_KNOWLEDGE_LEVELS,
  );

  const knowledgeChoice = await options.prompts.select({
    message: "🧠 [3/9]: How much do your readers already know about your project?",
    choices: Object.entries(filteredKnowledgeOptions).map(([key, level]) => ({
      name: `${level.name}`,
      description: level.description,
      value: key,
    })),
    default: defaultKnowledge,
  });

  // Save reader knowledge level choice as key
  input.readerKnowledgeLevel = knowledgeChoice;

  // 4. Documentation depth - how comprehensive should the documentation be?
  // Determine default based on priority: Purpose > Audience > Knowledge Level
  const getDepthDefault = () => {
    // Check priority order: purposes -> audiences -> knowledgeLevels
    const checks = [
      () => {
        const purpose = prioritizedPurposes.find((p) => DEPTH_RECOMMENDATION_LOGIC.purposes[p]);
        return purpose ? DEPTH_RECOMMENDATION_LOGIC.purposes[purpose] : null;
      },
      () => {
        const audience = audienceChoices.find((a) => DEPTH_RECOMMENDATION_LOGIC.audiences[a]);
        return audience ? DEPTH_RECOMMENDATION_LOGIC.audiences[audience] : null;
      },
      () => DEPTH_RECOMMENDATION_LOGIC.knowledgeLevels[knowledgeChoice] || null,
    ];

    return checks.find((check) => check())?.() || null;
  };

  const defaultDepth = getDepthDefault();

  // Filter documentation depth options based on all previous selections
  const { filteredOptions: filteredDepthOptions } = getFilteredOptions(
    "documentationDepth",
    {
      documentPurpose: prioritizedPurposes,
      targetAudienceTypes: audienceChoices,
      readerKnowledgeLevel: knowledgeChoice,
    },
    DOCUMENTATION_DEPTH,
  );

  const depthChoice = await options.prompts.select({
    message: "📊 [4/9]: How detailed should your documentation be?",
    choices: Object.entries(filteredDepthOptions).map(([key, depth]) => ({
      name: `${depth.name}`,
      description: depth.description,
      value: key,
    })),
    default: defaultDepth,
  });

  // Save documentation depth choice as key
  input.documentationDepth = depthChoice;

  // 5. Language settings
  // Detect system language and use as default
  const systemLanguage = detectSystemLanguage();

  // Let user select primary language from supported list
  const primaryLanguageChoice = await options.prompts.select({
    message: "🌐 [5/9]: What is the main language of your documentation?",
    choices: SUPPORTED_LANGUAGES.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
    })),
    default: systemLanguage,
  });

  input.locale = primaryLanguageChoice;

  // 6. Translation languages
  // Filter out the primary language from available choices
  const availableTranslationLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code !== primaryLanguageChoice,
  );

  const translateLanguageChoices = await options.prompts.checkbox({
    message: "🔄 [6/9]: What languages should we translate to?",
    choices: availableTranslationLanguages.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
    })),
  });

  input.translateLanguages = translateLanguageChoices;

  // 7. Documentation directory
  const docsDirInput = await options.prompts.input({
    message: `📁 [7/9]: Where should we save your documentation?`,
    default: `${outputPath}/docs`,
    validate: validateDocDir,
  });
  input.docsDir = docsDirInput.trim() || `${outputPath}/docs`;

  // 8. Content sources
  console.log("\n🔍 [8/9]: Data Sources");
  console.log("Please specify the data source we should analyze to generate your documentation.");
  console.log(
    `  1. Use paths like ${chalk.green("./src")}, ${chalk.green("./README.md")} or ${chalk.green("!./src/private")}.`,
  );
  console.log(
    `  2. Use globs like ${chalk.green("src/**/*.js")} or ${chalk.green("!private/**/*.js")} for more specific file matching.`,
  );
  console.log(`  3. Use URLs like ${chalk.green("https://example.com/openapi.yaml")}.`);
  console.log("💡 If you leave this empty, we will scan the entire directory.");

  const sourcePaths = [];
  while (true) {
    const selectedPath = await options.prompts.search({
      message: "Please enter a valid data source:",
      source: async (input) => {
        if (!input || input.trim() === "") {
          return [
            {
              name: "",
              value: "",
              description: _PRESS_ENTER_TO_FINISH,
            },
          ];
        }

        let isIgnore = false;
        const searchTerm = input.trim();
        let cleanSearchTerm = searchTerm;
        if (cleanSearchTerm.startsWith("!")) {
          isIgnore = true;
          cleanSearchTerm = searchTerm.slice(1);
        }

        // Search for matching files and folders in current directory
        const availablePaths = getAvailablePaths(cleanSearchTerm);

        // Also add option to use as glob pattern
        const options = [...availablePaths].map((x) => ({
          ...x,
          name: isIgnore ? `!${x.name}` : x.name,
          value: isIgnore ? `!${x.value}` : x.value,
        }));

        // Check if input looks like a glob pattern
        const isGlobPatternResult = isGlobPattern(searchTerm);
        if (isGlobPatternResult) {
          // If it looks like a glob pattern, allow direct input
          options.push({
            name: searchTerm,
            value: searchTerm,
            description: "Use this glob pattern for file matching.",
          });
        }

        if (!isIgnore && isRemoteFile(searchTerm)) {
          options.push({
            name: searchTerm,
            value: searchTerm,
            description: "Use this remote url for content source.",
          });
        }

        return options;
      },
    });

    // Check if user chose to exit
    if (!selectedPath || selectedPath.trim() === "" || selectedPath === _PRESS_ENTER_TO_FINISH) {
      break;
    }

    const trimmedPath = selectedPath.trim();

    // Check if it's a glob pattern
    const isGlobPatternResult = isGlobPattern(trimmedPath);

    if (isRemoteFile(trimmedPath)) {
      // For remote urls, just add them without validation
      if (sourcePaths.includes(trimmedPath)) {
        console.log(`⚠️ URL already exists: ${trimmedPath}`);
        continue;
      }
      sourcePaths.push(trimmedPath);
    }
    if (isGlobPatternResult) {
      // For glob patterns, just add them without validation
      if (sourcePaths.includes(trimmedPath)) {
        console.log(`⚠️ Pattern already exists: ${trimmedPath}`);
        continue;
      }
      sourcePaths.push(trimmedPath);
    } else {
      const cleanTrimmedPath = trimmedPath.startsWith("!") ? trimmedPath.slice(1) : trimmedPath;
      // Use validatePath to check if path is valid for regular paths
      const validation = validatePath(cleanTrimmedPath);

      if (!validation.isValid) {
        console.log(`⚠️ ${validation.error}`);
        continue;
      }

      // Avoid duplicate paths
      if (sourcePaths.includes(trimmedPath)) {
        console.log(`⚠️ Path already exists: ${trimmedPath}`);
        continue;
      }

      sourcePaths.push(trimmedPath);
    }
  }

  // If no paths entered, use default
  input.sourcesPath = sourcePaths.length > 0 ? sourcePaths : ["./"];

  // 9. Custom rules - any specific requirements for the documentation?
  const rulesInput = await options.prompts.input({
    message:
      "📋 [9/9]: Do you have any custom rules or requirements for your documentation? (Optional, press Enter to skip)",
    default: "",
  });
  input.rules = rulesInput.trim();

  // Save project info to config
  const projectInfo = await getProjectInfo();
  input.projectName = projectInfo.name;
  input.projectDesc = projectInfo.description;
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
    console.log(chalk.cyan("---"));
    console.log(chalk.cyan(yamlContent));
    console.log(chalk.cyan("---"));
    console.log("💡 You can edit this file at any time to change your settings.\n");
    console.log(`🚀 To generate your documentation, run: ${chalk.cyan("aigne doc generate")}\n`);

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
    projectName: input.projectName || "",
    projectDesc: input.projectDesc || "",
    projectLogo: input.projectLogo || "",

    // Documentation configuration
    documentPurpose: input.documentPurpose || [],
    targetAudienceTypes: input.targetAudienceTypes || [],
    readerKnowledgeLevel: input.readerKnowledgeLevel || "",
    documentationDepth: input.documentationDepth || "",

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

  // Add documentation configuration with comments
  yaml += "# =============================================================================\n";
  yaml += "# Documentation Configuration\n";
  yaml += "# =============================================================================\n\n";

  // Document Purpose with all available options
  yaml += "# Purpose: What's the main outcome you want readers to achieve?\n";
  yaml += "# Available options (uncomment and modify as needed):\n";
  Object.entries(DOCUMENT_STYLES).forEach(([key, style]) => {
    if (key !== "custom") {
      yaml += `#   ${key.padEnd(16)} - ${style.name}: ${style.description}\n`;
    }
  });

  // Safely serialize documentPurpose
  const documentPurposeSection = yamlStringify({ documentPurpose: config.documentPurpose }).trim();
  yaml += `${documentPurposeSection.replace(/^documentPurpose:/, "documentPurpose:")}\n\n`;

  // Target Audience Types with all available options
  yaml += "# Target Audience: Who will be reading this most often?\n";
  yaml += "# Available options (uncomment and modify as needed):\n";
  Object.entries(TARGET_AUDIENCES).forEach(([key, audience]) => {
    if (key !== "custom") {
      yaml += `#   ${key.padEnd(16)} - ${audience.name}: ${audience.description}\n`;
    }
  });

  // Safely serialize targetAudienceTypes
  const targetAudienceTypesSection = yamlStringify({
    targetAudienceTypes: config.targetAudienceTypes,
  }).trim();
  yaml += `${targetAudienceTypesSection.replace(/^targetAudienceTypes:/, "targetAudienceTypes:")}\n\n`;

  // Reader Knowledge Level with all available options
  yaml += "# Reader Knowledge Level: What do readers typically know when they arrive?\n";
  yaml += "# Available options (uncomment and modify as needed):\n";
  Object.entries(READER_KNOWLEDGE_LEVELS).forEach(([key, level]) => {
    yaml += `#   ${key.padEnd(20)} - ${level.name}: ${level.description}\n`;
  });

  // Safely serialize readerKnowledgeLevel
  const readerKnowledgeLevelSection = yamlStringify({
    readerKnowledgeLevel: config.readerKnowledgeLevel,
  }).trim();
  yaml += `${readerKnowledgeLevelSection.replace(/^readerKnowledgeLevel:/, "readerKnowledgeLevel:")}\n\n`;

  // Documentation Depth with all available options
  yaml += "# Documentation Depth: How comprehensive should the documentation be?\n";
  yaml += "# Available options (uncomment and modify as needed):\n";
  Object.entries(DOCUMENTATION_DEPTH).forEach(([key, depth]) => {
    yaml += `#   ${key.padEnd(18)} - ${depth.name}: ${depth.description}\n`;
  });

  // Safely serialize documentationDepth
  const documentationDepthSection = yamlStringify({
    documentationDepth: config.documentationDepth,
  }).trim();
  yaml += `${documentationDepthSection.replace(/^documentationDepth:/, "documentationDepth:")}\n\n`;

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
  yaml += `${docsDirSection.replace(/^docsDir:/, "docsDir:")}  # The directory where the generated documentation will be saved.\n`;

  const sourcesPathSection = yamlStringify({ sourcesPath: config.sourcesPath }).trim();
  yaml += `${sourcesPathSection.replace(/^sourcesPath:/, "sourcesPath:  # The source code paths to analyze.")}\n`;

  // Image filtering settings
  const mediaInfoSection = yamlStringify({
    media: config.media,
  }).trim();
  yaml += `# minImageWidth: Only images wider than this value (in pixels) will be used in the page generation.\n${mediaInfoSection}\n`;

  return yaml;
}

init.description = "Create a configuration file for the documentation generation process.";
