import { afterAll, describe, expect, test } from "bun:test";
import checkDetailResult from "../agents/check-detail-result.mjs";
import { checkMarkdown } from "../utils/markdown-checker.mjs";
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

  {
    category: "💻 CODE BLOCK VALIDATION",
    name: "Code block with inconsistent indentation (user case)",
    expectPass: false,
    expectedErrors: ["code block with inconsistent indentation"],
    content: `# API Response Handling

You can retrieve the response body in various formats:

*   **\`response.content\`**: Accesses the raw response body as bytes. This is useful for non-text data like images or binary files.
    \`\`\`python
    import requests

r = requests.get('https://httpbin.org/image/png')
print(type(r.content))
# Expected output: <class 'bytes'>
    \`\`\`

*   **\`response.text\`**: Accesses the response body as Unicode text. Requests automatically guesses the encoding, or you can explicitly set \`response.encoding\`.
    \`\`\`python
    import requests

r = requests.get('https://httpbin.org/get')
print(type(r.text))
# Expected output: <class 'str'>
print(r.text)
# Expected output: {"args": {}, "headers": ..., "origin": "...", "url": "https://httpbin.org/get"}
    \`\`\`

*   **\`response.json(**kwargs)\`**: Decodes the response body as JSON into a Python object (dictionary, list, etc.). This method raises \`requests.exceptions.JSONDecodeError\` if the content is not valid JSON.
    \`\`\`python
    import requests

r = requests.get('https://httpbin.org/json')
print(type(r.json()))
# Expected output: <class 'dict'>
print(r.json())
# Expected output: {'slideshow': {'author': 'Yours Truly', 'date': 'date of publication', 'slides': [...], 'title': 'Sample Slide Show'}}
    \`\`\`

**Status and Error Handling**

*   **\`response.ok\`**: A boolean property that returns \`True\` if \`status_code\` is less than 400, indicating no client or server error. It does *not* necessarily mean \`200 OK\`.

*   **\`response.raise_for_status()\`**: Raises an \`HTTPError\` if the HTTP request returned an unsuccessful status code (4xx or 5xx). This is a convenient way to check for errors and is typically used after a request to ensure it was successful.

    \`\`\`python
    import requests
    from requests.exceptions import HTTPError

try:
    r = requests.get('https://httpbin.org/status/404')
    r.raise_for_status() # This will raise an HTTPError for 404
except HTTPError as e:
    print(f"HTTP Error occurred: {e}")
# Expected output: HTTP Error occurred: 404 Client Error: NOT FOUND for url: https://httpbin.org/status/404
    \`\`\`

This document ends properly.
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
    expectedErrors: ["Mermaid syntax error"],
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

  {
    category: "🧩 MERMAID VALIDATION",
    name: "Mermaid with numbered list format in node labels",
    expectPass: false,
    expectedErrors: ["numbered list format in Mermaid node label"],
    content: `# Test Document

\`\`\`mermaid
flowchart TD
    A["1. Create Backend Implementation<br>api/src/providers/"]
    B["2. Add Backend Configuration<br>api/src/providers/models.ts"]
    C["3. Update Frontend Selector<br>src/pages/config/ai-providers/"]
    D["4. Add Provider Logo<br>public/logo/"]
    E["5. Update Documentation"]

    A --> B --> C --> D --> E
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

describe("Markdown Validation Test Suite", () => {
  afterAll(async () => {
    // Shutdown worker pool to ensure clean exit
    try {
      await shutdownValidation();
    } catch {
      // Ignore shutdown errors in tests
    }
  });

  // Group tests by category
  const testsByCategory = testCases.reduce((acc, testCase) => {
    if (!acc[testCase.category]) {
      acc[testCase.category] = [];
    }
    acc[testCase.category].push(testCase);
    return acc;
  }, {});

  Object.entries(testsByCategory).forEach(([category, categoryTests]) => {
    describe(category, () => {
      categoryTests.forEach((testCase) => {
        test(testCase.name, async () => {
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
          if (expectPass) {
            expect(hasErrors).toBe(false);
          } else {
            expect(hasErrors).toBe(true);

            // Check if expected error types are present
            if (testCase.expectedErrors) {
              const foundExpectedErrors = testCase.expectedErrors.every((expectedError) =>
                errors.some((error) => error.toLowerCase().includes(expectedError.toLowerCase())),
              );
              expect(foundExpectedErrors).toBe(true);
            }
          }

          // Verify consistency between direct call and wrapper
          const wrapperErrors = wrapperResult.detailFeedback
            ? wrapperResult.detailFeedback.split("\n").filter((line) => line.trim())
            : [];

          // Note: We don't enforce exact equality as wrapper may format differently
          expect(wrapperErrors.length > 0).toBe(hasErrors);
        });
      });
    });
  });
});

// Export test cases for external use
export { testCases, mockStructurePlan, allowedLinks };
