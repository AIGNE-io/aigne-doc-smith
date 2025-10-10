# Generating Documentation

This guide provides a systematic procedure for creating a complete set of documentation from your project's source files. The process is initiated using the `aigne doc generate` command, which analyzes your codebase, proposes a logical structure, and then writes the content for each document.

This command is the primary tool for the initial creation of your documentation. For modifying documents after they have been created, refer to the [Updating Documentation](./guides-updating-documentation.md) guide.

### The Generation Workflow

The `generate` command executes a sequence of automated steps to build your documentation. The process is designed to be interactive, allowing you to review and approve the proposed structure before content is written.

```d2
direction: down

start: {
  label: "Start"
  shape: oval
}

run_command: {
  label: "Run 'aigne doc generate'"
  shape: rectangle
}

check_config: {
  label: "Configuration file exists?"
  shape: diamond
}

interactive_setup: {
  label: "Guide through interactive setup"
  shape: rectangle
  tooltip: "If .aigne/doc-smith/config.yaml is not found, an interactive setup is triggered."
}

propose_structure: {
  label: "Analyze project and propose document structure"
  shape: rectangle
}

review_structure: {
  label: "User reviews the proposed structure"
  shape: rectangle
}

user_approve: {
  label: "Approve structure?"
  shape: diamond
}

provide_feedback: {
  label: "Provide feedback to refine structure"
  shape: rectangle
  tooltip: "User can request changes like renaming, adding, or removing sections."
}

generate_content: {
  label: "Generate content for all documents"
  shape: rectangle
}

end: {
  label: "End"
  shape: oval
}

start -> run_command
run_command -> check_config
check_config -> interactive_setup: {
  label: "No"
}
interactive_setup -> propose_structure
check_config -> propose_structure: {
  label: "Yes"
}
propose_structure -> review_structure
review_structure -> user_approve
user_approve -> provide_feedback: {
  label: "No"
}
provide_feedback -> review_structure
user_approve -> generate_content: {
  label: "Yes"
}
generate_content -> end
```

## Step-by-Step Process

To generate your documentation, navigate to the root directory of your project in your terminal and follow these steps.

### 1. Run the Generate Command

Execute the `generate` command to begin the process. The tool will start by analyzing your project's files and structure.

```bash Basic Generation Command
aigne doc generate
```

You can also use the aliases `gen` or `g` for brevity.

### 2. Review the Documentation Structure

After the analysis is complete, the tool will present a proposed documentation structure. This structure is a hierarchical plan of the documents that will be created.

You will be prompted to review this plan:

```
Would you like to optimize the documentation structure?
You can edit titles, reorganize sections.
❯ Looks good - proceed with current structure
  Yes, optimize the structure
```

-   **Looks good - proceed with current structure**: Select this option to approve the proposed structure and proceed directly to content generation.
-   **Yes, optimize the structure**: Select this option if you wish to modify the plan. You will be able to provide feedback in plain text, such as "Rename 'API' to 'API Reference'" or "Add a new section for 'Deployment'." The AI will revise the structure based on your feedback, and you can review it again. This cycle can be repeated until the structure meets your requirements.

### 3. Content Generation

Once the documentation structure is approved, DocSmith will begin generating the detailed content for each document in the plan. This process runs automatically, and its duration depends on the size and complexity of your project.

Upon completion, the generated files will be saved to the output directory specified in your configuration (e.g., `./docs`).

## Command Parameters

The `generate` command accepts several optional parameters to control its behavior.

| Parameter           | Description                                                                                                                              | Example                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `--forceRegenerate` | Rebuilds all documentation from scratch, ignoring any existing structure or content. This is useful for starting over with a clean slate. | `aigne doc generate --forceRegenerate`                                        |
| `--feedback`        | Provides initial instructions to guide the AI during the structure generation phase.                                                     | `aigne doc generate --feedback "Add more API examples and a troubleshooting section"` |
| `--glossary`        | Specifies a glossary file (`.md`) to ensure consistent use of terminology throughout the documentation.                                   | `aigne doc generate --glossary @/path/to/glossary.md`                       |

### Example: Forcing a Complete Rebuild

If you want to discard all previously generated documents and create a new set based on the current state of your code, use the `--forceRegenerate` flag.

```bash Forcing Regeneration
aigne doc generate --forceRegenerate
```

## Summary

The `generate` command orchestrates the entire process of creating your initial project documentation. It combines automated code analysis with an interactive review process to produce a structured and relevant set of documents.

After your documents are generated, you may want to:

-   [Update Documentation](./guides-updating-documentation.md): Make changes to specific documents.
-   [Translate Documentation](./guides-translating-documentation.md): Translate your content into other languages.
-   [Publishing Your Docs](./guides-publishing-your-docs.md): Make your documentation available online.