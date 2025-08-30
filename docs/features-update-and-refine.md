---
labels: ["Reference"]
---

# Update and Refine

Once your initial documentation is generated, the next step is to keep it current and improve its quality. AIGNE DocSmith provides powerful and flexible ways to update your documents, whether you're responding to source code changes or incorporating specific feedback to refine the content.

## Intelligent Updates on Code Changes

DocSmith is designed to be efficient. When your source code changes, you don't need to manually track which documents are affected. Simply run the generation command again:

```bash
aigne doc generate
```

The tool automatically detects which parts of your source code have changed and regenerates only the corresponding documents. This intelligent update mechanism saves time and ensures your documentation stays synchronized with your codebase without regenerating everything from scratch.

![Intelligent detection only regenerates necessary documents](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

## Refining Individual Documents with Feedback

For targeted improvements, the `aigne doc update` command allows you to regenerate specific documents using direct feedback. This is ideal for clarifying sections, adding examples, or correcting inaccuracies. You can use this command in two ways: interactive mode or by specifying parameters directly.

### Interactive Mode

For a guided experience, run the command without any arguments:

```bash
aigne doc update
```

DocSmith will present an interactive menu listing your documents. You can select the one you wish to update, and you will then be prompted to provide feedback. This is the easiest way to make specific improvements without having to remember file paths.

![Interactively select the document you need to update](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### Targeted Update with Parameters

You can also specify the document and feedback directly on the command line for a faster workflow. This is useful for scripting or when you know exactly what you want to change.

```bash
aigne doc update --docs overview.md --feedback "Add more comprehensive FAQ entries"
```

This command will regenerate only the `overview.md` document, incorporating your feedback to add more FAQs.

Here are the key parameters for the `update` command:

| Parameter | Description | Example |
|---|---|---|
| `--docs` | The path to the document you want to update. You can specify this multiple times for multiple documents. | `--docs examples.md` |
| `--feedback` | The feedback or instructions for the AI to use when regenerating the content. | `--feedback "Clarify the section on API keys"` |
| `--glossary` | Use a glossary file to ensure consistent terminology. | `--glossary @path/to/glossary.md` |

## Optimizing the Overall Structure

Refinement isn't limited to just the content of individual files. You can also improve the overall structure of your documentation. By providing feedback to the `generate` command, you can ask DocSmith to reorganize, add, or remove sections from the documentation plan.

For example, to add a new API Reference section and remove an existing About section, you would run:

```bash
aigne doc generate --feedback "Remove About section and add API Reference"
```

This command tells the AI to first revise the `structurePlan` and then regenerate the documentation according to the new structure.

---

By using these update and refinement features, you can maintain high-quality, accurate, and well-structured documentation that evolves with your project. Once you are satisfied with the content, the next step is to make it available to a wider audience. Continue to the [Translate Documentation](./features-translate-documentation.md) guide to learn how to reach a global audience.