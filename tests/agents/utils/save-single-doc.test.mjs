import { describe, expect, test } from "bun:test";
import saveSingleDoc from "../../../agents/utils/save-single-doc.mjs";

describe("saveSingleDoc", () => {
  test("should be a function", () => {
    expect(typeof saveSingleDoc).toBe("function");
  });
});
