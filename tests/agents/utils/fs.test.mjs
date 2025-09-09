import { describe, expect, test } from "bun:test";
import fs from "../../../agents/utils/fs.mjs";

describe("fs", () => {
  test("should be a function", () => {
    expect(typeof fs).toBe("function");
  });
});
