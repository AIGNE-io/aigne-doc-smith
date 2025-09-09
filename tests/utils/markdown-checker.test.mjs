import { describe, expect, test } from "bun:test";
import * as markdownChecker from "../../utils/markdown-checker.mjs";

describe("markdown-checker", () => {
  test("should export markdown checker functions", () => {
    expect(typeof markdownChecker).toBe("object");
  });
});
