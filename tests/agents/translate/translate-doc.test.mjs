import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { AIAgent, AIGNE } from "@aigne/core";
import { loadModel } from "../../utils/mock-chat-model.mjs";

describe("translateDoc Agent", () => {
  beforeAll(() => {
    process.env.AIGNE_OBSERVABILITY_DISABLED = "true";
  });

  afterAll(() => {
    delete process.env.AIGNE_OBSERVABILITY_DISABLED;
  });
  test("should load agent correctly with proper configuration", async () => {
    const aigne = await AIGNE.load(join(import.meta.dirname, "../../.."), {
      model: loadModel,
    });

    expect(aigne).toBeDefined();
    expect(aigne.agents.length).toBeGreaterThan(0);

    // Get the translateDoc agent by name
    const agent = aigne.agents.find((a) => a.name === "translateDoc");

    // Verify agent exists and is correct type
    expect(agent).toBeDefined();
    expect(agent).toBeInstanceOf(AIAgent);
    expect(agent.name).toBe("translateDoc");
  });

  test("should have instructions loaded from file", async () => {
    const aigne = await AIGNE.load(join(import.meta.dirname, "../../.."), {
      model: loadModel,
    });

    const agent = aigne.agents.find((a) => a.name === "translateDoc");
    expect(agent).toBeDefined();

    // Verify instructions are loaded
    expect(agent.instructions).toBeDefined();
    const instructions = await agent.instructions.build({});
    expect(instructions.messages).toBeDefined();
    expect(instructions.messages.length).toBeGreaterThan(0);

    // The instructions should contain content from the prompt file
    const systemMessage = instructions.messages.find((m) => m.role === "system");
    expect(systemMessage).toBeDefined();
  });
});
