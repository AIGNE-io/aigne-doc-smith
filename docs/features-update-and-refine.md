---
labels: ["Reference"]
---

# Update and Refine

Creating documentation is just the first step. As your source code evolves, your documentation must keep pace. AIGNE DocSmith provides straightforward methods to ensure your documents remain accurate and relevant, whether you're syncing with code changes or making specific improvements based on feedback.

## Automatic Updates from Source Code

When you modify your source code, the simplest way to update your documentation is to run the `generate` command again. DocSmith intelligently detects which files have changed and only regenerates the corresponding documents. This saves time and ensures your documentation always reflects the current state of your code.

```bash
aigne doc generate
```

This smart detection mechanism avoids regenerating unchanged documents, making the update process efficient.

![A diagram showing DocSmith intelligently detecting changes and only regenerating the necessary documents.](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)


## Targeted Regeneration with Feedback

Sometimes, you may want to improve a specific document without re-analyzing the entire codebase. The `aigne doc update` command is designed for this purpose, allowing you to regenerate individual documents with targeted feedback.

### Interactive Mode

For an easy-to-use, guided experience, run the command without any arguments. DocSmith will launch an interactive menu where you can select the document you wish to update and then provide your feedback for improvement.

```bash
aigne doc update
```

This is ideal for quickly refining content without needing to remember specific file paths.

![An interactive command-line menu allowing the user to select a specific document to update.](https://docsmith.aigne.io/image-bin/uploads/b2bab8e5a727f168628a1cc8c5020697.png)

### Direct Command

You can also specify the document and feedback directly via command-line arguments. This is useful for scripting or making quick changes.

Use the `--docs` flag to specify the path of the document and the `--feedback` flag to provide instructions for the AI.

```bash
# Update a specific document with feedback
aigne doc update --docs overview.md --feedback "Add more comprehensive FAQ entries"
```

## Refining the Overall Structure

Beyond content, you can also refine the overall structure of your documentation. By providing feedback to the `generate` command, you can instruct DocSmith to reorganize, add, or remove sections from the documentation plan.

```bash
# Optimize the structure with feedback
aigne doc generate --feedback "Remove the About section and add an API Reference"
```

This command will re-evaluate the structure plan based on your feedback before regenerating the content, allowing for high-level adjustments to the entire documentation set.

---

With these tools, you can keep your documentation current and continuously improve its quality. Once you are satisfied with your content, the next step is to make it available. Learn how in the [Publish Your Docs](./features-publish-your-docs.md) section.