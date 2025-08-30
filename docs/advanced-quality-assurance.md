---
labels: ["Reference"]
---

# Quality Assurance

To ensure your documentation is consistently high-quality, DocSmith includes a powerful automated quality assurance pipeline. These built-in checks run automatically during the generation and update processes to detect and report common issues—from broken links to formatting errors—before they reach your readers.

The process validates multiple aspects of your content to maintain structural integrity and accuracy.

```d2
direction: right

Input: "Markdown Content"

QA_Pipeline: "DocSmith QA Pipeline" {
  shape: package
  
  Checks: {
    grid-columns: 2
    "Structural Integrity": "Incomplete code blocks & inconsistent indentation"
    "Link & Asset Health": "Dead links & missing local images"
    "Diagram Validation": "D2 syntax checks"
    "Markdown Linting": "Table formatting & standard rules"
  }
}

Output: "Validated Documentation"

Input -> QA_Pipeline: "Analyzed"
QA_Pipeline -> Output: "Generated"
```

### Content and Structural Integrity

DocSmith analyzes the fundamental structure of your markdown files to catch issues that often lead to rendering failures or confusing output.

- **Incomplete Code Blocks**: The validator ensures that every code block opened with ` ``` ` is properly closed. Unclosed blocks can cause large portions of a document to render incorrectly.
- **Inconsistent Indentation**: Code blocks with inconsistent indentation are flagged. This is particularly important for code samples where indentation is syntactically significant and for preventing unexpected rendering issues.
- **Content Completeness**: The system checks if the content appears to be truncated by verifying that it ends with appropriate punctuation (e.g., `.`, `)`, `|`). This helps catch incomplete generation results.

### Link and Asset Validation

Broken links and missing images can degrade the user experience. DocSmith validates these resources automatically to ensure they are always available to the reader.

- **Dead Link Checking**: All internal links are cross-referenced against the paths defined in your project's structure plan. Any link pointing to a non-existent page is reported as a dead link.
- **Local Image Verification**: For local images (i.e., those not hosted on an external server), the system checks that the referenced image file exists at the specified relative or absolute path.

### Diagram Validation

To ensure that all diagrams render correctly, DocSmith specifically validates the syntax of D2 code blocks. Before processing, the D2 content is checked for syntactical correctness. If an error is found, it is flagged to prevent a broken diagram from being published.

### Markdown Formatting and Linting

Beyond major structural issues, DocSmith lints the markdown for formatting consistency and correctness, leveraging established standards to enforce a clean and readable style. Key checks include:

| Check Category | Description |
|---|---|
| **Table Formatting** | Verifies that the number of columns in a table's header, separator line, and data rows are consistent. Mismatched column counts are a common cause of broken tables. |
| **Heading Issues** | Detects duplicate headings within the same document or headings that use improper indentation, which can break the document outline. |
| **Reference Validation** | Checks for undefined references, such as using a link reference `[text][ref]` without defining `[ref]: url` elsewhere. |
| **Code Block Style** | Ensures consistent usage of code block markers for better readability and parsing. |

This automated quality assurance layer is a core part of DocSmith's architecture, designed to minimize manual review and ensure that your documentation is always accurate, professional, and reliable. To learn more about the overall generation process, see [How It Works](./advanced-how-it-works.md).