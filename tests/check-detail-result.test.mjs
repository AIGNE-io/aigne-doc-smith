import checkDetailResult from "../agents/check-detail-result.mjs";

async function runTests() {
  function assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  async function testApproveValidContent() {
    console.log("Testing: should approve valid content");
    const structurePlan = [{ path: "/getting-started" }];
    const content = "This is a test with a [valid link](/getting-started).";
    const result = await checkDetailResult({ structurePlan, content });
    assert(result.isApproved === true, "Should be approved");
    assert(result.detailFeedback === "", "Feedback should be empty");
    console.log("✅ Test passed: should approve valid content");
  }

  async function testRejectDeadLink() {
    console.log("Testing: should reject content with a dead link");
    const structurePlan = [{ path: "/getting-started" }];
    const content = "This contains a [dead link](/dead-link).";
    const result = await checkDetailResult({ structurePlan, content });
    assert(result.isApproved === false, "Should not be approved");
    assert(result.detailFeedback.includes("Found a dead link"), "Should report dead link");
    console.log("✅ Test passed: should reject content with a dead link");
  }

  async function testRejectIncorrectTableSeparator() {
    console.log("Testing: should reject content with incorrect table separator");
    const structurePlan = [];
    const content = "| Header | Header |\n| - | - |\n| Cell | Cell |";
    const result = await checkDetailResult({ structurePlan, content });
    assert(result.isApproved === false, "Should not be approved");
    assert(
      result.detailFeedback.includes("incorrect table separator"),
      "Should report incorrect table separator",
    );
    console.log("✅ Test passed: should reject content with incorrect table separator");
  }

  async function testApproveExternalLink() {
    console.log("Testing: should approve content with an external link");
    const structurePlan = [];
    const content = "This is a [valid external link](https://example.com).";
    const result = await checkDetailResult({ structurePlan, content });
    assert(result.isApproved === true, "Should be approved");
    assert(result.detailFeedback === "", "Feedback should be empty");
    console.log("✅ Test passed: should approve content with an external link");
  }

  async function testRejectMultipleIssues() {
    console.log("Testing: should reject content with multiple issues");
    const structurePlan = [{ path: "/getting-started" }];
    const content = "This has a [dead link](/dead-link) and an incorrect table: | - |.";
    const result = await checkDetailResult({ structurePlan, content });
    assert(result.isApproved === false, "Should not be approved");
    assert(result.detailFeedback.includes("Found a dead link"), "Should report dead link");
    assert(
      result.detailFeedback.includes("incorrect table separator"),
      "Should report incorrect table separator",
    );
    console.log("✅ Test passed: should reject content with multiple issues");
  }

  async function testApproveImageSyntax() {
    console.log("Testing: should approve content with image syntax");
    const structurePlan = [];
    const content = "This is an image ![MCP Go Logo](/logo.png).";
    const result = await checkDetailResult({ structurePlan, content });
    assert(result.isApproved === true, "Should be approved");
    assert(result.detailFeedback === "", "Feedback should be empty");
    console.log("✅ Test passed: should approve content with image syntax");
  }

  try {
    console.log("🚀 Starting checkDetailResult tests...");
    await testApproveValidContent();
    await testRejectDeadLink();
    await testRejectIncorrectTableSeparator();
    await testApproveExternalLink();
    await testRejectMultipleIssues();
    await testApproveImageSyntax();
    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

runTests();
