---
labels: ["Reference"]
---

# CLI Command Reference

This page provides a comprehensive reference for all `aigne doc` sub-commands, their arguments, and options. Use this guide for detailed information on how to use the AIGNE DocSmith command-line interface.

## `aigne doc generate`

Generates a complete set of documentation from your source code based on the project configuration. If no configuration is found, it will automatically launch the interactive `init` wizard first.

**Aliases:** `gen`, `g`

**Options**

| Option | Type | Description |
|---|---|---|
| `--forceRegenerate` | `boolean` | Deletes existing documentation and regenerates everything from scratch. |
| `--feedback` | `string` | Provides feedback to refine the overall documentation structure plan. |
| `--model` | `string` | Specifies the LLM to use for generation (e.g., `openai:gpt-4o`, `google:gemini-2.5-flash`). |
| `--glossary` | `string` | Path to a glossary file for consistent terminology (e.g., `@glossary.md`). |

**Usage Examples**

```bash
# Generate documentation using existing configuration
aigne doc generate

# Force a complete regeneration of all documents
aigne doc generate --forceRegenerate

# Regenerate the structure plan with specific feedback
aigne doc generate --feedback "Add a new section for API examples."

# Generate documentation using a specific AI model
aigne doc generate --model claude:claude-3-5-sonnet
```

---

## `aigne doc init`

Launches an interactive wizard to configure the documentation generation settings for your project. This includes defining source code paths, output directories, target audience, languages, and documentation style.

**Options**

This command does not accept command-line options as it runs in a fully interactive mode.

**Usage Examples**

```bash
# Start the interactive configuration wizard
aigne doc init
```

---

## `aigne doc update`

Updates specific documents. You can run it interactively to select documents and provide feedback, or specify the documents and feedback directly via command-line options.

**Aliases:** `up`

**Options**

| Option | Type | Description |
|---|---|---|
| `--docs` | `string` | Path of a specific document to update. Can be used multiple times. |
| `--feedback` | `string` | Provides targeted feedback to improve the content of the selected document(s). |
| `--glossary` | `string` | Path to a glossary file for consistent terminology (e.g., `@glossary.md`). |

**Usage Examples**

```bash
# Start interactive mode to select a document to update
aigne doc update

# Update a specific document with feedback
aigne doc update --docs overview.md --feedback "Clarify the section on AIGNE Hub integration."
```

---

## `aigne doc translate`

Translates existing documentation into one or more languages. It can be run interactively to select documents and languages or non-interactively by providing arguments.

**Options**

| Option | Type | Description |
|---|---|---|
| `--langs` | `string` | A target language to translate to (e.g., `zh`, `ja`). Can be used multiple times. |
| `--docs` | `string` | Path of a specific document to translate. Can be used multiple times. |
| `--feedback` | `string` | Provides feedback to improve the quality of the translation. |
| `--glossary` | `string` | Path to a glossary file to ensure consistent terminology in translations. |

**Usage Examples**

```bash
# Start interactive mode to select documents and target languages
aigne doc translate

# Translate specific documents into Chinese and Japanese
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja

# Translate with a glossary for consistent terminology
aigne doc translate --docs examples.md --langs de --glossary @technical-terms.md
```

---

## `aigne doc publish`

Publishes your generated documentation to a Discuss Kit platform. You can publish to the official AIGNE platform or a self-hosted instance.

**Aliases:** `pub`, `p`

**Options**

| Option | Type | Description |
|---|---|---|
| `--appUrl` | `string` | The URL of a self-hosted Discuss Kit instance to publish to. |

**Usage Examples**

```bash
# Start interactive mode to choose a publishing destination
aigne doc publish

# Publish directly to a self-hosted instance
aigne doc publish --appUrl https://docs.my-company.com
```

---

## `aigne doc prefs`

Manages user preferences that DocSmith learns from your feedback. These preferences are stored as rules that influence future documentation generation, updates, and translations.

**Options**

| Option | Type | Description |
|---|---|---|
| `--list` | `boolean` | Lists all saved preferences with their status (active/inactive), scope, and ID. |
| `--remove` | `boolean` | Removes one or more preferences. Requires the `--id` option or runs interactively if no ID is provided. |
| `--toggle` | `boolean` | Toggles the active status of one or more preferences. Requires the `--id` option or runs interactively. |
| `--id` | `string` | The unique ID of a preference to manage. Can be used multiple times with `--remove` or `--toggle`. |

**Usage Examples**

```bash
# List all saved preferences
aigne doc prefs --list

# Interactively select preferences to remove
aigne doc prefs --remove

# Remove a specific preference by its ID
aigne doc prefs --remove --id 4a2b8e1f

# Toggle the active status of multiple preferences
aigne doc prefs --toggle --id 4a2b8e1f --id 9c7d3f5a
```

This reference provides the details for all core commands. For detailed settings, see the [Configuration Guide](./configuration.md).