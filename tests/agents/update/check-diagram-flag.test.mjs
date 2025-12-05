import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import checkDiagramFlag from "../../../agents/update/check-diagram-flag.mjs";

describe("check-diagram-flag", () => {
  let originalArgv;
  let originalEnv;

  beforeEach(() => {
    originalArgv = [...process.argv];
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = originalEnv;
  });

  describe("command line arguments", () => {
    test("should detect --diagram-all flag", () => {
      process.argv = ["node", "script.js", "--diagram-all"];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should detect -da short flag", () => {
      process.argv = ["node", "script.js", "-da"];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should detect --diagram flag", () => {
      process.argv = ["node", "script.js", "--diagram"];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should detect -d short flag", () => {
      process.argv = ["node", "script.js", "-d"];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should prioritize --diagram-all over --diagram", () => {
      process.argv = ["node", "script.js", "--diagram", "--diagram-all"];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should return false when no flags are present", () => {
      process.argv = ["node", "script.js"];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(false);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });
  });

  describe("input parameters", () => {
    test("should detect diagram-all parameter as true", () => {
      const result = checkDiagramFlag({ "diagram-all": true });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should detect diagram-all parameter as 'true' string", () => {
      const result = checkDiagramFlag({ "diagram-all": "true" });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should detect diagram parameter as true", () => {
      const result = checkDiagramFlag({ diagram: true });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should detect diagram parameter as 'true' string", () => {
      const result = checkDiagramFlag({ diagram: "true" });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should prioritize diagram-all over diagram", () => {
      const result = checkDiagramFlag({ diagram: true, "diagram-all": true });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should return false when no input parameters", () => {
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(false);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });
  });

  describe("environment variables", () => {
    test("should detect DOC_SMITH_UPDATE_DIAGRAMS=all", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS = "all";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS;
    });

    test("should detect DOC_SMITH_UPDATE_DIAGRAMS_ALL=true", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL = "true";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL;
    });

    test("should detect DOC_SMITH_UPDATE_DIAGRAMS_ALL=1", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL = "1";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL;
    });

    test("should detect DOC_SMITH_UPDATE_DIAGRAMS=true", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS = "true";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS;
    });

    test("should detect DOC_SMITH_UPDATE_DIAGRAMS=1", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS = "1";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS;
    });

    test("should prioritize DOC_SMITH_UPDATE_DIAGRAMS=all over DOC_SMITH_UPDATE_DIAGRAMS=true", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS = "all";
      process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL = "true";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS;
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL;
    });
  });

  describe("priority order", () => {
    test("should prioritize command line arguments over input parameters", () => {
      process.argv = ["node", "script.js", "--diagram-all"];
      const result = checkDiagramFlag({ diagram: true });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });

    test("should prioritize command line arguments over environment variables", () => {
      process.argv = ["node", "script.js", "--diagram"];
      process.env.DOC_SMITH_UPDATE_DIAGRAMS = "all";
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS;
    });

    test("should prioritize input parameters over environment variables", () => {
      process.env.DOC_SMITH_UPDATE_DIAGRAMS = "true";
      const result = checkDiagramFlag({ "diagram-all": true });
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
      delete process.env.DOC_SMITH_UPDATE_DIAGRAMS;
    });
  });

  describe("input passthrough", () => {
    test("should pass through all input properties", () => {
      const input = {
        docs: ["doc1.md"],
        feedback: "test feedback",
        customProp: "custom value",
      };
      const result = checkDiagramFlag(input);
      expect(result.docs).toEqual(["doc1.md"]);
      expect(result.feedback).toBe("test feedback");
      expect(result.customProp).toBe("custom value");
    });

    test("should merge flags with existing input", () => {
      process.argv = ["node", "script.js", "--diagram-all"];
      const input = { test: "value" };
      const result = checkDiagramFlag(input);
      expect(result.test).toBe("value");
      expect(result.shouldUpdateDiagrams).toBe(true);
      expect(result.shouldAutoSelectDiagrams).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle empty process.argv", () => {
      process.argv = [];
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(false);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should handle null process.argv", () => {
      process.argv = null;
      const result = checkDiagramFlag({});
      expect(result.shouldUpdateDiagrams).toBe(false);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should handle diagram parameter as false", () => {
      const result = checkDiagramFlag({ diagram: false });
      expect(result.shouldUpdateDiagrams).toBe(false);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });

    test("should handle diagram-all parameter as false", () => {
      const result = checkDiagramFlag({ "diagram-all": false });
      expect(result.shouldUpdateDiagrams).toBe(false);
      expect(result.shouldAutoSelectDiagrams).toBe(false);
    });
  });
});
