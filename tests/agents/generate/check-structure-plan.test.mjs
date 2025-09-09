import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import checkStructurePlan from "../../../agents/generate/check-structure-plan.mjs";

// Mock all external dependencies at the top level
const mockPreferencesUtils = {
  getActiveRulesForScope: mock(() => []),
};

const mockUtils = {
  getCurrentGitHead: mock(() => null),
  hasFileChangesBetweenCommits: mock(() => false),
  getProjectInfo: mock(() =>
    Promise.resolve({
      name: "Test Project",
      description: "Test Description",
      fromGitHub: false,
    }),
  ),
  loadConfigFromFile: mock(() => Promise.resolve({})),
  saveValueToConfig: mock(() => Promise.resolve()),
};

const mockFsPromises = {
  access: mock(() => Promise.reject(new Error("File not found"))),
};

// Apply mocks globally
mock.module("../../../utils/preferences-utils.mjs", () => mockPreferencesUtils);
mock.module("../../../utils/utils.mjs", () => mockUtils);
mock.module("node:fs/promises", () => mockFsPromises);

describe("checkStructurePlan", () => {
  let mockOptions;
  let originalStructurePlan;

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    originalStructurePlan = [
      { path: "/getting-started", title: "Getting Started" },
      { path: "/api", title: "API Reference" },
    ];

    mockOptions = {
      prompts: {
        input: mock(async () => ""),
      },
      context: {
        agents: { structurePlanner: {} },
        invoke: mock(async () => ({
          structurePlan: originalStructurePlan,
          projectName: "Test Project",
          projectDesc: "Test Description",
        })),
      },
    };

    // Reset module mocks to default behavior
    mockPreferencesUtils.getActiveRulesForScope.mockImplementation(() => []);
    mockUtils.getCurrentGitHead.mockImplementation(() => null);
    mockUtils.hasFileChangesBetweenCommits.mockImplementation(() => false);
    mockUtils.getProjectInfo.mockImplementation(() =>
      Promise.resolve({
        name: "Test Project",
        description: "Test Description",
        fromGitHub: false,
      }),
    );
    mockUtils.loadConfigFromFile.mockImplementation(() => Promise.resolve({}));
    mockUtils.saveValueToConfig.mockImplementation(() => Promise.resolve());
    mockFsPromises.access.mockImplementation(() => Promise.reject(new Error("File not found")));
  });

  test("should return original structure plan when no regeneration needed", async () => {
    // Test when no feedback and no sidebar file exists (default mock behavior)
    const result = await checkStructurePlan(
      { originalStructurePlan, docsDir: "./docs" },
      mockOptions,
    );

    expect(result).toBeDefined();
    expect(result.structurePlan).toEqual(originalStructurePlan);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should prompt for user feedback when originalStructurePlan exists", async () => {
    const userFeedback = "Need more API documentation";
    mockOptions.prompts.input.mockImplementation(async () => userFeedback);

    await checkStructurePlan({ originalStructurePlan, docsDir: "./docs" }, mockOptions);

    expect(mockOptions.prompts.input).toHaveBeenCalledWith({
      message: "Please provide feedback for structure planning (press Enter to skip):",
    });
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should skip prompting if feedback is already provided", async () => {
    const providedFeedback = "Already provided feedback";

    await checkStructurePlan(
      { originalStructurePlan, feedback: providedFeedback, docsDir: "./docs" },
      mockOptions,
    );

    expect(mockOptions.prompts.input).not.toHaveBeenCalled();
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should handle empty user feedback input", async () => {
    mockOptions.prompts.input.mockImplementation(async () => "   ");
    // Default mock behavior: no sidebar file exists

    const result = await checkStructurePlan(
      { originalStructurePlan, docsDir: "./docs" },
      mockOptions,
    );

    expect(result.structurePlan).toEqual(originalStructurePlan);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should regenerate when _sidebar.md exists", async () => {
    mockFsPromises.access.mockImplementation(() => Promise.resolve());

    await checkStructurePlan({ originalStructurePlan, docsDir: "./docs" }, mockOptions);

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should not regenerate when _sidebar.md does not exist", async () => {
    // Default mock behavior: file access fails

    const result = await checkStructurePlan(
      { originalStructurePlan, docsDir: "./docs" },
      mockOptions,
    );

    expect(result.structurePlan).toEqual(originalStructurePlan);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should check git changes when lastGitHead is provided", async () => {
    mockUtils.getCurrentGitHead.mockImplementation(() => "def456");
    mockUtils.hasFileChangesBetweenCommits.mockImplementation(() => true);

    await checkStructurePlan(
      { originalStructurePlan, lastGitHead: "abc123", docsDir: "./docs" },
      mockOptions,
    );

    expect(mockUtils.hasFileChangesBetweenCommits).toHaveBeenCalledWith("abc123", "def456");
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should not regenerate when git head is same", async () => {
    mockUtils.getCurrentGitHead.mockImplementation(() => "abc123");

    const result = await checkStructurePlan(
      { originalStructurePlan, lastGitHead: "abc123", docsDir: "./docs" },
      mockOptions,
    );

    expect(result.structurePlan).toEqual(originalStructurePlan);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should force regenerate when forceRegenerate is true", async () => {
    await checkStructurePlan(
      { originalStructurePlan, forceRegenerate: true, docsDir: "./docs" },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should include user preferences", async () => {
    const mockRules = [{ rule: "Structure rule 1" }];
    mockPreferencesUtils.getActiveRulesForScope.mockImplementation(() => mockRules);

    await checkStructurePlan(
      { originalStructurePlan, feedback: "test", docsDir: "./docs" },
      mockOptions,
    );

    expect(mockPreferencesUtils.getActiveRulesForScope).toHaveBeenCalledWith("structure", []);
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should save project info when appropriate", async () => {
    mockOptions.context.invoke.mockImplementation(async () => ({
      structurePlan: originalStructurePlan,
      projectName: "New Project Name",
      projectDesc: "New Description",
    }));

    const result = await checkStructurePlan(
      { originalStructurePlan, feedback: "test", docsDir: "./docs" },
      mockOptions,
    );

    expect(mockUtils.saveValueToConfig).toHaveBeenCalledWith("projectName", "New Project Name");
    expect(result.projectInfoMessage).toContain("New Project Name");
  });

  test("should handle project info save errors", async () => {
    mockUtils.loadConfigFromFile.mockImplementation(async () => {
      throw new Error("Config load failed");
    });
    const consoleSpy = spyOn(console, "warn").mockImplementation(() => {});

    mockOptions.context.invoke.mockImplementation(async () => ({
      structurePlan: originalStructurePlan,
      projectName: "New Project",
      projectDesc: "New Description",
    }));

    const result = await checkStructurePlan(
      { originalStructurePlan, feedback: "test", docsDir: "./docs" },
      mockOptions,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result).toBeDefined();
    expect(consoleSpy).toHaveBeenCalled();
  });

  test("should return correct structure when no originalStructurePlan provided", async () => {
    const newStructurePlan = [{ path: "/new", title: "New Section" }];

    mockOptions.context.invoke.mockImplementation(async () => ({
      structurePlan: newStructurePlan,
    }));

    const result = await checkStructurePlan({ docsDir: "./docs" }, mockOptions);

    expect(result.structurePlan).toEqual(newStructurePlan);
    expect(result.originalStructurePlan).toEqual(newStructurePlan);
  });

  test("should clear feedback in result", async () => {
    const result = await checkStructurePlan(
      { originalStructurePlan, feedback: "some feedback", docsDir: "./docs" },
      mockOptions,
    );

    expect(result.feedback).toBe("");
  });

  test("should preserve structurePlanFeedback", async () => {
    const feedback = "user submitted feedback";

    const result = await checkStructurePlan(
      { originalStructurePlan, feedback, docsDir: "./docs" },
      mockOptions,
    );

    expect(result.structurePlanFeedback).toBe(feedback);
  });

  test("should pass through additional parameters", async () => {
    const additionalParams = {
      customParam1: "value1",
      customParam2: "value2",
    };

    await checkStructurePlan(
      {
        originalStructurePlan,
        feedback: "test",
        docsDir: "./docs",
        ...additionalParams,
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      mockOptions.context.agents.structurePlanner,
      expect.objectContaining(additionalParams),
    );
  });
});
