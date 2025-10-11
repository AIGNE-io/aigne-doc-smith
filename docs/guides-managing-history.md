# Managing History

AIGNE DocSmith maintains a chronological log of all updates made to your documentation. This feature allows you to track changes, review feedback provided during updates, and understand the evolution of your documents over time. This guide provides instructions on how to access and interpret this history.

## Viewing Update History

To view the log of all documentation updates, you can use the `history view` command. This command displays a compact, one-line summary for each entry, similar to a version control log.

Execute the following command in your terminal:

```bash Viewing History icon=material-symbols:history
aigne history view
```

The `history` command also supports two aliases for the `view` subcommand: `log` and `list`. The following commands are equivalent and will produce the same output:

```bash
aigne history log
aigne history list
```

### Understanding the History Output

The output of the `history view` command is formatted to provide key information about each update at a glance. Each line represents a single update entry.

Here is a breakdown of the format:

| Component | Description |
| :--- | :--- |
| **Short Hash** | An 8-character unique identifier generated from the timestamp of the update. |
| **Date** | A relative timestamp indicating when the update occurred (e.g., "5 minutes ago", "2 days ago"). For older entries, a specific date is shown. |
| **Operation** | The type of action performed, such as `generate_document` or `update_document_detail`. |
| **Document Path** | The path of the specific document that was modified, if the operation targeted a single file. This is enclosed in parentheses. |
| **Feedback** | The feedback or summary message that was provided when the update was made. |

### Example

Below is a sample output from running the `aigne history view` command.

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

This log provides a clear and orderly record of your documentation's modification history, which is useful for tracking progress and reviewing past changes.