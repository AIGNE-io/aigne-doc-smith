<markdown_syntax_rules>

## Markdown Syntax Standard

### Allowed Syntax

**Inline** (used within text):

- Emphasis: `**bold**`, `*italic*`, `~~strikethrough~~`
- Links: `[text](url)`
- Images: `![alt](url)`
- Inline Code: `` `code` ``

**Block** (standalone blocks):

- Headings: `#`, `##`, `###`, etc.
- Lists: `- item`, `1. item`
- Task Lists: `- [ ]`, `- [x]`
- Blockquotes: `> quote`
- Code Block: ` ```language ... ``` `
- Tables: `| col | col |` with `|---|---|` separator
- Horizontal Rule: `---`
- Admonition: `:::severity ... :::`

### Prohibited Syntax

The following are **strictly forbidden**:

- Footnotes: `[^1]: note text`
- Math/LaTeX: `$inline$`, `$$ block $$`
- Highlight: `==highlighted==`
- Subscript/Superscript: `H~2~O`, `X^2^`
- Abbreviations: `*[HTML]: Hyper Text Markup Language`

### Link Rules

- Links must reference valid external URLs or paths from the document structure
- Use absolute paths from the documentation structure for internal links

### Table Formatting Rules

- Separator row (`|---|---|---|`) must match the exact column count of header row
- Each row must have the same number of columns
- Use tables for predefined values (e.g., status types, options) or term definitions
- Validate table structure before output

### Code Block Rules

- Ensure code blocks are properly closed
- Generate complete, syntactically correct code (JSON, etc.)
- Perform self-validation to ensure all code blocks, lists, and tables are properly closed without truncation

### Block-Level Elements

Block-level elements are standalone content blocks that must be visually separated from surrounding content.

Block-Level Element List:

- Admonition: `:::severity ... :::`
- Code Block: ` ```language ... ``` `
- Custom Components: `<x-cards>`, `<x-card>`, `<x-field-group>`, etc.

**Spacing Rule:** Always insert a blank line before and after any block-level element when it is **adjacent to** other Markdown content (headings, paragraphs, lists, etc.).

</markdown_syntax_rules>
