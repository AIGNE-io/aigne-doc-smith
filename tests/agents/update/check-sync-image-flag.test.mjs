import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import checkSyncImageFlag from "../../../agents/update/check-sync-image-flag.mjs";

describe("check-sync-image-flag", () => {
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
    test("should detect --diagram-sync flag", () => {
      process.argv = ["node", "script.js", "--diagram-sync"];
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(true);
    });

    test("should detect -ds short flag", () => {
      process.argv = ["node", "script.js", "-ds"];
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(true);
    });

    test("should return false when no flags are present", () => {
      process.argv = ["node", "script.js"];
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(false);
    });
  });

  describe("input parameters", () => {
    test("should detect diagram-sync parameter as true", () => {
      const result = checkSyncImageFlag({ "diagram-sync": true });
      expect(result.shouldSyncImages).toBe(true);
    });

    test("should detect diagramSync parameter as true", () => {
      const result = checkSyncImageFlag({ diagramSync: true });
      expect(result.shouldSyncImages).toBe(true);
    });

    test("should return false when no input parameters", () => {
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(false);
    });

    test("should return false when diagram-sync is false", () => {
      const result = checkSyncImageFlag({ "diagram-sync": false });
      expect(result.shouldSyncImages).toBe(false);
    });
  });

  describe("environment variables", () => {
    test("should detect DOC_SMITH_SYNC_IMAGES=true", () => {
      process.env.DOC_SMITH_SYNC_IMAGES = "true";
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(true);
      delete process.env.DOC_SMITH_SYNC_IMAGES;
    });

    test("should detect DOC_SMITH_SYNC_IMAGES=1", () => {
      process.env.DOC_SMITH_SYNC_IMAGES = "1";
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(true);
      delete process.env.DOC_SMITH_SYNC_IMAGES;
    });

    test("should return false when DOC_SMITH_SYNC_IMAGES is not set", () => {
      delete process.env.DOC_SMITH_SYNC_IMAGES;
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(false);
    });

    test("should return false when DOC_SMITH_SYNC_IMAGES is false", () => {
      process.env.DOC_SMITH_SYNC_IMAGES = "false";
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(false);
      delete process.env.DOC_SMITH_SYNC_IMAGES;
    });
  });

  describe("priority order", () => {
    test("should prioritize command line arguments over input parameters", () => {
      process.argv = ["node", "script.js", "--diagram-sync"];
      const result = checkSyncImageFlag({ "diagram-sync": false });
      expect(result.shouldSyncImages).toBe(true);
    });

    test("should prioritize command line arguments over environment variables", () => {
      process.argv = ["node", "script.js", "--diagram-sync"];
      process.env.DOC_SMITH_SYNC_IMAGES = "false";
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(true);
      delete process.env.DOC_SMITH_SYNC_IMAGES;
    });

    test("should prioritize input parameters over environment variables", () => {
      delete process.env.DOC_SMITH_SYNC_IMAGES;
      const result = checkSyncImageFlag({ "diagram-sync": true });
      expect(result.shouldSyncImages).toBe(true);
    });
  });

  describe("input passthrough", () => {
    test("should pass through all input properties", () => {
      const input = {
        docs: ["doc1.md"],
        feedback: "test feedback",
        customProp: "custom value",
      };
      const result = checkSyncImageFlag(input);
      expect(result.docs).toEqual(["doc1.md"]);
      expect(result.feedback).toBe("test feedback");
      expect(result.customProp).toBe("custom value");
    });

    test("should merge flag with existing input", () => {
      process.argv = ["node", "script.js", "--diagram-sync"];
      const input = { test: "value" };
      const result = checkSyncImageFlag(input);
      expect(result.test).toBe("value");
      expect(result.shouldSyncImages).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle empty process.argv", () => {
      process.argv = [];
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(false);
    });

    test("should handle null process.argv", () => {
      process.argv = null;
      const result = checkSyncImageFlag({});
      expect(result.shouldSyncImages).toBe(false);
    });
  });
});
