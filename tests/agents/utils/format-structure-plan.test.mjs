import { describe, expect, test } from "bun:test";
import { stringify } from "yaml";
import formatStructurePlan from "../../../agents/utils/format-structure-plan.mjs";

describe("formatStructurePlan", () => {
  // BASIC FUNCTIONALITY TESTS
  test("should format empty structure plan", async () => {
    const result = await formatStructurePlan({
      structurePlan: [],
    });

    const expectedYaml = stringify([], {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result).toEqual({
      structurePlanYaml: expectedYaml,
      structurePlan: [],
    });
  });

  test("should format single item structure plan", async () => {
    const structurePlan = [
      {
        title: "Getting Started",
        path: "/getting-started",
        parentId: null,
        description: "Introduction to the platform",
        extraField: "should be ignored",
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    const expectedData = [
      {
        title: "Getting Started",
        path: "/getting-started",
        parentId: null,
        description: "Introduction to the platform",
      },
    ];
    const expectedYaml = stringify(expectedData, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result.structurePlan).toEqual(structurePlan);
    expect(result.structurePlanYaml).toBe(expectedYaml);
  });

  test("should format multiple items structure plan", async () => {
    const structurePlan = [
      {
        title: "API Reference",
        path: "/api",
        parentId: null,
        description: "Complete API documentation",
      },
      {
        title: "Authentication",
        path: "/api/auth",
        parentId: "/api",
        description: "Authentication endpoints",
      },
      {
        title: "Users",
        path: "/api/users",
        parentId: "/api",
        description: "User management endpoints",
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    const expectedData = [
      {
        title: "API Reference",
        path: "/api",
        parentId: null,
        description: "Complete API documentation",
      },
      {
        title: "Authentication",
        path: "/api/auth",
        parentId: "/api",
        description: "Authentication endpoints",
      },
      {
        title: "Users",
        path: "/api/users",
        parentId: "/api",
        description: "User management endpoints",
      },
    ];
    const expectedYaml = stringify(expectedData, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result.structurePlan).toEqual(structurePlan);
    expect(result.structurePlanYaml).toBe(expectedYaml);
  });

  // FIELD EXTRACTION TESTS
  test("should extract only required fields", async () => {
    const structurePlan = [
      {
        title: "Test Document",
        path: "/test",
        parentId: "parent-123",
        description: "Test description",
        // Extra fields that should be filtered out
        id: "doc-123",
        content: "Document content",
        metadata: { tags: ["test"] },
        lastModified: "2024-01-01",
        author: "John Doe",
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    const expectedData = [
      {
        title: "Test Document",
        path: "/test",
        parentId: "parent-123",
        description: "Test description",
      },
    ];
    const expectedYaml = stringify(expectedData, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result.structurePlanYaml).toBe(expectedYaml);
    // Verify extra fields are not in the YAML output
    expect(result.structurePlanYaml).not.toContain("doc-123");
    expect(result.structurePlanYaml).not.toContain("Document content");
    expect(result.structurePlanYaml).not.toContain("John Doe");
  });

  test("should handle items with missing optional fields", async () => {
    const structurePlan = [
      {
        title: "Required Title",
        path: "/required-path",
        // parentId and description are missing
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    const expectedData = [
      {
        title: "Required Title",
        path: "/required-path",
        parentId: undefined,
        description: undefined,
      },
    ];
    const expectedYaml = stringify(expectedData, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result.structurePlanYaml).toBe(expectedYaml);
  });

  test("should preserve null and undefined values", async () => {
    const structurePlan = [
      {
        title: "Test Item",
        path: "/test",
        parentId: null,
        description: undefined,
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    const expectedData = [
      {
        title: "Test Item",
        path: "/test",
        parentId: null,
        description: undefined,
      },
    ];
    const expectedYaml = stringify(expectedData, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result.structurePlanYaml).toBe(expectedYaml);
  });

  test("should handle items with special characters", async () => {
    const structurePlan = [
      {
        title: "Special Characters: @#$%^&*()",
        path: "/special-chars-test",
        parentId: null,
        description: 'Testing with 中文, émojis 🚀, and "quotes"',
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    // Verify special characters are preserved in YAML
    expect(result.structurePlanYaml).toContain("Special Characters: @#$%^&*()");
    expect(result.structurePlanYaml).toContain("中文");
    expect(result.structurePlanYaml).toContain("🚀");
  });

  test("should return both yaml string and original structure plan", async () => {
    const structurePlan = [
      {
        title: "Return Test",
        path: "/return-test",
        parentId: null,
        description: "Testing return values",
      },
    ];

    const result = await formatStructurePlan({ structurePlan });

    expect(result).toHaveProperty("structurePlanYaml");
    expect(result).toHaveProperty("structurePlan");
    expect(typeof result.structurePlanYaml).toBe("string");
    expect(result.structurePlan).toBe(structurePlan); // Should be the same reference
  });

  test("should preserve original structure plan unchanged", async () => {
    const originalStructurePlan = [
      {
        title: "Original",
        path: "/original",
        parentId: null,
        description: "Original description",
        extraField: "should remain",
      },
    ];

    const result = await formatStructurePlan({
      structurePlan: originalStructurePlan,
    });

    // Original should be unchanged
    expect(originalStructurePlan[0]).toHaveProperty("extraField");
    expect(originalStructurePlan[0].extraField).toBe("should remain");

    // Return value should reference the same object
    expect(result.structurePlan).toBe(originalStructurePlan);
  });
});
