# Updating Documentation

Maintaining the accuracy and relevance of documentation is a continuous process. As your codebase evolves or you receive new feedback, you will need to modify existing documents. The `update` command provides a structured way to regenerate specific documents with new instructions, ensuring they stay current.

This guide explains the two primary methods for updating your documentation: an interactive mode for detailed, single-document refinement and a batch mode for applying changes to multiple documents at once.

## Two Modes of Operation

The `update` command operates in one of two modes depending on the number of documents you select and the options you provide.

1.  **Interactive Mode**: Triggered when you update a single document without the `--reset` flag. This mode is designed for iterative refinement, allowing you to provide feedback, review the changes, and repeat the process until the document meets your standards.
2.  **Batch Mode**: Used when you update multiple documents simultaneously or when you use the `--reset` flag. This mode applies your feedback to all selected documents in a single operation, which is efficient for broad changes.

## Interactive Mode: Refining a Single Document

Interactive mode provides a controlled environment for making precise changes to a single document. It is the ideal choice when you need to carefully review and adjust content based on specific feedback.

To start an interactive session, run the `aigne doc update` command and select a single document from the list.

```bash
aigne doc update
```

The tool will guide you through the following steps:

1.  **Document Analysis**: The system first displays the structural outline of the selected document, showing its main headings.
2.  **User Action**: You are then prompted to choose one of three actions:
    *   **View document**: Displays the full content of the current version of the document, rendered in your terminal for easy reading.
    *   **Give feedback**: Prompts you to enter your modification requests. This can be anything from "add a section about error handling" to "clarify the purpose of the `config` object."
    *   **Done**: Exits the interactive session and saves the last generated version of the document.
3.  **Content Regeneration**: After you submit feedback, the AI regenerates the document content based on your instructions. The new heading structure is then displayed.
4.  **Iterate or Finish**: You can continue this loop of viewing, providing feedback, and regenerating until you are satisfied with the result. Once you select "Done," the process is complete.

This iterative cycle allows for fine-tuned control over the final output, ensuring the updated document is accurate and complete.

## Batch Mode: Updating Multiple Documents

Batch mode is designed for efficiency when you need to apply the same general feedback to multiple documents or completely regenerate them. This mode is automatically activated if you select more than one document or use command-line flags like `--docs` or `--reset`.

### Updating with Specific Feedback

You can provide feedback directly from the command line to update one or more documents without entering an interactive session.

```bash title="Update a single document with feedback"
aigne doc update --docs /guides/overview.md --feedback "Add a section explaining the authentication flow"
```

```bash title="Update multiple documents with the same feedback"
aigne doc update --docs /guides/overview.md --docs /guides/getting-started.md --feedback "Improve the clarity of all code examples"
```

### Resetting and Regenerating

The `--reset` flag instructs the tool to ignore the previous versions of the documents and regenerate them from scratch based on the source code. This is useful when significant changes in the code have made the existing documentation obsolete.

```bash title="Regenerate a specific document from scratch"
aigne doc update --docs /guides/overview.md --reset
```

## Command Reference

The `update` command accepts several flags to control its behavior.

| Parameter | Description | Example |
| :--- | :--- | :--- |
| `--docs <path>` | Specifies one or more document paths to update. Can be used multiple times. | `--docs /overview --docs /guides/generating-documentation` |
| `--feedback <text>` | Provides instructions for what to change in the content. | `--feedback "Add more detail to the installation steps"` |
| `--glossary <file>` | Specifies a glossary file to ensure consistent terminology during regeneration. | `--glossary @/path/to/glossary.md` |
| `--reset` | A boolean flag that forces a complete regeneration of the selected documents, ignoring their previous versions. | `--reset` |

## Summary

The `update` command offers a flexible workflow for keeping your documentation aligned with your project. Use the interactive mode for detailed, iterative changes on a single document and the batch mode for applying broad updates across multiple files efficiently.

For related tasks, refer to the following guides:
- [Generating Documentation](./guides-generating-documentation.md)
- [Translating Documentation](./guides-translating-documentation.md)