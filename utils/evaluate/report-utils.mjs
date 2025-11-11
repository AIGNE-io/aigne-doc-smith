import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import terminalLink from 'terminal-link';

import { toRelativePath } from "../utils.mjs";

/**
 * Create report structure with evaluation data
 * @param {Object} params - Parameters for creating the report
 * @param {string} params.timestamp - Report generation timestamp
 * @param {Object} params.metadata - Additional metadata for the report
 * @param {Object} params.structureEvaluation - Structure evaluation results
 * @param {Array} params.documentEvaluations - Individual document evaluations
 * @param {string} params.projectName - Name of the project
 * @param {string} params.projectDesc - Project description
 * @param {string} params.projectLogo - Project logo URL
 * @param {string} params.documentPurpose - Purpose of the documentation
 * @param {Array} params.targetAudienceTypes - Types of target audience
 * @param {string} params.readerKnowledgeLevel - Expected reader knowledge level
 * @param {string} params.documentationDepth - Depth of documentation
 * @param {string} params.targetAudience - Target audience description
 * @returns {Object} Complete report structure
 */
export function createReportStructure({
  timestamp,
  metadata,
  structureEvaluation,
  documentEvaluations,
  projectName,
  projectDesc,
  projectLogo,
  documentPurpose,
  targetAudienceTypes,
  readerKnowledgeLevel,
  documentationDepth,
  targetAudience,
}) {
  return {
    documentInfo: {
      projectName,
      projectDesc,
      projectLogo,
      documentPurpose,
      targetAudienceTypes,
      readerKnowledgeLevel,
      documentationDepth,
      targetAudience,
    },
    metadata: {
      version: "0.1.0",
      generatedBy: "AIGNE Doc Smith",
      generatedAt: timestamp,
      documentCount: documentEvaluations.length,
      ...metadata,
    },
    structureEvaluation: {
      type: "document-structure",
      results: structureEvaluation,
    },
    documentEvaluations: {
      type: "document-content",
      results: documentEvaluations,
    },
  };
}

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path to ensure exists
 */
export async function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Generate timestamp formatted for folder names
 * @param {Date} [date] - Date object, defaults to current date
 * @returns {string} Formatted timestamp string
 */
export function generateTimestampForFolder(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Copy HTML report template to the report directory
 * @param {string} targetDir - Target directory for the HTML report
 * @returns {Promise<string>} Path to the copied HTML file
 */
export async function copyHtmlReportTemplate(targetDir, data) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Path to the HTML template
  const templatePath = join(__dirname, "../../", "assets", "report-template", "report.html");
  const targetPath = join(targetDir, "integrity-report.html");

  const templateReport = await readFile(templatePath, "utf-8");
  const templateData = templateReport.replace("window.__REPORT_DATA__", JSON.stringify(data));
  await writeFile(targetPath, templateData);
  return toRelativePath(targetPath);
}

/**
 * Generate success message with report links
 * @param {string} jsonReportPath - Path to the JSON report
 * @param {string} htmlReportPath - Path to the HTML report
 * @returns {string} Success message with links
 */
export function generateReportSuccessMessage(jsonReportPath, htmlReportPath) {
  const openHtmlPath = resolve(htmlReportPath);
  const openUrl = pathToFileURL(openHtmlPath);
  return `# ✅ Documentation Evaluation Report Generated Successfully!

Generated evaluation report and saved to:

\`${jsonReportPath}\`

## 📊 View HTML Report

Open in your browser to view detailed analysis:

\`${terminalLink(openUrl, openUrl)}\`

`;
}
