import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

/**
 * Guide users through multi-turn dialogue to collect information and generate YAML configuration
 * @param {Object} params
 * @param {string} params.outputPath - Output file path
 * @param {string} params.fileName - File name
 * @returns {Promise<Object>}
 */
export default async function init(
  { outputPath = "./doc-smith", fileName = "config.yaml" },
  options
) {
  console.log("Welcome to AIGNE Doc Smith!");
  console.log(
    "I will help you generate a configuration file through several questions.\n"
  );

  // Collect user information
  const input = {};

  // 1. Document generation rules
  console.log("=== Document Generation Rules ===");
  const rulesInput = await options.prompts.input({
    message: "Please describe the document generation rules and requirements:",
  });
  input.rules = rulesInput.trim();

  // 2. Target audience
  console.log("\n=== Target Audience ===");
  const targetAudienceInput = await options.prompts.input({
    message:
      "What is the target audience? (e.g., developers, users, press Enter for default 'developers'):",
  });
  input.targetAudience = targetAudienceInput.trim() || "developers";

  // 3. Language settings
  console.log("\n=== Language Settings ===");
  const localeInput = await options.prompts.input({
    message: "Primary language (e.g., en, zh, press Enter for default 'en'):",
  });
  input.locale = localeInput.trim() || "en";

  // 4. Translation languages
  console.log("\n=== Translation Settings ===");
  console.log(
    "Enter translation languages (press Enter after each language, empty line to finish):"
  );
  const translateLanguages = [];
  while (true) {
    const langInput = await options.prompts.input({
      message: `Language ${translateLanguages.length + 1} (e.g., zh, en, ja):`,
    });
    if (!langInput.trim()) {
      break;
    }
    translateLanguages.push(langInput.trim());
  }
  input.translateLanguages = translateLanguages;

  // 5. Documentation directory
  console.log("\n=== Documentation Directory ===");
  console.log(
    "This is the directory where generated documentation will be saved."
  );
  const docsDirInput = await options.prompts.input({
    message: `Documentation directory (press Enter for default '${outputPath}/docs'):`,
  });
  input.docsDir = docsDirInput.trim() || `${outputPath}/docs`;

  // 6. Source code paths
  console.log("\n=== Source Code Paths ===");
  console.log(
    "These are the paths to your source code that will be analyzed for documentation generation."
  );
  console.log(
    "Enter source code paths (press Enter after each path, empty line to finish):"
  );

  const sourcePaths = [];
  while (true) {
    const pathInput = await options.prompts.input({
      message: `Path ${sourcePaths.length + 1} (e.g., ./, ./src, ./lib):`,
    });
    if (!pathInput.trim()) {
      break;
    }
    sourcePaths.push(pathInput.trim());
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
    console.log(`\n✅ Configuration file saved to: ${filePath}`);

    return {
      inputGeneratorStatus: true,
      inputGeneratorPath: filePath,
      inputGeneratorContent: yamlContent,
    };
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
  yaml += `outputDir: ${outputPath}/output  # Directory to save output files\n`;
  yaml += `sourcesPath:  # Source code paths to analyze\n`;
  input.sourcesPath.forEach((path) => {
    yaml += `  - ${path}\n`;
  });

  return yaml;
}

init.description =
  "Generate a configuration file for the documentation generation process";
