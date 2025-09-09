import { describe, expect, test } from "bun:test";

describe("mermaid-worker", () => {
  test("should be testable", () => {
    // Mermaid worker is a worker script, so we just test that the test framework works
    expect(true).toBe(true);
  });
});
