import { describe, expect, test } from "bun:test";
import publishDocs from "../../../agents/publish/publish-docs.mjs";

describe("publishDocs", () => {
  test("should be a function", () => {
    expect(typeof publishDocs).toBe("function");
  });
});
