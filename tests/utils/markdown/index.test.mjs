import { describe, expect, test } from "bun:test";
import { getMarkdownAst, traverseMarkdownAst } from "../../../utils/markdown/index.mjs";

describe("markdown utilities", () => {
  describe("getMarkdownAst", () => {
    test("should parse simple markdown text", () => {
      const markdown = "# Hello World\n\nThis is a paragraph.";
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      expect(ast.type).toBe("root");
      expect(ast.children).toHaveLength(2);
      expect(ast.children[0].type).toBe("heading");
      expect(ast.children[0].depth).toBe(1);
      expect(ast.children[1].type).toBe("paragraph");
    });

    test("should parse markdown with code blocks", () => {
      const markdown = `
# Title

\`\`\`javascript
console.log("Hello World");
\`\`\`

Inline \`code\` here.
      `;
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      expect(ast.children).toHaveLength(3);
      expect(ast.children[1].type).toBe("code");
      expect(ast.children[1].lang).toBe("javascript");
      expect(ast.children[2].children[1].type).toBe("inlineCode");
    });

    test("should parse markdown with lists", () => {
      const markdown = `
# List Example

- Item 1
- Item 2
  - Nested item
- Item 3

1. Ordered item 1
2. Ordered item 2
      `;
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      expect(ast.children).toHaveLength(3);
      expect(ast.children[1].type).toBe("list");
      expect(ast.children[1].ordered).toBe(false);
      expect(ast.children[2].type).toBe("list");
      expect(ast.children[2].ordered).toBe(true);
    });

    test("should parse markdown with links and images", () => {
      const markdown = `
# Links and Images

[Example Link](https://example.com)

![Alt text](image.png "Image title")
      `;
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      expect(ast.children[1].children[0].type).toBe("link");
      expect(ast.children[1].children[0].url).toBe("https://example.com");
      expect(ast.children[2].children[0].type).toBe("image");
      expect(ast.children[2].children[0].url).toBe("image.png");
    });

    test("should parse GitHub Flavored Markdown features", () => {
      const markdown = `
# GFM Features

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

~~Strikethrough text~~

- [x] Completed task
- [ ] Incomplete task
      `;
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      // Check for table
      const table = ast.children.find((child) => child.type === "table");
      expect(table).toBeDefined();
      expect(table.children).toHaveLength(2); // header + row

      // Check for strikethrough
      const strikethrough = ast.children.find((child) =>
        child.children?.some((c) => c.type === "delete"),
      );
      expect(strikethrough).toBeDefined();

      // Check for task list
      const taskList = ast.children.find((child) => child.type === "list");
      expect(taskList).toBeDefined();
    });

    test("should handle empty markdown", () => {
      const markdown = "";
      expect(() => getMarkdownAst({ markdown })).toThrow(
        "Invalid markdown input: must be a non-empty string",
      );
    });

    test("should handle null markdown", () => {
      expect(() => getMarkdownAst({ markdown: null })).toThrow(
        "Invalid markdown input: must be a non-empty string",
      );
    });

    test("should handle undefined markdown", () => {
      expect(() => getMarkdownAst({ markdown: undefined })).toThrow(
        "Invalid markdown input: must be a non-empty string",
      );
    });

    test("should handle non-string markdown", () => {
      expect(() => getMarkdownAst({ markdown: 123 })).toThrow(
        "Invalid markdown input: must be a non-empty string",
      );
      expect(() => getMarkdownAst({ markdown: {} })).toThrow(
        "Invalid markdown input: must be a non-empty string",
      );
      expect(() => getMarkdownAst({ markdown: [] })).toThrow(
        "Invalid markdown input: must be a non-empty string",
      );
    });

    test("should handle markdown with special characters", () => {
      const markdown = `
# 中文标题

This has **bold** and *italic* text.

> This is a blockquote with 🚀 emoji.

\`\`\`
Code with special chars: @#$%^&*()
\`\`\`
      `;
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      expect(ast.children).toHaveLength(4);
      expect(ast.children[0].type).toBe("heading");
      expect(ast.children[2].type).toBe("blockquote");
      expect(ast.children[3].type).toBe("code");
    });

    test("should handle malformed markdown gracefully", () => {
      // This should still parse without throwing
      const markdown = `
# Incomplete heading [

[Incomplete link](

\`\`\`incomplete
code block without closing
      `;
      const ast = getMarkdownAst({ markdown });

      expect(ast).toBeDefined();
      expect(ast.type).toBe("root");
      expect(ast.children.length).toBeGreaterThan(0);
    });
  });

  describe("traverseMarkdownAst", () => {
    test("should traverse AST and visit all nodes", () => {
      const markdown = "# Heading\n\nParagraph with **bold** text.";
      const ast = getMarkdownAst({ markdown });

      const visitedNodes = [];
      traverseMarkdownAst({
        ast,
        test: () => true, // Visit all nodes
        visitor: (node) => {
          visitedNodes.push(node.type);
        },
      });

      expect(visitedNodes.length).toBeGreaterThan(0);
      expect(visitedNodes).toContain("heading");
      expect(visitedNodes).toContain("paragraph");
      expect(visitedNodes).toContain("text");
      expect(visitedNodes).toContain("strong");
    });

    test("should visit only specific node types", () => {
      const markdown = `
# Heading 1
## Heading 2
### Heading 3

Paragraph text.
      `;
      const ast = getMarkdownAst({ markdown });

      const headings = [];
      traverseMarkdownAst({
        ast,
        test: "heading", // Only visit heading nodes
        visitor: (node) => {
          headings.push({ depth: node.depth, text: node.children[0].value });
        },
      });

      expect(headings).toHaveLength(3);
      expect(headings[0].depth).toBe(1);
      expect(headings[1].depth).toBe(2);
      expect(headings[2].depth).toBe(3);
    });

    test("should visit nodes based on custom test function", () => {
      const markdown = `
# Main Title

## Section 1
Content here.

## Section 2
More content.

### Subsection
Even more content.
      `;
      const ast = getMarkdownAst({ markdown });

      const level2Headings = [];
      traverseMarkdownAst({
        ast,
        test: (node) => node.type === "heading" && node.depth === 2,
        visitor: (node) => {
          level2Headings.push(node.children[0].value);
        },
      });

      expect(level2Headings).toHaveLength(2);
      expect(level2Headings).toContain("Section 1");
      expect(level2Headings).toContain("Section 2");
    });

    test("should collect code blocks with language information", () => {
      const markdown = `
\`\`\`javascript
console.log("JS code");
\`\`\`

\`\`\`python
print("Python code")
\`\`\`

\`\`\`
Plain code block
\`\`\`
      `;
      const ast = getMarkdownAst({ markdown });

      const codeBlocks = [];
      traverseMarkdownAst({
        ast,
        test: "code",
        visitor: (node) => {
          codeBlocks.push({
            lang: node.lang || "none",
            value: node.value,
          });
        },
      });

      expect(codeBlocks).toHaveLength(3);
      expect(codeBlocks[0].lang).toBe("javascript");
      expect(codeBlocks[1].lang).toBe("python");
      expect(codeBlocks[2].lang).toBe("none");
    });

    test("should extract all links from markdown", () => {
      const markdown = `
# Links Example

[Example](https://example.com)
[GitHub](https://github.com)

![Image](image.png)

Reference link: [Google][1]

[1]: https://google.com
      `;
      const ast = getMarkdownAst({ markdown });

      const links = [];
      traverseMarkdownAst({
        ast,
        test: (node) => node.type === "link" || node.type === "linkReference",
        visitor: (node) => {
          if (node.type === "link") {
            links.push({ text: node.children[0].value, url: node.url });
          } else if (node.type === "linkReference") {
            links.push({ text: node.children[0].value, ref: node.identifier });
          }
        },
      });

      expect(links.length).toBeGreaterThan(0);
      expect(links.some((link) => link.text === "Example")).toBe(true);
      expect(links.some((link) => link.text === "GitHub")).toBe(true);
    });

    test("should handle visitor that modifies nodes", () => {
      const markdown = "# Original Title\n\nSome content.";
      const ast = getMarkdownAst({ markdown });

      // Modify heading text
      traverseMarkdownAst({
        ast,
        test: "heading",
        visitor: (node) => {
          if (node.children?.[0] && node.children[0].type === "text") {
            node.children[0].value = "Modified Title";
          }
        },
      });

      // Verify the modification
      const headingNode = ast.children.find((child) => child.type === "heading");
      expect(headingNode.children[0].value).toBe("Modified Title");
    });

    test("should throw error when ast parameter is missing", () => {
      expect(() => {
        traverseMarkdownAst({
          test: "heading",
          visitor: () => {},
        });
      }).toThrow("Required parameters missing: ast, test, and visitor must be provided");
    });

    test("should throw error when test parameter is missing", () => {
      const ast = { type: "root", children: [] };
      expect(() => {
        traverseMarkdownAst({
          ast,
          visitor: () => {},
        });
      }).toThrow("Required parameters missing: ast, test, and visitor must be provided");
    });

    test("should throw error when visitor parameter is missing", () => {
      const ast = { type: "root", children: [] };
      expect(() => {
        traverseMarkdownAst({
          ast,
          test: "heading",
        });
      }).toThrow("Required parameters missing: ast, test, and visitor must be provided");
    });

    test("should throw error when all parameters are missing", () => {
      expect(() => {
        traverseMarkdownAst({});
      }).toThrow("Required parameters missing: ast, test, and visitor must be provided");
    });

    test("should handle empty AST", () => {
      const ast = { type: "root", children: [] };
      const visitedNodes = [];

      traverseMarkdownAst({
        ast,
        test: () => true,
        visitor: (node) => {
          visitedNodes.push(node.type);
        },
      });

      // Should only visit the root node
      expect(visitedNodes).toEqual(["root"]);
    });

    test("should handle complex nested structures", () => {
      const markdown = `
# Main Heading

1. First item
   - Sub item with **bold** text
   - Another sub item with [link](https://example.com)
2. Second item
   > Blockquote with *italic* text

| Col 1 | Col 2 |
|-------|-------|
| Data  | More  |
      `;
      const ast = getMarkdownAst({ markdown });

      const nodeTypes = new Set();
      traverseMarkdownAst({
        ast,
        test: () => true,
        visitor: (node) => {
          nodeTypes.add(node.type);
        },
      });

      expect(nodeTypes.has("heading")).toBe(true);
      expect(nodeTypes.has("list")).toBe(true);
      expect(nodeTypes.has("listItem")).toBe(true);
      expect(nodeTypes.has("blockquote")).toBe(true);
      expect(nodeTypes.has("table")).toBe(true);
      expect(nodeTypes.has("strong")).toBe(true);
      expect(nodeTypes.has("emphasis")).toBe(true);
      expect(nodeTypes.has("link")).toBe(true);
    });
  });
});
