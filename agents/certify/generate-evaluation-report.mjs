import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
  const timestampForFolder = timestamp.replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");

  // Process document evaluation results from originalDocumentStructure array
  const documentEvaluations = [];
  let aggregatedDocumentEvaluation = null;

  if (originalDocumentStructure && Array.isArray(originalDocumentStructure)) {
    for (const docItem of originalDocumentStructure) {
      if (docItem && typeof docItem === "object") {
        // Extract evaluation results from each document
        const {
          readability,
          coherence,
          contentQuality,
          translationQuality,
          consistency,
          purposeAlignment,
          audienceAlignment,
          knowledgeLevelAlignment,
          navigability,
          path,
          title,
        } = docItem;

        const docEvaluation = {
          documentInfo: {
            path: path || "unknown",
            title: title || "untitled",
          },
          evaluation: {
            readability,
            coherence,
            contentQuality,
            translationQuality,
            consistency,
            purposeAlignment,
            audienceAlignment,
            knowledgeLevelAlignment,
            navigability,
          },
        };

        documentEvaluations.push(docEvaluation);
      }
    }

    // Generate aggregated evaluation if we have documents
    if (documentEvaluations.length > 0) {
      aggregatedDocumentEvaluation = aggregateDocumentEvaluations(documentEvaluations);
    }
  }

  const report = {
    timestamp,
    metadata: {
      version: "1.0.0",
      generatedBy: "doc-smith",
      documentCount: documentEvaluations.length,
      ...metadata,
    },
    structureEvaluation: {
      type: "document-structure",
      results: {
        purposeCoverage: purposeCoverage || null,
        audienceCoverage: audienceCoverage || null,
        coverageDepthAlignment: coverageDepthAlignment || null,
      },
    },
    documentEvaluations: {
      type: "document-content",
      individual: documentEvaluations,
      aggregated: aggregatedDocumentEvaluation,
    },
    summary: generateSummary(
      { purposeCoverage, audienceCoverage, coverageDepthAlignment },
      aggregatedDocumentEvaluation,
    ),
  };

  const saveDir = join(basePath, ".aigne", "doc-smith", "certify", timestampForFolder);
  const filePath = join(saveDir, "integrity-report.json");

  await ensureDirectoryExists(saveDir);
  await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

  return {};
}

/**
 * Generate summary statistics from both evaluation results
 * @param {Object} structureEval - Structure evaluation results
 * @param {Object} docEval - Document evaluation results
 * @returns {Object} Summary object with aggregated scores
 */
function generateSummary(structureEval, docEval) {
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
function aggregateDocumentEvaluations(documentEvaluations) {
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
      if (evaluation[key] && evaluation[key].score) {
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
    }
  });

  return result;
}

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path to ensure exists
 */
async function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

generateEvaluationReport.taskTitle = "Generate evaluation report";
