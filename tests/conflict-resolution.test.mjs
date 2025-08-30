import { describe, expect, test } from "bun:test";
import {
  detectResolvableConflicts,
  generateConflictResolutionRules,
} from "../utils/conflict-detector.mjs";
import { processConfigFields } from "../utils/utils.mjs";

describe("conflict resolution", () => {
  describe("detectResolvableConflicts", () => {
    test("should detect document purpose conflicts", () => {
      const config = {
        documentPurpose: ["getStarted", "findAnswers"],
        targetAudienceTypes: ["developers"],
      };

      const conflicts = detectResolvableConflicts(config);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        type: "documentPurpose",
        items: ["getStarted", "findAnswers"],
        strategy: "layered_structure",
        description: "Quick start and API reference conflict, resolved through layered structure",
      });
    });

    test("should detect target audience conflicts", () => {
      const config = {
        documentPurpose: ["completeTasks"],
        targetAudienceTypes: ["endUsers", "developers"],
      };

      const conflicts = detectResolvableConflicts(config);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        type: "targetAudienceTypes",
        items: ["endUsers", "developers"],
        strategy: "separate_user_paths",
        description: "End users and developers conflict, resolved through separate user paths",
      });
    });

    test("should detect multiple conflicts", () => {
      const config = {
        documentPurpose: ["getStarted", "findAnswers", "understandSystem"],
        targetAudienceTypes: ["endUsers", "developers"],
      };

      const conflicts = detectResolvableConflicts(config);

      expect(conflicts).toHaveLength(3);

      // Check for getStarted vs findAnswers conflict
      expect(
        conflicts.some(
          (c) =>
            c.type === "documentPurpose" &&
            c.items.includes("getStarted") &&
            c.items.includes("findAnswers"),
        ),
      ).toBe(true);

      // Check for getStarted vs understandSystem conflict
      expect(
        conflicts.some(
          (c) =>
            c.type === "documentPurpose" &&
            c.items.includes("getStarted") &&
            c.items.includes("understandSystem"),
        ),
      ).toBe(true);

      // Check for endUsers vs developers conflict
      expect(
        conflicts.some(
          (c) =>
            c.type === "targetAudienceTypes" &&
            c.items.includes("endUsers") &&
            c.items.includes("developers"),
        ),
      ).toBe(true);
    });

    test("should not detect conflicts with single selections", () => {
      const config = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
      };

      const conflicts = detectResolvableConflicts(config);

      expect(conflicts).toHaveLength(0);
    });

    test("should not detect conflicts with non-conflicting combinations", () => {
      const config = {
        documentPurpose: ["completeTasks", "solveProblems"],
        targetAudienceTypes: ["developers", "devops"],
      };

      const conflicts = detectResolvableConflicts(config);

      expect(conflicts).toHaveLength(0);
    });

    test("should handle object arrays with value property", () => {
      const config = {
        documentPurpose: [
          { value: "getStarted", label: "Get Started" },
          { value: "findAnswers", label: "Find Answers" },
        ],
      };

      const conflicts = detectResolvableConflicts(config);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].items).toEqual(["getStarted", "findAnswers"]);
    });
  });

  describe("generateConflictResolutionRules", () => {
    test("should generate resolution rules for conflicts", () => {
      const conflicts = [
        {
          type: "documentPurpose",
          items: ["getStarted", "findAnswers"],
          strategy: "layered_structure",
          description: "Quick start and API reference conflict, resolved through layered structure",
        },
        {
          type: "targetAudienceTypes",
          items: ["endUsers", "developers"],
          strategy: "separate_user_paths",
          description: "End users and developers conflict, resolved through separate user paths",
        },
      ];

      const rules = generateConflictResolutionRules(conflicts);

      expect(rules).toContain("=== Conflict Resolution Guidelines ===");
      expect(rules).toContain('Detected "getStarted" and "findAnswers" purpose conflict');
      expect(rules).toContain('Detected "endUsers" and "developers" audience conflict');
      expect(rules).toContain('Quick start section: Uses "get started" style');
      expect(rules).toContain('User guide path: Uses "end users" style');
      expect(rules).toContain("Conflict Resolution Principles:");
      expect(rules).toContain(
        "1. Meet diverse needs through intelligent structural design, not simple concatenation",
      );
    });

    test("should return empty string for no conflicts", () => {
      const conflicts = [];
      const rules = generateConflictResolutionRules(conflicts);
      expect(rules).toBe("");
    });

    test("should handle unknown strategies gracefully", () => {
      const conflicts = [
        {
          type: "documentPurpose",
          items: ["unknown1", "unknown2"],
          strategy: "unknown_strategy",
          description: "Unknown conflict",
        },
      ];

      const rules = generateConflictResolutionRules(conflicts);

      expect(rules).toContain("=== Conflict Resolution Guidelines ===");
      expect(rules).toContain("Conflict Resolution Principles:");
      // Should not contain any strategy-specific text since strategy is unknown
      expect(rules).not.toContain('Detected "unknown1" and "unknown2"');
    });
  });

  describe("processConfigFields integration", () => {
    test("should integrate conflict resolution into config processing", () => {
      const config = {
        documentPurpose: ["getStarted", "findAnswers"],
        targetAudienceTypes: ["endUsers", "developers"],
        readerKnowledgeLevel: "completeBeginners",
        documentationDepth: "balancedCoverage",
      };

      const result = processConfigFields(config);

      // Should detect conflicts
      expect(result.detectedConflicts).toBeDefined();
      expect(result.detectedConflicts).toHaveLength(2);

      // Should include conflict resolution rules in final rules
      expect(result.rules).toContain("=== Conflict Resolution Guidelines ===");
      expect(result.rules).toContain("Create layered document structure");
      expect(result.rules).toContain("Create separate user paths");

      // Should also include regular configuration content with enhanced format
      expect(result.rules).toContain("Document Purpose - Get started quickly:");
      expect(result.rules).toContain("Target Audience - End users (non-technical):");
      expect(result.rules).toContain("Target Audience - Developers integrating your product/API:");
      expect(result.rules).toContain("Reader Knowledge Level:");
    });

    test("should work without conflicts", () => {
      const config = {
        documentPurpose: ["completeTasks"],
        targetAudienceTypes: ["developers"],
        readerKnowledgeLevel: "domainFamiliar",
      };

      const result = processConfigFields(config);

      // Should not detect conflicts
      expect(result.detectedConflicts).toBeUndefined();

      // Should not include conflict resolution rules
      expect(result.rules).not.toContain("=== Conflict Resolution Guidelines ===");

      // Should still include regular configuration content with enhanced format
      expect(result.rules).toContain("Document Purpose - Complete specific tasks:");
      expect(result.rules).toContain("Target Audience - Developers integrating your product/API:");
    });

    test("should preserve target audience field processing", () => {
      const config = {
        targetAudienceTypes: ["developers", "devops"],
        targetAudience: "Existing audience description",
      };

      const result = processConfigFields(config);

      expect(result.targetAudience).toContain("Existing audience description");
      expect(result.targetAudience).toContain("Developers integrating your product/API");
      expect(result.targetAudience).toContain("DevOps / SRE / Infrastructure teams");
    });
  });
});
