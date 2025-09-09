import { describe, expect, test } from "bun:test";
import formatStructurePlan from "../../../agents/utils/format-structure-plan.mjs";

describe("formatStructurePlan", () => {
  test("should be a function", () => {
    expect(typeof formatStructurePlan).toBe("function");
  });
});
