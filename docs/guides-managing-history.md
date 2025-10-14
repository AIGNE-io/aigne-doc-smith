# Managing History

AIGNE DocSmith maintains a chronological log of all updates made to your documentation. This feature allows you to track changes, review the feedback provided for each update, and observe the evolution of your documents over time. This guide provides instructions on how to access and interpret this history log.

## Viewing Update History

To view the log of all documentation updates, use the `history view` command. This command displays a compact, one-line summary for each entry, formatted similarly to a version control log.

Execute the following command in your project's root directory:

```bash Viewing History icon=material-symbols:history
aigne history view
```

For convenience, the `history` command also supports two aliases for the `view` subcommand: `log` and `list`. The following commands are equivalent to the one above and will produce the identical output:

```bash
aigne history log
```

```bash
aigne history list
```

If no updates have been made yet, the tool will display the message: `No update history found`.

### Understanding the History Output

The output of the `history view` command is structured to provide key information about each update in a concise format. Each line in the log represents a single update event.

The format is composed of the following components:

| Component | Description |
| :--- | :--- |
| **Short Hash** | An 8-character unique identifier generated from the timestamp of the update. This hash is deterministic, meaning the same timestamp will always produce the same hash. |
| **Date** | A relative timestamp indicating when the update occurred (e.g., "5 minutes ago", "2 days ago"). For entries older than one week, a specific date is shown. |
| **Operation** | The type of action performed, such as `generate_document` or `update_document_detail`. |
| **Document Path** | The path of the specific document that was modified, if the operation targeted a single file. This is enclosed in parentheses for clarity. |
| **Feedback** | The summary message or feedback that was provided when the update was executed. |

### Example Output

Below is a sample output from running the `aigne history view` command. This example illustrates how different operations are recorded in the log.

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

This log provides a clear and orderly record of your documentation's modification history, which is an effective tool for tracking progress and reviewing past changes.