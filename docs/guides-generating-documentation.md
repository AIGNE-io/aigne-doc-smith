# Generating Documentation

This guide provides a systematic, step-by-step walkthrough of the process for creating a new set of documentation from your project's source files. The `generate` command automates the analysis, structuring, and writing of your technical documents.

The generation process consists of three primary phases:
1.  **Analysis and Structure Planning**: The tool analyzes your codebase to propose a logical documentation structure, which acts as a table of contents.
2.  **Interactive Structure Review**: You have the opportunity to review, modify, and approve the proposed structure before any content is written.
3.  **Automated Content Creation**: Once the structure is finalized, the tool generates the detailed content for each document.

---

## The Generation Workflow

Follow these steps to generate your documentation from start to finish.

### Step 1: Initiate the Process

Navigate to the root directory of your project in your terminal and execute the `generate` command.

```bash Command Line icon=lucide:terminal
aigne doc generate
```

This command begins the entire documentation generation workflow. If this is your first time running the command for the project, you will be guided through an initial setup process.

### Step 2: AI-Powered Structure Planning

After initiating the command, AIGNE DocSmith analyzes your project's files and code. Based on this analysis, it formulates a logical and organized structure for your documentation. This structure serves as the blueprint for the final set of documents.

### Step 3: Review and Refine the Structure

This is a critical interactive step where you validate the proposed plan. The tool will display the generated documentation structure in your terminal and ask for your approval.

```text Terminal Interaction
? Would you like to optimize the documentation structure?
❯ No, looks good
  Yes, optimize the structure (e.g. rename 'Getting Started' to 'Quick Start', move 'API Reference' before 'Configuration')
```

-   **If the structure is acceptable**, select "No, looks good" to proceed directly to content creation.
-   **If you wish to make changes**, select "Yes, optimize the structure". The tool will then prompt you for feedback. You can provide instructions in plain language to modify the plan.

For example:
-   `Rename 'Guides' to 'Tutorials'`
-   `Add a new document named 'Troubleshooting' under the 'Guides' section`
-   `Remove the 'Legacy API' document`

The tool will apply your feedback and display the updated structure for your review. This refinement loop continues until you are satisfied. To finalize the structure and proceed, simply press `Enter` at an empty prompt.

### Step 4: Automated Content Creation

With the structure approved, DocSmith begins writing the content for each document. It will process the files one by one, displaying progress in the terminal.

![Screenshot of the documentation generation process in progress.](../assets/screenshots/doc-generate-docs.png)

### Step 5: Completion and Output

Once the generation is complete, the final Markdown files are saved in your configured output directory (typically `./docs`). A confirmation message will appear in your terminal.

![Screenshot of the success message after documentation is generated.](../assets/screenshots/doc-generated-successfully.png)

You can now review the generated files in your local project directory.

## Command Options

You can modify the behavior of the `generate` command using the following options.

| Option | Description |
|---|---|
| `--forceRegenerate` | Forces a complete regeneration of all documentation from scratch. This will discard the existing documentation structure and content and create a new version. |
| `--glossary` | Specifies the path to a glossary file (e.g., `@glossary.md`). This ensures that technical terms are used consistently throughout the generated content. |

**Example Usage:**

```bash Command Line icon=lucide:terminal
# Force a full regeneration of the documentation
aigne doc generate --forceRegenerate
```

## Summary

The `generate` command provides a structured and interactive workflow to create a complete documentation set from your source code. By initiating the command, reviewing the structure, and allowing the tool to create the content, you can produce a solid foundation for your project's documentation.

After generating your documents, your next steps might be to [update the content](./guides-updating-documentation.md) with more specific details or [publish them](./guides-publishing-your-docs.md) for your audience.