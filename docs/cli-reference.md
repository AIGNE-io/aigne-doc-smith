# CLI Command Reference

This guide provides a comprehensive reference for all available `aigne doc` sub-commands, their arguments, and options. It is intended for users who want to utilize the command-line interface to its full potential.

The general syntax is:

```bash command
aigne doc <command> [options]
```

### Command Workflow

The following diagram illustrates the typical lifecycle of creating and maintaining documentation with DocSmith's CLI commands, along with the data they interact with.

```d2
direction: down

# Artifacts
Source-Code: {
  label: "Source Code"
  shape: cylinder
}
Configuration: {
  label: "Configuration\n(.aigne/doc-smith/config.yml)"
  shape: cylinder
}
Generated-Docs: {
  label: "Generated Docs"
  shape: cylinder
}
Published-Docs: {
  label: "Published Site"
  shape: cylinder
}

# --- Core Workflow ---
Lifecycle: {
  label: "Documentation Lifecycle"
  
  init: {
    label: "1. Init\n`aigne doc init`"
    shape: rectangle
  }

  generate: {
    label: "2. Generate\n`aigne doc generate`"
    shape: rectangle
  }

  Refinement: {
    label: "3. Refine (Iterative)"
    grid-columns: 2

    update: {
      label: "Update\n`aigne doc update`"
      shape: rectangle
    }
    translate: {
      label: "Translate\n`aigne doc translate`"
      shape: rectangle
    }
  }

  publish: {
    label: "4. Publish\n`aigne doc publish`"
    shape: rectangle
  }
}

# --- Utility Commands ---
Utilities: {
  label: "Utility Commands"
  grid-columns: 2
  
  prefs: {
    label: "View Config\n`aigne doc prefs`"
    shape: rectangle
  }
  clear: {
    label: "Clear Data\n`aigne doc clear`"
    shape: rectangle
  }
}


# --- Connections ---

# Setup and Generation
Lifecycle.init -> Configuration: "Creates"
Source-Code -> Lifecycle.generate: "Reads"
Configuration -> Lifecycle.generate: "Reads"
Lifecycle.generate -> Generated-Docs: "Creates / Overwrites"
Lifecycle.generate -> Lifecycle.init: {
  label: "Runs if no config"
  style.stroke-dash: 4
}

# Refinement Loop
Generated-Docs <-> Lifecycle.Refinement: "Reads & Writes"

# Publishing
Lifecycle.Refinement -> Lifecycle.publish
Lifecycle.publish -> Published-Docs: "Uploads to"

# Utility Connections
Utilities.prefs -> Configuration: "Reads"
Utilities.clear -> Configuration: "Deletes"
Utilities.clear -> Generated-Docs: "Deletes"
```

---

## `aigne doc init`

Manually starts the interactive configuration wizard. This is useful for setting up a new project or modifying the configuration of an existing one. The wizard guides you through defining source code paths, setting output directories, choosing languages, and defining the documentation's style and target audience.

### Usage Example

**Launch the setup wizard:**

```bash
aigne doc init
```

For more details on how to tailor DocSmith to your needs, see the [Configuration Guide](./configuration.md).

---

## `aigne doc generate`

Analyzes your source code and generates a complete set of documentation based on your configuration. If no configuration is found, it automatically launches the interactive setup wizard (`aigne doc init`).

### Options

| Option              | Type    | Description                                                                                                   |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `--forceRegenerate` | boolean | Discards existing content and regenerates all documentation from scratch.                                     |
| `--feedback`        | string  | Provides feedback to adjust and refine the overall documentation structure.                                   |
| `--model`           | string  | Specifies a particular large language model to use for generation (e.g., `anthropic:claude-3-5-sonnet`). Overrides the default. |

### Usage Examples

**Generate or update documentation:**

```bash
aigne doc generate
```

**Force a complete regeneration of all documents:**

```bash
aigne doc generate --forceRegenerate
```

**Refine the documentation structure with feedback:**

```bash
aigne doc generate --feedback "Add a new section for API examples and remove the 'About' page."
```

**Generate using a specific model:**

```bash
aigne doc generate --model openai:gpt-4o
```

---

## `aigne doc update`

Optimizes and regenerates specific documents. You can run it interactively to select documents or specify them directly with options. This is useful for making targeted improvements based on feedback without regenerating the entire project.

### Options

| Option     | Type  | Description                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------------- |
| `--docs`     | array | A list of document paths to regenerate. Can be specified multiple times.                         |
| `--feedback` | string | Provides specific feedback to improve the content of the selected document(s).              |

### Usage Examples

**Start an interactive session to select a document to update:**

```bash
aigne doc update
```

**Update a specific document with targeted feedback:**

```bash
aigne doc update --docs /overview.md --feedback "Add more detailed FAQ entries"
```

---

## `aigne doc translate`

Translates existing documentation into one or more languages. It can be run interactively to select documents and languages, or non-interactively by specifying them as arguments.

### Options

| Option       | Type  | Description                                                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| `--docs`       | array | A list of document paths to translate. Can be specified multiple times.                                         |
| `--langs`      | array | A list of target language codes (e.g., `zh-CN`, `ja`). Can be specified multiple times.                            |
| `--feedback`   | string | Provides feedback to improve the quality of the translation.                                               |
| `--glossary`   | string | Path to a glossary file to ensure consistent terminology across languages. Use `@path/to/glossary.md`. |

### Usage Examples

**Start an interactive translation session:**

```bash
aigne doc translate
```

**Translate specific documents into Chinese and Japanese:**

```bash
aigne doc translate --langs zh-CN --langs ja --docs /features/generate-documentation.md --docs /overview.md
```

**Translate with a glossary and feedback for improved quality:**

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

## `aigne doc publish`

Publishes your documentation and generates a shareable link. This command uploads your content to a Discuss Kit instance. You can use the official AIGNE DocSmith platform or run your own instance of [Discuss Kit](https://www.web3kit.rocks/discuss-kit).

### Options

| Option     | Type   | Description                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `--appUrl` | string | The URL of your self-hosted Discuss Kit instance. If not provided, the command runs interactively. |

### Usage Examples

**Start an interactive publishing session:**

```bash
aigne doc publish
```

**Publish directly to a self-hosted instance:**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc prefs`

Displays the current configuration settings for the project. This is a read-only command that helps you verify the settings applied during the `init` or `generate` process.

### Usage Example

**View current project configuration:**

```bash
aigne doc prefs
```

---

## `aigne doc clear`

Launches an interactive session to clear locally stored data. This can be used to remove the generated documentation, the document structure configuration, or cached authentication tokens.

### Usage Example

**Start the interactive cleanup process:**

```bash
aigne doc clear
```
