import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as fsPromises from "node:fs/promises";
import checkNeedGenerateStructure from "../../../agents/generate/check-need-generate-structure.mjs";

import * as preferencesUtils from "../../../utils/preferences-utils.mjs";
import * as utils from "../../../utils/utils.mjs";

describe("check-need-generate-structure", () => {
  let mockOptions;
  let originalDocumentStructure;

  // Spies for external dependencies
  let accessSpy;

  // Spies for internal utils
  let getActiveRulesForScopeSpy;
  let getCurrentGitHeadSpy;
  let hasFileChangesBetweenCommitsSpy;
  let getProjectInfoSpy;
  let loadConfigFromFileSpy;
  let saveValueToConfigSpy;

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    originalDocumentStructure = [
      { path: "/getting-started", title: "Getting Started" },
      { path: "/api", title: "API Reference" },
    ];

    mockOptions = {
      prompts: {
        input: mock(async () => ""),
      },
      context: {
        agents: { refineDocumentStructure: {} },
        invoke: mock(async () => ({
          documentStructure: originalDocumentStructure,
          projectName: "Test Project",
          projectDesc: "Test Description",
        })),
      },
    };

    // Set up spies for internal utils
    getActiveRulesForScopeSpy = spyOn(preferencesUtils, "getActiveRulesForScope").mockReturnValue(
      [],
    );
    getCurrentGitHeadSpy = spyOn(utils, "getCurrentGitHead").mockReturnValue(null);
    hasFileChangesBetweenCommitsSpy = spyOn(utils, "hasFileChangesBetweenCommits").mockReturnValue(
      false,
    );
    getProjectInfoSpy = spyOn(utils, "getProjectInfo").mockResolvedValue({
      name: "Test Project",
      description: "Test Description",
      fromGitHub: false,
    });
    loadConfigFromFileSpy = spyOn(utils, "loadConfigFromFile").mockResolvedValue({});
    saveValueToConfigSpy = spyOn(utils, "saveValueToConfig").mockResolvedValue();

    // Set up spy for external dependencies
    accessSpy = spyOn(fsPromises, "access").mockImplementation(() =>
      Promise.reject(new Error("File not found")),
    );

    // Clear prompts mock call history
    mockOptions.prompts.input.mockClear();
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    accessSpy?.mockRestore();
    getActiveRulesForScopeSpy?.mockRestore();
    getCurrentGitHeadSpy?.mockRestore();
    hasFileChangesBetweenCommitsSpy?.mockRestore();
    getProjectInfoSpy?.mockRestore();
    loadConfigFromFileSpy?.mockRestore();
    saveValueToConfigSpy?.mockRestore();
  });

  test("should return original document structure when no regeneration needed", async () => {
    // Test when no feedback and no sidebar file exists (default mock behavior)
    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, docsDir: "./docs" },
      mockOptions,
    );

    expect(result).toBeDefined();
    expect(result.documentStructure).toEqual(originalDocumentStructure);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should prompt for user feedback when originalDocumentStructure exists", async () => {
    const userFeedback = "Need more API documentation";
    mockOptions.prompts.input.mockImplementation(async () => userFeedback);

    await checkNeedGenerateStructure({ originalDocumentStructure, docsDir: "./docs" }, mockOptions);

    expect(mockOptions.prompts.input).toHaveBeenCalledWith({
      message: "How can we improve the documentation structure? (press Enter to skip):",
    });
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should skip prompting if feedback is already provided", async () => {
    const providedFeedback = "Already provided feedback";

    await checkNeedGenerateStructure(
      { originalDocumentStructure, feedback: providedFeedback, docsDir: "./docs" },
      mockOptions,
    );

    expect(mockOptions.prompts.input).not.toHaveBeenCalled();
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should handle empty user feedback input", async () => {
    mockOptions.prompts.input.mockImplementation(async () => "   ");
    // Default mock behavior: no sidebar file exists

    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, docsDir: "./docs" },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(originalDocumentStructure);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should regenerate when _sidebar.md exists", async () => {
    accessSpy.mockImplementation(() => Promise.resolve());

    await checkNeedGenerateStructure({ originalDocumentStructure, docsDir: "./docs" }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should not regenerate when _sidebar.md does not exist", async () => {
    // Default mock behavior: file access fails

    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, docsDir: "./docs" },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(originalDocumentStructure);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should check git changes when lastGitHead is provided", async () => {
    getCurrentGitHeadSpy.mockImplementation(() => "def456");
    hasFileChangesBetweenCommitsSpy.mockImplementation(() => true);

    await checkNeedGenerateStructure(
      { originalDocumentStructure, lastGitHead: "abc123", docsDir: "./docs" },
      mockOptions,
    );

    expect(hasFileChangesBetweenCommitsSpy).toHaveBeenCalledWith("abc123", "def456");
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should not regenerate when git head is same", async () => {
    getCurrentGitHeadSpy.mockImplementation(() => "abc123");

    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, lastGitHead: "abc123", docsDir: "./docs" },
      mockOptions,
    );

    expect(result.documentStructure).toEqual(originalDocumentStructure);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should force regenerate when forceRegenerate is true", async () => {
    await checkNeedGenerateStructure(
      { originalDocumentStructure, forceRegenerate: true, docsDir: "./docs" },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should include user preferences", async () => {
    const mockRules = [{ rule: "Structure rule 1" }];
    getActiveRulesForScopeSpy.mockImplementation(() => mockRules);

    await checkNeedGenerateStructure(
      { originalDocumentStructure, feedback: "test", docsDir: "./docs" },
      mockOptions,
    );

    expect(getActiveRulesForScopeSpy).toHaveBeenCalledWith("structure", []);
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should save project info when appropriate", async () => {
    mockOptions.context.invoke.mockImplementation(async () => ({
      documentStructure: originalDocumentStructure,
      projectName: "New Project Name",
      projectDesc: "New Description",
    }));

    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, feedback: "test", docsDir: "./docs" },
      mockOptions,
    );

    expect(saveValueToConfigSpy).toHaveBeenCalledWith("projectName", "New Project Name");
    expect(result.projectInfoMessage).toContain("New Project Name");
  });

  test("should handle project info save errors", async () => {
    loadConfigFromFileSpy.mockImplementation(async () => {
      throw new Error("Config load failed");
    });
    const consoleSpy = spyOn(console, "warn").mockImplementation(() => {});

    mockOptions.context.invoke.mockImplementation(async () => ({
      documentStructure: originalDocumentStructure,
      projectName: "New Project",
      projectDesc: "New Description",
    }));

    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, feedback: "test", docsDir: "./docs" },
      mockOptions,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result).toBeDefined();
    expect(consoleSpy).toHaveBeenCalled();
  });

  test("should return correct structure when no originalDocumentStructure provided", async () => {
    const newDocumentStructure = [{ path: "/new", title: "New Section" }];

    mockOptions.context.invoke.mockImplementation(async () => ({
      documentStructure: newDocumentStructure,
    }));

    const result = await checkNeedGenerateStructure({ docsDir: "./docs" }, mockOptions);

    expect(result.documentStructure).toEqual(newDocumentStructure);
    expect(result.originalDocumentStructure).toEqual(newDocumentStructure);
  });

  test("should clear feedback in result", async () => {
    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, feedback: "some feedback", docsDir: "./docs" },
      mockOptions,
    );

    expect(result.feedback).toBe("");
  });

  test("should preserve documentStructureFeedback", async () => {
    const feedback = "user submitted feedback";

    const result = await checkNeedGenerateStructure(
      { originalDocumentStructure, feedback, docsDir: "./docs" },
      mockOptions,
    );

    expect(result.documentStructureFeedback).toBe(feedback);
  });

  test("should pass through additional parameters", async () => {
    const additionalParams = {
      customParam1: "value1",
      customParam2: "value2",
    };

    await checkNeedGenerateStructure(
      {
        originalDocumentStructure,
        feedback: "test",
        docsDir: "./docs",
        ...additionalParams,
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.refineDocumentStructure,
      expect.objectContaining(additionalParams),
    );
  });
});
