---
labels: ["Reference"]
---

# Update and Refine

Keeping documentation synchronized with your evolving source code is crucial. AIGNE DocSmith provides powerful and flexible ways to keep your content up-to-date, whether through intelligent automatic updates or precise, feedback-driven refinements.

This guide covers how to:
- Automatically update documents when your code changes.
- Manually regenerate specific documents with targeted feedback.
- Optimize the overall documentation structure.

---

## Automatic Updates with Smart Detection

When you run the `aigne doc generate` command, DocSmith doesn't blindly regenerate everything. It intelligently analyzes your codebase, detects changes since the last run, and only regenerates the documents that are affected. This efficient process saves time and reduces unnecessary LLM API calls.

```bash
# DocSmith will automatically detect changes and update only what's necessary
aigne doc generate
```

![DocSmith intelligently detects changes and regenerates only the required documents.](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### Forcing a Full Regeneration

If you need to regenerate all documentation from scratch, ignoring the cache and previous state, use the `--forceRegenerate` flag. This is useful after significant configuration changes or when you want to ensure a completely fresh build.

```bash
# Regenerate all documentation from the ground up
aigne doc generate --forceRegenerate
```

---

## Refining Individual Documents with Feedback

Sometimes, you need to improve a specific document without any corresponding code changes. The `aigne doc update` command is designed for this purpose, allowing you to provide targeted feedback to the AI for content refinement.

You can use this command in two ways: interactively or directly via command-line arguments.

### Interactive Mode

For an easy, guided experience, simply run the command without any arguments. DocSmith will present you with an interactive menu to select which document you want to update. After you choose, you'll be prompted to enter your feedback.

```bash
# Start the interactive update process
aigne doc update
```

![Interactively select the documents you wish to update.](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### Direct Command-Line Updates

For faster workflows or scripting, you can specify the document and feedback directly using flags. This allows for precise, non-interactive updates.

```bash
# Update a specific document with feedback
aigne doc update --docs overview.md --feedback "Add a more comprehensive FAQ section at the end."
```

Key parameters for the `update` command:

| Parameter | Description |
|---|---|
| `--docs` | The path to the document you want to update. You can use this flag multiple times for multiple documents. |
| `--feedback` | The specific feedback or instructions for the AI to use when regenerating the content. |

---

## Optimizing the Overall Structure

Beyond refining the content of individual documents, you can also refine the overall documentation structure. If you feel a section is missing, or the existing organization could be improved, you can provide feedback to the structure planning agent using the `generate` command.

This command tells DocSmith to reconsider the entire document plan based on your new input.

```bash
# Regenerate the structure plan with specific feedback
aigne doc generate --feedback "Remove the 'About' section and add a more detailed 'API Reference'."
```

This approach is best for high-level changes to the table of contents, rather than line-by-line content edits.

With these tools, you can maintain accurate, high-quality documentation that evolves alongside your project. Once your content is refined, you may want to make it available to a global audience. Learn how in the [Translate Documentation](./features-translate-documentation.md) guide.