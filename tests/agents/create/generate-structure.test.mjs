import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { loadAgent } from "@aigne/core/loader/index.js";
import { loadModel } from "../../utils/mock-chat-model.mjs";

describe("generateStructure Agent", () => {
  beforeAll(() => {
    process.env.AIGNE_OBSERVABILITY_DISABLED = "true";
  });

  afterAll(() => {
    delete process.env.AIGNE_OBSERVABILITY_DISABLED;
  });

  const afsOptions = {
    afs: {
      availableModules: [{ module: "system-fs", create: () => ({}), options: {} }],
    },
  };

  test("should load agent correctly with proper configuration", async () => {
    const agent = await loadAgent(
      join(import.meta.dirname, "../../../agents/create/generate-structure.yaml"),
      {
        model: loadModel,
        ...afsOptions,
      },
    );

    expect(agent).toBeDefined();
    expect(agent.name).toBe("generateStructure");
    expect(agent.skills?.length).toBeGreaterThan(0);
  });

  test("should have instructions loaded from file", async () => {
    const agent = await loadAgent(
      join(import.meta.dirname, "../../../agents/create/generate-structure.yaml"),
      {
        model: loadModel,
        ...afsOptions,
      },
    );

    expect(agent).toBeDefined();

    // Verify instructions are loaded on worker ai skill
    const aiSkill = agent?.skills?.[0]?.skills?.[0];
    expect(aiSkill?.instructions).toBeDefined();
    const instructions = await aiSkill.instructions.build({});
    expect(instructions.messages).toBeDefined();
    expect(instructions.messages.length).toBeGreaterThan(0);
  });
});
