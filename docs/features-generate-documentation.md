---
labels: ["Reference"]
---

# Generate Documentation

AIGNE DocSmith simplifies the creation of comprehensive documentation into a single, powerful command. It analyzes your source code to automatically plan a logical structure and then generates detailed content for each section. This page covers how to generate your documentation from scratch and refine the overall structure.

## The Primary Generate Command

To start the process, navigate to your project's root directory in your terminal and run the following command:

```bash
aigne doc generate
```

### Smart Auto-Configuration

The first time you run this command in a new project, DocSmith's **Smart Auto-Configuration** will activate. It detects that no configuration file exists and automatically launches an interactive wizard to guide you through the setup.

![Running the generate command for the first time will intelligently trigger the setup wizard.](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You'll be asked a few simple questions to define:

- The style and rules for generation
- Your target audience
- The primary language and any additional languages for translation
- The location of your source code
- The output directory for the generated documents

![Answer a few questions to complete the initial project setup.](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, DocSmith will proceed to analyze your code, plan the document structure, and generate the content.

![DocSmith executing the structure planning and document generation phases.](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Upon successful completion, you will see a confirmation message, and your new documentation will be ready in the specified output directory.

![A success message indicates that your documentation has been generated.](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## Forcing a Full Regeneration

If you have made significant changes to your source code or updated your configuration and want to rebuild all documents from scratch, you can use the `--forceRegenerate` flag. This ensures that all existing content is discarded and replaced with freshly generated documentation.

```bash
aigne doc generate --forceRegenerate
```

## Optimizing the Document Structure with Feedback

You can influence the overall structure of your documentation by providing direct feedback to the AI. Use the `--feedback` flag to suggest changes, such as adding, removing, or reorganizing sections. This is useful for refining the high-level outline that DocSmith creates before the content is written.

**Example: Adding a New Section**

```bash
aigne doc generate --feedback "Add a more detailed installation guide and a troubleshooting section"
```

**Example: Reorganizing Content**

```bash
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'"
```

## Command Options

Here is a summary of the available options for the `generate` command.

| Parameter             | Description                                                                          | Example                                                       |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| (none)                | Starts the generation process. Triggers the setup wizard if not configured.          | `aigne doc generate`                                          |
| `--forceRegenerate`   | Deletes all existing documents and regenerates them from scratch.                    | `aigne doc generate --forceRegenerate`                        |
| `--feedback "<text>"` | Provides feedback to refine and optimize the overall document structure plan.        | `aigne doc generate --feedback "Add an advanced usage guide"` |
| `--model <provider:model>` | Specifies a particular Large Language Model to use for generation via AIGNE Hub. | `aigne doc generate --model openai:gpt-4o`                    |

---

Now you can generate a complete set of documentation and guide the AI for better structural results. Once your documents are created, you might need to make small adjustments or update them as your code evolves.

To learn how to do this efficiently, proceed to the next section: [Update and Refine](./features-update-and-refine.md).