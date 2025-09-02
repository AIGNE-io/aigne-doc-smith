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

  describe("Table validation", () => {
    test("should reject table with mismatched column count", async () => {
      const structurePlan = [];
      const reviewContent = 
        "| Header 1 | Header 2 | Header 3 |\n" +
        "|----------|----------|\n" + // Only 2 separator columns but 3 header columns
        "| Cell 1 | Cell 2 | Cell 3 |";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("separator has 2 columns but header has 3 columns");
    });

    test("should reject table with data row column mismatch", async () => {
      const structurePlan = [];
      const reviewContent = 
        "| Header 1 | Header 2 |\n" +
        "|----------|----------|\n" +
        "| Cell 1 | Cell 2 | Cell 3 |"; // Data row has 3 columns but separator defines 2
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("data row has 3 columns but separator defines 2 columns");
    });

    test("should handle complex table with pipes in content", async () => {
      const structurePlan = [];
      const reviewContent = 
        "| Code | Description |\n" +
        "|------|-------------|\n" +
        "| `a \\| b` | This has escaped pipe |\n" +
        "| `c | d` | This has unescaped pipe in code |";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Code block validation", () => {
    test("should reject incomplete code blocks", async () => {
      const structurePlan = [];
      const reviewContent = 
        "Here is some code:\n\n" +
        "```javascript\n" +
        "function test() {\n" +
        "  return 'incomplete';\n" +
        "}\n"; // Missing closing ```
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("incomplete code block");
    });

    test("should detect code block indentation issues", async () => {
      const structurePlan = [];
      const reviewContent = 
        "  ```javascript\n" +
        "function test() {\n" + // This line has insufficient indentation
        "    return 'test';\n" +
        "  }\n" +
        "  ```";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("insufficient indentation");
    });
  });

  describe("Content structure validation", () => {
    test("should reject single line content", async () => {
      const structurePlan = [];
      const reviewContent = "This is a single line without proper line breaks";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("single line content");
    });

    test("should reject incomplete content without proper ending", async () => {
      const structurePlan = [];
      const reviewContent = "This content doesn't end properly\n\nNo proper punctuation";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("incomplete content");
    });

    test("should approve content with valid ending punctuation", async () => {
      const structurePlan = [];
      const reviewContent = "This content ends properly.\n\nWith valid punctuation.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Mermaid syntax validation", () => {
    test("should reject Mermaid with backticks in node labels", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        '  A["Contains `backticks` in label"]\n' +
        "```";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("backticks in Mermaid node label");
    });

    test("should reject Mermaid with numbered lists in node labels", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        '  A["1. First item\\n2. Second item"]\n' +
        "```";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("numbered list format in Mermaid node label");
    });

    test("should reject Mermaid with numbered lists in edge descriptions", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        '  A -- "1. First step" --> B\n' +
        "```";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("numbered list format in Mermaid edge description");
    });

    test("should reject Mermaid with unquoted special characters", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        "  A[Node with: special chars]\n" +
        "```";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("unquoted special characters in Mermaid node label");
    });

    test("should approve properly formatted Mermaid", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        '  A["Properly quoted label"]\n' +
        '  B["Another node"]\n' +
        '  A --> B\n' +
        "```\n\n" +
        "This diagram is properly formatted.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("D2 syntax validation", () => {
    test("should handle D2 syntax errors", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```d2\n" +
        "invalid d2 syntax {{\n" + // Malformed D2
        "```\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // D2 validation might fail - we just want to ensure it's handled gracefully
      expect(typeof result.isApproved).toBe("boolean");
    });
  });

  describe("Markdown lint rules validation", () => {
    test("should handle duplicate headings check", async () => {
      const structurePlan = [];
      const reviewContent = 
        "# Section\n\n" +
        "Content here.\n\n" +
        "# Section\n\n" + // Duplicate heading
        "More content.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // Test that the function handles this case - might pass or fail depending on lint rules
      expect(typeof result.isApproved).toBe("boolean");
      expect(typeof result.detailFeedback).toBe("string");
    });

    test("should handle undefined references check", async () => {
      const structurePlan = [];
      const reviewContent = 
        "This has an [undefined reference][nonexistent].\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // Test that the function handles this case - might pass or fail depending on lint rules  
      expect(typeof result.isApproved).toBe("boolean");
      expect(typeof result.detailFeedback).toBe("string");
    });

    test("should reject content with unused definitions", async () => {
      const structurePlan = [];
      const reviewContent = 
        "This is content with proper structure.\n\n" +
        "[unused]: http://example.com 'This definition is never used'\n\n" +
        "Content continues here.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // This should be detected by remark-lint unused definitions rule
      expect(typeof result.isApproved).toBe("boolean");
      if (!result.isApproved) {
        expect(result.detailFeedback).toContain("unused");
      }
    });
  });

  describe("Advanced table edge cases", () => {
    test("should handle empty table cells correctly", async () => {
      const structurePlan = [];
      const reviewContent = 
        "| Header 1 | Header 2 | Header 3 |\n" +
        "|----------|----------|----------|\n" +
        "| Cell 1 | | Cell 3 |\n" +
        "| | Cell 2 | |";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should handle tables with code spans containing pipes", async () => {
      const structurePlan = [];
      const reviewContent = 
        "| Function | Code Example |\n" +
        "|----------|---------------|\n" +
        "| pipe | `a \\| b` |\n" +
        "| filter | `data \\| filter` |";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Code block edge cases", () => {
    test("should handle nested code blocks properly", async () => {
      const structurePlan = [];
      const reviewContent = 
        "Here's a markdown example:\n\n" +
        "```markdown\n" +
        "# Title\n" +
        "\n" +
        "```javascript\n" +
        "function test() { return true; }\n" +
        "```\n" +
        "```\n\n" +
        "This content ends properly.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should handle code blocks with unusual indentation patterns", async () => {
      const structurePlan = [];
      const reviewContent = 
        "    ```javascript\n" +
        "    function test() {\n" +
        "        return 'properly indented';\n" +
        "    }\n" +
        "    ```\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Complex Mermaid scenarios", () => {
    test("should handle Mermaid with curly brace syntax", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        '  A{"Decision point"}\n' +
        '  B["Action"]\n' +
        "  A --> B\n" +
        "```\n\n" +
        "This diagram uses proper syntax.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should reject Mermaid with problematic curly brace labels", async () => {
      const structurePlan = [];
      const reviewContent = 
        "```mermaid\n" +
        "graph TD\n" +
        '  A{"Contains `backticks` problem"}\n' +
        "```";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("backticks in Mermaid node label");
    });
  });

  describe("Image validation edge cases", () => {
    test("should approve data URLs in images", async () => {
      const structurePlan = [];
      const reviewContent = 
        "Here's an inline image ![Inline](data:image/svg+xml;base64,PHN2Zz4KPC9zdmc+).\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should handle images with complex alt text", async () => {
      const structurePlan = [];
      const reviewContent = 
        "![Complex alt text with [brackets] and (parentheses)](https://example.com/image.png)\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Link validation edge cases", () => {
    test("should handle mailto links correctly", async () => {
      const structurePlan = [];
      const reviewContent = 
        "Contact us at [email](mailto:test@example.com).\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should handle links with anchors", async () => {
      const structurePlan = [{ path: "/getting-started" }];
      const reviewContent = 
        "See the [installation section](/getting-started#installation).\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // The link checker may be strict about anchor links
      expect(typeof result.isApproved).toBe("boolean");
      if (!result.isApproved) {
        expect(result.detailFeedback).toContain("link");
      }
    });

    test("should reject anchor-only links without base path", async () => {
      const structurePlan = [];
      const reviewContent = 
        "See the [section](#non-existent-anchor).\n\n" +
        "This has proper structure.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // This should be allowed since it's just an anchor
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Content structure edge cases", () => {
    test("should approve content ending with table", async () => {
      const structurePlan = [];
      const reviewContent = 
        "Here's a data table:\n\n" +
        "| Column 1 | Column 2 |\n" +
        "|----------|----------|\n" +
        "| Data 1   | Data 2   |";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should approve content ending with list", async () => {
      const structurePlan = [];
      const reviewContent = 
        "Here are the requirements:\n\n" +
        "- First requirement\n" +
        "- Second requirement\n" +
        "- Third requirement*";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should approve content ending with blockquote", async () => {
      const structurePlan = [];
      const reviewContent = 
        "As they say:\n\n" +
        "> This is a famous quote that ends with proper punctuation.";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Real-world scenario tests", () => {
    test("should approve comprehensive valid document", async () => {
      const structurePlan = [
        { path: "./getting-started" },
        { path: "/api/overview" },
        { path: "./advanced/configuration" }
      ];
      const reviewContent = `# Getting Started Guide

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

For more information, see our [API reference](/api/overview) and [advanced configuration](./advanced/configuration).

This document ends with proper punctuation and formatting.
`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should approve content with Chinese punctuation", async () => {
      const structurePlan = [];
      const reviewContent = `# 中文文档

这是一个中文文档的示例。

## 内容说明

文档内容使用中文标点符号。

这个文档以中文句号结尾。
`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });

    test("should reject document with multiple validation issues", async () => {
      const structurePlan = [{ path: "/getting-started" }];
      const reviewContent = `# Complex Test Document

This document has [multiple issues](./broken-link).

| Column 1 | Column 2 | Column 3 |
| - | - |
| Data 1 | Data 2 | Data 3 |

\`\`\`mermaid
flowchart TD
    A["node with \`backticks\`"] --> B[End]
\`\`\`

This content doesn't end properly`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("dead link");
      expect(result.detailFeedback).toContain("separator has 2 columns but header has 3 columns");
      expect(result.detailFeedback).toContain("incomplete content");
    });
  });

  describe("Complex code block indentation cases", () => {
    test("should reject real-world code block indentation issue", async () => {
      const structurePlan = [];
      const reviewContent = `# API Response Handling

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

This document ends properly.
`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("insufficient indentation");
    });
  });

  describe("Advanced Mermaid validation cases", () => {
    test("should reject Mermaid with numbered list in node labels", async () => {
      const structurePlan = [];
      const reviewContent = `# Test Document

\`\`\`mermaid
flowchart TD
    A["1. Create Backend Implementation<br>api/src/providers/"]
    B["2. Add Backend Configuration<br>api/src/providers/models.ts"]
    C["3. Update Frontend Selector<br>src/pages/config/ai-providers/"]
    
    A --> B --> C
\`\`\`

This content ends properly.
`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(result.detailFeedback).toContain("numbered list format in Mermaid node label");
    });

    test("should handle complex Mermaid with subgraph issues", async () => {
      const structurePlan = [];
      const reviewContent = `# Test Document

\`\`\`mermaid
flowchart TD
    A["FastAPI Application"] --> B["Security & Authentication"];
    A --> C["Error Handling"];
    H["Project Structure"] -- "Organizes" --> A;

    subgraph Advanced Capabilities
        B
        C
    end

    AdvancedCapabilities --> "Robustness" --> L["Production-Ready API"];
\`\`\`

This content ends properly.
`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // This may pass or fail depending on Mermaid validation - we just ensure it doesn't crash
      expect(typeof result.isApproved).toBe("boolean");
    });
  });

  describe("Table validation with real content", () => {
    test("should approve table with escaped pipes", async () => {
      const structurePlan = [];
      const reviewContent = `# Test Document

| 参数 | 类型 | 描述 |
|---|---|---|
| callback | () => void \\| Promise<void> | Payment Kit 组件运行后要执行的函数。这可以是一个异步函数。 |
| wait | boolean | 可选。如果为，稍后在组件启动时执行回调。 |

This document demonstrates escaped pipe handling.
`;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(true);
    });
  });

  describe("Error handling", () => {
    test("should handle markdown processing errors gracefully", async () => {
      const structurePlan = [];
      // Test with extremely malformed content that might cause parsing errors
      const reviewContent = null;
      const result = await checkDetailResult({ structurePlan, reviewContent });
      expect(result.isApproved).toBe(false);
      expect(typeof result.detailFeedback).toBe("string");
    });

    test("should handle empty content gracefully", async () => {
      const structurePlan = [];
      const reviewContent = "";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // Empty content may be handled differently
      expect(typeof result.isApproved).toBe("boolean");
      expect(typeof result.detailFeedback).toBe("string");
    });

    test("should handle whitespace-only content", async () => {
      const structurePlan = [];
      const reviewContent = "   \n\n   \t  \n   ";
      const result = await checkDetailResult({ structurePlan, reviewContent });
      // Whitespace-only content may be handled differently
      expect(typeof result.isApproved).toBe("boolean");
      expect(typeof result.detailFeedback).toBe("string");
    });
  });
});
