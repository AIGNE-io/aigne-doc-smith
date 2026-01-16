import { existsSync, mkdirSync } from "node:fs";
import fs from "node:fs/promises";
import { constants } from "node:fs";
import { parse, stringify as yamlStringify } from "yaml";
import { PATHS, ERROR_CODES } from "./agent-constants.mjs";

/**
 * Load config from config.yaml file
 * @returns {Promise<Object|null>} - The config object or null if file doesn't exist
 */
export async function loadConfigFromFile() {
  try {
    if (!existsSync(PATHS.CONFIG)) {
      return null;
    }

    const configContent = await fs.readFile(PATHS.CONFIG, "utf8");
    return parse(configContent);
  } catch (error) {
    console.warn("Failed to read config file:", error.message);
    return null;
  }
}

/**
 * Handle string value formatting and updating in YAML config
 * @param {string} key - The configuration key
 * @param {string} value - The string value to save
 * @param {string} comment - Optional comment
 * @param {string} fileContent - Current file content
 * @returns {string} Updated file content
 */
function handleStringValueUpdate(key, value, comment, fileContent) {
  // Skip if key is empty to avoid "Empty regular expressions are not allowed" error
  if (!key || !key.trim()) {
    return fileContent;
  }

  const yamlObject = { [key]: value };
  const yamlContent = yamlStringify(yamlObject).trim();
  const formattedValue = yamlContent.substring(yamlContent.indexOf(":") + 1).trim();

  const lines = fileContent.split("\n");
  const keyRegex = new RegExp(`^${key}:\\s*`);
  const keyIndex = lines.findIndex((line) => line.match(keyRegex));

  if (keyIndex !== -1) {
    lines[keyIndex] = `${key}: ${formattedValue}`;
  } else {
    if (comment) {
      lines.push(`# ${comment}`);
    }
    lines.push(`${key}: ${formattedValue}`);
  }

  return lines.join("\n");
}

/**
 * Handle array value formatting and updating in YAML config
 * @param {string} key - The configuration key
 * @param {Array} value - The array value to save
 * @param {string} comment - Optional comment
 * @param {string} fileContent - Current file content
 * @returns {string} Updated file content
 */
function handleArrayValueUpdate(key, value, comment, fileContent) {
  if (!key || !key.trim()) {
    return fileContent;
  }

  const yamlObject = { [key]: value };
  const yamlContent = yamlStringify(yamlObject).trim();
  const formattedValue = yamlContent;

  const lines = fileContent.split("\n");
  const keyStartIndex = lines.findIndex((line) => line.match(new RegExp(`^${key}:\\s*`)));

  if (keyStartIndex !== -1) {
    let keyEndIndex = keyStartIndex;
    for (let i = keyStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "" || line.startsWith("#") || (!line.startsWith("- ") && !line.match(/^\w+:/))) {
        if (!line.startsWith("- ")) {
          keyEndIndex = i - 1;
          break;
        }
      } else if (line.match(/^\w+:/)) {
        keyEndIndex = i - 1;
        break;
      } else if (line.startsWith("- ")) {
        keyEndIndex = i;
      }
    }

    if (keyEndIndex === keyStartIndex) {
      const keyLine = lines[keyStartIndex];
      if (keyLine.includes("[") || !keyLine.endsWith(":")) {
        keyEndIndex = keyStartIndex;
      } else {
        for (let i = keyStartIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("- ")) {
            keyEndIndex = i;
          } else if (line !== "" && !line.startsWith("#")) {
            break;
          }
        }
      }
    }

    const replacementLines = formattedValue.split("\n");
    lines.splice(keyStartIndex, keyEndIndex - keyStartIndex + 1, ...replacementLines);

    if (comment && keyStartIndex > 0 && !lines[keyStartIndex - 1].trim().startsWith("# ")) {
      lines.splice(keyStartIndex, 0, `# ${comment}`);
    }
  } else {
    if (comment) {
      lines.push(`# ${comment}`);
    }
    const formattedLines = formattedValue.split("\n");
    lines.push(...formattedLines);
  }

  return lines.join("\n");
}

/**
 * Save value to config.yaml file
 * @param {string} key - The config key to save
 * @param {string|Array} value - The value to save (can be string or array)
 * @param {string} [comment] - Optional comment to add above the key
 */
export async function saveValueToConfig(key, value, comment) {
  if (value === undefined) {
    return;
  }

  try {
    const workspaceDir = PATHS.WORKSPACE_BASE;
    if (!existsSync(workspaceDir)) {
      mkdirSync(workspaceDir, { recursive: true });
    }

    let fileContent = "";

    if (existsSync(PATHS.CONFIG)) {
      fileContent = await fs.readFile(PATHS.CONFIG, "utf8");
    }

    let updatedContent;
    if (Array.isArray(value)) {
      updatedContent = handleArrayValueUpdate(key, value, comment, fileContent);
    } else {
      updatedContent = handleStringValueUpdate(key, value, comment, fileContent);
    }

    await fs.writeFile(PATHS.CONFIG, updatedContent);
  } catch (error) {
    console.warn(`Failed to save ${key} to config.yaml:`, error.message);
  }
}

/**
 * Generate configuration YAML content
 * @param {Object} input - Input configuration object
 * @returns {string} - YAML configuration string
 */
export function generateConfigYAML(input) {
  const config = {
    workspaceVersion: input.workspaceVersion || "1.0",
    createdAt: input.createdAt || new Date().toISOString(),
    projectName: (input.projectName || "").trim(),
    projectDesc: (input.projectDesc || "").trim(),
    projectLogo: input.projectLogo || "",
    locale: input.locale || "en",
    translateLanguages: input.translateLanguages?.filter((lang) => lang.trim()) || [],
    docsDir: input.docsDir || "./docs",
    sourcesPath: input.sourcesPath || [],
    source: input.source || null,
  };

  let yaml = "# Workspace metadata\n";
  const metadataSection = yamlStringify({
    workspaceVersion: config.workspaceVersion,
    createdAt: config.createdAt,
  }).trim();
  yaml += `${metadataSection}\n\n`;

  yaml += "# Project information for documentation publishing\n";
  const projectSection = yamlStringify({
    projectName: config.projectName,
    projectDesc: config.projectDesc,
    projectLogo: config.projectLogo,
  }).trim();

  yaml += `${projectSection}\n\n`;

  yaml += "# Language settings\n";
  const localeSection = yamlStringify({ locale: config.locale }).trim();
  yaml += `${localeSection}\n`;

  if (config.translateLanguages.length > 0) {
    const translateLanguagesSection = yamlStringify({
      translateLanguages: config.translateLanguages,
    }).trim();
    yaml += `${translateLanguagesSection}\n`;
  } else {
    yaml += "# translateLanguages:  # A list of languages to translate the documentation to.\n";
    yaml += "#   - zh  # Example: Chinese translation\n";
    yaml += "#   - en  # Example: English translation\n";
  }

  yaml += "\n# Source repository configuration\n";
  if (config.source) {
    const sourceSection = yamlStringify({ source: config.source }).trim();
    yaml += `${sourceSection}\n`;
  } else {
    yaml += "# source:  # Git submodule source repository\n";
    yaml += "#   type: git-submodule\n";
    yaml += "#   path: sources/my-project\n";
    yaml += "#   url: https://github.com/user/repo.git\n";
    yaml += "#   branch: main\n";
  }

  yaml += "\n# Documentation directory and source paths\n";
  const docsDirSection = yamlStringify({ docsDir: config.docsDir }).trim();
  yaml += `${docsDirSection}  # The directory where the generated documentation will be saved.\n`;

  const sourcesPathSection = yamlStringify({
    sourcesPath: config.sourcesPath,
  }).trim();
  yaml += `${sourcesPathSection.replace(/^sourcesPath:/, "sourcesPath:  # The source code paths to analyze.")}\n`;

  return yaml;
}

/**
 * 加载配置文件获取主语言 locale
 * @returns {Promise<string>} - 主语言代码
 * @throws {Error} - 配置文件不存在或 locale 字段缺失时抛出错误
 */
export async function loadLocale() {
  try {
    await fs.access(PATHS.CONFIG, constants.F_OK | constants.R_OK);
    const content = await fs.readFile(PATHS.CONFIG, "utf8");
    const config = parse(content);

    if (!config.locale || typeof config.locale !== "string") {
      throw new Error(ERROR_CODES.MISSING_LOCALE);
    }

    return config.locale;
  } catch (error) {
    if (error.message === ERROR_CODES.MISSING_LOCALE) {
      throw error;
    }
    throw new Error(ERROR_CODES.MISSING_CONFIG_FILE);
  }
}
