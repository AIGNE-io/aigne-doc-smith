# Managing Preferences

AIGNE DocSmith is designed to learn from your feedback. When you refine or correct generated content, DocSmith can convert that feedback into persistent rules, called preferences. These rules ensure that your specific style, structural requirements, and content policies are applied consistently in future documentation tasks. All preferences are stored in a human-readable YAML file located at `.aigne/doc-smith/preferences.yml` in your project root.

## How DocSmith Learns from Feedback

When you provide feedback during the `refine` or `translate` stages, an internal agent called the 'Feedback Refiner' analyzes your input. Its goal is to distinguish between a one-time fix (e.g., correcting a typo) and a reusable policy (e.g., "always write code comments in English"). If it determines the feedback represents a lasting instruction, it creates a new preference rule.

Each rule has several key properties that define its behavior:

| Property | Description |
|---|---|
| **ID** | A unique identifier for the rule (e.g., `pref_a1b2c3d4`). |
| **Rule** | The actual instruction that will be passed to the AI in future tasks. |
| **Scope** | Defines when the rule should be applied: `global`, `structure`, `document`, or `translation`. |
| **Active** | A boolean (`true`/`false`) indicating if the rule is currently enabled. |
| **Paths** | An optional list of file or directory paths. If present, the rule only applies to content generated for those specific paths. |
| **Feedback** | The original natural language feedback you provided. |

## Managing Preferences via the CLI

You can easily view and manage all your saved preferences using the `aigne doc prefs` command. This allows you to list, activate, deactivate, or permanently remove rules.

### Listing All Preferences

To see all saved preferences, both active and inactive, use the `--list` flag.

```bash
aigne doc prefs --list
```

The command displays a formatted list explaining the status, scope, ID, and any path limitations for each rule.

**Example Output:**

```text
# User Preferences

**Format explanation:**
- 🟢 = Active preference, ⚪ = Inactive preference
- [scope] = Preference scope (global, structure, document, translation)
- ID = Unique preference identifier
- Paths = Specific file paths (if applicable)

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   Add a 'Next Steps' section at the end of overview documents.

⚪ [document] pref_i9j0k1l2m3n4o5p6
   Code comments must be written in English.
```

### Toggling Preference Status

If you want to temporarily disable a rule without deleting it, you can toggle its active status. Use the `--toggle` flag.

Running the command without an ID will launch an interactive mode, allowing you to select one or more preferences to toggle:

```bash
aigne doc prefs --toggle
```

To toggle specific rules directly, provide their IDs using the `--id` flag:

```bash
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### Removing Preferences

To permanently delete one or more preferences, use the `--remove` flag. This action cannot be undone.

For an interactive selection prompt, run the command without an ID:

```bash
aigne doc prefs --remove
```

To remove specific rules directly by their ID, use the `--id` flag:

```bash
aigne doc prefs --remove --id pref_i9j0k1l2m3n4o5p6
```

## Next Steps

Managing preferences is a key part of tailoring DocSmith to your project's specific needs. For more customization options, explore the main [Configuration Guide](./configuration.md).