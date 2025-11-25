import { afterEach, beforeEach, describe, expect, test, mock, spyOn } from "bun:test";
import chalk from "chalk";
import viewHistory from "../../../agents/history/view.mjs";
import * as historyUtils from "../../../utils/history-utils.mjs";

describe("History View", () => {
  let consoleLogMock;
  let getHistorySpy;

  beforeEach(async () => {
    mock.restore();
    // Ensure chalk helpers exist even if mutated by other tests
    chalk.dim = chalk.dim || ((x) => x);
    chalk.cyan = chalk.cyan || ((x) => x);
    chalk.yellow = chalk.yellow || ((x) => x);

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
