import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  copyHtmlReportTemplate,
  createReportStructure,
  ensureDirectoryExists,
  generateReportSuccessMessage,
  generateTimestampForFolder,
  processDocumentEvaluations,
} from "../../utils/report-utils.mjs";
import { toRelativePath } from "../../utils/utils.mjs";

/**
 * Generate and save evaluation report by aggregating results from both structure and document evaluation agents
 * @param {Object} params - Parameters object containing all evaluation data
 * @param {Object} params.purposeCoverage - Purpose coverage evaluation from evaluation-document-structure agent
 * @param {Object} params.audienceCoverage - Audience coverage evaluation from evaluation-document-structure agent
 * @param {Object} params.coverageDepthAlignment - Coverage depth alignment evaluation from evaluation-document-structure agent
 * @param {Array} params.originalDocumentStructure - Array of document evaluation results from evaluation-document agent
 * @param {Object} [params.metadata] - Additional metadata for the report
 * @param {string} [params.basePath] - Base path for saving reports, defaults to current working directory
 * @returns {Promise<string>} Path to the saved report file
 */
export default async function generateEvaluationReport({
  purposeCoverage,
  audienceCoverage,
  coverageDepthAlignment,
  originalDocumentStructure,
  metadata = {},
  basePath = process.cwd(),
}) {
  const timestamp = new Date().toISOString();
  const timestampForFolder = generateTimestampForFolder();

  // Process document evaluation results from originalDocumentStructure array
  const { documentEvaluations, aggregatedDocumentEvaluation } =
    processDocumentEvaluations(originalDocumentStructure);

  // Create report structure
  const report = createReportStructure({
    timestamp,
    metadata,
    structureEvaluation: { purposeCoverage, audienceCoverage, coverageDepthAlignment },
    documentEvaluations,
    aggregatedDocumentEvaluation,
  });

  const saveDir = join(basePath, ".aigne", "doc-smith", "certify", timestampForFolder);
  const jsonReportPath = join(saveDir, "integrity-report.json");

  await ensureDirectoryExists(saveDir);
  await writeFile(jsonReportPath, JSON.stringify(report, null, 2), "utf8");

  // Copy HTML report template
  const htmlReportPath = await copyHtmlReportTemplate(saveDir);

  // Generate success message
  const message = generateReportSuccessMessage(toRelativePath(jsonReportPath), htmlReportPath);

  return {
    message,
  };
}

generateEvaluationReport.taskTitle = "Generate evaluation report";
