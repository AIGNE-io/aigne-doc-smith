---
labels: ["Reference"]
---

# Managing Preferences

DocSmith is designed to learn from your feedback. Instead of you having to repeat the same instructions, the tool can create persistent rules, called preferences, to ensure that future documentation consistently follows your style and requirements. This section explains how these preferences are created and how you can manage them using the command-line interface (CLI).

## How DocSmith Learns from Feedback

When you provide feedback during a refinement process (e.g., using `aigne doc refine`), an AI agent called the "Feedback Refiner" analyzes your input. It determines whether your feedback is a one-time fix or a reusable policy that should be saved for future use. If it's a reusable policy, it's converted into a clear, executable rule.

This process involves a few key decisions:

1.  **Save or Discard**: The agent first decides if the feedback represents a lasting policy (e.g., "Always use formal language") or a temporary correction (e.g., "Fix this specific typo"). Only reusable policies are saved.
2.  **Determine Scope**: It then assigns a scope to the rule, which dictates when it should be applied:
    *   `global`: Applies to all stages of generation and refinement.
    *   `structure`: Applies only when planning the document structure.
    *   `document`: Applies when writing or refining the main content of documents.
    *   `translation`: Applies specifically to the translation process.
3.  **Path Limitation**: If your feedback is clearly about a specific file or set of files, the rule can be limited to apply only to those paths.

## Managing Preferences with the CLI

You have full control over your saved preferences through the `aigne doc prefs` command. This allows you to list, activate, deactivate, and delete rules as needed.

### Listing All Preferences

To see all the rules DocSmith has learned, run the `--list` command.

```bash aigne doc prefs --list icon=lucide:list
$ aigne doc prefs --list

# User Preferences

**Format explanation:**
- 🟢 = Active preference, ⚪ = Inactive preference
- [scope] = Preference scope (global, structure, document, translation)
- ID = Unique preference identifier
- Paths = Specific file paths (if applicable)

🟢 [document] pref_a1b2c3d4e5f6a7b8 | Paths: docs/api/v1.md
   Endpoint strings with 'spaceDid' in code examples should not use ellipsis for abbreviation.

🟢 [structure] pref_f9e8d7c6b5a4b3c2
   Add a 'Next Steps' section at the end of overview and tutorial documents with 2-3 internal links.

⚪ [translation] pref_1a2b3c4d5e6f7a8b
   Keep code and identifiers unchanged during translation; they must not be translated.
```

The output shows each rule's status (active or inactive), its scope, a unique ID, any associated paths, and the rule's content.

### Toggling Rule Status (Active/Inactive)

If you want to temporarily disable a rule without deleting it, you can toggle its status. Run the `prefs` command with the `--toggle` flag. You can either provide specific rule IDs or run it without IDs to enter an interactive mode where you can select the rules to toggle from a list.

**Toggle by ID:**

```bash aigne doc prefs --toggle --id icon=lucide:toggle-right
$ aigne doc prefs --toggle --id pref_1a2b3c4d5e6f7a8b

Successfully toggled 1 preferences.
```

**Interactive Mode:**

```bash aigne doc prefs --toggle icon=lucide:mouse-pointer-click
$ aigne doc prefs --toggle

# You will be presented with a checklist of all preferences to select from.
```

### Removing Preferences

To permanently delete a rule, use the `--remove` flag. Similar to toggling, you can specify IDs directly or use the interactive selection mode.

**Remove by ID:**

```bash aigne doc prefs --remove --id icon=lucide:trash-2
$ aigne doc prefs --remove --id pref_1a2b3c4d5e6f7a8b

Successfully removed 1 preferences.
```

**Interactive Mode:**

```bash aigne doc prefs --remove icon=lucide:mouse-pointer-click
$ aigne doc prefs --remove

# You will be presented with a checklist of all preferences to select for removal.
```

## Direct File Access

For advanced users, all preferences are stored in a human-readable YAML file located at `.aigne/doc-smith/preferences.yml` in your project's root directory. While you can edit this file directly, we recommend using the CLI commands to avoid formatting errors.

---

By managing preferences, you can fine-tune DocSmith's behavior over time, making it an increasingly intelligent partner in your documentation workflow. To further customize the generation process, you may want to explore the [LLM Setup](./configuration-llm-setup.md).