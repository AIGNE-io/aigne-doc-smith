---
labels: ["Reference"]
---

# CLI Command Reference

AIGNE DocSmith is operated through the `aigne doc` command-line interface (CLI). This reference provides a comprehensive overview of all available commands, their options, and usage examples. All documentation tasks, from initial setup to final publication, are managed through these commands.

For installation instructions, please see the [Getting Started](./getting-started.md) guide.

## Command Overview

Here is a quick summary of the primary commands available in DocSmith:

| Command | Aliases | Description |
| --- | --- | --- |
| `generate` | `gen`, `g` | Generates a complete set of documentation from your source code. |
| `update` | `up` | Optimizes and regenerates individual documents based on feedback. |
| `translate` | | Translates existing documentation into one or more languages. |
| `publish` | `pub`, `p` | Publishes your documentation to a Discuss Kit platform. |
| `init` | | Starts an interactive wizard to configure your documentation project. |
| `prefs` | | Manages user preferences learned from your feedback over time. |
| `chat` | | Starts an interactive chat assistant for a guided documentation experience. |

---

## `generate`

Automatically analyzes your codebase, plans the document structure, and generates high-quality content for the entire project.

This is the primary command for creating your documentation from scratch or regenerating it after significant source code changes.

### Usage

```bash Basic Usage
aigne doc generate
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `--forceRegenerate` | boolean | Deletes all existing documentation and regenerates everything from scratch. |
| `--feedback` | string | Provides feedback to refine the overall document structure plan (e.g., "Add a section on API authentication"). |
| `--model` | string | Specifies which large language model to use for generation (e.g., `openai:gpt-4o`, `google:gemini-1.5-flash`). |
| `--glossary` | string | Path to a glossary file (`@path/to/glossary.md`) to ensure consistent terminology. |

### Examples

**Force a complete regeneration**

```bash icon=lucide:refresh-cw
aigne doc generate --forceRegenerate
```

**Refine the structure with feedback**

```bash icon=lucide:edit
aigne doc generate --feedback "Remove the 'About' section and add a detailed API Reference."
```

**Generate using a specific model**

```bash icon=lucide:bot
aigne doc generate --model claude:claude-3-5-sonnet
```

---

## `update`

Optimizes and regenerates specific documents. This is useful for making targeted improvements based on feedback or updating a single page after minor code changes.

Running this command without any options will launch an interactive mode, allowing you to select which document to update.

### Usage

```bash Basic Usage
aigne doc update
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `--docs` | array | The path(s) of the document(s) to update (e.g., `--docs overview.md`). Can be used multiple times. |
| `--feedback` | string | Specific feedback for improving the content of the selected document(s). |
| `--reset` | boolean | Ignores previous results and regenerates the document content from scratch. |
| `--glossary` | string | Path to a glossary file (`@path/to/glossary.md`) for consistent terminology. |

### Examples

**Start interactive update mode**

```bash icon=lucide:mouse-pointer-click
aigne doc update
```

**Update a specific document with feedback**

```bash icon=lucide:file-edit
aigne doc update --docs /features/generate-documentation.md --feedback "Add more details about the --forceRegenerate flag."
```

---

## `translate`

Translates existing documentation into one or more of the 12+ supported languages.

Running the command without options starts an interactive wizard to help you select documents and target languages.

### Usage

```bash Basic Usage
aigne doc translate
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `--langs` | array | Specify one or more target language codes (e.g., `zh`, `ja`, `fr`). Can be used multiple times. |
| `--docs` | array | The path(s) of the document(s) to translate. If omitted, all documents are considered. |
| `--feedback` | string | Feedback to improve the quality and style of the translation. |
| `--glossary` | string | Path to a glossary file (`@path/to/glossary.md`) to ensure consistent terminology across languages. |

### Examples

**Start interactive translation mode**

```bash icon=lucide:languages
aigne doc translate
```

**Translate specific documents into Chinese and Japanese**

```bash icon=lucide:globe
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja
```

**Improve a translation using a glossary and feedback**

```bash icon=lucide:book-check
aigne doc translate --docs cli-reference.md --langs de --glossary @glossary.md --feedback "Use formal address ('Sie') instead of informal ('du')."
```

---

## `publish`

Publishes your generated documentation to a Discuss Kit platform. This can be the official public platform or your own self-hosted instance.

Running the command without options starts an interactive wizard to select the publishing destination.

### Usage

```bash Basic Usage
aigne doc publish
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `--appUrl` | string | The URL of your self-hosted Discuss Kit instance. |

### Examples

**Publish to the official platform (interactive)**

```bash icon=lucide:rocket
aigne doc publish
```

**Publish to a self-hosted instance**

```bash icon=lucide:server
aigne doc publish --appUrl https://docs.my-company.com
```

---

## `init`

Starts an interactive wizard to create or update the `aigne-doc.json` configuration file for your project. This is the recommended way to set up your documentation preferences, including source paths, output directories, languages, and style.

### Usage

```bash Basic Usage
aigne doc init
```

This command has no options as it is fully interactive.

---

## `prefs`

Manages user preferences that DocSmith learns from your feedback. These preferences are stored as rules that are applied to future generation, update, and translation tasks to continuously improve quality and align with your style.

### Usage

```bash Basic Usage
aigne doc prefs --list
```

### Options

| Option | Type | Description |
| --- | --- | --- |
| `--list` | boolean | Lists all saved preferences, showing their status (active/inactive), scope, and content. |
| `--remove` | boolean | Interactively select and remove one or more preferences. |
| `--toggle` | boolean | Interactively select and toggle the active status of one or more preferences. |
| `--id` | array | Specifies preference ID(s) to apply the `--remove` or `--toggle` action to directly. |

### Examples

**List all saved preferences**

```bash icon=lucide:list
aigne doc prefs --list
```

**Interactively remove preferences**

```bash icon=lucide:trash-2
aigne doc prefs --remove
```

**Toggle the status of a specific preference by ID**

```bash icon=lucide:toggle-right
aigne doc prefs --toggle --id "pref_abc123"
```

---

## `chat`

Starts an interactive chat assistant that can help you with all documentation tasks. You can ask the assistant to generate, update, or translate documents in a conversational way.

### Usage

```bash Basic Usage
aigne doc chat
```

This command provides a powerful, guided alternative to using the individual commands and options.