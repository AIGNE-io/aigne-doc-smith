import { describe, expect, test } from "bun:test";
import updateDocumentContent from "../../../../agents/update/document-tools/update-document-content.mjs";

describe("update-document-content", () => {
  // INPUT VALIDATION TESTS
  test("should throw error when originalContent is not provided", async () => {
    await expect(updateDocumentContent({ diffPatch: "valid patch" })).rejects.toThrow(
      "originalContent must be a non-empty string",
    );
  });

  test("should throw error when originalContent is not a string", async () => {
    await expect(
      updateDocumentContent({ originalContent: 123, diffPatch: "valid patch" }),
    ).rejects.toThrow("originalContent must be a non-empty string");
  });

  test("should throw error when originalContent is empty string", async () => {
    await expect(
      updateDocumentContent({ originalContent: "", diffPatch: "valid patch" }),
    ).rejects.toThrow("originalContent must be a non-empty string");
  });

  test("should throw error when diffPatch is not provided", async () => {
    await expect(updateDocumentContent({ originalContent: "original content" })).rejects.toThrow(
      "diffPatch must be a non-empty string",
    );
  });

  test("should throw error when diffPatch is not a string", async () => {
    await expect(
      updateDocumentContent({ originalContent: "original content", diffPatch: null }),
    ).rejects.toThrow("diffPatch must be a non-empty string");
  });

  test("should throw error when diffPatch is empty string", async () => {
    await expect(
      updateDocumentContent({ originalContent: "original content", diffPatch: "" }),
    ).rejects.toThrow("diffPatch must be a non-empty string");
  });

  // SUCCESSFUL PATCH APPLICATION TESTS
  test("should successfully apply simple diff patch", async () => {
    const originalContent = "line 1\nline 2\nline 3";
    const diffPatch = "@@ -1,3 +1,3 @@\n line 1\n-line 2\n+updated line 2\n line 3";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\nupdated line 2\nline 3");
    expect(result.message).toBe("Document content updated successfully");
  });

  test("should handle diff with multiple hunks", async () => {
    const originalContent = "line 1\nline 2\nline 3\nline 4\nline 5";
    const diffPatch =
      "@@ -1,2 +1,2 @@\n-line 1\n+updated line 1\n line 2\n@@ -4,2 +4,2 @@\n line 4\n-line 5\n+updated line 5";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("updated line 1\nline 2\nline 3\nline 4\nupdated line 5");
  });

  test("should handle diff with additions only", async () => {
    const originalContent = "line 1\nline 2";
    const diffPatch = "@@ -2,0 +3,2 @@\n line 2\n+new line 3\n+new line 4";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\nline 2\nnew line 3\nnew line 4");
  });

  test("should handle diff with deletions only", async () => {
    const originalContent = "line 1\nline 2\nline 3\nline 4";
    const diffPatch = "@@ -2,2 +2,0 @@\n line 1\n-line 2\n-line 3\n line 4";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\nline 4");
  });

  test("should handle diff with context lines", async () => {
    const originalContent = "line 1\nline 2\nline 3\nline 4\nline 5";
    const diffPatch =
      "@@ -2,3 +2,3 @@\n line 1\n line 2\n-line 3\n+updated line 3\n line 4\n line 5";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\nline 2\nupdated line 3\nline 4\nline 5");
  });

  // DIFF PATCH PARSING TESTS
  test("should return error for invalid diff format", async () => {
    const originalContent = "line 1\nline 2";
    const diffPatch = "invalid diff format";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result).toEqual({
      success: false,
      error: "No valid hunks found in diff",
      message: "Invalid diff format",
    });
  });

  test("should return error for empty diff", async () => {
    const originalContent = "line 1\nline 2";
    const diffPatch = "\n\n";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result).toEqual({
      success: false,
      error: "No valid hunks found in diff",
      message: "Invalid diff format",
    });
  });

  test("should handle malformed hunk headers gracefully", async () => {
    const originalContent = "line 1\nline 2";
    const diffPatch = "@@malformed header@@\n-line 1\n+updated line 1";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid diff format");
  });

  // LINE NUMBER FIXING TESTS
  test("should fix line numbers when patch position is off", async () => {
    const originalContent = "prefix line\nline 1\nline 2\nline 3";
    // This diff patch expects to find "line 1" at line 1, but it's actually at line 2
    const diffPatch = "@@ -1,2 +1,2 @@\n-line 1\n+updated line 1\n line 2";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("prefix line\nupdated line 1\nline 2\nline 3");
  });

  test("should use fuzzy matching when exact match fails", async () => {
    const originalContent = "similar line 1\nsimilar line 2\ndifferent content\nsimilar line 3";
    // This patch refers to lines that are similar but not exactly matching
    const diffPatch = "@@ -10,2 +10,2 @@\n-similar line 1\n+updated line 1\n similar line 2";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe(
      "updated line 1\nsimilar line 2\ndifferent content\nsimilar line 3",
    );
  });

  test("should return error when no matching context found", async () => {
    const originalContent = "completely different content\nnothing matches";
    const diffPatch =
      "@@ -1,2 +1,2 @@\n-line that doesn't exist\n+updated line\n another nonexistent line";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot find matching context");
    expect(result.message).toBe("Cannot fix diff line number issues");
  });

  // COMPLEX DIFF SCENARIOS
  test("should handle diff with no context lines", async () => {
    const originalContent = "line 1\nline 2\nline 3";
    const diffPatch = "@@ -2,1 +2,1 @@\n-line 2\n+updated line 2";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\nupdated line 2\nline 3");
  });

  test("should handle diff with single line count (implicit 1)", async () => {
    const originalContent = "line 1\nline 2\nline 3";
    const diffPatch = "@@ -2 +2 @@\n-line 2\n+updated line 2";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\nupdated line 2\nline 3");
  });

  test("should handle multiple changes in single hunk", async () => {
    const originalContent = "line 1\nline 2\nline 3\nline 4\nline 5";
    const diffPatch =
      "@@ -2,3 +2,4 @@\n line 1\n-line 2\n-line 3\n+updated line 2\n+new line\n+updated line 3\n line 4";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe(
      "line 1\nupdated line 2\nnew line\nupdated line 3\nline 4\nline 5",
    );
  });

  // EDGE CASES
  test("should handle empty lines in diff", async () => {
    const originalContent = "line 1\n\nline 3";
    const diffPatch = "@@ -1,3 +1,3 @@\n line 1\n \n-line 3\n+updated line 3";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 1\n\nupdated line 3");
  });

  test("should handle diff with trailing newlines", async () => {
    const originalContent = "line 1\nline 2\n";
    const diffPatch = "@@ -1,2 +1,2 @@\n-line 1\n+updated line 1\n line 2";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("updated line 1\nline 2\n");
  });

  // REALISTIC DOCUMENTATION UPDATE SCENARIOS
  test("should handle updating code blocks", async () => {
    const originalContent =
      "# API Reference\n\n```javascript\nfunction oldFunction() {\n  return 'old';\n}\n```\n\nDescription here.";
    const diffPatch =
      "@@ -3,3 +3,3 @@\n # API Reference\n \n ```javascript\n-function oldFunction() {\n-  return 'old';\n+function newFunction() {\n+  return 'new';\n }\n ```";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain("function newFunction()");
    expect(result.updatedContent).toContain("return 'new';");
  });

  test("should handle adding new sections", async () => {
    const originalContent =
      "# Documentation\n\n## Section 1\n\nContent 1\n\n## Section 3\n\nContent 3";
    const diffPatch =
      "@@ -4,0 +5,3 @@\n Content 1\n \n+## Section 2\n+\n+Content 2\n+\n ## Section 3";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain("## Section 2");
    expect(result.updatedContent).toContain("Content 2");
  });

  test("should handle removing outdated content", async () => {
    const originalContent =
      "# Guide\n\n## Current Feature\n\nThis is current.\n\n## Deprecated Feature\n\nThis is deprecated.\n\n## Another Feature\n\nThis is also current.";
    const diffPatch =
      "@@ -5,4 +5,0 @@\n This is current.\n \n-## Deprecated Feature\n-\n-This is deprecated.\n-\n ## Another Feature";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).not.toContain("Deprecated Feature");
    expect(result.updatedContent).toContain("Current Feature");
    expect(result.updatedContent).toContain("Another Feature");
  });

  // ERROR SCENARIOS WITH REALISTIC CONTENT
  test("should handle conflicting patches gracefully", async () => {
    const originalContent = "line 1\nline 2\nline 3";
    // This patch tries to modify content that doesn't match exactly
    const diffPatch =
      "@@ -1,3 +1,3 @@\n-different line 1\n-different line 2\n+updated line 1\n+updated line 2\n line 3";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot find matching context");
  });

  test("should handle patches with incorrect line counts", async () => {
    const originalContent = "line 1\nline 2\nline 3\nline 4";
    // Incorrect line count in hunk header (says 5 lines but content has 4)
    const diffPatch = "@@ -1,5 +1,3 @@\n-line 1\n-line 2\n line 3\n line 4";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toBe("line 3\nline 4");
  });

  // FUZZY MATCHING EDGE CASES
  test("should succeed fuzzy matching with high similarity", async () => {
    const originalContent =
      "function calculateTotal(items) {\n  let total = 0;\n  for (item of items) {\n    total += item.price;\n  }\n  return total;\n}";
    // Patch has slight differences but should match with fuzzy matching
    const diffPatch =
      "@@ -2,2 +2,2 @@\n function calculateTotal(items) {\n-  let total = 0;\n+  let sum = 0;\n   for (item of items) {";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(true);
    expect(result.updatedContent).toContain("let sum = 0;");
  });

  test("should fail fuzzy matching with low similarity", async () => {
    const originalContent = "completely different content\nwith nothing similar\nat all";
    const diffPatch =
      "@@ -1,2 +1,2 @@\n-some totally different text\n+updated text\n that has no relation";

    const result = await updateDocumentContent({ originalContent, diffPatch });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot find matching context");
  });
});
