import { describe, expect, test } from "bun:test";
import { shutdownMermaidWorkerPool } from "../../utils/mermaid-worker-pool.mjs";

describe("mermaid-worker-pool", () => {
  test("should export shutdownMermaidWorkerPool function", () => {
    expect(typeof shutdownMermaidWorkerPool).toBe("function");
  });
});
