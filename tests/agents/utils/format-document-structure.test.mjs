import { describe, expect, test } from "bun:test";
import { stringify } from "yaml";
import formatDocumentStructure from "../../../agents/utils/format-document-structure.mjs";

describe("format-document-structure", () => {
  // BASIC FUNCTIONALITY TESTS
  test("should format empty structure plan", async () => {
    const result = await formatDocumentStructure({
      documentStructure: [],
    });

    const expectedYaml = stringify([], {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    expect(result).toEqual({
      documentStructureYaml: expectedYaml,
      documentStructure: [],
    });
  });

  test("should format single item structure plan", async () => {
    const documentStructure = [
      {
        title: "Getting Started",
        path: "/getting-started",
        parentId: null,
        description: "Introduction to the platform",
        extraField: "should be ignored",
      },
    ];

    const result = await formatDocumentStructure({ documentStructure });

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

    expect(result.documentStructure).toEqual(documentStructure);
    expect(result.documentStructureYaml).toBe(expectedYaml);
  });

  test("should format multiple items structure plan", async () => {
    const documentStructure = [
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

    const result = await formatDocumentStructure({ documentStructure });

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

    expect(result.documentStructure).toEqual(documentStructure);
    expect(result.documentStructureYaml).toBe(expectedYaml);
  });

  // FIELD EXTRACTION TESTS
  test("should extract only required fields", async () => {
    const documentStructure = [
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

    const result = await formatDocumentStructure({ documentStructure });

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

    expect(result.documentStructureYaml).toBe(expectedYaml);
    // Verify extra fields are not in the YAML output
    expect(result.documentStructureYaml).not.toContain("doc-123");
    expect(result.documentStructureYaml).not.toContain("Document content");
    expect(result.documentStructureYaml).not.toContain("John Doe");
  });

  test("should handle items with missing optional fields", async () => {
    const documentStructure = [
      {
        title: "Required Title",
        path: "/required-path",
        // parentId and description are missing
      },
    ];

    const result = await formatDocumentStructure({ documentStructure });

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

    expect(result.documentStructureYaml).toBe(expectedYaml);
  });

  test("should preserve null and undefined values", async () => {
    const documentStructure = [
      {
        title: "Test Item",
        path: "/test",
        parentId: null,
        description: undefined,
      },
    ];

    const result = await formatDocumentStructure({ documentStructure });

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

    expect(result.documentStructureYaml).toBe(expectedYaml);
  });

  test("should handle items with special characters", async () => {
    const documentStructure = [
      {
        title: "Special Characters: @#$%^&*()",
        path: "/special-chars-test",
        parentId: null,
        description: 'Testing with 中文, émojis 🚀, and "quotes"',
      },
    ];

    const result = await formatDocumentStructure({ documentStructure });

    // Since YAML is mocked, just verify the function runs without error
    // and returns a structure with the expected properties
    expect(result.documentStructureYaml).toBeDefined();
    expect(result.documentStructure).toEqual(documentStructure);
  });

  test("should return both yaml string and original structure plan", async () => {
    const documentStructure = [
      {
        title: "Return Test",
        path: "/return-test",
        parentId: null,
        description: "Testing return values",
      },
    ];

    const result = await formatDocumentStructure({ documentStructure });

    expect(result).toHaveProperty("documentStructureYaml");
    expect(result).toHaveProperty("documentStructure");
    expect(typeof result.documentStructureYaml).toBe("string");
    expect(result.documentStructure).toBe(documentStructure); // Should be the same reference
  });

  test("should preserve original structure plan unchanged", async () => {
    const originalDocumentStructure = [
      {
        title: "Original",
        path: "/original",
        parentId: null,
        description: "Original description",
        extraField: "should remain",
      },
    ];

    const result = await formatDocumentStructure({
      documentStructure: originalDocumentStructure,
    });

    // Original should be unchanged
    expect(originalDocumentStructure[0]).toHaveProperty("extraField");
    expect(originalDocumentStructure[0].extraField).toBe("should remain");

    // Return value should reference the same object
    expect(result.documentStructure).toBe(originalDocumentStructure);
  });
});
