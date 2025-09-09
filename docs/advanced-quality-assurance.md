# Quality Assurance

To ensure all generated documentation is functional, clear, and professional, DocSmith incorporates an automated quality assurance process. This process executes a series of checks on the Markdown content to detect and report common issues, from broken links to malformed diagrams, before publication.

This automated pipeline validates content structure, links, media, and syntax to maintain a consistent standard of quality.

```d2
direction: down

Input-Markdown-Content: {
  label: "Input: Markdown Content"
  shape: rectangle
}

QA-Pipeline: {
  label: "QA Pipeline"
  shape: rectangle
  grid-columns: 1
  grid-gap: 50

  Structural-Checks: {
    label: "Structural Checks"
    shape: rectangle
    grid-columns: 2
    Completeness: "Ensures content is not truncated"
    Code-Blocks: "Validates block syntax & indentation"
  }

  Content-Validation: {
    label: "Content Validation"
    shape: rectangle
    grid-columns: 2
    Link-Integrity: "Verifies internal links"
    Image-Paths: "Checks local image existence"
    Table-Formatting: "Matches column counts"
  }

  Syntax-Validation: {
    label: "Syntax Validation"
    shape: rectangle
    grid-columns: 2
    D2-Diagrams: "Validates D2 syntax"
    Mermaid-Diagrams: "Validates Mermaid syntax"
    Markdown-Linting: "Enforces style rules"
  }
}

Output-Validated-Content-or-Error-Report: {
  label: "Output: Validated Content or Error Report"
  shape: rectangle
}

Input-Markdown-Content -> QA-Pipeline
QA-Pipeline -> Output-Validated-Content-or-Error-Report
```

### Core Validation Areas

DocSmith's quality assurance process covers several key areas to ensure document integrity.

#### Content Structure & Completeness

DocSmith performs several checks to ensure the structural integrity of the content:

- **Incomplete Code Blocks**: Detects code blocks that are opened with ```` ``` ```` but never closed.
- **Missing Line Breaks**: Identifies content that appears on a single line, which may indicate missing newlines.
- **Content Endings**: Verifies that the content ends with appropriate punctuation (e.g., `.`, `)`, `|`, `>`) to prevent truncated output.

#### Link and Media Integrity

- **Link Integrity**: All relative links within the documentation are validated against the project's `structurePlan` to prevent dead links. This ensures that all internal navigation works as expected. The checker ignores external links (starting with `http://` or `https://`) and `mailto:` links.

- **Image Validation**: To avoid broken images, the checker verifies that any local image file referenced in the documentation exists on the file system. It resolves both relative and absolute paths to confirm the file is present. External image URLs and data URLs are not checked.

#### Diagram Syntax Validation

- **D2 Diagrams**: DocSmith validates D2 diagram syntax by sending the code to a rendering service. This process confirms that the diagram can be successfully compiled into an SVG image, catching any syntax errors before they result in a broken graphic.

- **Mermaid Diagrams**: Mermaid diagrams undergo several checks: a primary syntax validation, and specific checks for patterns known to cause rendering issues, such as backticks or numbered lists within node labels, and unquoted special characters that require quotes.

#### Formatting and Style Enforcement

- **Table Formatting**: Tables are inspected for mismatched column counts between the header, the separator line, and the data rows. This check prevents common table rendering failures.

- **Code Block Indentation**: The checker analyzes code blocks for inconsistent indentation. If a line of code has less indentation than the opening ```` ``` ```` marker, it can cause rendering problems. This check helps maintain correct code presentation.

- **Markdown Linting**: A built-in linter enforces a consistent Markdown structure. Key rules include:

| Rule ID | Description |
|---|---|
| `no-duplicate-headings` | Prevents multiple headings with the same content in the same section. |
| `no-undefined-references` | Ensures all link and image references are defined. |
| `no-heading-content-indent` | Disallows indentation before heading content. |
| `no-multiple-toplevel-headings` | Allows only one top-level heading (H1) per document. |
| `code-block-style` | Enforces a consistent style for code blocks (e.g., using backticks). |

By automating these checks, DocSmith maintains a consistent standard for documentation, ensuring the final output is accurate and navigable.

To learn more about the overall architecture, see the [How It Works](./advanced-how-it-works.md) section.