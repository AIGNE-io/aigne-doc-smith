# Quality Assurance

To ensure that all generated documentation is clear, functional, and professional, DocSmith includes an automated quality assurance process. This process runs a series of checks on the Markdown content to detect and report common issues before publication, from broken links to malformed diagrams.

This automated pipeline validates content structure, links, media, and syntax to maintain high standards of quality.

```d2
direction: down

"Input: Markdown Content": {
  shape: document
}

"QA Pipeline": {
  shape: package
  grid-columns: 1
  grid-gap: 50

  "Structural Checks": {
    shape: rectangle
    grid-columns: 2
    "Completeness": "Ensures content is not truncated"
    "Code Blocks": "Validates block syntax & indentation"
  }

  "Content Validation": {
    shape: rectangle
    grid-columns: 2
    "Link Integrity": "Verifies internal links"
    "Image Paths": "Checks local image existence"
    "Table Formatting": "Matches column counts"
  }

  "Syntax Validation": {
    shape: rectangle
    grid-columns: 1
    "D2 Diagrams": "Validates D2 syntax"
    "Markdown Linting": "Enforces style rules"
  }
}

"Output: Validated Content or Error Report": {
  shape: document
}

"Input: Markdown Content" -> "QA Pipeline"
"QA Pipeline" -> "Output: Validated Content or Error Report"
```

### Core Validation Areas

DocSmith's quality assurance process covers several key areas to ensure document integrity.

#### Content Structure & Completeness

DocSmith performs several checks to ensure the structural integrity of the content:

- **Incomplete Code Blocks**: Detects code blocks that are opened with ` ``` ` but never closed.
- **Missing Line Breaks**: Identifies content that appears on a single line, which may indicate missing newlines.
- **Proper Endings**: Verifies that the content ends with appropriate punctuation (e.g., `.`, `)`, `|`, `>`) to prevent truncated output.

#### Link Integrity

All relative links within the documentation are validated against the project's `structurePlan` to prevent dead links. This ensures that all internal navigation works as expected. The checker ignores external links (starting with `http://` or `https://`) and `mailto:` links.

#### Image and Media Validation

To avoid broken images, the checker verifies that any local image referenced in the documentation exists on the file system. It resolves both relative and absolute paths to confirm the file is present. External image URLs and data URLs are not checked.

#### Diagram Syntax Validation

DocSmith validates D2 diagram syntax to ensure they render correctly. Each `d2` code block is processed to confirm it can be successfully rendered into an SVG image, catching any syntax errors beforehand.

#### Table Formatting

Tables are checked for a common formatting error: a mismatch between the number of columns in the header, the separator line, and the data rows. This check ensures that tables render correctly across all Markdown parsers.

#### Code Block Formatting

The checker analyzes code blocks to detect inconsistent indentation. If a line within a code block has less indentation than the opening ` ``` ` marker, it can cause rendering issues. This check helps maintain code readability and presentation.

#### Markdown Formatting and Linting

A built-in linter enforces a consistent and valid Markdown structure, which helps prevent rendering issues and improves readability. Key rules include:

| Rule ID | Description |
|---|---|
| `no-duplicate-headings` | Prevents multiple headings with the same content in the same section. |
| `no-undefined-references` | Ensures all link and image references are defined. |
| `no-heading-content-indent` | Disallows indentation before heading content. |
| `no-multiple-toplevel-headings` | Allows only one top-level heading (H1) per document. |
| `code-block-style` | Enforces a consistent style for code blocks (e.g., using backticks). |

By automating these checks, DocSmith helps maintain a high standard of quality, ensuring that the final documentation is accurate, reliable, and easy for end-users to navigate.

To learn more about the overall architecture, see the [How It Works](./advanced-how-it-works.md) section.