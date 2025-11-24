import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import saveSingleDoc from "../../../agents/utils/save-single-doc.mjs";
import * as mermaidWorkerPool from "../../../utils/mermaid-worker-pool.mjs";
import * as utils from "../../../utils/utils.mjs";

describe("saveSingleDoc utility", () => {
  let consoleWarnSpy;
  let shutdownMermaidWorkerPoolSpy;
  let saveDocWithTranslationsSpy;

  beforeEach(() => {
    shutdownMermaidWorkerPoolSpy = spyOn(
      mermaidWorkerPool,
      "shutdownMermaidWorkerPool",
    ).mockResolvedValue();
    saveDocWithTranslationsSpy = spyOn(utils, "saveDocWithTranslations").mockResolvedValue({
      success: true,
    });
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all spies
    shutdownMermaidWorkerPoolSpy?.mockRestore();
    saveDocWithTranslationsSpy?.mockRestore();
    consoleWarnSpy?.mockRestore();
  });

  // BASIC FUNCTIONALITY TESTS
  test("should save document without showing message", async () => {
    const options = {
      path: "/docs/guide.md",
      content: "# User Guide\n\nThis is a guide.",
      docsDir: "/project/docs",
      translates: [],
      labels: {},
      locale: "en",
      isTranslate: false,
      isShowMessage: false,
    };

    const result = await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith({
      path: "/docs/guide.md",
      content: "# User Guide\n\nThis is a guide.",
      docsDir: "/project/docs",
      translates: [],
      labels: {},
      locale: "en",
      isTranslate: false,
    });
    expect(shutdownMermaidWorkerPoolSpy).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  test("should save document with success message for regular update", async () => {
    const options = {
      path: "/docs/api.md",
      content: "# API Reference",
      docsDir: "/project/docs",
      translates: [{ language: "zh" }, { language: "ja" }],
      labels: { api: "API" },
      locale: "en",
      isTranslate: false,
      isShowMessage: true,
    };

    const result = await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith({
      path: "/docs/api.md",
      content: "# API Reference",
      docsDir: "/project/docs",
      translates: [{ language: "zh" }, { language: "ja" }],
      labels: { api: "API" },
      locale: "en",
      isTranslate: false,
    });
    expect(shutdownMermaidWorkerPoolSpy).toHaveBeenCalled();
    expect(result).toEqual({
      message: "✅ Document updated successfully",
    });
  });

  test("should save document with success message for translation", async () => {
    const options = {
      path: "/docs/zh/guide.md",
      content: "# 用户指南\n\n这是一个指南。",
      docsDir: "/project/docs",
      translates: [{ language: "zh" }, { language: "ja" }],
      labels: { guide: "指南" },
      locale: "zh",
      isTranslate: true,
      isShowMessage: true,
    };

    const result = await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith({
      path: "/docs/zh/guide.md",
      content: "# 用户指南\n\n这是一个指南。",
      docsDir: "/project/docs",
      translates: [{ language: "zh" }, { language: "ja" }],
      labels: { guide: "指南" },
      locale: "zh",
      isTranslate: true,
    });
    expect(shutdownMermaidWorkerPoolSpy).toHaveBeenCalled();
    expect(result).toEqual({
      message: "✅ Translation completed successfully",
    });
  });

  // DEFAULT VALUES TESTS
  test("should use default values for optional parameters", async () => {
    const options = {
      path: "/docs/minimal.md",
      content: "# Minimal",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
    };

    const result = await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith({
      path: "/docs/minimal.md",
      content: "# Minimal",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
      isTranslate: false, // Default value
    });
    expect(shutdownMermaidWorkerPoolSpy).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  test("should handle explicit false values", async () => {
    const options = {
      path: "/docs/explicit.md",
      content: "# Explicit",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
      isTranslate: false,
      isShowMessage: false,
    };

    const result = await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isTranslate: false,
      }),
    );
    expect(result).toEqual({});
  });

  // MERMAID WORKER POOL SHUTDOWN TESTS
  test("should handle mermaid worker pool shutdown error gracefully", async () => {
    const shutdownError = new Error("Worker pool shutdown failed");
    shutdownMermaidWorkerPoolSpy.mockRejectedValue(shutdownError);

    const options = {
      path: "/docs/with-error.md",
      content: "# Document with shutdown error",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
      isTranslate: false,
      isShowMessage: true,
    };

    const result = await saveSingleDoc(options);

    expect(shutdownMermaidWorkerPoolSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to shutdown mermaid worker pool:",
      "Worker pool shutdown failed",
    );
    expect(result).toEqual({
      message: "✅ Document updated successfully",
    });
  });

  test("should handle mermaid worker pool shutdown error for translation", async () => {
    const shutdownError = new Error("Pool cleanup failed");
    shutdownMermaidWorkerPoolSpy.mockRejectedValue(shutdownError);

    const options = {
      path: "/docs/zh/with-error.md",
      content: "# 带错误的文档",
      docsDir: "/docs",
      translates: ["zh"],
      labels: {},
      locale: "zh",
      isTranslate: true,
      isShowMessage: true,
    };

    const result = await saveSingleDoc(options);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to shutdown mermaid worker pool:",
      "Pool cleanup failed",
    );
    expect(result).toEqual({
      message: "✅ Translation completed successfully",
    });
  });

  // COMPREHENSIVE PARAMETER TESTS
  test("should pass all parameters correctly to saveDocWithTranslations", async () => {
    const complexOptions = {
      path: "/docs/complex/nested/file.md",
      content: "# Complex Document\n\nWith multiple sections.",
      docsDir: "/project/documentation",
      translates: ["zh-CN", "ja-JP", "ko-KR"],
      labels: {
        title: "标题",
        section: "部分",
        example: "例子",
      },
      locale: "zh-CN",
      isTranslate: true,
      isShowMessage: false,
    };

    await saveSingleDoc(complexOptions);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith({
      path: "/docs/complex/nested/file.md",
      content: "# Complex Document\n\nWith multiple sections.",
      docsDir: "/project/documentation",
      translates: ["zh-CN", "ja-JP", "ko-KR"],
      labels: {
        title: "标题",
        section: "部分",
        example: "例子",
      },
      locale: "zh-CN",
      isTranslate: true,
    });
  });

  // EDGE CASES
  test("should handle empty content", async () => {
    const options = {
      path: "/docs/empty.md",
      content: "",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
      isShowMessage: true,
    };

    const result = await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "",
      }),
    );
    expect(result).toEqual({
      message: "✅ Document updated successfully",
    });
  });

  test("should handle empty translations array", async () => {
    const options = {
      path: "/docs/no-translations.md",
      content: "# No Translations",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
    };

    await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        translates: [],
      }),
    );
  });

  test("should handle empty labels object", async () => {
    const options = {
      path: "/docs/no-labels.md",
      content: "# No Labels",
      docsDir: "/docs",
      translates: ["zh"],
      labels: {},
      locale: "en",
    };

    await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        labels: {},
      }),
    );
  });

  // SPECIAL CHARACTERS AND PATHS
  test("should handle paths with special characters", async () => {
    const options = {
      path: "/docs/特殊字符/file with spaces.md",
      content: "# Special Characters 特殊字符",
      docsDir: "/project/docs",
      translates: ["zh-CN"],
      labels: { special: "特殊" },
      locale: "zh-CN",
      isTranslate: true,
    };

    await saveSingleDoc(options);

    expect(saveDocWithTranslationsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/docs/特殊字符/file with spaces.md",
        content: "# Special Characters 特殊字符",
        labels: { special: "特殊" },
        locale: "zh-CN",
      }),
    );
  });

  // RETURN VALUE CONSISTENCY
  test("should always return object structure", async () => {
    const withoutMessage = await saveSingleDoc({
      path: "/docs/test1.md",
      content: "Test",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
      isShowMessage: false,
    });

    const withMessage = await saveSingleDoc({
      path: "/docs/test2.md",
      content: "Test",
      docsDir: "/docs",
      translates: [],
      labels: {},
      locale: "en",
      isShowMessage: true,
    });

    expect(typeof withoutMessage).toBe("object");
    expect(typeof withMessage).toBe("object");
    expect(withoutMessage).toEqual({});
    expect(withMessage).toHaveProperty("message");
  });
});
