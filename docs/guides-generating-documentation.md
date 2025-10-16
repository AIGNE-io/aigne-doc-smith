# Generating Documentation

This guide provides a step-by-step process for creating a new set of documentation for your project using the `generate` command. This is the primary command used to transform your source files into a structured set of documents from start to finish.

The generation process is designed to be systematic and interactive, ensuring the final output meets your project's specific needs.

## The Generation Process

When you run `aigne doc generate`, the tool follows a methodical process to create your documentation. Here is a breakdown of each step.

### Step 1: Initiate Generation

To begin, navigate to your project's root directory in your terminal and execute the core command.

```bash title="Terminal" icon=lucide:terminal
aigne doc generate
```

This single command initiates the entire documentation creation workflow. If it's your first time running the command, you will be guided through an interactive setup process.

![Generate Documentation Dialog](../assets/screenshots/doc-generate.png)

### Step 2: Code Analysis and Structure Planning

First, DocSmith analyzes your source code to understand its structure, components, and relationships. Based on this analysis, it proposes an initial documentation structure. This plan organizes topics into a logical hierarchy, which may include sections like "Getting Started," "Guides," and "API Reference," tailored to your project's content.

### Step 3: Interactive Structure Review

After the initial structure is planned, you will be prompted to review it in the terminal. This is a critical step that allows you to refine the organization of your documents before the content is written.

You can either approve the structure as is or provide feedback in plain language to make changes.

![Reviewing the Documentation Structure](../assets/screenshots/doc-generate-docs.png)

Examples of feedback you can provide:

*   Rename a section (e.g., change "Getting Started" to "Quick Start").
*   Add a new document for "Troubleshooting."
*   Remove a document that is not needed.
*   Reorder sections to place "API Reference" before "Configuration."

The tool will apply your feedback and present the updated structure for another review. You can repeat this process until the structure aligns perfectly with your requirements.

### Step 4: Content Creation

Once you approve the final structure, DocSmith proceeds to generate the detailed content for each document. It reads the relevant source files and writes clear explanations, code examples, and descriptions for every planned section. This process is executed for all documents in the approved plan.

### Step 5: Completion

When the process is complete, you will see a confirmation message indicating that the documentation has been generated successfully. The output files will be located in the directory specified in your configuration (the default is `./docs`).

![Documentation Generated Successfully](../assets/screenshots/doc-generated-successfully.png)

## Command Options

You can modify the behavior of the `generate` command by using optional flags. These flags provide more control over the generation process.

| Option                | Description                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--forceRegenerate`   | Re-creates all documentation from scratch, ignoring any existing files. This is useful if you have made significant changes to your source code or want a completely fresh build. |
| `--glossary <path>`   | Specifies a glossary file (e.g., `--glossary @glossary.md`). This ensures that technical terms are defined and used consistently across all generated documents.               |

### Example Usage

Here are a few examples demonstrating how to use the command with its options.

**Standard Generation**
This is the most common use case for creating your initial set of documents.
```bash title="Terminal" icon=lucide:terminal
aigne doc generate
```

**Forced Regeneration**
Use this command when you need to discard all existing documents and rebuild them entirely.
```bash title="Terminal" icon=lucide:terminal
aigne doc generate --forceRegenerate
```

**Using a Glossary**
To ensure consistent terminology, provide a path to your glossary file.
```bash title="Terminal" icon=lucide:terminal
aigne doc generate --glossary @./glossary.md
```

## Summary

You have now learned the complete process for generating documentation from your project's source files. This workflow involves initiating the command, interactively reviewing the proposed structure, and allowing the tool to write the content.

After generating your documents, your next steps might be to [update specific documents](./guides-updating-documentation.md) with new information or [publish your documentation](./guides-publishing-your-docs.md) to make it accessible to your audience.