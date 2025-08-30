import { describe, expect, test } from "bun:test";
import checkDetailResult from "../agents/check-detail-result.mjs";

describe("checkDetailResult", () => {
  test("should approve valid content", async () => {
    const structurePlan = [{ path: "/getting-started" }];
    const reviewContent =
      "This is a test with a [valid link](/getting-started).\n\nThis has proper structure with multiple lines.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should reject content with a dead link", async () => {
    const structurePlan = [{ path: "/getting-started" }];
    const reviewContent = "This contains a [dead link](/dead-link).";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(false);
    expect(result.detailFeedback).toContain("Found a dead link");
  });

  test("should accept valid table format", async () => {
    const structurePlan = [];
    const reviewContent =
      "| Header | Header |\n|--------|--------|\n| Cell | Cell |\n\nThis table is properly formatted.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should approve content with an external link", async () => {
    const structurePlan = [];
    const reviewContent =
      "This is a [valid external link](https://example.com).\n\nThis has proper multi-line structure.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should reject content with multiple issues", async () => {
    const structurePlan = [{ path: "/getting-started" }];
    const reviewContent = "This has a [dead link](/dead-link).";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(false);
    expect(result.detailFeedback).toContain("dead link");
  });

  test("should approve content with external image syntax", async () => {
    const structurePlan = [];
    const reviewContent =
      "This is an image ![MCP Go Logo](https://example.com/logo.png).\n\nThis has proper structure.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should approve content with valid local image path", async () => {
    const structurePlan = [];
    const reviewContent =
      "This is a valid image ![Test Image](./README.md).\n\nThis has proper structure.";
    const docsDir = process.cwd();
    const result = await checkDetailResult({ structurePlan, reviewContent, docsDir });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should reject content with invalid local image path", async () => {
    const structurePlan = [];
    const reviewContent =
      "This is an invalid image ![Non-existent Image](./nonexistent.png).\n\nThis has proper structure.";
    const docsDir = process.cwd();
    const result = await checkDetailResult({ structurePlan, reviewContent, docsDir });
    expect(result.isApproved).toBe(false);
    expect(result.detailFeedback).toContain("Found invalid local image");
    expect(result.detailFeedback).toContain("only valid media resources can be used");
  });

  test("should approve content with absolute image path that exists", async () => {
    const structurePlan = [];
    const reviewContent = `This is an absolute image ![Test Image](${process.cwd()}/README.md).\n\nThis has proper structure.`;
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should reject content with absolute image path that doesn't exist", async () => {
    const structurePlan = [];
    const reviewContent =
      "This is an invalid absolute image ![Non-existent Image](/path/to/nonexistent.png).\n\nThis has proper structure.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(false);
    expect(result.detailFeedback).toContain("Found invalid local image");
    expect(result.detailFeedback).toContain("only valid media resources can be used");
  });

  test("should approve content with external image URL", async () => {
    const structurePlan = [];
    const reviewContent =
      "This is an external image ![External Image](https://example.com/image.png).\n\nThis has proper structure.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });
});
