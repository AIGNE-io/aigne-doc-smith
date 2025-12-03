import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import updateDocument from "../../../../agents/create/document-structure-tools/update-document.mjs";

describe("update-document", () => {
  let consoleSpy;
  let baseDocumentStructure;
  let options;
  const runUpdate = (input) => updateDocument(input, options);

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
    ];
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
  });

  // SUCCESSFUL UPDATE TESTS - TITLE
  test("should update document title successfully", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      title: "Quick Start Guide",
    });

    expect(result.documentStructure).toHaveLength(4);
    expect(result.updatedDocument).toEqual({
      title: "Quick Start Guide",
      description: "Introduction to the project",
      path: "/getting-started",
      parentId: null,
      sourceIds: ["intro.md"],
    });

    expect(result.originalDocument).toEqual({
      title: "Getting Started",
      description: "Introduction to the project",
      path: "/getting-started",
      parentId: null,
      sourceIds: ["intro.md"],
    });

    // Verify the document was actually updated in the structure
    const updatedDoc = result.documentStructure.find((doc) => doc.path === "/getting-started");
    expect(updatedDoc.title).toBe("Quick Start Guide");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // SUCCESSFUL UPDATE TESTS - DESCRIPTION
  test("should update document description successfully", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api",
      description: "Comprehensive API documentation with examples",
    });

    expect(result.updatedDocument.description).toBe(
      "Comprehensive API documentation with examples",
    );
    expect(result.originalDocument.description).toBe("Complete API documentation");

    const updatedDoc = result.documentStructure.find((doc) => doc.path === "/api");
    expect(updatedDoc.description).toBe("Comprehensive API documentation with examples");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // SUCCESSFUL UPDATE TESTS - SOURCE IDS
  test("should update document sourceIds successfully", async () => {
    const newSourceIds = ["new-auth.js", "updated-security.md", "examples.js"];
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      sourceIds: newSourceIds,
    });

    expect(result.updatedDocument.sourceIds).toEqual(newSourceIds);
    expect(result.originalDocument.sourceIds).toEqual(["auth.js", "security.md"]);

    const updatedDoc = result.documentStructure.find((doc) => doc.path === "/api/auth");
    expect(updatedDoc.sourceIds).toEqual(newSourceIds);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should create a copy of sourceIds array", async () => {
    const originalSourceIds = ["source1.js", "source2.md"];
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      sourceIds: originalSourceIds,
    });

    // Verify it's a copy, not a reference
    expect(result.updatedDocument.sourceIds).toEqual(originalSourceIds);
    expect(result.updatedDocument.sourceIds).not.toBe(originalSourceIds);

    // Modifying original should not affect the updated document
    originalSourceIds.push("source3.js");
    expect(result.updatedDocument.sourceIds).not.toContain("source3.js");
  });

  // SUCCESSFUL UPDATE TESTS - MULTIPLE FIELDS
  test("should update multiple fields simultaneously", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      title: "Advanced Rate Limiting",
      description: "Comprehensive guide to API rate limiting with examples",
      sourceIds: ["rate-limit-v2.js", "examples.md", "best-practices.md"],
    });

    expect(result.updatedDocument).toEqual({
      title: "Advanced Rate Limiting",
      description: "Comprehensive guide to API rate limiting with examples",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit-v2.js", "examples.md", "best-practices.md"],
    });

    expect(result.originalDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should update only specified fields, leaving others unchanged", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      title: "Advanced Authentication",
    });

    expect(result.updatedDocument).toEqual({
      title: "Advanced Authentication",
      description: "How to authenticate with the API", // Unchanged
      path: "/api/auth", // Unchanged
      parentId: "/api", // Unchanged
      sourceIds: ["auth.js", "security.md"], // Unchanged
    });
  });

  // VALIDATION ERROR TESTS
  test("should return error when path is missing", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      title: "New Title",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.originalDocument).toBeUndefined();
    expect(result.updatedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot update document: path: Required");
  });

  test("should return error when path is empty string", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "",
      title: "New Title",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith("⚠️  Cannot update document: path: Path is required");
  });

  test("should return error when no update fields are provided", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: : At least one field (title, description, or sourceIds) must be provided for update",
    );
  });

  test("should return error when all update fields are undefined", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      title: undefined,
      description: undefined,
      sourceIds: undefined,
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: : At least one field (title, description, or sourceIds) must be provided for update",
    );
  });

  test("should return error when document does not exist", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/nonexistent-document",
      title: "New Title",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: Document '/nonexistent-document' does not exist. Choose an existing document to update.",
    );
  });

  // SOURCE IDS VALIDATION TESTS
  test("should return error when sourceIds is not an array", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      sourceIds: "not-an-array",
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: sourceIds: Expected array, received string",
    );
  });

  test("should return error when sourceIds is empty array", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      sourceIds: [],
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: sourceIds: Array must contain at least 1 element(s)",
    );
  });

  test("should return error when sourceIds is null", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      sourceIds: null,
    });

    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.originalDocument).toBeUndefined();
    expect(result.updatedDocument).toBeUndefined();
    // null is not an array, so it triggers sourceIds validation error
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: sourceIds: Expected array, received null",
    );
  });

  // EDGE CASES
  test("should return error when updating with empty strings (falsy values)", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      title: "",
      description: "",
    });

    // Empty strings trigger specific field validation errors
    expect(result.documentStructure).toEqual(baseDocumentStructure);
    expect(result.originalDocument).toBeUndefined();
    expect(result.updatedDocument).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: title: String must contain at least 1 character(s), description: String must contain at least 1 character(s)",
    );
  });

  test("should handle updating deeply nested document", async () => {
    const nestedStructure = [
      ...baseDocumentStructure,
      {
        title: "OAuth",
        description: "OAuth authentication flow",
        path: "/api/auth/oauth",
        parentId: "/api/auth",
        sourceIds: ["oauth.js"],
      },
    ];

    const result = await runUpdate({
      documentStructure: nestedStructure,
      path: "/api/auth/oauth",
      title: "OAuth 2.0 Implementation",
    });

    expect(result.updatedDocument.title).toBe("OAuth 2.0 Implementation");
    expect(result.updatedDocument.path).toBe("/api/auth/oauth");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should handle empty documentation structure", async () => {
    const result = await runUpdate({
      documentStructure: [],
      path: "/any-path",
      title: "New Title",
    });

    expect(result.documentStructure).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️  Cannot update document: Document '/any-path' does not exist. Choose an existing document to update.",
    );
  });

  test("should handle single documentation structure", async () => {
    const singleDocStructure = [
      {
        title: "Only Document",
        description: "The only document",
        path: "/only",
        parentId: null,
        sourceIds: ["only.md"],
      },
    ];

    const result = await runUpdate({
      documentStructure: singleDocStructure,
      path: "/only",
      title: "Updated Only Document",
    });

    expect(result.documentStructure).toHaveLength(1);
    expect(result.updatedDocument.title).toBe("Updated Only Document");
    expect(consoleSpy).not.toHaveBeenCalled();
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

    const result = await runUpdate({
      documentStructure: specialStructure,
      path: "/api/special-chars_and.numbers123",
      title: "Updated Special Document",
    });

    expect(result.updatedDocument.title).toBe("Updated Special Document");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // DATA INTEGRITY TESTS
  test("should not modify original documentation structure", async () => {
    const originalStructure = [...baseDocumentStructure];

    await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      title: "Updated Title",
    });

    expect(baseDocumentStructure).toEqual(originalStructure);
  });

  test("should update only the specified document", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      title: "Updated Authentication",
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
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api",
      description: "Updated API documentation",
    });

    // Verify all documents are in the same positions
    for (let i = 0; i < baseDocumentStructure.length; i++) {
      expect(result.documentStructure[i].path).toBe(baseDocumentStructure[i].path);
      if (baseDocumentStructure[i].path === "/api") {
        // This is the updated document
        expect(result.documentStructure[i].description).toBe("Updated API documentation");
      } else {
        // Other documents should be unchanged
        expect(result.documentStructure[i]).toEqual(baseDocumentStructure[i]);
      }
    }
  });

  test("should preserve parentId and path when updating other fields", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      title: "New Authentication Title",
      description: "New authentication description",
      sourceIds: ["new-auth.js"],
    });

    expect(result.updatedDocument.path).toBe("/api/auth");
    expect(result.updatedDocument.parentId).toBe("/api");
    expect(result.originalDocument.path).toBe("/api/auth");
    expect(result.originalDocument.parentId).toBe("/api");
  });

  // RETURN VALUE TESTS
  test("should return complete original and updated document information", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/rate-limiting",
      title: "Enhanced Rate Limiting",
      description: "Advanced rate limiting techniques",
    });

    expect(result.originalDocument).toEqual({
      title: "Rate Limiting",
      description: "API rate limiting documentation",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    expect(result.updatedDocument).toEqual({
      title: "Enhanced Rate Limiting",
      description: "Advanced rate limiting techniques",
      path: "/api/rate-limiting",
      parentId: "/api",
      sourceIds: ["rate-limit.js"],
    });

    // Verify both have all required properties
    ["title", "description", "path", "parentId", "sourceIds"].forEach((prop) => {
      expect(result.originalDocument).toHaveProperty(prop);
      expect(result.updatedDocument).toHaveProperty(prop);
    });
  });

  test("should handle updating with multiple source IDs", async () => {
    const multipleSourceIds = [
      "main.js",
      "helper.js",
      "documentation.md",
      "examples/example1.js",
      "examples/example2.js",
    ];

    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      sourceIds: multipleSourceIds,
    });

    expect(result.updatedDocument.sourceIds).toEqual(multipleSourceIds);
    expect(result.updatedDocument.sourceIds).toHaveLength(5);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  // PARTIAL UPDATE TESTS
  test("should handle partial updates with mixed defined/undefined values", async () => {
    const result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      title: "New Title",
      description: undefined, // Should not be updated
      sourceIds: ["new-source.md"], // Should be updated
    });

    expect(result.updatedDocument).toEqual({
      title: "New Title", // Updated
      description: "Introduction to the project", // Unchanged
      path: "/getting-started",
      parentId: null,
      sourceIds: ["new-source.md"], // Updated
    });
  });

  test("should correctly identify when any update field is provided", async () => {
    // Test with only title
    let result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/getting-started",
      title: "Only Title Updated",
    });
    expect(result.updatedDocument.title).toBe("Only Title Updated");
    expect(consoleSpy).not.toHaveBeenCalled();

    // Test with only description
    consoleSpy.mockClear();
    result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api",
      description: "Only Description Updated",
    });
    expect(result.updatedDocument.description).toBe("Only Description Updated");
    expect(consoleSpy).not.toHaveBeenCalled();

    // Test with only sourceIds
    consoleSpy.mockClear();
    result = await runUpdate({
      documentStructure: baseDocumentStructure,
      path: "/api/auth",
      sourceIds: ["only-sources-updated.js"],
    });
    expect(result.updatedDocument.sourceIds).toEqual(["only-sources-updated.js"]);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
