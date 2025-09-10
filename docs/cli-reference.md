# CLI Command Reference

This guide provides a reference for all available `aigne doc` sub-commands, their arguments, and options. It is intended for users who want to use the command-line interface to its full potential.

The general syntax is:

```bash
aigne doc <command> [options]
```

### Command Workflow

The following diagram illustrates the typical lifecycle of creating and maintaining documentation with DocSmith's CLI commands:

```d2
direction: down

Start: {
  label: "Project Setup"
  shape: circle
}

init: {
  label: "aigne doc init\n(Interactive Setup)"
  shape: rectangle
}

generate: {
  label: "aigne doc generate\n(Create/Update All Docs)"
  shape: rectangle
}

refinement-cycle: {
  label: "Refinement Cycle"
  shape: rectangle
  grid-columns: 2

  update: {
    label: "aigne doc update\n(Refine Single Doc)"
  }
  translate: {
    label: "aigne doc translate\n(Localize Content)"
  }
}

publish: {
  label: "aigne doc publish\n(Deploy Docs)"
  shape: rectangle
}

End: {
  label: "Docs Live"
  shape: circle
  style.fill: "#a2eeaf"
}

prefs: {
  label: "aigne doc prefs\n(Manage Learned Rules)"
  shape: cylinder
}

Start -> init: "Optional" {
  style.stroke-dash: 4
}
init -> generate: "Configure"
Start -> generate: "Direct"
generate -> refinement-cycle: "Refine"
refinement-cycle -> publish: "Ready"
generate -> publish: "Direct Deploy"
publish -> End

prefs <-> generate: "Influences" {
  style.stroke-dash: 2
}
prefs <-> refinement-cycle: "Influences" {
  style.stroke-dash: 2
}
```

---

## `aigne doc generate`

**Aliases:** `gen`, `g`

Analyzes your source code and generates a complete set of documentation based on your configuration. If no configuration is found, it automatically launches the interactive setup wizard.

### Options

| Option | Type | Description |
|---|---|---|
| `--feedback` | string | Provides feedback to adjust and refine the overall documentation structure. |
| `--forceRegenerate` | boolean | Discards existing content and regenerates all documentation from scratch. |
| `--model` | string | Specifies a particular LLM to use for generation (e.g., `openai:gpt-4o`). Overrides the default model. |
| `--glossary` | string | Path to a glossary file for consistent terminology. Use the format `@path/to/glossary.md`. |

### Usage Examples

**Generate documentation for the first time or update it:**
```bash
aigne doc generate
```

**Force a complete regeneration of all documents:**
```bash
aigne doc generate --forceRegenerate
```

**Refine the document structure with feedback:**
```bash
aigne doc generate --feedback "Add a new section for API examples and remove the 'About' page."
```

**Generate using a specific model from AIGNE Hub:**
```bash
aigne doc generate --model google:gemini-1.5-flash
```

---

## `aigne doc update`

**Alias:** `up`

Optimizes and regenerates specific documents. You can run it interactively to select documents or specify them directly with options. This is useful for making targeted improvements based on feedback without regenerating the entire project.

### Options

| Option | Type | Description |
|---|---|---|
| `--docs` | array | A list of document paths to regenerate (e.g., `--docs overview.md`). Can be used multiple times. |
| `--feedback` | string | Provides specific feedback to improve the content of the selected document(s). |
| `--glossary` | string | Path to a glossary file for consistent terminology. Use the format `@path/to/glossary.md`. |
| `--reset` | boolean | Ignores previous results and regenerates content from scratch for the selected documents. |

### Usage Examples

**Start an interactive session to select which document to update:**
```bash
aigne doc update
```

**Update a specific document with targeted feedback:**
```bash
aigne doc update --docs /cli-reference --feedback "Clarify the difference between the --docs and --langs options."
```

---

## `aigne doc translate`

Translates existing documentation into one or more languages. It can be run interactively to select documents and languages, or non-interactively by specifying them as arguments.

### Options

| Option | Type | Description |
|---|---|---|
| `--docs` | array | A list of document paths to translate. Can be used multiple times. |
| `--langs` | array | A list of target language codes (e.g., `zh`, `ja`, `es`). Can be used multiple times. |
| `--feedback` | string | Provides feedback to improve the quality of the translation. |
| `--glossary` | string | Path to a glossary file to ensure consistent terminology across languages. Use `@path/to/glossary.md`. |

### Usage Examples

**Start an interactive translation session:**
```bash
aigne doc translate
```

**Translate specific documents into Chinese and Japanese:**
```bash
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja
```

**Translate with a glossary and feedback for better quality:**
```bash
aigne doc translate --glossary @glossary.md --feedback "Use formal language for the Japanese translation."
```

---

## `aigne doc publish`

**Aliases:** `pub`, `p`

Publishes your generated documentation to a Discuss Kit platform. You can publish to the official AIGNE DocSmith platform or to your own self-hosted instance.

### Options

| Option | Type | Description |
|---|---|---|
| `--appUrl` | string | The URL of your self-hosted Discuss Kit instance. If not provided, the command runs interactively. |

### Usage Examples

**Start an interactive publishing session:**
```bash
aigne doc publish
```

**Publish directly to a self-hosted instance:**
```bash
aigne doc publish --appUrl https://docs.my-company.com
```

---

## `aigne doc init`

Manually starts the interactive configuration wizard. This is useful for setting up a new project or modifying the configuration of an existing one. The wizard guides you through defining source code paths, setting output directories, choosing languages, and defining the documentation's style and target audience.

### Usage Example

**Launch the setup wizard:**
```bash
aigne doc init
```

---

## `aigne doc prefs`

Manages user preferences that DocSmith learns from your feedback over time. These preferences are applied as rules in future generation and update tasks to maintain consistency with your style.

### Options

| Option | Type | Description |
|---|---|---|
| `--list` | boolean | Lists all saved preferences, showing their status (active/inactive), scope, and content. |
| `--remove` | boolean | Removes one or more preferences. Runs interactively if `--id` is not provided. |
| `--toggle` | boolean | Toggles the active status of one or more preferences. Runs interactively if `--id` is not provided. |
| `--id` | array | Specifies the preference ID(s) to act upon for `--remove` or `--toggle`. Can be used multiple times. |

### Usage Examples

**List all your saved preferences:**
```bash
aigne doc prefs --list
```

**Interactively select preferences to remove:**
```bash
aigne doc prefs --remove
```

**Toggle the status of a specific preference by its ID:**
```bash
aigne doc prefs --toggle --id <preference-id>
```

For more details on how to tailor DocSmith to your needs, see the [Configuration Guide](./configuration.md).
