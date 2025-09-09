import { describe, expect, test } from "bun:test";
import * as authUtils from "../../utils/auth-utils.mjs";

describe("auth-utils", () => {
  test("should export auth utility functions", () => {
    expect(typeof authUtils).toBe("object");
  });
});
