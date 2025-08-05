import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

// Predefined document generation styles
const DOCUMENT_STYLES = {
  actionFirst: {
    name: "Action-First Style",
    rules:
      "Action-first and task-oriented; steps first, copyable examples, minimal context; second person, active voice, short sentences",
  },
  conceptFirst: {
    name: "Concept-First Style",
    rules:
      "Why/What before How; precise and restrained, provide trade-offs and comparisons; support with architecture/flow/sequence diagrams",
  },
  specReference: {
    name: "Spec-Reference Style",
    rules:
      "Objective and precise, no rhetoric; tables/Schema focused, authoritative fields and defaults; clear error codes and multi-language examples",
  },
  custom: {
    name: "Custom Rules",
    rules: "Enter your own documentation generation rules",
  },
};

// Predefined target audiences
const TARGET_AUDIENCES = {
  actionFirst: "Developers, Implementation Engineers, DevOps",
  conceptFirst:
    "Architects, Technical Leads, Developers interested in principles",
  generalUsers: "General Users",
  custom: "Enter your own target audience",
};

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

  // 1. Document generation rules with style selection
  console.log("=== Document Generation Rules ===");
  console.log(
    "Select document generation style. You can edit the rules in the generated configuration file."
  );

  // Let user select a document style
  const styleChoice = await options.prompts.select({
    message: "Select document generation style:",
    choices: Object.entries(DOCUMENT_STYLES).map(([key, style]) => ({
      name: `${style.name} - ${style.rules}`,
      value: key,
    })),
  });

  let rules;
  if (styleChoice === "custom") {
    // User wants to input custom rules
    rules = await options.prompts.input({
      message:
        "Please enter your custom documentation generation rules and requirements:",
    });
  } else {
    // Use predefined style directly
    rules = DOCUMENT_STYLES[styleChoice].rules;
    console.log(`\n✅ Selected: ${DOCUMENT_STYLES[styleChoice].name}`);
  }

  input.rules = rules.trim();

  // 2. Target audience selection
  console.log("\n=== Target Audience ===");

  // Let user select target audience
  const audienceChoice = await options.prompts.select({
    message: "Select target audience:",
    choices: Object.entries(TARGET_AUDIENCES).map(([key, audience]) => ({
      name: audience,
      value: key,
    })),
  });

  let targetAudience;
  if (audienceChoice === "custom") {
    // User wants to input custom audience
    targetAudience = await options.prompts.input({
      message: "Please enter your custom target audience:",
    });
  } else {
    // Use predefined audience directly
    targetAudience = TARGET_AUDIENCES[audienceChoice];
    console.log(`\n✅ Selected: ${TARGET_AUDIENCES[audienceChoice]}`);
  }

  input.targetAudience = targetAudience.trim();

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
    "Enter source code paths (press Enter after each path, empty line to finish). If no paths are entered, './' will be used as the default:"
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
  // yaml += `outputDir: ${outputPath}/output  # Directory to save output files\n`;
  yaml += `sourcesPath:  # Source code paths to analyze\n`;
  input.sourcesPath.forEach((path) => {
    yaml += `  - ${path}\n`;
  });

  return yaml;
}

init.description =
  "Generate a configuration file for the documentation generation process";
