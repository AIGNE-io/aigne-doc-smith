import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import generateSubStructure from "../../../../agents/generate/document-structure-tools/generate-sub-structure.mjs";

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

    test("should process single source path with small context", async () => {
      const testFile = join(testDir, "test.js");
      await writeFile(testFile, "// Small test file\nconst x = 1;");

      const mockContext = {
        agents: {
          generateStructureWithoutTools: "mock-agent-without-tools",
        },
        invoke: async (agent, params) => {
          expect(agent).toBe("mock-agent-without-tools");
          expect(params.isSubStructure).toBe(true);
          expect(params.parentDocument).toBeDefined();
          expect(params.datasources).toBeDefined();
          expect(params.allFilesPaths).toBeDefined();
          expect(params.isLargeContext).toBe(false);
          expect(params.files).toBeDefined();
          expect(params.totalTokens).toBeGreaterThan(0);

          return {
            documentStructure: [
              {
                title: "Test Document",
                path: "/test-doc",
                description: "Generated from test file",
              },
            ],
          };
        },
      };

      const result = await generateSubStructure(
        {
          parentDocument: {
            title: "Parent",
            path: "/parent",
            description: "Parent doc",
          },
          subSourcePaths: [{ path: testFile, reason: "Test file" }],
        },
        { context: mockContext },
      );

      expect(result).toBeDefined();
      expect(result.subStructure).toBeDefined();
      expect(Array.isArray(result.subStructure)).toBe(true);
      expect(result.subStructure.length).toBe(1);
      expect(result.message).toContain("Generated a sub structure");
      expect(result.message).toContain("/parent");
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

    test("should use generateStructure agent for large context", async () => {
      const largeContent = `// Large file\n${"const x = 1;\n".repeat(150000)}`;
      const testFile = join(testDir, "large.js");
      await writeFile(testFile, largeContent);

      const mockContext = {
        agents: {
          generateStructure: "mock-agent-with-tools",
          generateStructureWithoutTools: "mock-agent-without-tools",
        },
        invoke: async (agent, params) => {
          expect(agent).toBe("mock-agent-with-tools");
          expect(params.isLargeContext).toBe(true);

          return {
            documentStructure: [{ title: "Large Doc", path: "/large" }],
          };
        },
      };

      const result = await generateSubStructure(
        {
          parentDocument: { title: "Parent", path: "/parent" },
          subSourcePaths: [{ path: testFile, reason: "Large file" }],
        },
        { context: mockContext },
      );

      expect(result.subStructure).toBeDefined();
      expect(result.subStructure.length).toBe(1);
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
