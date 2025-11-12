# Create Document

This guide walks you through creating a complete set of documents from your project's source files using a single command. The process is designed to be straightforward, moving from initial analysis to final content creation, with an interactive review step to ensure the output is structured exactly as you need.

## The Creation Process

When you run `aigne doc create`, the tool executes a sequence of steps to analyze your project and produce documents. This section provides a factual breakdown of that workflow.

### Step 1: Initiating the Command

The process begins by running the `create` command in your project's root directory. This command orchestrates the entire workflow from analysis to content creation.

```bash Terminal icon=lucide:terminal
aigne doc create
```

For efficiency, you can also use the aliases `gen` or `g`.

### Step 2: Source Code Analysis and Structure Planning

Upon initiation, DocSmith performs an analysis of your project's source files. It identifies the components, logic, and relationships within the codebase to propose an initial document structure. This plan outlines a logical hierarchy of documents, such as "Overview," "Getting Started," and "API Reference," tailored to the detected content.

### Step 3: Interactive Structure Review

After the initial structure is planned, it is displayed in the terminal for your review. This step allows you to approve or modify the document organization before any content is written.

You have two options:
1.  **Accept the structure:** If the proposed organization is satisfactory, you can approve it to proceed.
2.  **Provide feedback for refinement:** You can input plain-text instructions to modify the structure.

![Interactive prompt to refine the document structure.](../assets/screenshots/doc-generate-feedback.png)

Examples of feedback include:
*   "Rename 'Getting Started' to 'Quick Start'."
*   "Add a new document titled 'Troubleshooting'."
*   "Move 'API Reference' to be under a 'Guides' section."

The tool revises the structure based on your feedback and presents it for another review. This iterative process continues until the structure meets your requirements.

### Step 4: Content Generation

Once the document structure is finalized and approved, DocSmith begins generating the content for each document in the plan. It processes the relevant source files to write detailed explanations and code examples. This operation is performed for every document, ensuring complete coverage according to the approved structure.

### Step 5: Completion

After all documents have been created, a confirmation message is displayed in the terminal. The output files are saved to the directory specified in your configuration, which defaults to `.aigne/doc-smith/docs`.

![Success notification banner indicating document creation is complete.](../assets/screenshots/doc-generated-successfully.png)

## Command Options

The `create` command includes optional flags to control its behavior. These flags allow for more specific actions during the creation process.

| Option | Description |
| :--- | :--- |
| `--forceRegenerate` | Rebuilds all documents from the source files, overwriting any existing documents. This is useful for a complete refresh after significant code changes. |
| `--glossary <path>` | Specifies the path to a glossary file (e.g., `@glossary.md`). Using a glossary ensures that key terms are used consistently throughout the documents. |

### Example: Forced Recreation

To discard existing documents and generate a new set from scratch, use the `--forceRegenerate` flag.

```bash Terminal icon=lucide:terminal
aigne doc create --forceRegenerate
```

### Example: Using a Glossary

To maintain terminological consistency, provide a path to a glossary file.

```bash Terminal icon=lucide:terminal
aigne doc create --glossary @./project-glossary.md
```

## Summary

This guide has detailed the systematic process for generating a new set of documents. The workflow proceeds from command initiation and source analysis to an interactive structure review, followed by content creation.

With your documents created, you may proceed to [Update Existing Documents](./guides-updating-documentation.md) or [Publish Your Documents](./guides-publishing-your-docs.md).
