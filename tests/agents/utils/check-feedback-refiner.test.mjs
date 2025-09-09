import { describe, expect, test } from "bun:test";
import checkFeedbackRefiner from "../../../agents/utils/check-feedback-refiner.mjs";

describe("checkFeedbackRefiner", () => {
  test("should be a function", () => {
    expect(typeof checkFeedbackRefiner).toBe("function");
  });
});
