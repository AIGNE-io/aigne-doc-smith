---
labels: ["Reference"]
---

# Managing Preferences

DocSmith is designed to learn from your feedback. When you refine documents and provide corrections, the system can convert that feedback into persistent, reusable rules called "preferences". This ensures that your stylistic choices, structural conventions, and specific instructions are remembered and applied consistently in future operations.

All preferences are stored in a human-readable YAML file located at `.aigne/doc-smith/preferences.yml` in your project root. While you can view this file, it's recommended to manage your preferences using the dedicated `aigne doc prefs` command-line interface.

## How Preferences Are Created

Preferences are automatically generated during the feedback cycle of commands like `aigne doc refine`. The process works as follows:

```d2
direction: right

User: {
  shape: person
}

Refine: "`aigne doc refine` command"

FeedbackRefiner: "Feedback→Rule Converter"

PreferencesFile: "preferences.yml" {
  shape: document
}

User -> Refine: "Provide feedback, e.g., 'Don't translate variable names'"
Refine -> FeedbackRefiner: "Sends feedback for analysis"
FeedbackRefiner -> PreferencesFile: "Saves new, reusable rule" {
  style.animated: true
}

```

1.  **Feedback Input**: You provide natural language feedback during a refinement session.
2.  **Rule Generation**: An internal agent analyzes your feedback to determine if it represents a reusable policy rather than a one-time fix.
3.  **Rule Creation**: If deemed reusable, it creates a structured rule with a specific scope (e.g., `document`, `translation`), a unique ID, and the instruction itself.
4.  **Persistence**: The new rule is saved to the `preferences.yml` file, making it active for future tasks.

## Managing Preferences via CLI

The `aigne doc prefs` command is your primary tool for viewing and managing all saved preferences.

### List All Preferences

To see a formatted list of all your preferences, use the `--list` flag.

```bash
aigne doc prefs --list
```

The output provides a clear overview of each rule:

```text
# User Preferences

**Format explanation:**
- 🟢 = Active preference, ⚪ = Inactive preference
- [scope] = Preference scope (global, structure, document, translation)
- ID = Unique preference identifier
- Paths = Specific file paths (if applicable)

🟢 [translation] pref_1a2b3c4d
   Keep code and identifiers unchanged during translation, must not translate them.

⚪ [structure] pref_5e6f7g8h | Paths: overview.md, tutorials.md
   Add 'Next Steps' section at the end of overview and tutorial documents with 2-3 links within the repository.
```

- **Status (🟢 / ⚪)**: Shows whether a rule is currently active or inactive.
- **Scope**: Indicates where the rule applies (e.g., `translation`, `structure`).
- **ID**: A unique identifier used to manage the rule.
- **Paths**: If a rule is limited to specific files, they will be listed here.

### Toggle Preference Status

You can activate or deactivate preferences using the `--toggle` flag. This is useful for temporarily disabling a rule without deleting it permanently.

**Interactive Mode**

If you run the command without specifying an ID, an interactive prompt will appear, allowing you to select multiple rules to toggle.

```bash
aigne doc prefs --toggle
```

**By ID**

To toggle specific rules, provide their IDs using the `--id` option.

```bash
aigne doc prefs --toggle --id pref_5e6f7g8h
```

### Remove Preferences

To permanently delete one or more preferences, use the `--remove` flag.

**Interactive Mode**

Running the command without an ID will launch an interactive selection prompt.

```bash
aigne doc prefs --remove
```

**By ID**

To remove a specific rule, pass its ID.

```bash
aigne doc prefs --remove --id pref_1a2b3c4d
```

This action is irreversible, so use it with care.

---

By managing your preferences, you can fine-tune DocSmith's behavior over time, making the documentation process increasingly automated and aligned with your project's specific needs. To see how feedback is provided, you can learn more in the [Update and Refine](./features-update-and-refine.md) guide.