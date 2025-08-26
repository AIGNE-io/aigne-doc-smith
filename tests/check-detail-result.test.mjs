import { test, expect, describe } from "bun:test";
import checkDetailResult from "../agents/check-detail-result.mjs";

describe("checkDetailResult", () => {
  test("should approve valid content", async () => {
    const structurePlan = [{ path: "/getting-started" }];
    const reviewContent = "This is a test with a [valid link](/getting-started).\n\nThis has proper structure with multiple lines.";
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
    const reviewContent = "| Header | Header |\n|--------|--------|\n| Cell | Cell |\n\nThis table is properly formatted.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

  test("should approve content with an external link", async () => {
    const structurePlan = [];
    const reviewContent = "This is a [valid external link](https://example.com).\n\nThis has proper multi-line structure.";
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

  test("should approve content with image syntax", async () => {
    const structurePlan = [];
    const reviewContent = "This is an image ![MCP Go Logo](/logo.png).\n\nThis has proper structure.";
    const result = await checkDetailResult({ structurePlan, reviewContent });
    expect(result.isApproved).toBe(true);
    expect(result.detailFeedback).toBe("");
  });

});
