---
labels: ["Reference"]
---

# Update and Refine

Creating documentation is just the first step. As your source code evolves, your documentation needs to keep pace. AIGNE DocSmith provides powerful and intuitive ways to keep your documents up-to-date and continuously improve their quality, whether you're making small tweaks or significant structural changes.

## Intelligent Automatic Updates

DocSmith is designed to be efficient. After you've generated your documentation for the first time, running the `aigne doc generate` command again won't start from scratch. Instead, it intelligently detects which parts of your source code have changed and only regenerates the corresponding documents. This saves time and ensures your documentation always reflects the latest state of your project without unnecessary work.

![Intelligent detection, only regenerating necessary documents](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

## Manually Updating a Single Document

Sometimes, you may want to improve a specific document without changing any code. You might want to clarify a section, add more examples, or incorporate user feedback. For this, the `aigne doc update` command is the perfect tool.

There are two ways to use this command:

### 1. Interactive Mode

If you're not sure of the exact document path or prefer a guided experience, simply run the command without any parameters. DocSmith will launch an interactive menu listing all your documents. You can easily select the one you want to update and then provide your feedback for improvement in the next step.

```bash
# Start the interactive menu to select a document and provide feedback
aigne doc update
```

This mode is ideal for quickly finding and refining content without needing to remember specific commands or paths.

![Interactively select a document to update from a list](https://docsmith.aigne.io/image-bin/uploads/b2bab8e5a727f168628a1cc8c5020697.png)

### 2. Direct Command

If you already know which document you want to modify, you can specify its path and your feedback directly in the command. This is faster and particularly useful for scripting or automated workflows.

Use the `--doc-path` flag to specify the document and the `--feedback` flag to provide instructions to the AI on how to improve the content.

```bash
# Update a specific document with targeted feedback
aigne doc update --doc-path /faq --feedback "Add more comprehensive FAQ entries"
```

## Refining the Overall Structure

Beyond improving the content of individual pages, you can also refine the entire documentation structure. If you feel a section is missing, a title is unclear, or the organization could be better, you can provide feedback to the structure planner.

This is done using the `aigne doc generate` command combined with the `--feedback` flag. For a complete guide on this, please see the [Generate Documentation](./features-generate-documentation.md) section.

```bash
# Provide feedback to regenerate and improve the overall document structure
aigne doc generate --feedback "Add a new section for API Reference"
```

With these tools, you can ensure your documentation remains a living, accurate, and valuable resource. Once you're satisfied with your updates, the next step is to share it. Learn how in the [Publish Your Docs](./features-publish-your-docs.md) guide.