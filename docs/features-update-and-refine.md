---
labels: ["Reference"]
---

# Update and Refine

Documentation is not a one-time task; it must evolve alongside your source code. AIGNE DocSmith provides mechanisms to keep your documents current, whether through intelligent automatic updates or targeted manual refinements based on specific feedback.

## Intelligent Automatic Updates

After the initial generation, your source code will inevitably change. When you run the `aigne doc generate` command again, DocSmith automatically detects which parts of your codebase have been modified. It then intelligently regenerates only the affected documents, saving time and ensuring your documentation stays synchronized with your code without redoing everything from scratch.

![Smart detection regenerates only the necessary documents](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

To force a complete regeneration of all documents, you can use the `--forceRegenerate` flag:

```bash
aigne doc generate --forceRegenerate
```

## Targeted Document Regeneration

Sometimes you need to refine the content of a specific document without any changes to the source code. The `aigne doc update` command is designed for this purpose, allowing you to provide direct feedback to the AI for improving a single file.

This command can be used in two ways: interactive mode or direct mode.

### Interactive Mode

For a guided experience, run the command without any arguments. DocSmith will present an interactive menu where you can select which document you want to update.

```bash
aigne doc update
```

After selecting a document, you will be prompted to provide your feedback for the new version.

![Interactively select which document to regenerate](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### Direct Mode

If you already know which document to update and what feedback to provide, you can use command-line arguments for a faster workflow. This is also useful for scripting.

**Example:**

```bash
aigne doc update --docs overview.md --feedback "Add more comprehensive FAQ entries"
```

This command will specifically regenerate the `overview.md` file using the new feedback.

**Parameters**

| Parameter  | Description                                        |
|------------|----------------------------------------------------|
| `--docs`   | Specify the path of the document to update.        |
| `--feedback` | Provide instructions for content improvement.      |

## Improving the Overall Structure

Beyond refining individual documents, you can also provide feedback to improve the overall documentation structure. This is done using the `aigne doc generate` command with the `--feedback` flag. It allows you to request changes like adding, removing, or reorganizing entire sections.

**Example:**

```bash
# Ask the AI to reorganize the structure based on new requirements
aigne doc generate --feedback "Remove the About section and add a detailed API Reference"
```

This helps maintain a logical and user-friendly structure as your project grows.

---

Once your documentation is updated and refined to your satisfaction, you can proceed to make it available. Learn how to do this in the next section, [Publish Your Docs](./features-publish-your-docs.md).
