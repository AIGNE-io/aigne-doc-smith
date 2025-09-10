import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import checkDetail from "../../../agents/update/check-detail.mjs";
import * as checkDetailResultModule from "../../../agents/utils/check-detail-result.mjs";
import * as utils from "../../../utils/utils.mjs";

// Mock external/system dependencies
const mockFsPromises = {
  access: mock(() => Promise.resolve()),
  readFile: mock(() => Promise.resolve("# Test Content\n\nSome content")),
};

const mockTeamAgent = {
  from: mock(() => ({ mockTeamAgent: true })),
};

describe("checkDetail", () => {
  let mockOptions;

  // Spies for internal utils
  let hasSourceFilesChangedSpy;
  let checkDetailResultSpy;
  let consoleSpy;

  beforeEach(() => {
    mock.restore();

    // Apply mocks for external dependencies inside beforeEach
    mock.module("node:fs/promises", () => mockFsPromises);
    mock.module("@aigne/core", () => ({ TeamAgent: mockTeamAgent }));

    mockOptions = {
      context: {
        agents: {
          detailGeneratorAndTranslate: { mockAgent: true },
        },
        invoke: mock(async () => ({ mockResult: true })),
      },
    };

    // Set up spies for internal utils
    hasSourceFilesChangedSpy = spyOn(utils, "hasSourceFilesChanged").mockReturnValue(false);
    checkDetailResultSpy = spyOn(checkDetailResultModule, "default").mockResolvedValue({
      isApproved: true,
      detailFeedback: "",
    });
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});

    // Reset external mocks
    mockFsPromises.access.mockClear();
    mockFsPromises.access.mockImplementation(() => Promise.resolve());
    mockFsPromises.readFile.mockClear();
    mockFsPromises.readFile.mockImplementation(() =>
      Promise.resolve("# Test Content\n\nSome content"),
    );
    mockTeamAgent.from.mockClear();
    mockTeamAgent.from.mockImplementation(() => ({ mockTeamAgent: true }));

    // Clear context mock call history
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    hasSourceFilesChangedSpy?.mockRestore();
    checkDetailResultSpy?.mockRestore();
    consoleSpy?.mockRestore();

    // Critical: Restore all module mocks to prevent test pollution
    mock.restore();
  });

  // FILE EXISTENCE TESTS
  test("should return early when file exists and no changes detected", async () => {
    // File exists, no changes
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(result.detailGenerated).toBe(true);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should generate when file does not exist", async () => {
    // File doesn't exist
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalled();
    expect(result.path).toBe("/getting-started");
  });

  // SOURCE IDS CHANGE TESTS
  test("should regenerate when sourceIds have changed", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js", "file2.js"], // Different from original
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should regenerate when sourceIds count changed", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js", "file2.js", "file3.js"], // More files
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js", "file2.js"] }],
        structurePlan: [{ path: "/getting-started" }],
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should not regenerate when sourceIds are same (different order)", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file2.js", "file1.js"], // Same files, different order
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js", "file2.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(result.detailGenerated).toBe(true);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should handle missing originalStructurePlan gracefully", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: null,
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(result.detailGenerated).toBe(true);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  test("should handle missing original node in structure plan", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/different-path", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(result.detailGenerated).toBe(true);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });

  // SOURCE FILES CHANGE TESTS
  test("should regenerate when source files have changed", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });
    hasSourceFilesChangedSpy.mockReturnValue(true);

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: ["file1.js"],
      },
      mockOptions,
    );

    expect(hasSourceFilesChangedSpy).toHaveBeenCalledWith(["file1.js"], ["file1.js"]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Source files changed for /getting-started, will regenerate",
    );
    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  test("should not check source files when no sourceIds provided", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: [],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: ["file1.js"],
      },
      mockOptions,
    );

    expect(hasSourceFilesChangedSpy).not.toHaveBeenCalled();
    expect(result.detailGenerated).toBe(true);
  });

  test("should not check source files when no modifiedFiles provided", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: null,
      },
      mockOptions,
    );

    expect(hasSourceFilesChangedSpy).not.toHaveBeenCalled();
    expect(result.detailGenerated).toBe(true);
  });

  // CONTENT VALIDATION TESTS
  test("should regenerate when content validation fails", async () => {
    mockFsPromises.access.mockResolvedValue();
    mockFsPromises.readFile.mockResolvedValue("# Test Content");
    checkDetailResultSpy.mockResolvedValue({
      isApproved: false,
      detailFeedback: "Content needs improvement",
    });

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(checkDetailResultSpy).toHaveBeenCalledWith({
      structurePlan: [{ path: "/getting-started" }],
      reviewContent: "# Test Content",
      docsDir: "./docs",
    });
    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockTeamAgent: true },
      expect.objectContaining({
        detailFeedback: "Content needs improvement",
      }),
    );
  });

  test("should not validate content when file doesn't exist", async () => {
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        structurePlan: [{ path: "/getting-started" }],
      },
      mockOptions,
    );

    expect(checkDetailResultSpy).not.toHaveBeenCalled();
  });

  test("should not validate content when no structurePlan provided", async () => {
    mockFsPromises.access.mockResolvedValue();
    mockFsPromises.readFile.mockResolvedValue("# Test Content");

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: null,
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(checkDetailResultSpy).not.toHaveBeenCalled();
    expect(result.detailGenerated).toBe(true);
  });

  // FORCE REGENERATE TESTS
  test("should regenerate when forceRegenerate is true", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
        forceRegenerate: true,
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalled();
  });

  // TEAM AGENT TESTS
  test("should create team agent with correct configuration", async () => {
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
      },
      mockOptions,
    );

    expect(mockTeamAgent.from).toHaveBeenCalledWith({
      name: "generateDetail",
      skills: [{ mockAgent: true }],
    });
  });

  test("should invoke team agent with correct parameters", async () => {
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));

    await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started" }],
        structurePlan: [{ path: "/getting-started" }],
        customParam: "test",
      },
      mockOptions,
    );

    expect(mockOptions.context.invoke).toHaveBeenCalledWith(
      { mockTeamAgent: true },
      expect.objectContaining({
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started" }],
        structurePlan: [{ path: "/getting-started" }],
        customParam: "test",
        detailFeedback: "",
      }),
    );
  });

  // PATH PROCESSING TESTS
  test("should handle root path correctly", async () => {
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));

    await checkDetail(
      {
        path: "/",
        docsDir: "./docs",
      },
      mockOptions,
    );

    // Root path "/" -> flatName "" -> fileFullName ".md"
    expect(mockFsPromises.access).toHaveBeenCalledWith(expect.stringMatching(/\.md$/));
  });

  test("should handle nested path correctly", async () => {
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));

    await checkDetail(
      {
        path: "/api/users/create",
        docsDir: "./docs",
      },
      mockOptions,
    );

    // "/api/users/create" -> flatName "api-users-create" -> fileFullName "api-users-create.md"
    expect(mockFsPromises.access).toHaveBeenCalledWith(
      expect.stringMatching(/api-users-create\.md$/),
    );
  });

  // RESULT STRUCTURE TESTS
  test("should return correct result structure when regenerating", async () => {
    mockFsPromises.access.mockRejectedValue(new Error("File not found"));
    mockOptions.context.invoke.mockResolvedValue({ generatedContent: "test" });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        customParam: "test",
      },
      mockOptions,
    );

    expect(result).toEqual({
      path: "/getting-started",
      docsDir: "./docs",
      customParam: "test",
      result: { generatedContent: "test" },
    });
  });

  test("should return correct result structure when not regenerating", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
        customParam: "test",
      },
      mockOptions,
    );

    expect(result).toEqual({
      path: "/getting-started",
      docsDir: "./docs",
      customParam: "test",
      detailGenerated: true,
    });
  });

  // EDGE CASES
  test("should handle file read errors gracefully", async () => {
    mockFsPromises.access.mockResolvedValue();
    mockFsPromises.readFile.mockRejectedValue(new Error("Read error"));

    // When file read fails, content validation is skipped, and since file exists
    // but can't be read properly, no early return occurs, so regeneration happens
    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: ["file1.js"],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: ["file1.js"] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    // When file read fails, no content validation happens, and since no early return
    // condition is met, the function should proceed to regeneration
    expect(result.result).toBeDefined();
    expect(mockOptions.context.invoke).toHaveBeenCalled();
    expect(checkDetailResultSpy).not.toHaveBeenCalled();
  });

  test("should handle empty sourceIds arrays", async () => {
    mockFsPromises.access.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDetail(
      {
        path: "/getting-started",
        docsDir: "./docs",
        sourceIds: [],
        originalStructurePlan: [{ path: "/getting-started", sourceIds: [] }],
        structurePlan: [{ path: "/getting-started" }],
        modifiedFiles: [],
      },
      mockOptions,
    );

    expect(result.detailGenerated).toBe(true);
    expect(mockOptions.context.invoke).not.toHaveBeenCalled();
  });
});
