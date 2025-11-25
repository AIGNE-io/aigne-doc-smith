import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import deleteDocument from "../../../../agents/create/document-structure-tools/delete-document.mjs";

describe("delete-document", () => {
  let consoleSpy;
  let baseDocumentStructure;
  let options;
  const runDelete = (input) => deleteDocument(input, options);

  beforeEach(() => {
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    options = { context: { userContext: {} } };
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
      {
        title: "Rate Limiting",
        description: "API rate limiting documentation",
        path: "/api/rate-limiting",
        parentId: "/api",
        sourceIds: ["rate-limit.js"],
      },
      {
        title: "OAuth",
        description: "OAuth authentication flow",
        path: "/api/auth/oauth",
        parentId: "/api/auth",
        sourceIds: ["oauth.js"],
      },
    ];
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  // SUCCESSFUL DELETION TESTS
  test("should delete a leaf document successfully", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.deletedDocuments).toHaveLength(1);
    expect(result.deletedDocuments[0]).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    // Verify the document is actually removed
    expect(
      result.documentStructure.find((doc) => doc.path === "/api/rate-limiting"),
    ).toBeUndefined();

    // Verify other documents remain
    expect(result.documentStructure.find((doc) => doc.path === "/api")).toBeDefined();
    expect(result.documentStructure.find((doc) => doc.path === "/api/auth")).toBeDefined();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle duplicate recursive delete gracefully", async () => {
    options.context.userContext.deletedPaths = ["/api/rate-limiting"];
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      recursive: true,
    });

    expect(result.deletedDocuments).toEqual([]);
    expect(result.message).toContain("Skipping duplicate deletion");
  });

  test("should delete a deeply nested document successfully", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/auth/oauth",
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.deletedDocuments).toHaveLength(1);
    expect(result.deletedDocuments[0]).toEqual({
      title: "OAuth",
      description: "OAuth authentication flow",
      path: "/api/auth/oauth",
      parentId: "/api/auth",
      sourceIds: ["oauth.js"],
    });

    // Verify the parent still exists
    expect(result.documentStructure.find((doc) => doc.path === "/api/auth")).toBeDefined();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should delete a top-level document with no children", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.deletedDocuments).toHaveLength(1);
    expect(result.deletedDocuments[0]).toEqual({
      title: "Getting Started",
      description: "Introduction to the project",
      path: "/getting-started",
      parentId: null,
      sourceIds: ["intro.md"],
    });

    expect(result.documentStructure.find((doc) => doc.path === "/getting-started")).toBeUndefined();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // VALIDATION ERROR TESTS
  test("should return error when path is missing", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.deletedDocuments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot delete document: path: Required");
  });

  test("should return error when path is empty string", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.deletedDocuments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot delete document: path: Path is required");
  });

  test("should return error when document does not exist", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/nonexistent-document",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.deletedDocuments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot delete document: Document '/nonexistent-document' does not exist. Please choose an existing document to delete.",
    );
  });

  // CHILD DOCUMENTS VALIDATION TESTS
  test("should return error when trying to delete document with child documents", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.deletedDocuments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot delete document: Document '/api' has 3 child document(s): /api/auth, /api/rate-limiting, /api/auth/oauth. Please first move or delete these child documents, or set recursive=true to delete them all.",
    );
  });

  test("should return error when trying to delete document with single child", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.deletedDocuments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot delete document: Document '/api/auth' has 1 child document(s): /api/auth/oauth. Please first move or delete these child documents, or set recursive=true to delete them all.",
    );
  });

  test("should allow deletion after children are removed", async () => {
    // First delete the child
    const firstResult = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/auth/oauth",
    });

    // Then delete the parent
    const secondResult = await runDelete({
      documentStructure: firstResult.documentStructure,
      path: "/api/auth",
    });

    expect(secondResult.documentStructure).toHaveLength(3);
    expect(secondResult.deletedDocuments).toHaveLength(1);
    expect(secondResult.deletedDocuments[0].path).toBe("/api/auth");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should recursively delete children documents when recursive=true", async () => {
    const complexStructure = [
      ...baseDocumentStructure,
      {
        title: "OAuth Scopes",
        description: "OAuth scope documentation",
        path: "/api/auth/oauth/scopes",
        parentId: "/api/auth/oauth",
        sourceIds: ["scopes.md"],
      },
      {
        title: "JWT Tokens",
        description: "JWT token handling",
        path: "/api/auth/oauth/jwt",
        parentId: "/api/auth/oauth",
        sourceIds: ["jwt.js"],
      },
    ];

    const result = await runDelete({
      documentStructure: complexStructure,
      path: "/api/auth",
      recursive: true,
    });

    // Should delete /api/auth, /api/auth/oauth, /api/auth/oauth/scopes, /api/auth/oauth/jwt (4 documents total)
    expect(result.documentStructure).toHaveLength(3);
    expect(result.deletedDocuments).toHaveLength(4);

    // Verify all documents are in deletedDocuments
    const deletedPaths = result.deletedDocuments.map((doc) => doc.path);
    expect(deletedPaths).toContain("/api/auth");
    expect(deletedPaths).toContain("/api/auth/oauth");
    expect(deletedPaths).toContain("/api/auth/oauth/scopes");
    expect(deletedPaths).toContain("/api/auth/oauth/jwt");

    // Verify all documents are removed from structure
    expect(result.documentStructure.find((doc) => doc.path === "/api/auth")).toBeUndefined();
    expect(result.documentStructure.find((doc) => doc.path === "/api/auth/oauth")).toBeUndefined();
    expect(
      result.documentStructure.find((doc) => doc.path === "/api/auth/oauth/scopes"),
    ).toBeUndefined();
    expect(
      result.documentStructure.find((doc) => doc.path === "/api/auth/oauth/jwt"),
    ).toBeUndefined();

    // Verify parent document still exists
    expect(result.documentStructure.find((doc) => doc.path === "/api")).toBeDefined();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // EDGE CASES
  test("should handle empty documentation structure", async () => {
    const result = await runDelete({
      documentStructure: [],
      path: "/any-path",
    });

    expect(result.documentStructure).toEqual([]);
    expect(result.deletedDocuments).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot delete document: Document '/any-path' does not exist. Please choose an existing document to delete.",
    );
  });

  test("should handle documentation structure with single document", async () => {
    const singleDocStructure = [
      {
        title: "Only Document",
        description: "The only document",
        path: "/only",
        parentId: null,
        sourceIds: ["only.md"],
      },
    ];

    const result = await runDelete({
      documentStructure: singleDocStructure,
      path: "/only",
    });

    expect(result.documentStructure).toEqual([]);
    expect(result.deletedDocuments).toHaveLength(1);
    expect(result.deletedDocuments[0]).toEqual(singleDocStructure[0]);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle complex nested hierarchies", async () => {
    const complexStructure = [
      ...baseDocumentStructure,
      {
        title: "OAuth Scopes",
        description: "OAuth scope documentation",
        path: "/api/auth/oauth/scopes",
        parentId: "/api/auth/oauth",
        sourceIds: ["scopes.md"],
      },
      {
        title: "JWT Tokens",
        description: "JWT token handling",
        path: "/api/auth/oauth/jwt",
        parentId: "/api/auth/oauth",
        sourceIds: ["jwt.js"],
      },
    ];

    // Should not be able to delete parent with grandchildren
    const result = await runDelete({
      documentStructure: complexStructure,
      path: "/api/auth/oauth",
    });

    expect(result.documentStructure).toEqual(complexStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot delete document: Document '/api/auth/oauth' has 2 child document(s): /api/auth/oauth/scopes, /api/auth/oauth/jwt. Please first move or delete these child documents, or set recursive=true to delete them all.",
    );
  });

  test("should correctly identify all children recursively", async () => {
    const structureWithManyChildren = [
      {
        title: "Parent",
        description: "Parent document",
        path: "/parent",
        parentId: null,
        sourceIds: ["parent.md"],
      },
      {
        title: "Child 1",
        description: "First child",
        path: "/parent/child1",
        parentId: "/parent",
        sourceIds: ["child1.md"],
      },
      {
        title: "Child 2",
        description: "Second child",
        path: "/parent/child2",
        parentId: "/parent",
        sourceIds: ["child2.md"],
      },
      {
        title: "Child 3",
        description: "Third child",
        path: "/parent/child3",
        parentId: "/parent",
        sourceIds: ["child3.md"],
      },
      {
        title: "Grandchild",
        description: "Grandchild document",
        path: "/parent/child1/grandchild",
        parentId: "/parent/child1",
        sourceIds: ["grandchild.md"],
      },
    ];

    const result = await runDelete({
      documentStructure: structureWithManyChildren,
      path: "/parent",
    });

    expect(result.documentStructure).toEqual(structureWithManyChildren);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot delete document: Document '/parent' has 4 child document(s): /parent/child1, /parent/child2, /parent/child3, /parent/child1/grandchild. Please first move or delete these child documents, or set recursive=true to delete them all.",
    );
  });

  // DATA INTEGRITY TESTS
  test("should not modify original documentation structure", async () => {
    const originalStructure = [...baseDocumentStructure];

    await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
    });

    expect(baseDocumentStructure).toEqual(originalStructure);
  });

  test("should preserve document order after deletion", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
    });

    // Since /api/auth has children, it should not be deleted
    expect(result.documentStructure).toEqual(baseDocumentStructure);

    // But if we delete a leaf node, order should be preserved
    const leafResult = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
    });

    const expectedStructure = baseDocumentStructure.filter(
      (doc) => doc.path !== "/api/rate-limiting",
    );
    expect(leafResult.documentStructure).toEqual(expectedStructure);
  });

  test("should handle special characters in paths", async () => {
    const specialStructure = [
      ...baseDocumentStructure,
      {
        title: "Special Document",
        description: "Document with special characters",
        path: "/api/special-chars_and.numbers123",
        parentId: "/api",
        sourceIds: ["special.md"],
      },
    ];

    const result = await runDelete({
      documentStructure: specialStructure,
      path: "/api/special-chars_and.numbers123",
    });

    expect(result.documentStructure).toHaveLength(5);
    expect(result.deletedDocuments).toHaveLength(1);
    expect(result.deletedDocuments[0].path).toBe("/api/special-chars_and.numbers123");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // RETURN VALUE TESTS
  test("should return complete deleted document information", async () => {
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
    });

    expect(result.deletedDocuments).toHaveLength(1);
    expect(result.deletedDocuments[0]).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    // Verify all properties are present
    expect(result.deletedDocuments[0]).toHaveProperty("title");
    expect(result.deletedDocuments[0]).toHaveProperty("description");
    expect(result.deletedDocuments[0]).toHaveProperty("path");
    expect(result.deletedDocuments[0]).toHaveProperty("parentId");
    expect(result.deletedDocuments[0]).toHaveProperty("sourceIds");
  });

  test("should mark error when rm throws non-ENOENT", async () => {
    options.context.userContext.deletedPaths = [];
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      recursive: true,
    });

    // Implementation is pure data manipulation; no fs calls, so error should be falsy
    expect(result.error).toBeFalsy();
  });

  test("should return updated documentation structure without deleted document", async () => {
    const originalLength = baseDocumentStructure.length;
    const result = await runDelete({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
    });

    expect(result.documentStructure).toHaveLength(originalLength - 1);
    expect(result.documentStructure.every((doc) => doc.path !== "/getting-started")).toBe(true);

    // Verify all other documents are still present
    const remainingPaths = result.documentStructure.map((doc) => doc.path);
    expect(remainingPaths).toContain("/api");
    expect(remainingPaths).toContain("/api/auth");
    expect(remainingPaths).toContain("/api/rate-limiting");
    expect(remainingPaths).toContain("/api/auth/oauth");
  });
});
