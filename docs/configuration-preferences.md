# Managing Preferences

AIGNE DocSmith is designed to learn from your feedback. When you refine or correct generated content, DocSmith can convert that feedback into persistent rules, called preferences. These rules ensure that your specific style, structural requirements, and content policies are applied consistently in future documentation tasks. All preferences are stored in a human-readable YAML file located at `.aigne/doc-smith/preferences.yml` in your project root.

## The Preference Lifecycle

The following diagram illustrates how your feedback becomes a reusable rule that can be applied to future tasks and managed from the command line.

```d2 The Preference Lifecycle
direction: down

developer: {
  label: "Developer"
  shape: person
}

docsmith_system: {
  label: "AIGNE DocSmith System"
  shape: rectangle

  cli: {
    label: "CLI Command\n(refine / translate)"
    shape: rectangle
  }

  agent: {
    label: "Internal Analysis Agent"
    shape: rectangle
  }

  decision: {
    label: "Is feedback a\nreusable policy?"
    shape: diamond
  }

  create_rule: {
    label: "Create New Preference Rule"
    shape: rectangle
  }
}

preferences_file: {
  label: ".aigne/doc-smith/preferences.yml"
  shape: cylinder
}

one_time_fix: {
  label: "Apply as a one-time fix"
  shape: oval
}

developer -> docsmith_system.cli: "1. Provides feedback"
docsmith_system.cli -> docsmith_system.agent: "2. Captures feedback"
docsmith_system.agent -> docsmith_system.decision: "3. Analyzes"
docsmith_system.decision -> docsmith_system.create_rule: "Yes"
docsmith_system.create_rule -> preferences_file: "4. Saves rule to file"
docsmith_system.decision -> one_time_fix: "No"
```

### How Preferences are Created

When you provide feedback during the `refine` or `translate` stages, an internal agent analyzes your input. It determines if the feedback is a one-time fix (e.g., correcting a typo) or a reusable policy (e.g., "always write code comments in English"). If it represents a lasting instruction, it creates a new preference rule and saves it to your project's `preferences.yml` file.

### Rule Properties

Each rule saved in `preferences.yml` has the following structure:

<x-field-group>
  <x-field data-name="id" data-type="string" data-desc="A unique, randomly generated identifier for the rule (e.g., pref_a1b2c3d4e5f6g7h8)."></x-field>
  <x-field data-name="active" data-type="boolean" data-desc="Indicates if the rule is currently enabled. Inactive rules are ignored during generation tasks."></x-field>
  <x-field data-name="scope" data-type="string">
    <x-field-desc markdown>Defines when the rule should be applied. Valid scopes are `global`, `structure`, `document`, or `translation`.</x-field-desc>
  </x-field>
  <x-field data-name="rule" data-type="string" data-desc="The specific, distilled instruction that will be passed to the AI in future tasks."></x-field>
  <x-field data-name="feedback" data-type="string" data-desc="The original, natural language feedback provided by the user, preserved for reference."></x-field>
  <x-field data-name="createdAt" data-type="string" data-desc="The ISO 8601 timestamp indicating when the rule was created."></x-field>
  <x-field data-name="paths" data-type="string[]" data-required="false">
    <x-field-desc markdown>An optional list of file paths. If present, the rule only applies to content generated for these specific source files.</x-field-desc>
  </x-field>
</x-field-group>

## Managing Preferences with the CLI

You can view and manage all your saved preferences using the `aigne doc prefs` command. This allows you to list, activate, deactivate, or permanently remove rules.

### Listing All Preferences

To see a complete list of all saved preferences, both active and inactive, use the `--list` flag.

```bash List all preferences icon=lucide:terminal
aigne doc prefs --list
```

The command displays a formatted list showing the status, scope, ID, and any path limitations for each rule.

```text Example Output icon=lucide:clipboard-list
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

### Deactivating and Reactivating Preferences

If you need to temporarily disable a rule without deleting it, you can toggle its active status with the `--toggle` flag. Running the command without an ID will launch an interactive mode, allowing you to select one or more preferences to toggle.

```bash Toggle preferences interactively icon=lucide:terminal
aigne doc prefs --toggle
```

To toggle a specific rule directly, provide its ID using the `--id` flag. This action changes the rule's `active` property.

```bash Toggle a specific preference icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### Removing Preferences

To permanently delete one or more preferences, use the `--remove` flag. This action cannot be undone.

For an interactive selection prompt, run the command without an ID.

```bash Remove preferences interactively icon=lucide:terminal
aigne doc prefs --remove
```

To remove a specific rule directly, provide its ID using the `--id` flag.

```bash Remove a specific preference icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## Next Steps

Managing preferences is a key part of tailoring DocSmith to your project's specific needs. For more customization options, explore the main [Configuration Guide](./configuration.md).