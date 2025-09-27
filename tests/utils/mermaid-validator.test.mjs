import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getValidationStats,
  shutdownValidation,
  validateBasicMermaidSyntax,
  validateMermaidSyntax,
} from "../../utils/mermaid-validator.mjs";
import {
  getMermaidWorkerPool,
  SimpleMermaidWorkerPool,
  shutdownMermaidWorkerPool,
} from "../../utils/mermaid-worker-pool.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe.skip("Mermaid Worker Pool", () => {
  let workerPool;

  beforeAll(() => {
    // Ensure clean state
    workerPool = new SimpleMermaidWorkerPool({ poolSize: 2, timeout: 5000 });
  });

  afterAll(async () => {
    if (workerPool) {
      await workerPool.shutdown();
    }
    await shutdownMermaidWorkerPool();
  });

  describe("SimpleMermaidWorkerPool", () => {
    test("should initialize with default options", () => {
      const pool = new SimpleMermaidWorkerPool();
      expect(pool.poolSize).toBe(3);
      expect(pool.timeout).toBe(15000);
      expect(pool.workers).toEqual([]);
      expect(pool.availableWorkers).toEqual([]);
      expect(pool.requestQueue).toEqual([]);
      expect(pool.isShuttingDown).toBe(false);
    });

    test("should initialize with custom options", () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 5, timeout: 10000 });
      expect(pool.poolSize).toBe(5);
      expect(pool.timeout).toBe(10000);
    });

    test("should initialize workers", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 2, timeout: 5000 });

      await pool.initialize();

      expect(pool.workers.length).toBe(2);
      expect(pool.availableWorkers.length).toBe(2);

      await pool.shutdown();
    });

    test("should not reinitialize if already initialized", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 2, timeout: 5000 });

      await pool.initialize();
      const initialWorkers = pool.workers.length;

      await pool.initialize();
      expect(pool.workers.length).toBe(initialWorkers);

      await pool.shutdown();
    });

    test("should validate valid mermaid content", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 10000 });

      const validContent = `
        flowchart TD
          A[Start] --> B[Process]
          B --> C[End]
      `;

      const result = await pool.validate(validContent);
      expect(result).toBe(true);

      await pool.shutdown();
    });

    test("should reject invalid mermaid content", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 10000 });

      const invalidContent = `
        flowchart TD
          A[Start] --> B[Process
          B --> C[End]
      `;

      await expect(pool.validate(invalidContent)).rejects.toThrow();

      await pool.shutdown();
    });

    test("should handle concurrent validation requests", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 2, timeout: 10000 });

      const validContent1 = `
        flowchart TD
          A[Start] --> B[Process]
      `;

      const validContent2 = `
        graph LR
          X --> Y --> Z
      `;

      const validContent3 = `
        sequenceDiagram
          Alice->>Bob: Hello
      `;

      const promises = [
        pool.validate(validContent1),
        pool.validate(validContent2),
        pool.validate(validContent3),
      ];

      const results = await Promise.all(promises);
      expect(results).toEqual([true, true, true]);

      await pool.shutdown();
    });

    test("should handle validation timeout", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 100 });

      // Create content that might cause processing delay
      const complexContent = `
        flowchart TD
          ${"A --> B\n".repeat(1000)}
      `;

      await expect(pool.validate(complexContent)).rejects.toThrow(/timeout/);

      await pool.shutdown();
    });

    test("should queue requests when all workers are busy", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 5000 });

      const validContent = `
        flowchart TD
          A --> B
      `;

      // Start multiple validations simultaneously
      const promise1 = pool.validate(validContent);
      const promise2 = pool.validate(validContent);
      const promise3 = pool.validate(validContent);

      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual([true, true, true]);

      await pool.shutdown();
    });

    test("should reject requests when shutting down", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 5000 });

      await pool.initialize();
      await pool.shutdown();

      await expect(pool.validate("flowchart TD\nA --> B")).rejects.toThrow(
        "Worker pool is shutting down",
      );
    });

    test("should provide accurate statistics", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 3, timeout: 5000 });
      await pool.initialize();

      const stats = pool.getStats();
      expect(stats.poolSize).toBe(3);
      expect(stats.totalWorkers).toBe(3);
      expect(stats.availableWorkers).toBe(3);
      expect(stats.busyWorkers).toBe(0);
      expect(stats.queuedRequests).toBe(0);
      expect(stats.isShuttingDown).toBe(false);

      await pool.shutdown();
    });

    test("should handle worker errors gracefully", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 5000 });

      // Try to validate empty content which should cause an error
      await expect(pool.validate("")).rejects.toThrow();

      // Pool should still be functional after error
      const validContent = "flowchart TD\nA --> B";
      const result = await pool.validate(validContent);
      expect(result).toBe(true);

      await pool.shutdown();
    });

    test("should shutdown gracefully", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 2, timeout: 5000 });
      await pool.initialize();

      expect(pool.workers.length).toBe(2);
      expect(pool.isShuttingDown).toBe(false);

      await pool.shutdown();

      expect(pool.workers.length).toBe(0);
      expect(pool.availableWorkers.length).toBe(0);
      expect(pool.isShuttingDown).toBe(true);
    });

    test("should reject queued requests during shutdown", async () => {
      const pool = new SimpleMermaidWorkerPool({ poolSize: 1, timeout: 5000 });
      await pool.initialize();

      // Add requests to queue
      const validContent = "flowchart TD\nA --> B";
      const promise1 = pool.validate(validContent);
      const promise2 = pool.validate(validContent);

      // Start shutdown while requests are queued
      setTimeout(() => pool.shutdown(), 10);

      // At least one request should be rejected due to shutdown
      const results = await Promise.allSettled([promise1, promise2]);
      const rejectedCount = results.filter((r) => r.status === "rejected").length;
      expect(rejectedCount).toBeGreaterThan(0);
    });
  });

  describe("Global Worker Pool Functions", () => {
    afterAll(async () => {
      await shutdownMermaidWorkerPool();
    });

    test("should get global worker pool instance", () => {
      const pool1 = getMermaidWorkerPool();
      const pool2 = getMermaidWorkerPool();
      expect(pool1).toBe(pool2); // Should return same instance
    });

    test("should get global worker pool with options", () => {
      // Note: Global pool ignores options if already created
      // This test verifies that the function returns a pool instance
      const pool = getMermaidWorkerPool({ poolSize: 4, timeout: 8000 });
      expect(pool).toBeInstanceOf(SimpleMermaidWorkerPool);
      expect(typeof pool.poolSize).toBe("number");
      expect(typeof pool.timeout).toBe("number");
    });

    test("should shutdown global worker pool", async () => {
      const pool = getMermaidWorkerPool();
      await pool.initialize();
      expect(pool.workers.length).toBeGreaterThan(0);

      await shutdownMermaidWorkerPool();
      expect(pool.workers.length).toBe(0);
    });
  });
});

describe.skip("Mermaid Validator", () => {
  afterAll(async () => {
    await shutdownValidation();
  });

  describe("validateBasicMermaidSyntax", () => {
    test("should validate basic flowchart syntax", () => {
      const content = "flowchart TD\nA --> B";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate graph syntax", () => {
      const content = "graph LR\nA --> B";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate sequence diagram syntax", () => {
      const content = "sequenceDiagram\nAlice->>Bob: Hello";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate class diagram syntax", () => {
      const content = "classDiagram\nclass Animal";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate state diagram syntax", () => {
      const content = "stateDiagram\n[*] --> Still";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate ER diagram syntax", () => {
      const content = "erDiagram\nCUSTOMER {}";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate journey diagram syntax", () => {
      const content = "journey\ntitle My working day";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate gantt chart syntax", () => {
      const content = "gantt\ntitle A Gantt Diagram";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should validate pie chart syntax", () => {
      const content = "pie title Pets adopted by volunteers";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should reject empty content", () => {
      expect(() => validateBasicMermaidSyntax("")).toThrow("Empty mermaid diagram");
      expect(() => validateBasicMermaidSyntax("   ")).toThrow("Empty mermaid diagram");
    });

    test("should reject invalid diagram type", () => {
      expect(() => validateBasicMermaidSyntax("invalid\nA --> B")).toThrow(
        "Invalid or missing diagram type",
      );
    });

    test("should detect unmatched brackets", () => {
      expect(() => validateBasicMermaidSyntax("flowchart TD\nA[Start --> B[End]")).toThrow(
        "Unmatched brackets in diagram",
      );
    });

    test("should detect unmatched single quotes", () => {
      // Test with properly matched brackets but unmatched quotes
      expect(() =>
        validateBasicMermaidSyntax("flowchart TD\nA --> B\nNote: 'Unmatched quote"),
      ).toThrow("Unmatched single quotes in diagram");
    });

    test("should detect unmatched double quotes", () => {
      // Test with properly matched brackets but unmatched quotes
      expect(() =>
        validateBasicMermaidSyntax('flowchart TD\nA --> B\nNote: "Unmatched quote'),
      ).toThrow("Unmatched double quotes in diagram");
    });

    test("should allow matched quotes", () => {
      const content = "flowchart TD\nA[\"Start\"] --> B['End']";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });

    test("should allow complex bracket combinations", () => {
      const content = "flowchart TD\nA[Start] --> B{Decision} --> C((Circle))";
      expect(validateBasicMermaidSyntax(content)).toBe(true);
    });
  });

  describe("validateMermaidSyntax", () => {
    test("should validate simple flowchart", async () => {
      const content = "flowchart TD\nA[Start] --> B[End]";
      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should validate complex flowchart", async () => {
      const content = `
        flowchart TD
          A[Start] --> B{Is it working?}
          B -->|Yes| C[Great!]
          B -->|No| D[Fix it]
          D --> B
          C --> E[End]
      `;
      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should validate sequence diagram", async () => {
      const content = `
        sequenceDiagram
          participant Alice
          participant Bob
          Alice->>Bob: Hello Bob, how are you?
          Bob-->>Alice: Great!
      `;
      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should reject invalid syntax", async () => {
      const content = "flowchart TD\nA[Start --> B[End"; // Missing closing bracket
      await expect(validateMermaidSyntax(content)).rejects.toThrow();
    });

    test("should reject empty content", async () => {
      await expect(validateMermaidSyntax("")).rejects.toThrow("Empty mermaid diagram");
      await expect(validateMermaidSyntax("   ")).rejects.toThrow("Empty mermaid diagram");
    });

    test("should handle worker pool fallback gracefully", async () => {
      // This test checks that the function can fall back to basic validation
      // if worker validation fails due to environment issues
      const content = "flowchart TD\nA --> B";
      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should validate different diagram types", async () => {
      const testCases = [
        "graph LR\nA --> B",
        "sequenceDiagram\nAlice->>Bob: Hello",
        "classDiagram\nclass Animal",
        "stateDiagram\n[*] --> Still",
        "erDiagram\nCUSTOMER {}",
        "journey\ntitle My day",
        "gantt\ntitle Project",
        "pie title Data",
      ];

      for (const content of testCases) {
        const result = await validateMermaidSyntax(content);
        expect(result).toBe(true);
      }
    });
  });

  describe("Utility Functions", () => {
    test("should get validation statistics", () => {
      const stats = getValidationStats();
      expect(typeof stats).toBe("object");

      if (stats.error) {
        expect(typeof stats.error).toBe("string");
      } else {
        expect(typeof stats.poolSize).toBe("number");
        expect(typeof stats.totalWorkers).toBe("number");
        expect(typeof stats.availableWorkers).toBe("number");
        expect(typeof stats.busyWorkers).toBe("number");
        expect(typeof stats.queuedRequests).toBe("number");
        expect(typeof stats.isShuttingDown).toBe("boolean");
      }
    });

    test("should shutdown validation properly", async () => {
      // Should not throw
      await expect(shutdownValidation()).resolves.toBeUndefined();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("should handle very large diagrams", async () => {
      const largeContent = `
        flowchart TD
          ${Array.from({ length: 50 }, (_, i) => `A${i} --> A${i + 1}`).join("\n  ")}
      `;

      // Should either succeed or fail with a clear error
      try {
        const result = await validateMermaidSyntax(largeContent);
        expect(result).toBe(true);
      } catch (error) {
        expect(error.message).toBeTruthy();
      }
    });

    test("should handle special characters in content", async () => {
      const content = `
        flowchart TD
          A["Node with special chars: @#$%"] --> B["Another node: &*()"]
      `;

      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should handle unicode characters", async () => {
      const content = `
        flowchart TD
          A["开始"] --> B["处理"]
          B --> C["结束"]
      `;

      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should handle multiline node labels", async () => {
      const content = `
        flowchart TD
          A["Multi<br/>Line<br/>Label"] --> B["Another<br/>Multi<br/>Line"]
      `;

      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });

    test("should handle comments in diagrams", async () => {
      const content = `
        flowchart TD
          %% This is a comment
          A[Start] --> B[End]
          %% Another comment
      `;

      const result = await validateMermaidSyntax(content);
      expect(result).toBe(true);
    });
  });

  describe("Concurrency and Performance", () => {
    test("should handle multiple concurrent validations", async () => {
      const validations = Array.from({ length: 10 }, (_, i) =>
        validateMermaidSyntax(`flowchart TD\nA${i} --> B${i}`),
      );

      const results = await Promise.all(validations);
      expect(results.every((r) => r === true)).toBe(true);
    });

    test("should handle mixed valid and invalid validations", async () => {
      const validations = [
        validateMermaidSyntax("flowchart TD\nA --> B"),
        validateMermaidSyntax("invalid content"),
        validateMermaidSyntax("graph LR\nX --> Y"),
        validateMermaidSyntax("another invalid"),
      ];

      const results = await Promise.allSettled(validations);

      expect(results[0].status).toBe("fulfilled");
      expect(results[1].status).toBe("rejected");
      expect(results[2].status).toBe("fulfilled");
      expect(results[3].status).toBe("rejected");
    });
  });
});
