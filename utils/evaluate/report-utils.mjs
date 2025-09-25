import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toRelativePath } from "../utils.mjs";

/**
 * Generate summary statistics from both evaluation results
 * @param {Object} structureEval - Structure evaluation results
 * @param {Object} docEval - Document evaluation results
 * @returns {Object} Summary object with aggregated scores
 */
export function generateSummary(structureEval, docEval) {
  const summary = {
    structureScores: {},
    documentScores: {},
    overallScore: null,
    issues: [],
  };

  if (structureEval) {
    const { purposeCoverage, audienceCoverage, coverageDepthAlignment } = structureEval;
    summary.structureScores = {
      purposeCoverage: purposeCoverage?.score || 0,
      audienceCoverage: audienceCoverage?.score || 0,
      coverageDepthAlignment: coverageDepthAlignment?.score || 0,
    };

    const structureAvg =
      (summary.structureScores.purposeCoverage +
        summary.structureScores.audienceCoverage +
        summary.structureScores.coverageDepthAlignment) /
      3;
    summary.structureScores.average = Math.round(structureAvg * 10) / 10;

    // Collect structure issues
    if (purposeCoverage?.missing?.length > 0) {
      summary.issues.push(`Missing purposes: ${purposeCoverage.missing.join(", ")}`);
    }
    if (audienceCoverage?.missing?.length > 0) {
      summary.issues.push(`Missing audiences: ${audienceCoverage.missing.join(", ")}`);
    }
  }

  if (docEval) {
    const docScores = {};
    const keys = [
      "readability",
      "coherence",
      "contentQuality",
      "translationQuality",
      "consistency",
      "purposeAlignment",
      "audienceAlignment",
      "knowledgeLevelAlignment",
      "navigability",
      "codeExampleIntegrity",
    ];

    keys.forEach((key) => {
      if (docEval[key]?.score) {
        docScores[key] = docEval[key].score;
      }
    });

    summary.documentScores = docScores;

    const docScoreValues = Object.values(docScores);
    if (docScoreValues.length > 0) {
      const docAvg = docScoreValues.reduce((a, b) => a + b, 0) / docScoreValues.length;
      summary.documentScores.average = Math.round(docAvg * 10) / 10;
    }

    // Collect document issues (scores below 3)
    keys.forEach((key) => {
      if (docEval[key]?.score < 3 && docEval[key]?.reason) {
        summary.issues.push(`${key}: ${docEval[key].reason}`);
      }
    });
  }

  // Calculate overall score if both evaluations exist
  if (summary.structureScores.average && summary.documentScores.average) {
    summary.overallScore =
      Math.round(((summary.structureScores.average + summary.documentScores.average) / 2) * 10) /
      10;
  }

  return summary;
}

/**
 * Aggregate document evaluations to calculate overall statistics
 * @param {Array} documentEvaluations - Array of document evaluation objects
 * @returns {Object} Aggregated evaluation results
 */
export function aggregateDocumentEvaluations(documentEvaluations) {
  if (!documentEvaluations || documentEvaluations.length === 0) {
    return null;
  }

  const keys = [
    "readability",
    "coherence",
    "contentQuality",
    "translationQuality",
    "consistency",
    "purposeAlignment",
    "audienceAlignment",
    "knowledgeLevelAlignment",
    "navigability",
    "codeExampleIntegrity",
  ];

  const aggregated = {};
  const validCounts = {};

  // Initialize
  keys.forEach((key) => {
    aggregated[key] = { totalScore: 0, count: 0, reasons: [] };
    validCounts[key] = 0;
  });

  // Aggregate scores
  for (const docEval of documentEvaluations) {
    const evaluation = docEval.evaluation;
    keys.forEach((key) => {
      if (evaluation[key]?.score) {
        aggregated[key].totalScore += evaluation[key].score;
        aggregated[key].count++;
        if (evaluation[key].reason) {
          aggregated[key].reasons.push(evaluation[key].reason);
        }
      }
    });
  }

  // Calculate averages and build result
  const result = {};
  keys.forEach((key) => {
    if (aggregated[key].count > 0) {
      const avgScore = aggregated[key].totalScore / aggregated[key].count;
      result[key] = {
        score: Math.round(avgScore * 10) / 10,
        reason: `Average from ${aggregated[key].count} documents: ${aggregated[key].reasons.slice(0, 3).join("; ")}`,
      };
      if (key === "codeExampleIntegrity") {
        delete result[key].reason;
      }
    }
  });

  return result;
}

/**
 * Process document evaluation results from originalDocumentStructure array
 * @param {Array} originalDocumentStructure - Array of document evaluation results
 * @returns {Object} Processed document evaluations and aggregated results
 */
export function processDocumentEvaluations(originalDocumentStructure) {
  const documentEvaluations = [];
  const aggregatedDocumentEvaluation = null;

  if (originalDocumentStructure && Array.isArray(originalDocumentStructure)) {
    for (const docItem of originalDocumentStructure) {
      if (docItem && typeof docItem === "object") {
        // Extract evaluation results from each document
        const {
          details,
          path,
          title,
        } = docItem;

        const docEvaluation = {
          documentInfo: {
            path: path || "unknown",
            title: title || "untitled",
          },
          details,
        };

        documentEvaluations.push(docEvaluation);
      }
    }
  }

  return {
    documentEvaluations,
    aggregatedDocumentEvaluation,
  };
}

/**
 * Create report structure with evaluation data
 * @param {Object} params - Parameters for creating the report
 * @param {string} params.timestamp - Report generation timestamp
 * @param {Object} params.metadata - Additional metadata for the report
 * @param {Object} params.structureEvaluation - Structure evaluation results
 * @param {Array} params.documentEvaluations - Individual document evaluations
 * @param {Object} params.aggregatedDocumentEvaluation - Aggregated document evaluation
 * @returns {Object} Complete report structure
 */
export function createReportStructure({
  timestamp,
  metadata,
  structureEvaluation,
  documentEvaluations,
}) {
  return {
    timestamp,
    metadata: {
      version: "0.1.0",
      generatedBy: "doc-smith",
      documentCount: documentEvaluations.length,
      ...metadata,
    },
    structureEvaluation: {
      type: "document-structure",
      results: structureEvaluation,
    },
    documentEvaluations: {
      type: "document-content",
      results: documentEvaluations
    }
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
export async function copyHtmlReportTemplate(targetDir) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Path to the HTML template
  const templatePath = join(__dirname, "../../", "assets", "report-template", "report.html");
  const targetPath = join(targetDir, "integrity-report.html");

  await copyFile(templatePath, targetPath);
  return toRelativePath(targetPath);
}

/**
 * Generate success message with report links
 * @param {string} jsonReportPath - Path to the JSON report
 * @param {string} htmlReportPath - Path to the HTML report
 * @returns {string} Success message with links
 */
export function generateReportSuccessMessage(jsonReportPath, htmlReportPath) {
  return `# ✅ Documentation Evaluation Report Generated Successfully!

Generated evaluation report and saved to:

\`${jsonReportPath}\`

## 📊 View HTML Report

Open in your browser to view detailed analysis:

\`${htmlReportPath}\`

`;
}
