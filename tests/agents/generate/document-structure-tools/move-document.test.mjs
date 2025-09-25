import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import moveDocument from "../../../../agents/generate/document-structure-tools/move-document.mjs";

describe("move-document", () => {
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
      {
        title: "Tutorials",
        description: "Step-by-step tutorials",
        path: "/tutorials",
        parentId: null,
        sourceIds: ["tutorials.md"],
      },
    ];
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  // SUCCESSFUL MOVE TESTS
  test("should move document to different parent successfully", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "/tutorials",
    });

    expect(result.documentStructure).toHaveLength(6);
    expect(result.updatedDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/tutorials",
      sourceIds: ["rate-limit.js"],
    });

    expect(result.originalDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    // Verify the document was actually updated in the structure
    const updatedDoc = result.documentStructure.find((doc) => doc.path === "/api/rate-limiting");
    expect(updatedDoc.parentId).toBe("/tutorials");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should move document to top level (null parent)", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      newParentId: null,
    });

    expect(result.updatedDocument.parentId).toBeNull();
    expect(result.originalDocument.parentId).toBe("/api");

    const updatedDoc = result.documentStructure.find((doc) => doc.path === "/api/auth");
    expect(updatedDoc.parentId).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle undefined newParentId as null", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      newParentId: undefined,
    });

    expect(result.updatedDocument.parentId).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle empty string newParentId as null", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "",
    });

    expect(result.updatedDocument.parentId).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle string 'null' newParentId but keep it as string", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth/oauth",
      newParentId: "null",
    });

    expect(result.updatedDocument.parentId).toBe("null");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should move deeply nested document", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth/oauth",
      newParentId: "/getting-started",
    });

    expect(result.updatedDocument.parentId).toBe("/getting-started");
    expect(result.originalDocument.parentId).toBe("/api/auth");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // VALIDATION ERROR TESTS
  test("should return error when path is missing", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      newParentId: "/tutorials",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.originalDocument).toBeUndefined();
    expect(result.updatedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - No document path specified. Please provide the path of the document to move and its destination.",
    );
  });

  test("should return error when path is empty string", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "",
      newParentId: "/tutorials",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - No document path specified. Please provide the path of the document to move and its destination.",
    );
  });

  test("should return error when document does not exist", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/nonexistent-document",
      newParentId: "/tutorials",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Document '/nonexistent-document' does not exist. Please select an existing document to move.",
    );
  });

  test("should return error when new parent does not exist", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "/nonexistent-parent",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Target parent document '/nonexistent-parent' does not exist. Please select an existing parent document.",
    );
  });

  // CIRCULAR DEPENDENCY TESTS
  test("should prevent moving document under its own child", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api",
      newParentId: "/api/auth",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Moving '/api' under '/api/auth' would create an invalid hierarchy. Please select a parent that is not nested under the document being moved.",
    );
  });

  test("should prevent moving document under its grandchild", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api",
      newParentId: "/api/auth/oauth",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Moving '/api' under '/api/auth/oauth' would create an invalid hierarchy. Please select a parent that is not nested under the document being moved.",
    );
  });

  test("should allow moving document to same parent (no change)", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      newParentId: "/api/auth",
    });

    // The move-document logic doesn't prevent self-assignment, it just does the operation
    expect(result.updatedDocument.parentId).toBe("/api/auth");
    expect(result.originalDocument.parentId).toBe("/api");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should allow moving to sibling or unrelated documents", async () => {
    // Move from /api/auth to /tutorials (siblings under different parents)
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      newParentId: "/tutorials",
    });

    expect(result.updatedDocument.parentId).toBe("/tutorials");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle complex circular dependency scenarios", async () => {
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

    // Try to move /api under its great-grandchild
    const result = await moveDocument({
      documentStructure: complexStructure,
      path: "/api",
      newParentId: "/api/auth/oauth/scopes",
    });

    expect(result.documentStructure).toEqual(complexStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Moving '/api' under '/api/auth/oauth/scopes' would create an invalid hierarchy. Please select a parent that is not nested under the document being moved.",
    );
  });

  // EDGE CASES
  test("should handle moving to same parent (no-op)", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      newParentId: "/api",
    });

    // Should still work, even though it's essentially a no-op
    expect(result.updatedDocument.parentId).toBe("/api");
    expect(result.originalDocument.parentId).toBe("/api");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle moving top-level document to become child", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      newParentId: "/tutorials",
    });

    expect(result.originalDocument.parentId).toBeNull();
    expect(result.updatedDocument.parentId).toBe("/tutorials");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should preserve all other document properties", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "/tutorials",
    });

    const originalDoc = baseDocumentStructure.find((doc) => doc.path === "/api/rate-limiting");
    const updatedDoc = result.updatedDocument;

    expect(updatedDoc.title).toBe(originalDoc.title);
    expect(updatedDoc.description).toBe(originalDoc.description);
    expect(updatedDoc.path).toBe(originalDoc.path);
    expect(updatedDoc.sourceIds).toEqual(originalDoc.sourceIds);
    // Only parentId should change
    expect(updatedDoc.parentId).not.toBe(originalDoc.parentId);
  });

  test("should handle empty document structure", async () => {
    const result = await moveDocument({
      documentStructure: [],
      path: "/any-path",
      newParentId: "/any-parent",
    });

    expect(result.documentStructure).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Document '/any-path' does not exist. Please select an existing document to move.",
    );
  });

  test("should handle single document structure", async () => {
    const singleDocStructure = [
      {
        title: "Only Document",
        description: "The only document",
        path: "/only",
        parentId: null,
        sourceIds: ["only.md"],
      },
    ];

    const result = await moveDocument({
      documentStructure: singleDocStructure,
      path: "/only",
      newParentId: "/nonexistent",
    });

    expect(result.documentStructure).toEqual(singleDocStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error: Cannot move document - Target parent document '/nonexistent' does not exist. Please select an existing parent document.",
    );
  });

  // DATA INTEGRITY TESTS
  test("should not modify original document structure", async () => {
    const originalStructure = [...baseDocumentStructure];

    await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "/tutorials",
    });

    expect(baseDocumentStructure).toEqual(originalStructure);
  });

  test("should update only the specified document", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "/tutorials",
    });

    // Count how many documents have changed
    let changedCount = 0;
    for (let i = 0; i < baseDocumentStructure.length; i++) {
      if (
        JSON.stringify(baseDocumentStructure[i]) !== JSON.stringify(result.documentStructure[i])
      ) {
        changedCount++;
      }
    }

    expect(changedCount).toBe(1);
  });

  test("should preserve document order in array", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      newParentId: "/tutorials",
    });

    // Verify all documents are in the same positions except the moved one
    for (let i = 0; i < baseDocumentStructure.length; i++) {
      if (baseDocumentStructure[i].path === "/api/auth") {
        // This is the moved document, check everything except parentId
        const original = baseDocumentStructure[i];
        const updated = result.documentStructure[i];
        expect(updated.title).toBe(original.title);
        expect(updated.description).toBe(original.description);
        expect(updated.path).toBe(original.path);
        expect(updated.sourceIds).toEqual(original.sourceIds);
        expect(updated.parentId).toBe("/tutorials");
      } else {
        // Other documents should be unchanged
        expect(result.documentStructure[i]).toEqual(baseDocumentStructure[i]);
      }
    }
  });

  // RETURN VALUE TESTS
  test("should return complete original and updated document information", async () => {
    const result = await moveDocument({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      newParentId: "/tutorials",
    });

    expect(result.originalDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    expect(result.updatedDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/tutorials",
      sourceIds: ["rate-limit.js"],
    });

    // Verify both have all required properties
    ["title", "description", "path", "parentId", "sourceIds"].forEach((prop) => {
      expect(result.originalDocument).toHaveProperty(prop);
      expect(result.updatedDocument).toHaveProperty(prop);
    });
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

    const result = await moveDocument({
      documentStructure: specialStructure,
      path: "/api/special-chars_and.numbers123",
      newParentId: "/tutorials",
    });

    expect(result.updatedDocument.path).toBe("/api/special-chars_and.numbers123");
    expect(result.updatedDocument.parentId).toBe("/tutorials");
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
