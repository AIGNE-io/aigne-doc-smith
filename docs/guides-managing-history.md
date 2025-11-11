# Managing History

Ever wondered what changes were made to your documentation and when? AIGNE DocSmith keeps a detailed log of every update. This guide will show you how to access and read this history, so you can easily track the evolution of your documents.

## Viewing Update History

To see the log of all documentation updates, you can use the `history view` command. This command provides a compact, one-line summary for each change, much like a version control system log.

Run the following command from your project's root directory:

```bash View History Log icon=lucide:history
aigne doc history view
```

### Command Aliases

For convenience, the `history` command includes two aliases for the `view` subcommand: `log` and `list`. These commands perform the exact same function and will produce the identical output.

You can use either of the following commands as a shortcut:

```bash
aigne doc history log
```

```bash
aigne doc history list
```

If you haven't made any updates yet, the tool will inform you with the message: `No update history found`.

## Understanding the History Output

The output from the `history` command is designed to give you a clear overview of each update at a glance. Every line in the log represents a single update event.

The format for each entry is broken down as follows:

| Component | Description |
| :--- | :--- |
| **Short Hash** | A unique 8-character identifier generated from the update's timestamp. This hash is deterministic, meaning the same timestamp will always produce the same hash. |
| **Date** | A relative timestamp showing when the update occurred (e.g., "5 minutes ago," "2 days ago"). For entries older than a week, a specific date is displayed. |
| **Operation** | The type of action performed, such as `generate_document` or `update_document_detail`. |
| **Document Path** | The path of the document that was modified, if the operation was specific to a single file. This is shown in parentheses for clarity. |
| **Feedback** | The summary or feedback message that was provided when the update was made. |

### Example Output

Here is a sample of what you might see when you run the `aigne doc history view` command. This example shows how different types of updates are recorded in the log.

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

This log provides an orderly and scannable record of all changes, making it a useful tool for tracking progress and reviewing your documentation's history.