import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import addDocument from "../../../../agents/generate/document-structure-tools/add-document.mjs";

describe("add-document", () => {
  let consoleSpy;
  let baseDocumentStructure;

  beforeEach(() => {
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    baseDocumentStructure = [
      {
        title: "Getting Started",
        description: "Introduction to the project",
        path: "/getting-started",
        parentId: null,
        sourceIds: ["intro.md"],
      },
      {
        title: "API Reference",
        description: "Complete API documentation",
        path: "/api",
        parentId: null,
        sourceIds: ["api.js"],
      },
      {
        title: "Authentication",
        description: "How to authenticate with the API",
        path: "/api/auth",
        parentId: "/api",
        sourceIds: ["auth.js", "security.md"],
      },
    ];
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  // SUCCESSFUL ADDITION TESTS
  test("should add a new top-level document successfully", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Deployment Guide",
      description: "How to deploy the application",
      path: "/deployment",
      parentId: null,
      sourceIds: ["deploy.md", "docker.yml"],
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.addedDocument).toEqual({
      title: "Deployment Guide",
      description: "How to deploy the application",
      path: "/deployment",
      parentId: null,
      sourceIds: ["deploy.md", "docker.yml"],
    });

    // Verify original structure is unchanged
    expect(result.documentStructure.slice(0, 3)).toEqual(baseDocumentStructure);
    expect(result.documentStructure[3]).toEqual(result.addedDocument);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should add a child document successfully", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.addedDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle undefined parentId as null", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "FAQ",
      description: "Frequently asked questions",
      path: "/faq",
      parentId: undefined,
      sourceIds: ["faq.md"],
    });

    expect(result.addedDocument.parentId).toBeNull();
    expect(result.documentStructure).toHaveLength(4);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle empty string parentId as null", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Changelog",
      description: "Project changelog",
      path: "/changelog",
      parentId: "",
      sourceIds: ["changelog.md"],
    });

    expect(result.addedDocument.parentId).toBeNull();
    expect(result.documentStructure).toHaveLength(4);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle string 'null' parentId but keep it as string", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "License",
      description: "Project license information",
      path: "/license",
      parentId: "null",
      sourceIds: ["license.txt"],
    });

    // The code treats "null" as a string and doesn't convert it to null
    // But it's still treated as a top-level document in validation
    expect(result.addedDocument.parentId).toBe("null");
    expect(result.documentStructure).toHaveLength(4);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should create a copy of sourceIds array", async () => {
    const originalSourceIds = ["source1.js", "source2.md"];
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Document",
      description: "Test description",
      path: "/test",
      parentId: null,
      sourceIds: originalSourceIds,
    });

    // Verify it's a copy, not a reference
    expect(result.addedDocument.sourceIds).toEqual(originalSourceIds);
    expect(result.addedDocument.sourceIds).not.toBe(originalSourceIds);

    // Modifying original should not affect the added document
    originalSourceIds.push("source3.js");
    expect(result.addedDocument.sourceIds).not.toContain("source3.js");
  });

  // VALIDATION ERROR TESTS - MISSING PARAMETERS
  test("should return error when title is missing", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      description: "Test description",
      path: "/test",
      sourceIds: ["test.md"],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot add document: title: Required");
  });

  test("should return error when description is missing", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      path: "/test",
      sourceIds: ["test.md"],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot add document: description: Required");
  });

  test("should return error when path is missing", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      description: "Test description",
      sourceIds: ["test.md"],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot add document: path: Required");
  });

  test("should return error when sourceIds is missing", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      description: "Test description",
      path: "/test",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot add document: sourceIds: Required");
  });

  test("should return error when sourceIds is not an array", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      description: "Test description",
      path: "/test",
      sourceIds: "not-an-array",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot add document: sourceIds: Expected array, received string",
    );
  });

  test("should return error when sourceIds is empty array", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      description: "Test description",
      path: "/test",
      sourceIds: [],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot add document: sourceIds: At least one source ID is required",
    );
  });

  // PATH VALIDATION TESTS
  test("should return error when path does not start with /", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      description: "Test description",
      path: "invalid-path",
      sourceIds: ["test.md"],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      '⚠️  Cannot add document: path: Path must start with "/"',
    );
  });

  test("should accept valid path formats", async () => {
    const validPaths = ["/test", "/api/endpoint", "/deep/nested/path", "/single"];

    for (const path of validPaths) {
      const result = await addDocument({
        documentStructure: baseDocumentStructure,
        title: "Test Title",
        description: "Test description",
        path,
        sourceIds: ["test.md"],
      });

      expect(result.addedDocument.path).toBe(path);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockClear();
    }
  });

  // PARENT VALIDATION TESTS
  test("should return error when parent document does not exist", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Test Title",
      description: "Test description",
      path: "/test",
      parentId: "/nonexistent-parent",
      sourceIds: ["test.md"],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot add document: Parent document '/nonexistent-parent' not found.",
    );
  });

  test("should accept existing parent document", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "New API Endpoint",
      description: "Documentation for new endpoint",
      path: "/api/new-endpoint",
      parentId: "/api",
      sourceIds: ["endpoint.js"],
    });

    expect(result.addedDocument.parentId).toBe("/api");
    expect(result.documentStructure).toHaveLength(4);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // DUPLICATE PATH TESTS
  test("should return error when document with same path already exists", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Duplicate",
      description: "This will conflict",
      path: "/getting-started", // This path already exists
      sourceIds: ["duplicate.md"],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.addedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot add document: A document with path '/getting-started' already exists. Choose a different path.",
    );
  });

  test("should allow different paths even with similar content", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Getting Started", // Same title as existing
      description: "Different getting started guide",
      path: "/getting-started-advanced", // Different path
      sourceIds: ["advanced.md"],
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.addedDocument.path).toBe("/getting-started-advanced");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // EDGE CASES
  test("should handle empty documentation structure", async () => {
    const result = await addDocument({
      documentStructure: [],
      title: "First Document",
      description: "The first document ever",
      path: "/first",
      parentId: null,
      sourceIds: ["first.md"],
    });

    expect(result.documentStructure).toHaveLength(1);
    expect(result.addedDocument).toEqual({
      title: "First Document",
      description: "The first document ever",
      path: "/first",
      parentId: null,
      sourceIds: ["first.md"],
    });
  });

  test("should handle complex nested structure", async () => {
    const complexStructure = [
      ...baseDocumentStructure,
      {
        title: "Deep Nested",
        description: "Deep nesting test",
        path: "/api/auth/oauth",
        parentId: "/api/auth",
        sourceIds: ["oauth.js"],
      },
    ];

    const result = await addDocument({
      documentStructure: complexStructure,
      title: "OAuth Scopes",
      description: "OAuth scope documentation",
      path: "/api/auth/oauth/scopes",
      parentId: "/api/auth/oauth",
      sourceIds: ["scopes.md"],
    });

    expect(result.documentStructure).toHaveLength(5);
    expect(result.addedDocument.parentId).toBe("/api/auth/oauth");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle special characters in paths", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Special Characters",
      description: "Document with special chars in path",
      path: "/api/special-chars_and.numbers123",
      sourceIds: ["special.md"],
    });

    expect(result.addedDocument.path).toBe("/api/special-chars_and.numbers123");
    expect(result.documentStructure).toHaveLength(4);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle multiple source IDs", async () => {
    const multipleSourceIds = [
      "main.js",
      "helper.js",
      "documentation.md",
      "examples/example1.js",
      "examples/example2.js",
    ];

    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Multi-Source Doc",
      description: "Document with multiple sources",
      path: "/multi-source",
      sourceIds: multipleSourceIds,
    });

    expect(result.addedDocument.sourceIds).toEqual(multipleSourceIds);
    expect(result.addedDocument.sourceIds).toHaveLength(5);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // DATA INTEGRITY TESTS
  test("should not modify original documentation structure", async () => {
    const originalStructure = [...baseDocumentStructure];

    await addDocument({
      documentStructure: baseDocumentStructure,
      title: "New Document",
      description: "Test document",
      path: "/new",
      sourceIds: ["new.md"],
    });

    expect(baseDocumentStructure).toEqual(originalStructure);
  });

  test("should create independent document objects", async () => {
    const result = await addDocument({
      documentStructure: baseDocumentStructure,
      title: "Independent Doc",
      description: "Test independence",
      path: "/independent",
      sourceIds: ["independent.md"],
    });

    // Modifying the added document should not affect the original structure
    result.addedDocument.title = "Modified Title";
    expect(result.documentStructure[3].title).toBe("Modified Title");
    expect(baseDocumentStructure.find((doc) => doc.path === "/independent")).toBeUndefined();
  });
});
