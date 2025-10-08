import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DOC_SMITH_DIR } from "../../utils/constants/index.mjs";
import { getHistory, isGitAvailable, recordUpdate } from "../../utils/history-utils.mjs";

const TEST_DIR = join(process.cwd(), `${DOC_SMITH_DIR}-test`);
const ORIGINAL_CWD = process.cwd();

describe("History Utils - Unified", () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });

    // Change to test directory
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    // Restore original directory
    process.chdir(ORIGINAL_CWD);

    // Clean up
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  test("detects git availability", () => {
    const hasGit = isGitAvailable();
    expect(typeof hasGit).toBe("boolean");
  });

  test("skips recording on empty feedback", () => {
    recordUpdate({ operation: "document_update", feedback: "" });
    const history = getHistory();
    expect(history.entries.length).toBe(0);
  });

  test("skips recording on whitespace-only feedback", () => {
    recordUpdate({ operation: "document_update", feedback: "   " });
    const history = getHistory();
    expect(history.entries.length).toBe(0);
  });

  test("records update in YAML", () => {
    recordUpdate({
      operation: "structure_update",
      feedback: "Test feedback",
    });

    const history = getHistory();
    expect(history.entries.length).toBe(1);
    expect(history.entries[0].feedback).toBe("Test feedback");
    expect(history.entries[0].operation).toBe("structure_update");
    expect(history.entries[0].timestamp).toBeDefined();
  });

  test("records document path when provided as string", () => {
    recordUpdate({
      operation: "document_update",
      feedback: "Update document",
      documentPath: "/getting-started",
    });

    const history = getHistory();
    expect(history.entries.length).toBe(1);
    expect(history.entries[0].documentPath).toBe("/getting-started");
  });

  test("records single document path for each update", () => {
    recordUpdate({
      operation: "document_update",
      feedback: "Update single document",
      documentPath: "/getting-started",
    });

    const history = getHistory();
    expect(history.entries.length).toBe(1);
    expect(history.entries[0].feedback).toBe("Update single document");
    expect(history.entries[0].documentPath).toBe("/getting-started");
  });

  test("does not include documentPath field when documentPath is null", () => {
    recordUpdate({
      operation: "structure_update",
      feedback: "Update structure",
      documentPath: null,
    });

    const history = getHistory();
    expect(history.entries.length).toBe(1);
    expect(history.entries[0].documentPath).toBeUndefined();
  });

  test("maintains chronological order (newest first)", () => {
    recordUpdate({ operation: "structure_update", feedback: "First" });
    // Small delay to ensure different timestamps
    const now = Date.now();
    while (Date.now() === now) {
      // Wait for next millisecond
    }
    recordUpdate({ operation: "document_update", feedback: "Second" });

    const history = getHistory();
    expect(history.entries.length).toBe(2);
    expect(history.entries[0].feedback).toBe("Second");
    expect(history.entries[1].feedback).toBe("First");
  });

  test("handles multiple updates", () => {
    recordUpdate({ operation: "structure_update", feedback: "Update 1" });
    recordUpdate({ operation: "document_update", feedback: "Update 2", documentPath: "/home" });
    recordUpdate({ operation: "document_update", feedback: "Update 3", documentPath: "/about" });
    recordUpdate({
      operation: "translation_update",
      feedback: "Update 4",
      documentPath: "/api",
    });

    const history = getHistory();
    expect(history.entries.length).toBe(4);
    expect(history.entries[0].feedback).toBe("Update 4");
    expect(history.entries[0].documentPath).toBe("/api");
    expect(history.entries[1].feedback).toBe("Update 3");
    expect(history.entries[1].documentPath).toBe("/about");
    expect(history.entries[2].feedback).toBe("Update 2");
    expect(history.entries[2].documentPath).toBe("/home");
    expect(history.entries[3].feedback).toBe("Update 1");
  });

  test("returns empty history when file does not exist", () => {
    const history = getHistory();
    expect(history.entries).toBeDefined();
    expect(history.entries.length).toBe(0);
  });

  test("handles corrupted history file gracefully", () => {
    // Create corrupted YAML file
    const historyPath = join(process.cwd(), DOC_SMITH_DIR, "history.yaml");
    mkdirSync(join(process.cwd(), DOC_SMITH_DIR), { recursive: true });
    writeFileSync(historyPath, "invalid: yaml: content: [[[", "utf8");

    const history = getHistory();
    expect(history.entries).toBeDefined();
    expect(history.entries.length).toBe(0);
  });

  test(`creates ${DOC_SMITH_DIR} directory if not exists`, () => {
    recordUpdate({
      operation: "document_update",
      feedback: "Test",
    });

    const docSmithDir = join(process.cwd(), DOC_SMITH_DIR);
    expect(existsSync(docSmithDir)).toBe(true);
  });

  test("timestamp is in ISO 8601 format", () => {
    recordUpdate({
      operation: "structure_update",
      feedback: "Test timestamp",
    });

    const history = getHistory();
    const timestamp = history.entries[0].timestamp;

    // Validate ISO 8601 format
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    // Validate it's a valid date
    const date = new Date(timestamp);
    expect(date.toISOString()).toBe(timestamp);
  });
});
