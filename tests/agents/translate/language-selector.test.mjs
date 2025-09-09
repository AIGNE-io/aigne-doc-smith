import { describe, expect, test } from "bun:test";
import languageSelector from "../../../agents/translate/language-selector.mjs";

describe("languageSelector", () => {
  test("should be a function", () => {
    expect(typeof languageSelector).toBe("function");
  });
});
