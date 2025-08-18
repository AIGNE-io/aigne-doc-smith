import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import chalk from "chalk";
import {
  DOCUMENT_STYLES,
  SUPPORTED_LANGUAGES,
  TARGET_AUDIENCES,
  READER_KNOWLEDGE_LEVELS,
  DOCUMENTATION_DEPTH,
  PURPOSE_TO_KNOWLEDGE_MAPPING,
  DEPTH_RECOMMENDATION_LOGIC,
} from "../utils/constants.mjs";
import { getAvailablePaths, getProjectInfo, validatePath } from "../utils/utils.mjs";

// UI constants
const _PRESS_ENTER_TO_FINISH = "Press Enter to finish";

/**
 * Guide users through multi-turn dialogue to collect information and generate YAML configuration
 * @param {Object} params
 * @param {string} params.outputPath - Output file path
 * @param {string} params.fileName - File name
 * @returns {Promise<Object>}
 */
export default async function init(
  { outputPath = ".aigne/doc-smith", fileName = "config.yaml", skipIfExists = false },
  options,
) {
  if (skipIfExists) {
    const filePath = join(outputPath, fileName);
    if (await readFile(filePath, "utf8").catch(() => null)) {
      return {};
    }
  }

  console.log("🚀 Welcome to AIGNE DocSmith!");
  console.log("Let's create your documentation configuration.\n");

  // Collect user information
  const input = {};

  // 1. Primary purpose - what's the main outcome you want readers to achieve?
  const purposeChoices = await options.prompts.checkbox({
    message:
      "📝 Step 1/8: What's the main outcome you want readers to achieve? (Select all that apply)",
    choices: Object.entries(DOCUMENT_STYLES)
      .filter(([key]) => key !== "custom") // Remove custom option for multiselect
      .map(([key, style]) => ({
        name: `${style.name}`,
        description: style.description,
        value: key,
      })),
    validate: (input) => {
      if (input.length === 0) {
        return "Please select at least one purpose.";
      }
      return true;
    },
  });

  // Follow-up logic: If ONLY mixedPurpose selected, ask for priority ranking
  let prioritizedPurposes = purposeChoices;
  if (purposeChoices.length === 1 && purposeChoices.includes("mixedPurpose")) {
    const topPriorities = await options.prompts.checkbox({
      message: "🎯 Which is most important? (Select top 2 priorities)",
      choices: Object.entries(DOCUMENT_STYLES)
        .filter(([key]) => key !== "custom" && key !== "mixedPurpose") // Filter out custom and mixedPurpose
        .map(([key, style]) => ({
          name: `${style.name}`,
          description: style.description,
          value: key,
        })),
      validate: (input) => {
        if (input.length === 0) {
          return "Please select at least one priority.";
        }
        if (input.length > 2) {
          return "Please select maximum 2 priorities.";
        }
        return true;
      },
    });

    // Replace mixedPurpose with selected priorities
    prioritizedPurposes = topPriorities;
  }

  // Save document purpose choices as keys
  input.documentPurpose = prioritizedPurposes;

  // 2. Target audience - who will be reading this most often?
  const audienceChoices = await options.prompts.checkbox({
    message: "👥 Step 2/8: Who will be reading this most often? (Select all that apply)",
    choices: Object.entries(TARGET_AUDIENCES)
      .filter(([key]) => key !== "custom") // Remove custom option for multiselect
      .map(([key, audience]) => ({
        name: `${audience.name}`,
        description: audience.description,
        value: key,
      })),
    validate: (input) => {
      if (input.length === 0) {
        return "Please select at least one audience.";
      }
      return true;
    },
  });

  // Save target audience choices as keys
  input.targetAudienceTypes = audienceChoices;

  // 3. Reader knowledge level - what do readers typically know when they arrive?
  // Determine default based on selected purposes using mapping
  const mappedPurpose = prioritizedPurposes.find(
    (purpose) => PURPOSE_TO_KNOWLEDGE_MAPPING[purpose],
  );
  const defaultKnowledge = mappedPurpose ? PURPOSE_TO_KNOWLEDGE_MAPPING[mappedPurpose] : null;

  const knowledgeChoice = await options.prompts.select({
    message: "🧠 Step 3/8: What do readers typically know when they arrive?",
    choices: Object.entries(READER_KNOWLEDGE_LEVELS).map(([key, level]) => ({
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

  const depthChoice = await options.prompts.select({
    message: "📊 Step 4/8: How comprehensive should the documentation be?",
    choices: Object.entries(DOCUMENTATION_DEPTH).map(([key, depth]) => ({
      name: `${depth.name}`,
      description: depth.description,
      value: key,
    })),
    default: defaultDepth,
  });

  // Save documentation depth choice as key
  input.documentationDepth = depthChoice;

  // 5. Language settings
  // Let user select primary language from supported list
  const primaryLanguageChoice = await options.prompts.select({
    message: "🌐 Step 5/8: Choose primary documentation language:",
    choices: SUPPORTED_LANGUAGES.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
    })),
  });

  input.locale = primaryLanguageChoice;

  // 6. Translation languages
  // Filter out the primary language from available choices
  const availableTranslationLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code !== primaryLanguageChoice,
  );

  const translateLanguageChoices = await options.prompts.checkbox({
    message: "🔄 Step 6/8: Select translation languages:",
    choices: availableTranslationLanguages.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
    })),
  });

  input.translateLanguages = translateLanguageChoices;

  // 7. Documentation directory
  const docsDirInput = await options.prompts.input({
    message: `📁 Step 7/8: Where to save generated docs:`,
    default: `${outputPath}/docs`,
  });
  input.docsDir = docsDirInput.trim() || `${outputPath}/docs`;

  // 8. Source code paths
  console.log("\n🔍 Step 8/8: Source Code Paths");
  console.log("Enter paths to analyze for documentation (e.g., ./src, ./lib)");
  console.log("💡 If no paths are configured, './' will be used as default");

  const sourcePaths = [];
  while (true) {
    const selectedPath = await options.prompts.search({
      message: "Path:",
      source: async (input) => {
        if (!input || input.trim() === "") {
          return [
            {
              name: "Press Enter to finish",
              value: "",
              description: "",
            },
          ];
        }

        const searchTerm = input.trim();

        // Search for matching files and folders in current directory
        const availablePaths = getAvailablePaths(searchTerm);

        return [...availablePaths];
      },
    });

    // Check if user chose to exit
    if (!selectedPath || selectedPath.trim() === "" || selectedPath === "Press Enter to finish") {
      break;
    }

    const trimmedPath = selectedPath.trim();

    // Use validatePath to check if path is valid
    const validation = validatePath(trimmedPath);

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

  // If no paths entered, use default
  input.sourcesPath = sourcePaths.length > 0 ? sourcePaths : ["./"];

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
    console.log(`\n🎉 Configuration saved to: ${chalk.cyan(filePath)}`);
    // Print YAML content for user review
    console.log(chalk.cyan("---"));
    console.log(chalk.cyan(yamlContent));
    console.log(chalk.cyan("---"));
    console.log("💡 You can edit the configuration file anytime to modify settings.\n");
    console.log(
      `🚀 Run ${chalk.cyan("'aigne doc generate'")} to start documentation generation!\n`,
    );

    return {};
  } catch (error) {
    console.error(`❌ Failed to save configuration file: ${error.message}`);
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
function generateYAML(input) {
  let yaml = "";

  // Add project information at the beginning
  yaml += `# Project information for documentation publishing\n`;
  yaml += `projectName: ${input.projectName || ""}\n`;
  yaml += `projectDesc: ${input.projectDesc || ""}\n`;
  yaml += `projectLogo: ${input.projectLogo || ""}\n`;
  yaml += `\n`;

  // Add documentation configuration choices
  yaml += `# Documentation configuration choices\n`;
  yaml += `documentPurpose:\n`;
  if (input.documentPurpose && input.documentPurpose.length > 0) {
    input.documentPurpose.forEach((purpose) => {
      yaml += `  - ${purpose}\n`;
    });
  }
  yaml += `\n`;

  yaml += `targetAudienceTypes:\n`;
  if (input.targetAudienceTypes && input.targetAudienceTypes.length > 0) {
    input.targetAudienceTypes.forEach((audience) => {
      yaml += `  - ${audience}\n`;
    });
  }
  yaml += `\n`;

  yaml += `readerKnowledgeLevel: ${input.readerKnowledgeLevel || ""}\n`;
  yaml += `documentationDepth: ${input.documentationDepth || ""}\n`;
  yaml += `\n`;

  // Keep rules field empty for now (backward compatibility)
  yaml += `rules: |\n`;
  yaml += `  \n\n`;

  // Keep targetAudience field empty for now (backward compatibility)
  yaml += `targetAudience: |\n`;
  yaml += `  \n\n`;

  // Add language settings
  yaml += `locale: ${input.locale}\n`;

  // Add translation languages
  if (
    input.translateLanguages &&
    input.translateLanguages.length > 0 &&
    input.translateLanguages.some((lang) => lang.trim())
  ) {
    yaml += `translateLanguages:\n`;
    input.translateLanguages.forEach((lang) => {
      if (lang.trim()) {
        yaml += `  - ${lang}\n`;
      }
    });
  } else {
    yaml += `# translateLanguages:  # List of languages to translate the documentation to\n`;
    yaml += `#   - zh  # Example: Chinese translation\n`;
    yaml += `#   - en  # Example: English translation\n`;
  }

  // Add directory and source path configurations
  yaml += `docsDir: ${input.docsDir}  # Directory to save generated documentation\n`;
  // yaml += `outputDir: ${outputPath}/output  # Directory to save output files\n`;
  yaml += `sourcesPath:  # Source code paths to analyze\n`;
  input.sourcesPath.forEach((path) => {
    yaml += `  - ${path}\n`;
  });

  return yaml;
}

init.description = "Generate a configuration file for the documentation generation process";
