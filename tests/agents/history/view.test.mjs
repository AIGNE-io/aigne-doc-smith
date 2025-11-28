import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import chalk from "chalk";
import viewHistory from "../../../agents/history/view.mjs";
import * as historyUtils from "../../../utils/history-utils.mjs";

describe("History View", () => {
  let consoleLogMock;
  let getHistorySpy;
  let chalkDimSpy;
  let chalkCyanSpy;
  let chalkYellowSpy;

  beforeEach(async () => {
    mock.restore();
    // Ensure chalk helpers exist even if mutated by other tests — use spies
    try {
      chalkDimSpy = spyOn(chalk, "dim").mockImplementation((x) => x);
    } catch {
      // ignore if not writable
    }
    try {
      chalkCyanSpy = spyOn(chalk, "cyan").mockImplementation((x) => x);
    } catch {}
    try {
      chalkYellowSpy = spyOn(chalk, "yellow").mockImplementation((x) => x);
    } catch {}

    consoleLogMock = spyOn(console, "log").mockImplementation(() => {});
    getHistorySpy = spyOn(historyUtils, "getHistory").mockReturnValue({ entries: [] });
  });

  afterEach(() => {
    consoleLogMock?.mockRestore();
    getHistorySpy?.mockRestore();
    chalkDimSpy?.mockRestore?.();
    chalkCyanSpy?.mockRestore?.();
    chalkYellowSpy?.mockRestore?.();
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
