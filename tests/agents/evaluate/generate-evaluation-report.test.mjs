import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import generateEvaluationReport from "../../../agents/evaluate/generate-evaluation-report.mjs";

describe("generateEvaluationReport", () => {
  let testDir;

  beforeAll(async () => {
    process.env.OBSERVABILITY_DISABLED = "true";
    // Create a temporary directory for testing
    testDir = await mkdtemp(join(tmpdir(), "test-evaluation-report-"));
  });

  afterAll(async () => {
    delete process.env.OBSERVABILITY_DISABLED;

    // Clean up test files
    try {
      if (existsSync(testDir)) {
        await rm(testDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn("Failed to clean up test files:", error.message);
    }
  });

  test("should generate evaluation report with correct structure", async () => {
    // Mock evaluation data matching the expected schema
    const testData = {
      purposeCoverage: {
        score: 4,
        reason: "Covers most main objectives, missing minor targets",
        covered: ["Quick Start", "API Reference"],
        missing: ["Troubleshooting"],
      },
      audienceCoverage: {
        score: 5,
        reason: "Covers all selected audiences",
        covered: ["Developers", "DevOps Engineers"],
        missing: [],
      },
      coverageDepthAlignment: {
        score: 3,
        reason: "About half of modules depth does not match expectations",
      },
      originalDocumentStructure: [
        {
          path: "/api/authentication",
          title: "Authentication",
          readability: {
            score: 4,
            reason: "Clear language with minor errors that don't affect reading",
          },
          coherence: { score: 5, reason: "Clear logic, no contradictions or jumps" },
          contentQuality: { score: 3, reason: "50-70% implementation, some content is brief" },
          translationQuality: { score: 4, reason: "Generally accurate with minor issues" },
          consistency: { score: 4, reason: "Generally consistent with 1-2 differences" },
          purposeAlignment: {
            score: 4,
            reason: "Generally meets objectives with minor irrelevant content",
          },
          audienceAlignment: { score: 5, reason: "Completely meets audience needs" },
          knowledgeLevelAlignment: { score: 3, reason: "Partial match, about half doesn't fit" },
        },
        {
          path: "/api/endpoints",
          title: "API Endpoints",
          readability: { score: 5, reason: "No errors, natural and fluent language" },
          coherence: { score: 4, reason: "Overall coherent with occasional unnatural transitions" },
          contentQuality: {
            score: 4,
            reason: "70-90% planning points implemented, minor details lacking",
          },
          translationQuality: { score: 5, reason: "Accurate and natural, consistent terminology" },
          consistency: { score: 5, reason: "Completely consistent" },
          purposeAlignment: { score: 5, reason: "Completely meets objectives, closely related" },
          audienceAlignment: { score: 4, reason: "Generally fits with minor mismatches" },
          knowledgeLevelAlignment: {
            score: 4,
            reason: "Mostly matches, slightly too shallow/deep in places",
          },
        },
      ],
      metadata: {
        documentTitle: "API Usage Guide",
        evaluator: "test-suite",
      },
      basePath: testDir,
    };

    // Call the function
    const reportPath = await generateEvaluationReport(testData);

    // Verify file was created
    expect(existsSync(reportPath)).toBe(true);
    expect(reportPath).toContain("integrity-report.json");
    expect(reportPath).toContain("doc-smith/evaluate/");

    // Read and parse the report
    const reportContent = await readFile(reportPath, "utf8");
    const report = JSON.parse(reportContent);

    // Verify report structure
    expect(report).toBeDefined();
    expect(report.timestamp).toBeDefined();
    expect(report.metadata).toBeDefined();
    expect(report.structureEvaluation).toBeDefined();
    expect(report.documentEvaluations).toBeDefined();
    expect(report.summary).toBeDefined();

    // Verify metadata
    expect(report.metadata.version).toBe("1.0.0");
    expect(report.metadata.generatedBy).toBe("doc-smith");
    expect(report.metadata.documentCount).toBe(2);
    expect(report.metadata.documentTitle).toBe("API Usage Guide");
    expect(report.metadata.evaluator).toBe("test-suite");

    // Verify structure evaluation
    expect(report.structureEvaluation.type).toBe("document-structure");
    expect(report.structureEvaluation.results.purposeCoverage).toEqual(testData.purposeCoverage);
    expect(report.structureEvaluation.results.audienceCoverage).toEqual(testData.audienceCoverage);
    expect(report.structureEvaluation.results.coverageDepthAlignment).toEqual(
      testData.coverageDepthAlignment,
    );

    // Verify document evaluations
    expect(report.documentEvaluations.type).toBe("document-content");
    expect(report.documentEvaluations.individual).toHaveLength(2);
    expect(report.documentEvaluations.aggregated).toBeDefined();

    // Verify individual document evaluations
    const firstDoc = report.documentEvaluations.individual[0];
    expect(firstDoc.documentInfo.path).toBe("/api/authentication");
    expect(firstDoc.documentInfo.title).toBe("Authentication");
    expect(firstDoc.evaluation.readability.score).toBe(4);

    // Verify aggregated evaluation
    const aggregated = report.documentEvaluations.aggregated;
    expect(aggregated.readability).toBeDefined();
    expect(aggregated.readability.score).toBeGreaterThan(0);
    expect(aggregated.readability.score).toBeLessThanOrEqual(5);

    // Verify summary
    expect(report.summary.structureScores).toBeDefined();
    expect(report.summary.documentScores).toBeDefined();
    expect(report.summary.structureScores.average).toBe(4); // (4+5+3)/3
    expect(report.summary.documentScores.average).toBeGreaterThan(0);
    expect(report.summary.overallScore).toBeGreaterThan(0);
    expect(report.summary.issues).toBeArray();
    expect(report.summary.issues.length).toBeGreaterThan(0); // Should have "Missing purposes" issue
  });

  test("should handle empty document structure", async () => {
    const testData = {
      purposeCoverage: {
        score: 5,
        reason: "Completely covers all objectives",
        covered: ["Objective 1", "Objective 2"],
        missing: [],
      },
      audienceCoverage: {
        score: 5,
        reason: "Completely covers all audiences",
        covered: ["Audience 1", "Audience 2"],
        missing: [],
      },
      coverageDepthAlignment: {
        score: 5,
        reason: "Depth completely matches expectations",
      },
      originalDocumentStructure: [],
      metadata: {
        documentTitle: "Test Document",
      },
      basePath: testDir,
    };

    const reportPath = await generateEvaluationReport(testData);

    expect(existsSync(reportPath)).toBe(true);

    const reportContent = await readFile(reportPath, "utf8");
    const report = JSON.parse(reportContent);

    expect(report.metadata.documentCount).toBe(0);
    expect(report.documentEvaluations.individual).toHaveLength(0);
    expect(report.documentEvaluations.aggregated).toBeNull();
    expect(report.summary.structureScores.average).toBe(5); // (5+5+5)/3
  });

  test("should handle missing optional parameters", async () => {
    const testData = {
      purposeCoverage: {
        score: 3,
        reason: "Partial coverage",
      },
      audienceCoverage: {
        score: 3,
        reason: "Partial coverage",
      },
      coverageDepthAlignment: {
        score: 3,
        reason: "Generally compliant",
      },
      originalDocumentStructure: [
        {
          path: "/test",
          title: "Test Document",
          readability: { score: 3, reason: "Fair" },
          coherence: { score: 3, reason: "Fair" },
          contentQuality: { score: 3, reason: "Fair" },
          translationQuality: { score: 3, reason: "Fair" },
          consistency: { score: 3, reason: "Fair" },
          purposeAlignment: { score: 3, reason: "Fair" },
          audienceAlignment: { score: 3, reason: "Fair" },
          knowledgeLevelAlignment: { score: 3, reason: "Fair" },
        },
      ],
      basePath: testDir,
      // metadata is optional
    };

    const reportPath = await generateEvaluationReport(testData);

    expect(existsSync(reportPath)).toBe(true);

    const reportContent = await readFile(reportPath, "utf8");
    const report = JSON.parse(reportContent);

    expect(report.metadata.version).toBe("1.0.0");
    expect(report.metadata.generatedBy).toBe("doc-smith");
    expect(report.metadata.documentCount).toBe(1);
  });
});
