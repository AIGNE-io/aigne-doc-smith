import { describe, expect, test } from "bun:test";
import * as docsFinderUtils from "../../utils/docs-finder-utils.mjs";

describe("docs-finder-utils", () => {
  test("should export docs finder utility functions", () => {
    expect(typeof docsFinderUtils).toBe("object");
  });
});
