---
labels: ["Reference"]
---

# Quality Assurance

To ensure every piece of documentation is high-quality, well-formatted, and error-free, DocSmith includes a powerful built-in Quality Assurance (QA) engine. This engine automatically scans generated content for common issues, from broken links to malformed diagrams, catching potential errors before you publish. This automated process is built on the robust `unified` and `remark-lint` ecosystem, tailored with specific checks to maintain professional standards.

### Core Validation Checks

DocSmith's QA engine performs a series of targeted checks to cover the most common sources of documentation errors:

<x-cards data-columns="2">
  <x-card data-title="Structural Integrity" data-icon="lucide:scan-line">
    DocSmith verifies the overall structure of your Markdown. It detects incomplete code blocks, checks for consistent indentation within code, and ensures content ends properly to prevent abrupt cutoffs.
  </x-card>
  <x-card data-title="Link & Asset Validation" data-icon="lucide:link">
    All internal links are cross-referenced with your project's structure plan to catch dead links. The engine also confirms that any local images referenced in your documents exist on the filesystem.
  </x-card>
  <x-card data-title="D2 Diagram Validation" data-icon="lucide:network">
    To prevent broken diagrams, DocSmith validates the syntax of all D2 code blocks. It communicates with an external rendering service to confirm the diagram code is valid and can be successfully generated.
  </x-card>
  <x-card data-title="Table Formatting" data-icon="lucide:table">
    Malformed tables are a common rendering issue. The QA engine checks that the number of columns in a table's header, separator line, and data rows are consistent, preventing display failures.
  </x-card>
</x-cards>

### The QA Pipeline

When documentation is generated or updated, the content passes through a multi-stage validation pipeline. This process is designed to be fast and comprehensive, identifying a wide range of potential issues as illustrated below.

```d2 The DocSmith QA Pipeline
direction: down

markdown-content: {
  label: "Markdown Content"
  shape: rectangle
}

qa-engine: {
  label: "DocSmith QA Engine\n(checkMarkdown)"
  shape: rectangle

  checks: {
    grid-columns: 2
    grid-gap: 40

    link-check: "Dead Link Check"
    image-check: "Local Image Check"
    structure-check: "Structural Integrity"
    diagram-check: "D2 Diagram Validation"
    table-check: "Table Formatting"
    lint-check: "General Linting"
  }
}

output: {
  label: "Validation Result"
  shape: diamond
}

success: "Valid Content"
errors: "List of Errors"

markdown-content -> qa-engine
qa-engine -> output
output -> success: "Pass"
output -> errors: "Fail"
```

By automating these checks, DocSmith helps maintain a high standard of quality with minimal effort, allowing you to focus on writing great content rather than fixing formatting errors. The results of these checks are often surfaced through CLI feedback, enabling quick corrections.

To learn more about the underlying architecture that powers these features, see the [How It Works](./advanced-how-it-works.md) section.