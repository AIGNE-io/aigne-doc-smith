---
labels: ["Reference"]
---

# Update and Refine

Keeping documentation synchronized with an evolving codebase is a significant challenge. AIGNE DocSmith provides powerful tools to ensure your documents remain accurate and relevant, whether through intelligent automatic updates or targeted manual refinements.

This guide covers how to keep your documentation fresh by regenerating it based on code changes and how to iteratively improve content quality using feedback.

## Automatic Updates with Intelligent Detection

DocSmith is designed to be efficient. When you run the `aigne doc generate` command, it doesn't blindly regenerate everything. Instead, it intelligently analyzes your codebase, detects which files have changed since the last run, and regenerates only the documentation sections affected by those changes.

This process saves significant time and reduces costs associated with LLM API calls, making it feasible to integrate documentation generation directly into your development workflow.

![Intelligent detection, only regenerates necessary documents](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

To force a complete regeneration of all documents from scratch, ignoring the cache of previous results, you can use the `--forceRegenerate` flag:

```bash Force Regeneration
aigne doc generate --forceRegenerate
```

## Targeted Document Regeneration

Sometimes, you need to improve a specific document's content without any corresponding code changes. You might want to add more examples, clarify a complex topic, or incorporate user feedback. For this, the `aigne doc update` command is the perfect tool.

### Interactive Mode

For a guided experience, simply run the command without any arguments. DocSmith will launch an interactive wizard.

```bash Interactive Update
aigne doc update
```

This wizard will prompt you to:
1.  **Select the document** you wish to update from a list of all existing documents.
2.  **Provide feedback** in your default text editor. Be as specific as possible to guide the AI in making the desired improvements.

![Interactively select documents to update](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### Command-Line Mode

If you prefer to work directly from the command line, you can specify the document and your feedback using flags. This is ideal for scripting or quick updates.

Use the `--docs` flag to specify the path of the document to update and the `--feedback` flag to provide your instructions.

```bash Update a Specific Document
aigne doc update --docs /overview --feedback "Add a more comprehensive FAQ section at the end to address common user questions."
```

You can specify the `--docs` flag multiple times to update several documents in a single command.

## Refining the Overall Structure

While `aigne doc update` is for refining the *content* of individual documents, you might occasionally want to refine the overall *structure* of your documentation. This includes tasks like adding new sections, removing obsolete ones, or reorganizing the entire layout.

To modify the structure, use the `aigne doc generate` command with the `--feedback` flag. This tells DocSmith to re-evaluate the entire structure plan based on your new input.

```bash Optimize Structure with Feedback
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference' section based on the JSDoc comments."
```

This approach ensures that your documentation's architecture evolves alongside your project's needs.

---

With these tools, you can maintain high-quality, up-to-date documentation with minimal effort. After refining your content, the next step is often to make it accessible to a wider audience.

Next, learn how to [Translate Documentation](./features-translate-documentation.md) into multiple languages.