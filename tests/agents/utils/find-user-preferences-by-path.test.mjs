import { describe, expect, test } from "bun:test";
import findUserPreferencesByPath from "../../../agents/utils/find-user-preferences-by-path.mjs";

describe("findUserPreferencesByPath", () => {
  test("should be a function", () => {
    expect(typeof findUserPreferencesByPath).toBe("function");
  });
});
