import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfigFromFile, saveValueToConfig } from "../../utils/config.mjs";
import { PATHS } from "../../utils/agent-constants.mjs";
import checkStructure from "../structure-checker/index.mjs";
import checkContent from "../content-checker/index.mjs";
import { getProjectInfo } from "../../utils/project.mjs";

/**
 * Check configuration and documents before publishing
 * @param {Object} params
 * @param {string} params.fileName - Config file name (relative to workspace)
 * @returns {Promise<Object>} - Result object with valid flag and message
 */
export default async function check({ fileName = "config.yaml" } = {}, _options) {
  // 1. Check configuration
  // Use PATHS.WORKSPACE_BASE to support both project and standalone modes
  const filePath = join(PATHS.WORKSPACE_BASE, fileName);
  const configContent = await readFile(filePath, "utf8").catch(() => null);

  if (!configContent || configContent.trim() === "") {
    throw new Error(
      "Configuration file not found or is empty. Please ensure the workspace is properly initialized with a valid configuration file.",
    );
  }

  const config = await loadConfigFromFile();

  // 2. Check and populate project metadata if not exists
  const missingFields = [];
  if (!config.projectName || config.projectName.trim() === "") missingFields.push("projectName");
  if (!config.projectDesc || config.projectDesc.trim() === "") missingFields.push("projectDesc");
  if (!config.projectLogo || config.projectLogo.trim() === "") missingFields.push("projectLogo");

  if (missingFields.length > 0) {
    try {
      const projectInfo = await getProjectInfo();

      if (
        missingFields.includes("projectName") &&
        projectInfo.name &&
        projectInfo.name.trim() !== ""
      ) {
        await saveValueToConfig("projectName", projectInfo.name, "Project name");
        config.projectName = projectInfo.name;
      }

      if (
        missingFields.includes("projectDesc") &&
        projectInfo.description &&
        projectInfo.description.trim() !== ""
      ) {
        await saveValueToConfig("projectDesc", projectInfo.description, "Project description");
        config.projectDesc = projectInfo.description;
      }

      if (
        missingFields.includes("projectLogo") &&
        projectInfo.icon &&
        projectInfo.icon.trim() !== ""
      ) {
        await saveValueToConfig("projectLogo", projectInfo.icon, "Project logo or icon");
        config.projectLogo = projectInfo.icon;
      }
    } catch (error) {
      console.warn("Failed to get project info:", error.message);
    }
  }

  // 3. Check document structure
  const structureResult = await checkStructure();

  // If structure check failed and not fixed, throw error
  if (!structureResult.valid && !structureResult.fixed) {
    throw new Error(
      `Document structure validation failed:\n${structureResult.message}\n\nPlease fix the structure issues before publishing.`,
    );
  }

  // 4. Check document content
  const contentResult = await checkContent();

  // If content check failed and not fixed, throw error
  if (!contentResult.valid && !contentResult.fixed) {
    throw new Error(
      `Document content validation failed:\n${contentResult.message}\n\nPlease fix the content issues before publishing.`,
    );
  }

  return {
    valid: true,
    config,
    message: "✅ Configuration and document checks passed.",
  };
}

check.description = "Check configuration and documents before publishing";

check.input_schema = {
  type: "object",
  properties: {
    fileName: {
      type: "string",
      description: "Config file name",
    },
  },
};
