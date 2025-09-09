import { describe, expect, test } from "bun:test";
import checkDetail from "../../../agents/update/check-detail.mjs";

describe("checkDetail", () => {
  test("should be a function", () => {
    expect(typeof checkDetail).toBe("function");
  });
});
