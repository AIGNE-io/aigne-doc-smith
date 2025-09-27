import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pick } from "@aigne/core/utils/type-utils.js";
import { DOC_SMITH_DIR } from "../../utils/constants/index.mjs";
import {
  copyHtmlReportTemplate,
  createReportStructure,
  ensureDirectoryExists,
  generateReportSuccessMessage,
  generateTimestampForFolder,
} from "../../utils/evaluate/report-utils.mjs";
import { toRelativePath } from "../../utils/utils.mjs";

/**
 * Generate and save evaluation report by aggregating results from both structure and document evaluation agents
 * @param {Object} params - Parameters object containing all evaluation data
 * @param {Object} params.purposeCoverage - Purpose coverage evaluation from evaluate/document-structure agent
 * @param {Object} params.audienceCoverage - Audience coverage evaluation from evaluate/document-structure agent
 * @param {Object} params.coverageDepthAlignment - Coverage depth alignment evaluation from evaluate/document-structure agent
 * @param {Array} params.originalDocumentStructure - Array of document evaluation results from evaluate/document agent
 * @param {Object} [params.metadata] - Additional metadata for the report
 * @param {string} [params.basePath] - Base path for saving reports, defaults to current working directory
 * @returns {Promise<string>} Path to the saved report file
 */
export default async function generateEvaluationReport({
  structureEvaluation,
  originalDocumentStructure,
  metadata = {},
  basePath = process.cwd(),
  projectName,
  projectDesc,
  projectLogo,
  documentPurpose,
  targetAudienceTypes,
  readerKnowledgeLevel,
  documentationDepth,
  targetAudience,
}) {
  const timestamp = new Date().toISOString();
  const timestampForFolder = generateTimestampForFolder();
  const documentEvaluations = originalDocumentStructure.map((x) =>
    pick(x, ["title", "description", "path", "parentId", "documentEvaluation", "codeEvaluation"]),
  );

  // Create report structure
  const report = createReportStructure({
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
  });

  const saveDir = join(basePath, DOC_SMITH_DIR, "evaluate", timestampForFolder);
  const jsonReportPath = join(saveDir, "integrity-report.json");

  await ensureDirectoryExists(saveDir);
  await writeFile(jsonReportPath, JSON.stringify(report, null, 2), "utf8");

  // Copy HTML report template
  const htmlReportPath = await copyHtmlReportTemplate(saveDir, report);

  // Generate success message
  const message = generateReportSuccessMessage(toRelativePath(jsonReportPath), htmlReportPath);

  return {
    message,
  };
}

generateEvaluationReport.taskTitle = "Generate evaluation report";
