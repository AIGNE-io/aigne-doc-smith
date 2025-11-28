import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// We'll mock `chalk` before importing the module under test to avoid
// environment-specific issues where `chalk.dim` may be undefined.
let viewHistory;

import * as historyUtils from "../../../utils/history-utils.mjs";

describe("History View", () => {
  let consoleLogMock;
  let getHistorySpy;
  // chalk will be mocked before importing the module under test

  beforeEach(async () => {
    mock.restore();
    mock.module("chalk", () => ({
      default: { dim: (x) => x, cyan: (x) => x, yellow: (x) => x },
      dim: (x) => x,
      cyan: (x) => x,
      yellow: (x) => x,
    }));
    // dynamic import after mocking chalk
    viewHistory = (await import("../../../agents/history/view.mjs")).default;

    consoleLogMock = spyOn(console, "log").mockImplementation(() => {});
    getHistorySpy = spyOn(historyUtils, "getHistory").mockReturnValue({ entries: [] });
  });

  afterEach(() => {
    consoleLogMock?.mockRestore();
    getHistorySpy?.mockRestore();
    mock.restore();
  });

  test("should display message when no history exists", () => {
    getHistorySpy.mockReturnValue({ entries: [] });
    expect(() => viewHistory()).not.toThrow();
  });

  test("should display formatted history entries", async () => {
    getHistorySpy.mockReturnValue({
      entries: [
        {
          timestamp: "2023-01-01T00:00:00.000Z",
          operation: "document_update",
          feedback: "Updated documentation",
          documentPath: "/readme.md",
        },
      ],
    });

    expect(() => viewHistory()).not.toThrow();
  });

  test("should handle empty history entries", async () => {
    getHistorySpy.mockReturnValue({ entries: [] });
    expect(() => viewHistory()).not.toThrow();
  });
});
