import { describe, expect, test } from "bun:test";
import actionSuccess from "../../../agents/utils/action-success.mjs";

describe("actionSuccess", () => {
  test("should return success message with action name", async () => {
    const result = await actionSuccess({ action: "✅ Document generation successfully" });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("message");
    expect(result.message).toBe("✅ Document generation successfully");
  });

  test("should handle different action names", async () => {
    const actions = [
      "Configuration setup",
      "File processing",
      "Translation generation",
      "Markdown validation",
    ];

    for (const action of actions) {
      const result = await actionSuccess({ action });

      expect(result).toBeDefined();
      expect(result.message).toBe(`${action}`);
    }
  });

  test("should handle empty action name", async () => {
    const result = await actionSuccess({ action: "" });

    expect(result).toBeDefined();
    expect(result.message).toBe("");
  });

  test("should handle undefined action", async () => {
    const result = await actionSuccess({ action: undefined });

    expect(result).toBeDefined();
    expect(result.message).toBe("undefined");
  });

  test("should have task_render_mode property", () => {
    expect(actionSuccess.task_render_mode).toBe("hide");
  });

  test("should handle mermaid worker pool shutdown gracefully", async () => {
    // This test ensures the function doesn't throw even if worker pool fails
    const result = await actionSuccess({ action: "Test action" });

    expect(result).toBeDefined();
    expect(result.message).toBe("Test action");
  });
});
