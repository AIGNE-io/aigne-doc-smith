import { describe, expect, test } from "bun:test";
import exit from "../../../agents/utils/exit.mjs";

describe("exit", () => {
  test("should be a function", () => {
    expect(typeof exit).toBe("function");
  });
});
