import { describe, expect, test } from "bun:test";
import { normalizePath } from "../../utils/utils.mjs";

describe("utils", () => {
  test("should normalize relative path to absolute path", () => {
    const result = normalizePath("./test");

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.startsWith("/")).toBe(true);
  });
});
