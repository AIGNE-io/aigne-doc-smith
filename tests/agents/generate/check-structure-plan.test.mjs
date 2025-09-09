import { describe, expect, test } from "bun:test";
import checkStructurePlan from "../../../agents/generate/check-structure-plan.mjs";

describe("checkStructurePlan", () => {
  test("should return original structure plan when no regeneration needed", async () => {
    const originalStructurePlan = [
      { path: "/getting-started", title: "Getting Started" },
      { path: "/api", title: "API Reference" },
    ];

    const mockOptions = {
      prompts: {
        input: async () => "",
      },
      context: {
        agents: { structurePlanner: {} },
        invoke: async () => ({ structurePlan: originalStructurePlan }),
      },
    };

    const result = await checkStructurePlan(
      { originalStructurePlan, docsDir: "./docs" },
      mockOptions,
    );

    expect(result).toBeDefined();
    expect(result.structurePlan).toEqual(originalStructurePlan);
  });
});
