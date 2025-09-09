import { describe, expect, test } from "bun:test";
import transformDetailDatasources from "../../../agents/utils/transform-detail-datasources.mjs";

describe("transformDetailDatasources", () => {
  test("should be a function", () => {
    expect(typeof transformDetailDatasources).toBe("function");
  });
});
