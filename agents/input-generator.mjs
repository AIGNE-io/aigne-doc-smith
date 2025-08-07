import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import chalk from "chalk";
import { validatePath, getAvailablePaths } from "../utils/utils.mjs";
import {
  SUPPORTED_LANGUAGES,
  DOCUMENT_STYLES,
  TARGET_AUDIENCES,
} from "../utils/constants.mjs";

// UI constants
const PRESS_ENTER_TO_FINISH = "Press Enter to finish";

/**
 * Guide users through multi-turn dialogue to collect information and generate YAML configuration
 * @param {Object} params
 * @param {string} params.outputPath - Output file path
 * @param {string} params.fileName - File name
 * @returns {Promise<Object>}
 */
export default async function init(
  {
    outputPath = ".aigne/doc-smith",
    fileName = "config.yaml",
    skipIfExists = false,
  },
  options
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

  // 1. Document generation rules with style selection
  console.log("📝 Step 1/6: Document Generation Rules");

  // Let user select a document style
  const styleChoice = await options.prompts.select({
    message: "Choose your documentation style:",
    choices: Object.entries(DOCUMENT_STYLES).map(([key, style]) => ({
      name: `${style.name} - ${style.rules}`,
      value: key,
    })),
  });

  let rules;
  if (styleChoice === "custom") {
    // User wants to input custom rules
    rules = await options.prompts.input({
      message: "Enter your custom documentation rules:",
    });
  } else {
    // Use predefined style directly
    rules = DOCUMENT_STYLES[styleChoice].rules;
  }

  input.rules = rules.trim();

  // 2. Target audience selection
  console.log("\n👥 Step 2/6: Target Audience");

  // Let user select target audience
  const audienceChoice = await options.prompts.select({
    message: "Who is your target audience?",
    choices: Object.entries(TARGET_AUDIENCES).map(([key, audience]) => ({
      name: audience,
      value: key,
    })),
  });

  let targetAudience;
  if (audienceChoice === "custom") {
    // User wants to input custom audience
    targetAudience = await options.prompts.input({
      message: "Enter your custom target audience:",
    });
  } else {
    // Use predefined audience directly
    targetAudience = TARGET_AUDIENCES[audienceChoice];
  }

  input.targetAudience = targetAudience.trim();

  // 3. Language settings
  console.log("\n🌐 Step 3/6: Primary Language");

  // Let user select primary language from supported list
  const primaryLanguageChoice = await options.prompts.select({
    message: "Choose primary documentation language:",
    choices: SUPPORTED_LANGUAGES.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
    })),
  });

  input.locale = primaryLanguageChoice;

  // 4. Translation languages
  console.log("\n🔄 Step 4/6: Translation Languages");

  // Filter out the primary language from available choices
  const availableTranslationLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code !== primaryLanguageChoice
  );

  const translateLanguageChoices = await options.prompts.checkbox({
    message: "Select translation languages:",
    choices: availableTranslationLanguages.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
    })),
  });

  input.translateLanguages = translateLanguageChoices;

  // 5. Documentation directory
  console.log("\n📁 Step 5/6: Output Directory");
  const docsDirInput = await options.prompts.input({
    message: `Where to save generated docs:`,
    default: `${outputPath}/docs`,
  });
  input.docsDir = docsDirInput.trim() || `${outputPath}/docs`;

  // 6. Source code paths
  console.log("\n🔍 Step 6/6: Source Code Paths");
  console.log("Enter paths to analyze for documentation (e.g., ./src, ./lib)");
  console.log("💡 If no paths are configured, './' will be used as default");

  const sourcePaths = [];
  while (true) {
    const selectedPath = await options.prompts.search({
      message: "Path:",
      source: async (input, { signal }) => {
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
    if (
      !selectedPath ||
      selectedPath.trim() === "" ||
      selectedPath === "Press Enter to finish"
    ) {
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
    console.log(
      "💡 You can edit the configuration file anytime to modify settings."
    );
    console.log(
      `🚀 Run ${chalk.cyan(
        "'aigne doc generate'"
      )} to start documentation generation!`
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
 * @param {string} outputPath - Output path for directory configuration
 * @returns {string} YAML string
 */
function generateYAML(input, outputPath) {
  let yaml = "";

  // Add rules (required field)
  yaml += `rules: |\n`;
  if (input.rules && input.rules.trim()) {
    yaml += `  ${input.rules.split("\n").join("\n  ")}\n\n`;
  } else {
    yaml += `  \n\n`;
  }

  // Add target audience
  yaml += `targetAudience: ${input.targetAudience}\n`;

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

init.description =
  "Generate a configuration file for the documentation generation process";
