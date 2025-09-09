import { describe, expect, test } from "bun:test";
import saveOutput from "../../../agents/utils/save-output.mjs";

describe("saveOutput", () => {
  test("should be a function", () => {
    expect(typeof saveOutput).toBe("function");
  });
});
