# Updating Documentation

Maintaining the accuracy and relevance of documentation is a continuous process. As your project evolves, so too will the need to update your documents. This guide provides a step-by-step process for modifying existing documentation, whether you need to incorporate user feedback, reflect code changes, or completely regenerate a section.

The `update` command provides two primary modes for this purpose: an interactive mode for refining a single document and a batch mode for applying changes to multiple documents or resetting content.

## Interactive Document Updating

The interactive mode is ideal for making iterative changes to a single document. It allows you to provide feedback, review the updated content, and continue refining until you are satisfied with the result. This is the default mode when you run the command without specifying a particular document.

To begin an interactive update session, follow these steps:

1.  Run the `update` command in your terminal:

    ```bash command aigne doc update icon=lucide:terminal
    aigne doc update
    ```

2.  The tool will display a list of your existing documents. Select the document you wish to modify using the arrow keys and press Enter.

    ![Screenshot of the interactive document update prompt, showing a list of documents to choose from.](https://docsmith.aigne.io/image-bin/uploads/6e088d8b4e724ef383b149b5c2a38116.png)

3.  Once a document is selected, you will enter a review loop with the following options:
    *   **View document**: Displays the full content of the current version of the document directly in your terminal for review.
    *   **Give feedback**: Prompts you to enter textual feedback on what you would like to change. For example, "Simplify the explanation of the configuration process" or "Add a troubleshooting section for common errors."
    *   **Done**: Exits the interactive session and saves the latest version of the document.

4.  After you provide feedback, the tool will regenerate the document content. You can then view the changes and provide more feedback if needed. This cycle can be repeated until the document meets your requirements.

## Batch Document Updates

Batch mode is designed for making non-interactive changes. It is useful when you know exactly what changes are needed and want to apply them directly, or when you need to update multiple documents simultaneously.

### Updating with Specific Feedback

You can provide feedback directly from the command line to update one or more documents. This bypasses the interactive session and applies the changes immediately.

Use the `--docs` flag to specify the path of the document and the `--feedback` flag to provide your instructions.

```bash command aigne doc update with feedback icon=lucide:terminal
aigne doc update --docs /guides/overview.md --feedback "Add a more detailed explanation of the core features."
```

To update multiple documents, simply provide multiple `--docs` flags:

```bash command aigne doc update multiple docs icon=lucide:terminal
aigne doc update --docs /guides/overview.md --docs /guides/getting-started.md --feedback "Ensure the tone is consistent across both documents."
```

### Resetting Document Content

In some cases, you may want to discard the current version of a document and regenerate it from scratch based on the latest source code. The `--reset` flag instructs the tool to ignore the existing content entirely.

```bash command aigne doc update with reset icon=lucide:terminal
aigne doc update --docs /guides/overview.md --reset
```

This command is useful when a document has become significantly outdated due to major changes in the underlying code.

## Command Parameters

The `update` command accepts several parameters to control its behavior. Here is a summary of the available options:

| Parameter  | Description                                                                                             | Example                                                  |
| :--------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| `--docs`   | Specifies the path(s) of the document(s) to update. This can be used multiple times for multiple files. | `--docs /overview.md`                                    |
| `--feedback` | Provides textual instructions for the changes to be made to the specified document(s).                  | `--feedback "Clarify the installation steps."`           |
| `--reset`  | A boolean flag that, when present, causes the document to be regenerated from scratch.                  | `--reset`                                                |
| `--glossary` | Specifies the path to a glossary file to ensure consistent terminology during the update process.       | `--glossary @/path/to/glossary.md`                       |