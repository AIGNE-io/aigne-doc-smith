#!/usr/bin/env node

import { checkMarkdown } from "../utils/markdown-checker.mjs";
import checkDetailResult from "../agents/check-detail-result.mjs";
import { shutdownValidation } from "../utils/mermaid-validator.mjs";

// Mock structure plan for link validation
const mockStructurePlan = [
  { path: "./getting-started" },
  { path: "/api/overview" },
  { path: "./advanced/configuration" },
  { path: "./tutorials/basic" },
  { path: "/reference/api" },
];

// Create allowed links set
const allowedLinks = new Set();
mockStructurePlan.forEach((item) => {
  allowedLinks.add(item.path);
  // Add processed .md path
  let processedPath = item.path;
  if (processedPath.startsWith(".")) {
    processedPath = processedPath.replace(/^\./, "");
  }
  let flatPath = processedPath.replace(/^\//, "").replace(/\//g, "-");
  flatPath = `./${flatPath}.md`;
  allowedLinks.add(flatPath);
});

const testCases = [
  // ========== PASSING CASES ==========
  {
    category: "✅ PASSING CASES",
    name: "Perfect valid document",
    expectPass: true,
    content: `# Getting Started Guide

This is a complete document with proper structure and formatting.

## Introduction

Welcome to our comprehensive guide. This document follows all markdown best practices.

## Code Examples

Here's a properly formatted code block:

\`\`\`javascript
function validateInput(data) {
    if (!data) {
        throw new Error("Data is required");
    }
    return data.trim();
}

// Export the function
export { validateInput };
\`\`\`

## Data Tables

Our API supports the following data types:

|Type|Description|Example|
|----|-----------|-------|
|String|Text data|"Hello"|
|Number|Numeric values|42|
|Boolean|True/false|true|

## Process Flow

The following diagram shows our validation process:

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Valid Input?}
    B -->|Yes| C[Process Data]
    B -->|No| D[Return Error]
    C --> E[Save Results]
    D --> F[Log Error]
    E --> G[End]
    F --> G
\`\`\`

## Related Documentation

For more information, see our [API reference](/reference/api) and [advanced configuration](./advanced/configuration).

This document ends with proper punctuation and formatting.
`,
  },

  {
    category: "✅ PASSING CASES",
    name: "Simple valid content",
    expectPass: true,
    content: `# Simple Document

This is a simple but valid document.

It has multiple paragraphs and proper structure.

The content ends with a period.
`,
  },

  {
    category: "✅ PASSING CASES",
    name: "Valid content with Chinese punctuation",
    expectPass: true,
    content: `# 中文文档

这是一个中文文档的示例。

## 内容说明

文档内容使用中文标点符号。

这个文档以中文句号结尾。
`,
  },

  // ========== LINK VALIDATION CASES ==========
  {
    category: "🔗 LINK VALIDATION",
    name: "Dead internal link",
    expectPass: false,
    expectedErrors: ["dead link"],
    content: `# Test Document

Check out this [broken link](./non-existent-page) for more info.

This content ends properly.
`,
  },

  {
    category: "🔗 LINK VALIDATION",
    name: "Multiple dead links",
    expectPass: false,
    expectedErrors: ["dead link"],
    content: `# Test Document

See [invalid page](./invalid) and [another broken link](/broken/path).

External links like [Google](https://google.com) should be ignored.

This content ends properly.
`,
  },

  {
    category: "🔗 LINK VALIDATION",
    name: "Valid internal links",
    expectPass: true,
    content: `# Test Document

Check out our [getting started guide](./getting-started) and [API overview](/api/overview).

External links like [GitHub](https://github.com) and [email](mailto:test@example.com) are fine.

This content ends properly.
`,
  },

  // ========== CODE BLOCK VALIDATION CASES ==========
  {
    category: "💻 CODE BLOCK VALIDATION",
    name: "Inconsistent code block indentation",
    expectPass: false,
    expectedErrors: ["code block with inconsistent indentation"],
    content: `# Test Document

Here's incorrectly indented code:

    \`\`\`javascript
function test() {
    return "content not properly indented";
}
    \`\`\`

This content ends properly.
`,
  },

  {
    category: "💻 CODE BLOCK VALIDATION",
    name: "Incomplete code block",
    expectPass: false,
    expectedErrors: ["incomplete code block"],
    content: `# Test Document

Here's incomplete code:

\`\`\`javascript
function incomplete() {
    console.log("missing closing");
`,
  },

  {
    category: "💻 CODE BLOCK VALIDATION",
    name: "Valid indented code block",
    expectPass: true,
    content: `# Test Document

Here's properly indented code:

    \`\`\`javascript
    function test() {
        return "properly indented";
    }
    \`\`\`

This content ends properly.
`,
  },

  // ========== CONTENT STRUCTURE CASES ==========
  {
    category: "📝 CONTENT STRUCTURE",
    name: "Single line content",
    expectPass: false,
    expectedErrors: ["single line content"],
    content: `This is just one line without any line breaks or proper structure`,
  },

  {
    category: "📝 CONTENT STRUCTURE",
    name: "Missing punctuation ending",
    expectPass: false,
    expectedErrors: ["incomplete content"],
    content: `# Test Document

This content doesn't end with proper punctuation`,
  },

  {
    category: "📝 CONTENT STRUCTURE",
    name: "Content with proper line breaks",
    expectPass: true,
    content: `# Test Document

This content has proper line breaks.

Multiple paragraphs are formatted correctly.

The document ends with proper punctuation.
`,
  },

  // ========== TABLE VALIDATION CASES ==========
  {
    category: "📊 TABLE VALIDATION",
    name: "Table separator with fewer columns",
    expectPass: false,
    expectedErrors: ["table separator with mismatched column count"],
    content: `# Test Document

| Column 1 | Column 2 | Column 3 |
| - | - |
| Data 1 | Data 2 | Data 3 |

This content ends properly.
`,
  },

  {
    category: "📊 TABLE VALIDATION",
    name: "Table separator with more columns",
    expectPass: false,
    expectedErrors: ["table separator with mismatched column count"],
    content: `# Test Document

| Column 1 | Column 2 |
|----------|----------|----------|
| Data 1   | Data 2   |

This content ends properly.
`,
  },

  {
    category: "📊 TABLE VALIDATION",
    name: "Table data row with mismatched columns",
    expectPass: false,
    expectedErrors: ["table data row with mismatched column count"],
    content: `# Test Document

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   | Data 3 |

This content ends properly.
`,
  },

  {
    category: "📊 TABLE VALIDATION",
    name: "Valid table with consistent columns",
    expectPass: true,
    content: `# Test Document

|Column 1|Column 2|Column 3|
|--------|--------|--------|
|Data 1|Data 2|Data 3|
|Row 2|More|Data|

This content ends properly.

| 参数 | 类型 | 描述 |
|---|---|---|
| callback | () => void \\| Promise<void> | Payment Kit 组件运行后要执行的函数。这可以是一个异步函数。 |
| wait | boolean | 可选。如果为 ，稍后在组件启动时执行回调。 |

This document demonstrates escaped pipe handling.
`,
  },

  // ========== MERMAID VALIDATION CASES ==========
  {
    category: "🧩 MERMAID VALIDATION",
    name: "Invalid Mermaid syntax",
    expectPass: false,
    expectedErrors: ["Mermaid syntax error"],
    content: `# Test Document

\`\`\`mermaid
invalid diagram type
    A --> B
\`\`\`

This content ends properly.
`,
  },

  {
    category: "🧩 MERMAID VALIDATION",
    name: "Mermaid with backticks in node labels",
    expectPass: false,
    expectedErrors: ["backticks in Mermaid node label"],
    content: `# Test Document

\`\`\`mermaid
flowchart TD
    A["label with \`backticks\`"] --> B[End]
    C{"another \`label\` with backticks"} --> D[Final]
\`\`\`

This content ends properly.
`,
  },

  {
    category: "🧩 MERMAID VALIDATION",
    name: "Mermaid with numbered edge descriptions",
    expectPass: false,
    expectedErrors: ["numbered list format in Mermaid edge description"],
    content: `# Test Document

\`\`\`mermaid
flowchart TD
    A[Start] -- "1. First step" --> B[Middle]
    B -- "2. Second step" --> C[End]
\`\`\`

This content ends properly.
`,
  },

  {
    category: "🧩 MERMAID VALIDATION",
    name: "Mermaid with unquoted special characters",
    expectPass: false,
    expectedErrors: ["unquoted special characters"],
    content: `# Test Document

\`\`\`mermaid
flowchart LR
    A[Start] --> B[Response.raw (file-like) is available]
    B --> C[End]
\`\`\`

This content ends properly.
`,
  },

  {
    category: "🧩 MERMAID VALIDATION",
    name: "Valid Mermaid diagrams",
    expectPass: true,
    content: `# Test Document

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> E[Save]
    E --> D
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob
    B-->>A: Hello Alice
\`\`\`

This content ends properly.
`,
  },

  {
    category: "🧩 MERMAID VALIDATION",
    name: "Mermaid with subgraph reference issues (rendering failure)",
    expectPass: false,
    expectedErrors: ["subgraph reference"],
    content: `# Test Document

\`\`\`mermaid
flowchart TD
    A["FastAPI Application"] --> B["Security & Authentication"];
    A --> C["Error Handling"];
    A --> D["WebSockets"];
    A --> E["Middleware"];
    A --> F["Lifespan Events"];
    A --> G["Database Integration"];
    H["Project Structure"] -- "Organizes" --> A;
    I["Application Settings"] -- "Configures" --> A;
    J["Testing FastAPI Applications"] -- "Ensures Reliability" --> A;
    A --> K["Deployment"];

    subgraph Advanced Capabilities
        B
        C
        D
        E
        F
        G
    end

    subgraph Operational Excellence
        H
        I
        J
        K
    end

    AdvancedCapabilities --> "Robustness" --> L["Production-Ready API"];
    OperationalExcellence --> "Maintainability & Scalability" --> L;
\`\`\`

This content ends properly.
`,
  },

  // ========== COMPLEX MIXED CASES ==========
  {
    category: "🔄 COMPLEX MIXED CASES",
    name: "Multiple issues in one document",
    expectPass: false,
    expectedErrors: [
      "dead link",
      "table separator with mismatched column count",
      "incomplete content",
    ],
    content: `# Complex Test Document

This document has [multiple issues](./broken-link).

| Column 1 | Column 2 | Column 3 |
| - | - |
| Data 1 | Data 2 | Data 3 |

\`\`\`mermaid
flowchart TD
    A["node with \`backticks\`"] --> B[End]
\`\`\`

This content doesn't end properly`,
  },

  {
    category: "🔄 COMPLEX MIXED CASES",
    name: "Complex valid document with all elements",
    expectPass: true,
    content: `# Comprehensive Test Document

This document contains all supported elements in their correct form.

## Links Section

Internal links: [Getting Started](./getting-started) and [API Reference](/api/overview).
External links: [GitHub](https://github.com) and [Email](mailto:support@example.com).

## Code Examples

Standard code block:

\`\`\`javascript
function processData(input) {
    const result = input.map(item => ({
        id: item.id,
        value: item.value * 2
    }));
    return result;
}
\`\`\`

## Data Tables

|Feature|Status|Notes|
|-------|------|-----|
|API v1|Active|Current version|
|API v2|Beta|Testing phase|
|Dashboard|Complete|Ready for use|

## Process Diagrams

Main workflow:

\`\`\`mermaid
flowchart TD
    A[User Request] --> B{Validate Input}
    B -->|Valid| C[Process Request]
    B -->|Invalid| D[Return Error]
    C --> E[Generate Response]
    D --> F[Log Error]
    E --> G[Send Response]
    F --> G
\`\`\`

Sequence diagram:

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant D as Database
    
    U->>A: Send Request
    A->>D: Query Data
    D-->>A: Return Results
    A-->>U: Send Response
\`\`\`

## Conclusion

This comprehensive document demonstrates all validation rules in their correct usage.
`,
  },
];

async function runValidationTests() {
  console.log("🧪 Comprehensive Markdown Validation Test Suite\n");
  console.log("=".repeat(80));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  let currentCategory = "";

  for (const testCase of testCases) {
    // Print category header if it changed
    if (testCase.category !== currentCategory) {
      currentCategory = testCase.category;
      console.log(`\n${currentCategory}`);
      console.log("-".repeat(80));
    }

    console.log(`\n📝 Testing: ${testCase.name}`);
    totalTests++;

    try {
      // Test with checkMarkdown directly
      const errors = await checkMarkdown(testCase.content, "test", {
        allowedLinks,
      });

      // Test with checkDetailResult wrapper
      const wrapperResult = await checkDetailResult({
        structurePlan: mockStructurePlan,
        reviewContent: testCase.content,
      });

      const hasErrors = errors.length > 0;
      const expectPass = testCase.expectPass;

      // Verify test expectation
      if (expectPass && !hasErrors) {
        console.log("✅ PASS - Content correctly passed validation");
        passedTests++;
      } else if (!expectPass && hasErrors) {
        console.log("✅ PASS - Content correctly failed validation");

        // Check if expected error types are present
        if (testCase.expectedErrors) {
          const foundExpectedErrors = testCase.expectedErrors.every(
            (expectedError) =>
              errors.some((error) =>
                error.toLowerCase().includes(expectedError.toLowerCase())
              )
          );

          if (foundExpectedErrors) {
            console.log("✅ Expected error types found");
          } else {
            console.log("⚠️  Expected error types not all found");
            console.log(`   Expected: ${testCase.expectedErrors.join(", ")}`);
          }
        }

        passedTests++;
      } else {
        console.log(
          `❌ FAIL - Expected ${expectPass ? "PASS" : "FAIL"} but got ${
            hasErrors ? "FAIL" : "PASS"
          }`
        );
        failedTests++;
      }

      // Show error details for failing cases
      if (hasErrors) {
        console.log(`   Found ${errors.length} issue(s):`);
        errors.slice(0, 3).forEach((error) => {
          console.log(`   • ${error}`);
        });
        if (errors.length > 3) {
          console.log(`   ... and ${errors.length - 3} more issues`);
        }
      }

      // Verify consistency between direct call and wrapper
      const wrapperErrors = wrapperResult.detailFeedback
        ? wrapperResult.detailFeedback.split("\n").filter((line) => line.trim())
        : [];

      if (errors.length === wrapperErrors.length) {
        console.log("✅ Direct call and wrapper consistent");
      } else {
        console.log(
          `⚠️  Inconsistent results: direct=${errors.length}, wrapper=${wrapperErrors.length}`
        );
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failedTests++;
    }
  }

  // Final summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  console.log("\n🔍 VALIDATION COVERAGE:");
  console.log("✅ Link validation (dead links, allowed links)");
  console.log("✅ Code block validation (indentation, completeness)");
  console.log("✅ Content structure (line breaks, punctuation)");
  console.log("✅ Table validation (column count consistency)");
  console.log("✅ Mermaid validation (syntax, rendering issues)");
  console.log("✅ Standard markdown linting (formatting rules)");
  console.log("✅ Complex mixed scenarios");
  console.log("✅ Edge cases and error conditions");

  if (failedTests === 0) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Validation system is working correctly."
    );
  } else {
    console.log(
      `\n⚠️  ${failedTests} test(s) failed. Please review the validation logic.`
    );
  }

  // Shutdown worker pool to ensure clean exit
  try {
    await shutdownValidation();
  } catch (error) {
    console.error("Error shutting down validation:", error);
  }
}

// Export test cases for external use
export { testCases, mockStructurePlan, allowedLinks };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidationTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test suite error:", error);
      process.exit(1);
    });
}
