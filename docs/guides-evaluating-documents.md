# Evaluating Documents

The `evaluate` command provides a systematic method to assess the quality and completeness of your generated documentation. It analyzes both the overall document structure and the content of individual files against the criteria defined during project setup. The process concludes by generating a detailed report, which helps identify areas for improvement and ensures the documentation aligns with its intended purpose and audience.

## The Evaluation Process

The evaluation command executes a two-stage analysis to provide a comprehensive assessment of your documentation.

```d2
direction: down

start: {
  label: "Run Command\naignite evaluate"
  shape: oval
}

structure-eval: {
  label: "Stage 1: Evaluate\nDocument Structure"
  shape: rectangle
}

content-eval: {
  label: "Stage 2: Evaluate\nDocument Content"
  shape: rectangle
}

report-gen: {
  label: "Generate Report"
  shape: rectangle
}

output: {
  label: "Output HTML &\nJSON Report Files"
  shape: oval
}

start -> structure-eval: "Analyzes overall organization"
structure-eval -> content-eval: "Analyzes each file individually"
content-eval -> report-gen: "Aggregates all findings"
report-gen -> output: "Saves report to disk"
```

1.  **Structure Evaluation**: The tool first examines the documentation's high-level organization, analogous to a table of contents. It verifies whether the structure is logical and complete based on the specified documentation goals, target audience, and content depth.
2.  **Content Evaluation**: Following the structural analysis, the tool inspects the content of each document. It scores each file against several quality dimensions, including readability, coherence, and factual accuracy. It also validates the correctness and formatting of included code snippets.

The findings from both stages are compiled into an HTML report that presents high-level scores and specific, actionable feedback.

## How to Run an Evaluation

To initiate the evaluation process, execute the `evaluate` command from your project's root directory.

### Execute the Command

Open your terminal and run the following command:

```bash
aignite evaluate
```

The tool will display its progress as it analyzes the documentation.

### Review the Output

Upon completion, a confirmation message will appear in the terminal, specifying the location of the generated report files.

```text
✔ Generate evaluation report
Evaluation report generated successfully.
- JSON Report: .aigc/evaluate/20240520114500/integrity-report.json
- HTML Report: .aigc/evaluate/20240520114500/report.html
```

Open the `report.html` file in a web browser to view the detailed analysis.

## Understanding the Evaluation Report

The report is organized into sections that correspond to the stages of the evaluation process, providing a clear breakdown of the analysis.

### Structure Evaluation Details

This section presents feedback on the overall architecture of your documentation. It measures how effectively the document hierarchy aligns with the project's configuration.

| Dimension | Description |
| :--- | :--- |
| **Purpose Coverage** | Assesses if the document structure adequately supports the primary goals selected (e.g., "Get started quickly"). |
| **Audience Coverage** | Determines if the structure is organized in a way that is suitable for the defined target audience (e.g., "non-technical users"). |
| **Depth Coverage** | Checks if the level of detail implied by the structure matches the selected content depth (e.g., "covers all parameters"). |

### Document Content Evaluation Details

This section provides a file-by-file breakdown of content quality. Each document is scored based on a set of standardized criteria.

| Dimension | Description |
| :--- | :--- |
| **Readability** | Measures the ease with which the text can be read and understood. |
| **Coherence** | Evaluates the logical flow and organization of information within the document. |
| **Content Quality** | Assesses the accuracy, relevance, and clarity of the information presented. |
| **Consistency** | Checks for uniform terminology, formatting, and style throughout the document. |
| **Purpose Alignment** | Determines how well the content fulfills the specified documentation goals. |
| **Audience Alignment** | Assesses if the language, tone, and examples are appropriate for the target audience. |
| **Knowledge Level Alignment** | Checks if the content's complexity matches the defined reader knowledge level. |

## Summary

Using the `evaluate` command is an essential step for maintaining accurate and effective documentation. It provides objective metrics and specific feedback, enabling a methodical approach to refining your content. After reviewing the evaluation report, you can make targeted improvements to enhance documentation quality.

For guidance on modifying your documents based on this feedback, refer to the [Updating Documentation](./guides-updating-documentation.md) guide.