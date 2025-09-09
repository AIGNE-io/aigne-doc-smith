---
labels: ["Reference"]
---

# Generate Documentation

Learn how to use a single command to automatically create a complete set of documentation from your source code. The `aigne doc generate` command is the primary tool for creating a full documentation suite from scratch, intelligently analyzing your codebase to produce a logical structure and high-quality content.

## The Generation Process

At its simplest, generating a complete set of documentation requires just one command.

```bash Basic Generation Command icon=lucide:play-circle
aigne doc generate
```

### Smart Auto-Configuration

If you are running DocSmith for the first time in a project, you don't need to run a separate setup command. The `generate` command automatically detects if a configuration is missing and will launch an interactive wizard to guide you through the setup process. This includes:

- Defining document generation rules and style.
- Specifying the target audience.
- Setting the primary and translation languages.
- Configuring source code and output paths.

This smart feature ensures you can get started immediately with a single, intuitive command.

![Running the generate command initiates the smart setup](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

![Answer a few questions to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once configured, DocSmith plans the document structure and generates the content, keeping you informed of its progress.

![DocSmith then plans the structure and generates the content](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

![Successful documentation generation](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

### Generation Workflow

The following diagram illustrates the complete workflow of the `generate` command, from the initial check to the final output.

```d2 Documentation Generation Workflow icon=lucide:workflow
direction: down

User: { shape: c4-person }

CLI: {
  label: "AIGNE CLI"
  shape: rectangle
}

DocSmith-Engine: {
  label: "DocSmith Engine"
  shape: rectangle

  Config-Check: { label: "1. Check Config" }
  Interactive-Setup: { label: "2. Run Interactive Setup" }
  Structure-Planner: { label: "3. Plan Structure (AI)" }
  Content-Generator: { label: "4. Generate Content (AI)" }
  File-Saver: { label: "5. Save Documents" }
}

Source-Code: {
    label: "Source Code"
    shape: cylinder
}

Output-Docs: {
    label: "Output Directory"
    shape: cylinder
}

User -> CLI: "aigne doc generate"
CLI -> DocSmith-Engine.Config-Check

DocSmith-Engine.Config-Check -> DocSmith-Engine.Interactive-Setup: "Not Found"
DocSmith-Engine.Interactive-Setup -> DocSmith-Engine.Config-Check: "Saves Config"

DocSmith-Engine.Config-Check -> DocSmith-Engine.Structure-Planner: "Found"
DocSmith-Engine.Structure-Planner <-> Source-Code: "Analyzes"
DocSmith-Engine.Structure-Planner -> DocSmith-Engine.Content-Generator
DocSmith-Engine.Content-Generator <-> Source-Code: "Analyzes"
DocSmith-Engine.Content-Generator -> DocSmith-Engine.File-Saver
DocSmith-Engine.File-Saver -> Output-Docs: "Writes Files"

```

## Advanced Generation Options

While the basic command is powerful, you can customize its behavior with several options to suit different scenarios.

### Force Regeneration

If you want to discard all existing documentation and regenerate everything from scratch based on the latest source code and configuration, use the `--forceRegenerate` flag.

```bash Force Regeneration icon=lucide:refresh-cw
aigne doc generate --forceRegenerate
```

This is useful when you've made significant changes to your project's structure or want a completely fresh start.

### Optimizing the Structure with Feedback

You can guide the AI's structural planning by providing direct feedback. Use the `--feedback` flag to suggest additions, removals, or reorganizations. This allows you to refine the overall documentation structure without manually editing configuration files.

```bash Structure Optimization with Feedback icon=lucide:lightbulb
# Add a new section
aigne doc generate --feedback "Add a more detailed installation guide and a troubleshooting section"

# Remove or reorganize sections
aigne doc generate --feedback "Remove the About section and add an API Reference"
```

### Specifying an AI Model

DocSmith integrates with AIGNE Hub, allowing you to easily switch between different Large Language Models (LLMs) without managing API keys. Use the `--model` option to specify which model to use for generation.

```bash Using Different LLMs icon=lucide:bot
# Use Google's Gemini 1.5 Flash
aigne doc generate --model google:gemini-1.5-flash

# Use Anthropic's Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# Use OpenAI's GPT-4o
aigne doc generate --model openai:gpt-4o
```

## Command Summary

| Option              | Description                                                               | Example                                                              |
| ------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| (none)              | Generates docs. Runs interactive setup if not configured.                 | `aigne doc generate`                                                 |
| `--forceRegenerate` | Deletes existing documents and regenerates everything from scratch.       | `aigne doc generate --forceRegenerate`                               |
| `--feedback`        | Provides feedback to the AI to refine the overall document structure.     | `aigne doc generate --feedback "Add a new Quick Start guide"`        |
| `--model`           | Specifies a different LLM to use for generation via AIGNE Hub.            | `aigne doc generate --model openai:gpt-4o`                           |

---

### Next Steps

Once your initial documentation is generated, you'll often need to make small adjustments or update it as your code evolves. Learn how to do this efficiently in the [Update and Refine](./features-update-and-refine.md) section.