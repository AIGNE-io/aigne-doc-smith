# Updating Documentation

Maintaining the accuracy and relevance of documentation is a continuous process. As your project evolves, so too will the need to update your documents. This guide provides a step-by-step process for modifying existing documentation, whether you need to incorporate user feedback, reflect code changes, or completely regenerate a section.

The `update` command is a flexible tool that can be used interactively to select documents or non-interactively with command-line flags to apply specific changes.

## Updating via Interactive Prompt

The default way to use the `update` command is to run it without any arguments. This starts an interactive session where you can select one or more documents to modify.

1.  Run the `update` command in your terminal:

    ```bash command aigne doc update icon=lucide:terminal
    aigne doc update
    ```

2.  The tool will display a list of your existing documents. Use the arrow keys to navigate, the spacebar to select one or more documents, and press Enter to confirm.

    ![Screenshot of the interactive document update prompt, showing a list of documents to choose from.](../assets/screenshots/doc-update.png)

The next steps depend on how many documents you selected.

### Refining a Single Document

If you select only one document, you will enter an iterative review loop. This mode is ideal for making precise changes to a single file. You will be presented with the following options:
*   **View document**: Displays the full content of the current version of the document directly in your terminal for review.
*   **Give feedback**: Prompts you to enter textual feedback on what you would like to change. For example, "Simplify the explanation of the configuration process" or "Add a troubleshooting section for common errors."
*   **Done**: Exits the interactive session and saves the latest version of the document.

After you provide feedback, the tool regenerates the document. You can then view the changes and provide more feedback. This cycle can be repeated until the document meets your requirements.

### Updating Multiple Documents

If you select multiple documents, the tool will perform a batch update. You will be prompted to provide a single piece of feedback that will be applied to all the selected documents. This is useful for making consistent changes across several files at once, such as standardizing terminology or updating a common section.

## Direct Updates via Command-Line Flags

Direct updates are designed for making changes without the interactive review loop. This approach is useful when you know exactly what changes are needed and want to apply them directly.

### Updating with Specific Feedback

You can provide feedback directly from the command line to update one or more documents. This bypasses the interactive session and applies the changes immediately.

Use the `--docs` flag to specify the path of the document and the `--feedback` flag to provide your instructions.

```bash command aigne doc update with feedback icon=lucide:terminal
aigne doc update --docs overview.md --feedback "Add a more detailed explanation of the core features."
```

To update multiple documents, simply provide multiple `--docs` flags:

```bash command aigne doc update multiple docs icon=lucide:terminal
aigne doc update --docs overview.md --docs getting-started.md --feedback "Ensure the tone is consistent across both documents."
```

### Resetting Document Content

In some cases, you may want to discard the current version of a document and regenerate it from scratch based on the latest source code. The `--reset` flag instructs the tool to ignore the existing content entirely.

```bash command aigne doc update with reset icon=lucide:terminal
aigne doc update --docs overview.md --reset
```

This command is useful when a document has become significantly outdated due to major changes in the underlying code.



## Command Parameters

The `update` command accepts several parameters to control its behavior. Here is a summary of the available options:

| Parameter  | Description                                                                                             | Example                                                  |
| :--------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| `--docs`   | Specifies the path(s) of the document(s) to update. This can be used multiple times for multiple files. | `--docs overview.md`                                     |
| `--feedback` | Provides textual instructions for the changes to be made to the specified document(s).                  | `--feedback "Clarify the installation steps."`           |
| `--reset`  | A boolean flag that, when present, causes the document to be regenerated from scratch.                  | `--reset`                                                |
| `--glossary` | Specifies the path to a glossary file to ensure consistent terminology during the update process.       | `--glossary @/path/to/glossary.md`                       |