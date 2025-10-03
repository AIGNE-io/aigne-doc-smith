# Quality Assurance

To ensure that all generated documentation meets a high standard of quality, consistency, and accuracy, DocSmith includes a comprehensive, automated quality assurance pipeline. These built-in checks run automatically to identify and flag common formatting errors, broken links, and structural issues before publication. This process guarantees that the final output is professional, reliable, and easy for users to navigate.

```d2 Quality Assurance Pipeline icon=lucide:shield-check
direction: down

Documentation-Content: {
  label: "Documentation Content"
  shape: rectangle
}

Quality-Assurance-Pipeline: {
  label: "Quality Assurance Pipeline"
  shape: rectangle
  grid-columns: 3
  grid-gap: 50

  Markdown-Validation: {
    label: "1. Markdown & Content Validation\n(remark-lint based)"
    shape: rectangle

    Check-1: "Valid Markdown Syntax"
    Check-2: "Heading Integrity"
    Check-3: "Table Formatting"
    Check-4: "Code Block Integrity"
    Check-5: "Content Completeness"
  }

  Link-Asset-Validation: {
    label: "2. Link & Asset Integrity"
    shape: rectangle

    Check-6: "Dead Link Detection"
    Check-7: "Local Image Validation"
  }

  D2-Diagram-Validation: {
    label: "3. D2 Diagram Validation"
    shape: rectangle

    Check-8: "D2 Syntax Check"
  }
}

Validation-Result: {
  label: "All Checks Pass?"
  shape: diamond
}

Published-Documentation: {
  label: "Published Documentation"
  shape: rectangle
  style.fill: "#d4edda"
}

Error-Report: {
  label: "Error Report"
  shape: rectangle
  style.fill: "#f8d7da"
}

Documentation-Content -> Quality-Assurance-Pipeline: "Input"
Quality-Assurance-Pipeline -> Validation-Result: "Validation"
Validation-Result -> Published-Documentation: "Yes"
Validation-Result -> Error-Report: "No"
```

## Markdown and Content Structure Validation

The foundation of quality assurance is ensuring the core Markdown is well-formed and structurally sound. DocSmith employs a sophisticated linter based on `remark-lint`, supplemented with custom checks to catch common structural problems.

Key structural and formatting checks include:

*   **Valid Markdown Syntax**: Adherence to standard Markdown and GFM (GitHub Flavored Markdown) specifications.
*   **Heading Integrity**: Detects issues such as duplicate headings within the same document, incorrect heading indentation, and the use of more than one top-level heading (H1).
*   **Table Formatting**: Verifies that table structures are correct, specifically checking for mismatches between the number of columns in the header, the separator line, and the data rows.
*   **Code Block Integrity**: Ensures that all code blocks are properly opened and closed with ```. It also checks for inconsistent indentation within a code block, which can affect rendering.
*   **Content Completeness**: A verification step to ensure that generated content does not appear truncated by checking that it ends with appropriate punctuation.

## Link and Asset Integrity

Broken links and missing images degrade the user experience. DocSmith performs checks to validate all local resources.

*   **Dead Link Detection**: The system scans all relative Markdown links and verifies that the target path corresponds to a valid document defined in the project's documentation structure. This check prevents users from encountering "404 Not Found" errors when navigating the documentation. External links beginning with `http://` or `https://` are not checked.
*   **Local Image Validation**: For all local images included via `![]()`, the validator confirms that the referenced image file exists at the specified path. This ensures that no broken images appear in the final output.

## D2 Diagram Validation

To guarantee that all diagrams are rendered correctly, DocSmith validates the syntax of every D2 diagram.

Each code block marked with `d2` is processed through a strict syntax checker. If any syntax errors are found, the generation process is halted with a descriptive error message. This prevents the publication of documents containing broken or improperly rendered visual diagrams.