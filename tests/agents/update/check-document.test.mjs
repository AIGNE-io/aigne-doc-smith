import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as fsPromises from "node:fs/promises";
import * as aigneCore from "@aigne/core";
import checkDocument from "../../../agents/update/check-document.mjs";
import * as checkDetailResultModule from "../../../agents/utils/check-detail-result.mjs";
import * as utils from "../../../utils/utils.mjs";

describe("check-document", () => {
  let mockOptions;

  // Spies for external dependencies
  let teamAgentFromSpy;

  // Spies for internal utils and fs operations
  let hasSourceFilesChangedSpy;
  let checkDetailResultSpy;
  let consoleSpy;
  let accessSpy;
  let readFileSpy;

  beforeEach(() => {
    // Set up spy for external dependencies
    teamAgentFromSpy = spyOn(aigneCore.TeamAgent, "from").mockReturnValue({ mockTeamAgent: true });

    mockOptions = {
      context: {
        agents: {
          generateAndTranslateDocument: { mockAgent: true },
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

    // Use spyOn for fs operations instead of module mocking
    accessSpy = spyOn(fsPromises, "access").mockResolvedValue(undefined);
    readFileSpy = spyOn(fsPromises, "readFile").mockResolvedValue("# Test Content\n\nSome content");

    // Clear context mock call history
    mockOptions.context.invoke.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    teamAgentFromSpy?.mockRestore();
    hasSourceFilesChangedSpy?.mockRestore();
    checkDetailResultSpy?.mockRestore();
    consoleSpy?.mockRestore();
    accessSpy?.mockRestore();
    readFileSpy?.mockRestore();
  });

  // FILE EXISTENCE TESTS
  test("should return early when file exists and no changes detected", async () => {
    // File exists, no changes
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockRejectedValue(new Error("File not found"));

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });
    hasSourceFilesChangedSpy.mockReturnValue(true);

    await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    readFileSpy.mockResolvedValue("# Test Content");
    checkDetailResultSpy.mockResolvedValue({
      isApproved: false,
      detailFeedback: "Content needs improvement",
    });

    await checkDocument(
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
    accessSpy.mockRejectedValue(new Error("File not found"));

    await checkDocument(
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
    accessSpy.mockResolvedValue();
    readFileSpy.mockResolvedValue("# Test Content");

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    await checkDocument(
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
    accessSpy.mockRejectedValue(new Error("File not found"));

    await checkDocument(
      {
        path: "/getting-started",
        docsDir: "./docs",
      },
      mockOptions,
    );

    expect(teamAgentFromSpy).toHaveBeenCalledWith({
      name: "generateDetail",
      skills: [{ mockAgent: true }],
    });
  });

  test("should invoke team agent with correct parameters", async () => {
    accessSpy.mockRejectedValue(new Error("File not found"));

    await checkDocument(
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
    accessSpy.mockRejectedValue(new Error("File not found"));

    await checkDocument(
      {
        path: "/",
        docsDir: "./docs",
      },
      mockOptions,
    );

    // Root path "/" -> flatName "" -> fileFullName ".md"
    expect(accessSpy).toHaveBeenCalledWith(expect.stringMatching(/\.md$/));
  });

  test("should handle nested path correctly", async () => {
    accessSpy.mockRejectedValue(new Error("File not found"));

    await checkDocument(
      {
        path: "/api/users/create",
        docsDir: "./docs",
      },
      mockOptions,
    );

    // "/api/users/create" -> flatName "api-users-create" -> fileFullName "api-users-create.md"
    expect(accessSpy).toHaveBeenCalledWith(expect.stringMatching(/api-users-create\.md$/));
  });

  // RESULT STRUCTURE TESTS
  test("should return correct result structure when regenerating", async () => {
    accessSpy.mockRejectedValue(new Error("File not found"));
    mockOptions.context.invoke.mockResolvedValue({ generatedContent: "test" });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    readFileSpy.mockRejectedValue(new Error("Read error"));

    // When file read fails, content validation is skipped, and since file exists
    // but can't be read properly, no early return occurs, so regeneration happens
    const result = await checkDocument(
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
    accessSpy.mockResolvedValue();
    checkDetailResultSpy.mockResolvedValue({ isApproved: true });

    const result = await checkDocument(
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
