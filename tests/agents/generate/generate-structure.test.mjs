import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { AIAgent } from "@aigne/core";
import { loadAgent } from "@aigne/core/loader/index.js";
import { loadModel } from "../../utils/mock-chat-model.mjs";

describe("generateStructure Agent", () => {
  beforeAll(() => {
    process.env.AIGNE_OBSERVABILITY_DISABLED = "true";
  });

  afterAll(() => {
    delete process.env.AIGNE_OBSERVABILITY_DISABLED;
  });
  test("should load agent correctly with proper configuration", async () => {
    const agent = await loadAgent(
      join(import.meta.dirname, "../../../agents/generate/generate-structure.yaml"),
      {
        model: loadModel,
      },
    );

    expect(agent).toBeDefined();

    // Verify agent exists and is correct type
    expect(agent).toBeDefined();
    expect(agent).toBeInstanceOf(AIAgent);
  });

  test("should have instructions loaded from file", async () => {
    const agent = await loadAgent(
      join(import.meta.dirname, "../../../agents/generate/generate-structure.yaml"),
      {
        model: loadModel,
      },
    );

    expect(agent).toBeDefined();

    // Verify instructions are loaded
    expect(agent.instructions).toBeDefined();
    const instructions = await agent.instructions.build({});
    expect(instructions.messages).toBeDefined();
  });
});
