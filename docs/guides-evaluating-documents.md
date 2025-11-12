# Evaluating Documents

Wondering if your documents hit the mark? This guide introduces the `evaluate` command, a powerful tool that systematically assesses your document quality and completeness, providing a clear, actionable report to guide your improvements. You'll learn how to run an evaluation and interpret its results.

## The Evaluation Process

The `evaluate` command performs a comprehensive, two-stage analysis to give you a complete picture of your document health. It checks both the high-level organization and the fine-grained details of each file.

1.  **Structure Evaluation**: First, the tool inspects the overall architecture of your documents. It verifies that the hierarchy of topics is logical and fully covers the goals, audience, and depth you defined during the initial setup.
2.  **Content Evaluation**: Next, it drills down into each individual document. This stage assesses the quality of the written content based on dimensions like readability, coherence, and alignment with your stated purpose. It also validates any code snippets for correctness.

After both stages are complete, the findings are compiled into a detailed HTML report that provides scores, identifies specific issues, and offers actionable feedback.

## How to Run an Evaluation

To start the evaluation process, you simply need to run a single command from your project's root directory.

### Execute the Command

Open your terminal and execute the `evaluate` command.

```bash aigne doc evaluate icon=lucide:terminal
aigne doc evaluate
```

By default, the command will automatically open the generated HTML report in your web browser upon completion. To prevent this, you can add the `--open false` flag.

```bash aigne doc evaluate --open false icon=lucide:terminal
aigne doc evaluate --open false
```

### Review the Output

As the command runs, it will display its progress. Once finished, a confirmation message will appear in the terminal, providing the paths to the report files.

```text
✔ Generate evaluation report
Evaluation report generated successfully.
- JSON Report: .aigc/evaluate/20240520114500/integrity-report.json
- HTML Report: .aigc/evaluate/20240520114500/report.html
```

You can open the `report.html` file directly in your browser to view the detailed analysis.

## Understanding the Evaluation Report

The report is structured to provide a clear and organized breakdown of the evaluation results, making it easy to pinpoint areas that need attention.

### Structure Evaluation Details

This section focuses on the high-level organization of your documents. It assesses how well the document structure aligns with the project's defined objectives.

| Dimension | Description |
| :--- | :--- |
| **Purpose Coverage** | Assesses if the document structure adequately supports the primary goals, such as "Get started quickly" or "Complete specific tasks." |
| **Audience Coverage** | Determines if the structure is organized logically for the intended target audience, like "End users (non-technical)." |
| **Depth Coverage** | Checks if the level of detail implied by the structure matches the selected content depth, for example, "Covers all parameters." |

### Document Content Evaluation Details

This section provides a file-by-file analysis of content quality. Each document is scored against a set of standardized criteria to ensure it meets quality standards.

| Dimension | Description |
| :--- | :--- |
| **Readability** | Measures how easy the text is to read and comprehend. |
| **Coherence** | Evaluates the logical flow and organization of topics within the document. |
| **Content Quality** | Assesses the accuracy, relevance, and clarity of the information provided. |
| **Consistency** | Checks for uniform use of terminology, formatting, and style across all documents. |
| **Purpose Alignment** | Determines how well the content achieves the specified document goals. |
| **Audience Alignment** | Assesses whether the language, tone, and examples are appropriate for the target audience. |
| **Knowledge Level Alignment** | Verifies that the content's complexity matches the defined reader knowledge level. |

## Summary

Regularly using the `evaluate` command is a key practice for maintaining high-quality documents. It provides objective metrics and specific feedback, allowing you to refine your content methodically. After reviewing the report, you can make targeted improvements to ensure your documents are as clear and effective as possible.

For detailed instructions on how to apply the feedback from the report, see the [Update Document](./guides-updating-documentation.md) guide.