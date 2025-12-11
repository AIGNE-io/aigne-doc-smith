import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import translateOrSkipDiagram from "../../../agents/localize/translate-or-skip-diagram.mjs";
import * as debugModule from "../../../utils/debug.mjs";

describe("translate-or-skip-diagram", () => {
  let debugSpy;
  let originalArgv;
  let originalEnv;

  beforeEach(() => {
    debugSpy = spyOn(debugModule, "debug").mockImplementation(() => {});
    originalArgv = process.argv;
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = originalEnv;
    debugSpy?.mockRestore();
  });

  test("should skip translation when --diagram flag is set in argv", async () => {
    process.argv = ["node", "script.js", "--diagram"];
    const input = {
      content: "Original content",
      path: "/test",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.translation).toBe("Original content");
    expect(result.reviewContent).toBe("Original content");
    expect(result.isApproved).toBe(true);
    expect(debugSpy).toHaveBeenCalledWith(
      "⏭️  --diagram flag set: skipping document translation, only translating images",
    );
  });

  test("should skip translation when -d flag is set in argv", async () => {
    process.argv = ["node", "script.js", "-d"];
    const input = {
      content: "Original content",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.isApproved).toBe(true);
  });

  test("should skip translation when input.diagram is true", async () => {
    process.argv = ["node", "script.js"];
    const input = {
      content: "Original content",
      diagram: true,
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.isApproved).toBe(true);
  });

  test("should skip translation when input.diagram is 'true'", async () => {
    process.argv = ["node", "script.js"];
    const input = {
      content: "Original content",
      diagram: "true",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.isApproved).toBe(true);
  });

  test("should skip translation when DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY env is 'true'", async () => {
    process.argv = ["node", "script.js"];
    process.env.DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY = "true";
    const input = {
      content: "Original content",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.isApproved).toBe(true);
  });

  test("should skip translation when DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY env is '1'", async () => {
    process.argv = ["node", "script.js"];
    process.env.DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY = "1";
    const input = {
      content: "Original content",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.isApproved).toBe(true);
  });

  test("should proceed with normal translation when no flags are set", async () => {
    process.argv = ["node", "script.js"];
    delete process.env.DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY;
    const input = {
      content: "Original content",
      path: "/test",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(false);
    expect(result.translation).toBeUndefined();
    expect(result.isApproved).toBeUndefined();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  test("should handle empty content gracefully", async () => {
    process.argv = ["node", "script.js", "--diagram"];
    const input = {
      content: "",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.shouldTranslateDiagramsOnly).toBe(true);
    expect(result.translation).toBe("");
    expect(result.reviewContent).toBe("");
    expect(result.isApproved).toBe(true);
  });

  test("should preserve all input properties when skipping", async () => {
    process.argv = ["node", "script.js", "--diagram"];
    const input = {
      content: "Original content",
      path: "/test",
      locale: "en",
      language: "zh",
      customProperty: "customValue",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.path).toBe("/test");
    expect(result.locale).toBe("en");
    expect(result.language).toBe("zh");
    expect(result.customProperty).toBe("customValue");
    expect(result.shouldTranslateDiagramsOnly).toBe(true);
  });

  test("should preserve all input properties when proceeding normally", async () => {
    process.argv = ["node", "script.js"];
    const input = {
      content: "Original content",
      path: "/test",
      locale: "en",
      customProperty: "customValue",
    };

    const result = await translateOrSkipDiagram(input);

    expect(result.path).toBe("/test");
    expect(result.locale).toBe("en");
    expect(result.customProperty).toBe("customValue");
    expect(result.shouldTranslateDiagramsOnly).toBe(false);
  });
});
