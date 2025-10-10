# Evaluating Documents

The `evaluate` command provides a systematic process to assess the quality and alignment of your generated documentation. It analyzes both the overall structure and the content of individual documents against the goals you defined during the initial setup. This process results in a detailed report, helping you identify areas for improvement and ensure the documentation effectively serves its intended purpose and audience.

## How It Works

The evaluation process operates in two primary stages. First, it assesses the high-level document structure, and second, it analyzes the content of each individual document.

1.  **Structure Evaluation**: The tool examines your documentation's overall organization (like a table of contents). It verifies whether the structure is logical and complete based on the documentation goals, target audience, and content depth you selected.
2.  **Content Evaluation**: After analyzing the structure, the tool inspects each document's content. It scores the document against several quality dimensions, including readability, coherence, and accuracy. It also checks for the correct implementation of code examples.

Upon completion, the tool compiles the findings into a user-friendly HTML report, providing both high-level scores and detailed, actionable feedback.

## Running the Evaluation

To initiate the evaluation process, execute the following command in your terminal:

```bash
aignite evaluate
```

The command will display progress as it analyzes your documentation. Once finished, it will provide a message indicating the location of the generated report files.

```text
✔ Generate evaluation report
Evaluation report generated successfully.
- JSON Report: .aigc/evaluate/20231027103000/integrity-report.json
- HTML Report: .aigc/evaluate/20231027103000/report.html
```

You can open the `report.html` file in your web browser to view the detailed analysis.

## Understanding the Report

The evaluation report is organized into two main sections, reflecting the two stages of the analysis process.

### Structure Evaluation

This section provides feedback on the overall architecture of your documentation. It measures how well the generated document hierarchy aligns with your specified configuration.

| Dimension | Description |
| :--- | :--- |
| **Purpose Coverage** | Assesses if the document structure effectively supports the primary goals you selected (e.g., "Get started quickly"). |
| **Audience Coverage** | Determines if the structure is appropriate for your defined target audience (e.g., "non-technical users"). |
| **Depth Coverage** | Checks if the level of detail in the structure matches your selected content depth (e.g., "covers all parameters"). |

### Document Content Evaluation

This section provides a document-by-document breakdown of content quality. Each document is scored based on a set of standardized criteria.

| Dimension | Description |
| :--- | :--- |
| **Readability** | Measures how easy the text is to read and comprehend. |
| **Coherence** | Evaluates the logical flow and organization of information within the document. |
| **Content Quality** | Assesses the accuracy, relevance, and clarity of the information presented. |
| **Consistency** | Checks for uniform terminology, formatting, and style across the document. |
| **Purpose Alignment** | Determines how well the content meets the specified documentation goals. |
| **Audience Alignment** | Assesses if the language and examples are suitable for the target audience. |
| **Knowledge Level Alignment** | Checks if the content complexity matches the defined reader knowledge level. |
| **Navigability** | Evaluates the effectiveness of internal links and structural elements that help users find information. |

## Summary

Using the `evaluate` command is a crucial step in maintaining accurate and effective documentation. It provides concrete metrics and specific feedback, allowing you to refine your content methodically. After reviewing the evaluation report, you can proceed to make targeted improvements.

For the next steps on modifying your documents based on this feedback, please see the guide on [Updating Documentation](./guides-updating-documentation.md).