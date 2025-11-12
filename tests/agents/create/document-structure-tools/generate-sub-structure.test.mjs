import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import generateSubStructure from "../../../../agents/create/document-structure-tools/generate-sub-structure.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("generate-sub-structure", () => {
  let testDir;

  beforeEach(async () => {
    testDir = join(__dirname, "test-generate-sub-structure");
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("generateSubStructure function", () => {
    test("should return empty subStructure when subSourcePaths is empty", async () => {
      const result = await generateSubStructure(
        {
          parentDocument: {
            title: "Test Parent",
            description: "Test Description",
            path: "/test",
            parentId: "parent-1",
            sourceIds: [],
          },
          subSourcePaths: [],
        },
        {},
      );

      expect(result).toBeDefined();
      expect(result.subStructure).toBeDefined();
      expect(Array.isArray(result.subStructure)).toBe(true);
      expect(result.subStructure.length).toBe(0);
      expect(result.message).toBeUndefined();
    });

    test("should process multiple source paths", async () => {
      const testFile1 = join(testDir, "test1.js");
      const testFile2 = join(testDir, "test2.js");
      await writeFile(testFile1, "// Test file 1\nconst a = 1;");
      await writeFile(testFile2, "// Test file 2\nconst b = 2;");

      const mockContext = {
        agents: {
          generateStructureWithoutTools: "mock-agent-without-tools",
        },
        invoke: async (_agent, params) => {
          expect(params.files.length).toBe(2);
          expect(params.allFilesPaths).toContain("test1.js");
          expect(params.allFilesPaths).toContain("test2.js");

          return {
            documentStructure: [
              { title: "Doc 1", path: "/doc1" },
              { title: "Doc 2", path: "/doc2" },
            ],
          };
        },
      };

      const result = await generateSubStructure(
        {
          parentDocument: { title: "Parent", path: "/parent" },
          subSourcePaths: [
            { path: testFile1, reason: "First test" },
            { path: testFile2, reason: "Second test" },
          ],
        },
        { context: mockContext },
      );

      expect(result.subStructure.length).toBe(2);
    });

    test("should handle custom include and exclude patterns", async () => {
      const srcDir = join(testDir, "src");
      await mkdir(srcDir, { recursive: true });
      await writeFile(join(srcDir, "index.js"), "// index");
      await writeFile(join(srcDir, "test.spec.js"), "// test");
      await writeFile(join(srcDir, "utils.ts"), "// utils");

      const mockContext = {
        agents: {
          generateStructureWithoutTools: "mock-agent",
        },
        invoke: async (_agent, params) => {
          const hasTestFile = params.files.some((f) => f.includes("test.spec.js"));
          expect(hasTestFile).toBe(false);

          return { documentStructure: [] };
        },
      };

      await generateSubStructure(
        {
          parentDocument: { title: "Parent", path: "/parent" },
          subSourcePaths: [{ path: testDir, reason: "Test directory" }],
          includePatterns: ["**/*.js", "**/*.ts"],
          excludePatterns: ["**/*.spec.js"],
        },
        { context: mockContext },
      );
    });

    test("should deduplicate files in result", async () => {
      const testFile = join(testDir, "test.js");
      await writeFile(testFile, "// test");

      const mockContext = {
        agents: {
          generateStructureWithoutTools: "mock-agent",
        },
        invoke: async (_agent, params) => {
          const uniqueFiles = new Set(params.files);
          expect(uniqueFiles.size).toBe(params.files.length);

          return { documentStructure: [] };
        },
      };

      await generateSubStructure(
        {
          parentDocument: { title: "Parent", path: "/parent" },
          subSourcePaths: [
            { path: testFile, reason: "First" },
            { path: testFile, reason: "Second" },
          ],
        },
        { context: mockContext },
      );
    });

    test("should pass extra parameters to agent", async () => {
      const testFile = join(testDir, "test.js");
      await writeFile(testFile, "// test");

      const mockContext = {
        agents: {
          generateStructureWithoutTools: "mock-agent",
        },
        invoke: async (_agent, params) => {
          expect(params.extraParam1).toBe("value1");
          expect(params.extraParam2).toBe("value2");

          return { documentStructure: [] };
        },
      };

      await generateSubStructure(
        {
          parentDocument: { title: "Parent", path: "/parent" },
          subSourcePaths: [{ path: testFile, reason: "Test" }],
          extraParam1: "value1",
          extraParam2: "value2",
        },
        { context: mockContext },
      );
    });

    test("should handle empty documentStructure from agent", async () => {
      const testFile = join(testDir, "test.js");
      await writeFile(testFile, "// test");

      const mockContext = {
        agents: {
          generateStructureWithoutTools: "mock-agent",
        },
        invoke: async () => {
          return {};
        },
      };

      const result = await generateSubStructure(
        {
          parentDocument: { title: "Parent", path: "/parent" },
          subSourcePaths: [{ path: testFile, reason: "Test" }],
        },
        { context: mockContext },
      );

      expect(result.subStructure).toEqual([]);
    });
  });
});
