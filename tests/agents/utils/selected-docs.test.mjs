import { describe, expect, test } from "bun:test";
import selectedDocs from "../../../agents/utils/selected-docs.mjs";

describe("selectedDocs", () => {
  test("should be a function", () => {
    expect(typeof selectedDocs).toBe("function");
  });
});
