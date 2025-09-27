import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import generateEvaluationReport from "../../../agents/evaluate/generate-report.mjs";

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
      structureEvaluation: {
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
      },
      originalDocumentStructure: [
        {
          path: "/api/authentication",
          title: "Authentication",
          description: "Authentication guide",
          parentId: null,
          documentEvaluation: {
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
          codeEvaluation: null,
        },
        {
          path: "/api/endpoints",
          title: "API Endpoints",
          description: "API endpoints documentation",
          parentId: null,
          documentEvaluation: {
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
          codeEvaluation: null,
        },
      ],
      metadata: {
        documentTitle: "API Usage Guide",
        evaluator: "test-suite",
      },
      basePath: testDir,
      projectName: "Test Project",
      projectDesc: "A test project for evaluation",
      projectLogo: "test-logo.png",
      documentPurpose: "Provide API documentation",
      targetAudienceTypes: ["Developers", "DevOps Engineers"],
      readerKnowledgeLevel: "Intermediate",
      documentationDepth: "Comprehensive",
      targetAudience: "Software developers and engineers",
    };

    // Call the function
    const result = await generateEvaluationReport(testData);

    // Verify result structure
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message).toContain("integrity-report.json");
    expect(result.message).toContain("doc-smith/evaluate/");

    // Extract report path from result message
    const reportPathMatch = result.message.match(/`([^`]+\.json)`/);
    expect(reportPathMatch).toBeTruthy();
    const reportPath = reportPathMatch[1];

    // Verify file was created
    expect(existsSync(reportPath)).toBe(true);

    // Read and parse the report
    const reportContent = await readFile(reportPath, "utf8");
    const report = JSON.parse(reportContent);

    // Verify report structure
    expect(report).toBeDefined();
    expect(report.documentInfo).toBeDefined();
    expect(report.metadata).toBeDefined();
    expect(report.structureEvaluation).toBeDefined();
    expect(report.documentEvaluations).toBeDefined();

    // Verify document info
    expect(report.documentInfo.projectName).toBe("Test Project");
    expect(report.documentInfo.projectDesc).toBe("A test project for evaluation");
    expect(report.documentInfo.projectLogo).toBe("test-logo.png");
    expect(report.documentInfo.documentPurpose).toBe("Provide API documentation");
    expect(report.documentInfo.targetAudienceTypes).toEqual(["Developers", "DevOps Engineers"]);
    expect(report.documentInfo.readerKnowledgeLevel).toBe("Intermediate");
    expect(report.documentInfo.documentationDepth).toBe("Comprehensive");
    expect(report.documentInfo.targetAudience).toBe("Software developers and engineers");

    // Verify metadata
    expect(report.metadata.version).toBe("0.1.0");
    expect(report.metadata.generatedBy).toBe("AIGNE Doc Smith");
    expect(report.metadata.generatedAt).toBeDefined();
    expect(report.metadata.documentCount).toBe(2);
    expect(report.metadata.documentTitle).toBe("API Usage Guide");
    expect(report.metadata.evaluator).toBe("test-suite");

    // Verify structure evaluation
    expect(report.structureEvaluation.type).toBe("document-structure");
    expect(report.structureEvaluation.results.purposeCoverage).toEqual(testData.structureEvaluation.purposeCoverage);
    expect(report.structureEvaluation.results.audienceCoverage).toEqual(testData.structureEvaluation.audienceCoverage);
    expect(report.structureEvaluation.results.coverageDepthAlignment).toEqual(
      testData.structureEvaluation.coverageDepthAlignment,
    );

    // Verify document evaluations
    expect(report.documentEvaluations.type).toBe("document-content");
    expect(report.documentEvaluations.results).toHaveLength(2);

    // Verify individual document evaluations
    const firstDoc = report.documentEvaluations.results[0];
    expect(firstDoc.path).toBe("/api/authentication");
    expect(firstDoc.title).toBe("Authentication");
    expect(firstDoc.description).toBe("Authentication guide");
    expect(firstDoc.parentId).toBe(null);
    expect(firstDoc.documentEvaluation.readability.score).toBe(4);
    expect(firstDoc.codeEvaluation).toBe(null);
  });

  test("should handle empty document structure", async () => {
    const testData = {
      structureEvaluation: {
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
      },
      originalDocumentStructure: [],
      metadata: {
        documentTitle: "Test Document",
      },
      basePath: testDir,
      projectName: "Empty Test Project",
      projectDesc: "Test project with no documents",
      projectLogo: "empty-logo.png",
      documentPurpose: "Test empty structure",
      targetAudienceTypes: ["Testers"],
      readerKnowledgeLevel: "Beginner",
      documentationDepth: "Basic",
      targetAudience: "Test users",
    };

    const result = await generateEvaluationReport(testData);

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();

    // Extract report path from result message
    const reportPathMatch = result.message.match(/`([^`]+\.json)`/);
    expect(reportPathMatch).toBeTruthy();
    const reportPath = reportPathMatch[1];

    expect(existsSync(reportPath)).toBe(true);

    const reportContent = await readFile(reportPath, "utf8");
    const report = JSON.parse(reportContent);

    expect(report.metadata.documentCount).toBe(0);
    expect(report.documentEvaluations.results).toHaveLength(0);
  });

  test("should handle missing optional parameters", async () => {
    const testData = {
      structureEvaluation: {
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
      },
      originalDocumentStructure: [
        {
          path: "/test",
          title: "Test Document",
          description: "Test document description",
          parentId: null,
          documentEvaluation: {
            readability: { score: 3, reason: "Fair" },
            coherence: { score: 3, reason: "Fair" },
            contentQuality: { score: 3, reason: "Fair" },
            translationQuality: { score: 3, reason: "Fair" },
            consistency: { score: 3, reason: "Fair" },
            purposeAlignment: { score: 3, reason: "Fair" },
            audienceAlignment: { score: 3, reason: "Fair" },
            knowledgeLevelAlignment: { score: 3, reason: "Fair" },
          },
          codeEvaluation: null,
        },
      ],
      basePath: testDir,
      projectName: "Minimal Test Project",
      projectDesc: "Minimal test setup",
      projectLogo: "minimal-logo.png",
      documentPurpose: "Test minimal configuration",
      targetAudienceTypes: ["General Users"],
      readerKnowledgeLevel: "Basic",
      documentationDepth: "Minimal",
      targetAudience: "General audience",
      // metadata is optional
    };

    const result = await generateEvaluationReport(testData);

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();

    // Extract report path from result message
    const reportPathMatch = result.message.match(/`([^`]+\.json)`/);
    expect(reportPathMatch).toBeTruthy();
    const reportPath = reportPathMatch[1];

    expect(existsSync(reportPath)).toBe(true);

    const reportContent = await readFile(reportPath, "utf8");
    const report = JSON.parse(reportContent);

    expect(report.metadata.version).toBe("0.1.0");
    expect(report.metadata.generatedBy).toBe("AIGNE Doc Smith");
    expect(report.metadata.documentCount).toBe(1);
  });
});
