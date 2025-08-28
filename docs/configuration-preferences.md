---
labels: ["Reference"]
---

# Managing Preferences

As you refine your documentation using feedback, AIGNE DocSmith learns your style and structural requirements. It saves these learnings as persistent rules, called 'preferences,' to ensure consistency in all future document generation. This system allows the tool to adapt to your specific needs over time.

This guide explains how preferences are created from your feedback and how you can manage them using the command-line interface (CLI). All preferences are stored in a human-readable YAML file located at `.aigne/doc-smith/preferences.yml` in your project's root directory.

## How Preferences Are Created

Preferences are generated automatically when you provide feedback using the `--feedback` flag during commands like `aigne doc update`. An internal agent, the "Feedback Refiner," analyzes your natural language input and performs several key actions:

1.  **Distills Feedback**: It converts your feedback (e.g., "Make the code examples simpler") into a concise, reusable instruction (e.g., "Simplify code examples to be minimal and runnable.").
2.  **Determines Scope**: It assigns a scope to the rule to control when it's applied:
    *   `global`: A general writing or style rule that applies everywhere.
    *   `structure`: A rule related to the overall document structure, like adding specific sections.
    *   `document`: A rule for content generation within a specific document.
    *   `translation`: A rule that applies only during the translation process.
3.  **Sets Path Limitations**: If your feedback clearly targets a specific set of files (e.g., "In the `examples/` directory..."), the rule can be limited to apply only to those paths.

## The Preference Rule Structure

Each rule saved in the `preferences.yml` file contains several fields that define its behavior and origin.

Here is an example of a single preference rule:

```yaml
- id: pref_a1b2c3d4e5f67890
  active: true
  scope: document
  rule: "Code comments must be written in English."
  feedback: "The code comments should be in English, not Chinese."
  createdAt: "2023-10-27T10:00:00.000Z"
  paths:
    - "src/utils/"
```

**Rule Fields**

| Field         | Description                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `id`          | A unique identifier for the preference, prefixed with `pref_`.                                               |
| `active`      | A boolean (`true` or `false`) indicating if the rule is currently enabled.                                   |
| `scope`       | The context in which the rule applies (`global`, `structure`, `document`, or `translation`).               |
| `rule`        | The concise, machine-readable instruction distilled from the feedback.                                     |
| `feedback`    | The original, raw feedback provided by the user.                                                           |
| `createdAt`   | An ISO 8601 timestamp indicating when the rule was created.                                                |
| `paths`       | (Optional) An array of file or directory paths to which this rule is restricted.                           |

## Managing Preferences via the CLI

The `aigne doc prefs` command is your primary tool for interacting with saved preferences. It allows you to list, activate, deactivate, and remove rules.

### List All Preferences

To see a formatted list of all your saved preferences, run:

```bash
aigne doc prefs --list
```

The output provides a clear summary of each rule, making it easy to see what's active and what each rule does.

**Example Output:**

```
# User Preferences

**Format explanation:**
- 🟢 = Active preference, ⚪ = Inactive preference
- [scope] = Preference scope (global, structure, document, translation)
- ID = Unique preference identifier
- Paths = Specific file paths (if applicable)

🟢 [document] pref_a1b2c3d4e5f67890 | Paths: src/utils/
   Code comments must be written in English.

⚪ [structure] pref_b2c3d4e5f67890a1
   In overview and tutorial documents, add a 'Next Steps' section at the end...
```

### Activate or Deactivate Preferences

Instead of permanently deleting a rule, you can temporarily deactivate it. This is useful for testing or when a rule is not currently needed. Use the `--toggle` flag to switch a rule's `active` status.

To toggle specific rules by providing their IDs:

```bash
aigne doc prefs --toggle --id pref_a1b2c3d4e5f67890
```

If you run the command without an `--id` flag, an interactive menu will appear, allowing you to select multiple preferences to toggle at once.

```bash
aigne doc prefs --toggle
```

### Permanently Remove Preferences

To permanently delete one or more preferences, use the `--remove` flag. **This action cannot be undone.**

To remove a specific rule by its ID:

```bash
aigne doc prefs --remove --id pref_a1b2c3d4e5f67890
```

For an interactive selection menu to choose which rules to delete, run the command without specifying an ID:

```bash
aigne doc prefs --remove
```

By managing your preferences, you can refine DocSmith's behavior over time, ensuring your documentation consistently meets your evolving standards. For more customization options, see the main [Configuration Guide](./configuration.md).