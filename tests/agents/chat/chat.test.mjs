import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { AIAgent } from "@aigne/core";
import { loadAgent } from "@aigne/core/loader/index.js";
import { loadModel } from "../../utils/mock-chat-model.mjs";

describe("chat Agent", () => {
  beforeAll(() => {
    process.env.AIGNE_OBSERVABILITY_DISABLED = "true";
  });

  afterAll(() => {
    delete process.env.AIGNE_OBSERVABILITY_DISABLED;
  });
  test("should load agent correctly with proper configuration", async () => {
    const agent = await loadAgent(join(import.meta.dirname, "../../../agents/chat/index.yaml"), {
      model: loadModel,
    });

    expect(agent).toBeDefined();

    // Verify agent exists and is correct type
    expect(agent).toBeDefined();
    expect(agent).toBeInstanceOf(AIAgent);
    expect(agent.name).toBe("chat");
  });

  test("should have instructions loaded correctly", async () => {
    const agent = await loadAgent(join(import.meta.dirname, "../../../agents/chat/index.yaml"), {
      model: loadModel,
    });

    expect(agent).toBeDefined();

    // Verify instructions are loaded
    expect(agent.instructions).toBeDefined();
    const instructions = await agent.instructions.build({});
    expect(instructions.messages).toBeDefined();
    expect(instructions.messages.length).toBeGreaterThan(0);

    // The instructions should contain content from the inline instructions
    const systemMessage = instructions.messages.find((m) => m.role === "system");
    expect(systemMessage).toBeDefined();
    expect(systemMessage.content).toContain("document generation assistant");
  });
});
