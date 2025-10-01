# Update and Refine

Keeping documentation synchronized with an evolving codebase is a critical task. AIGNE DocSmith provides direct and flexible methods to keep your content current, whether through automatic updates based on code changes or precise, feedback-driven refinements.

This guide covers how to:

- Automatically update documents when your source code changes.
- Regenerate specific documents using targeted feedback.
- Adjust the overall documentation structure.

### Document Update Workflows

The following diagram illustrates the different paths you can take to update your documentation:

```d2 Update Workflows
direction: down

Start: {
  shape: circle
  label: "Start"
}

Code-Change: {
  label: "Source Code or\nConfig Changes"
  shape: rectangle
}

Content-Tweak: {
  label: "Need Content\nImprovement?"
  shape: rectangle
}

Structure-Tweak: {
  label: "Need Structure\nImprovement?"
  shape: rectangle
}

Start -> Code-Change
Start -> Content-Tweak
Start -> Structure-Tweak

Code-Change -> Generate-Command: "aigne doc generate"

Generate-Command -> Change-Detection: {
  label: "Change Detection"
  shape: diamond
}
Change-Detection -> Auto-Regen: "Regenerates\nAffected Docs"

Content-Tweak -> Update-Command: "aigne doc update\n--feedback"
Update-Command -> Manual-Regen: "Regenerates\nSpecific Doc"

Structure-Tweak -> Generate-Feedback-Command: "aigne doc generate\n--feedback"
Generate-Feedback-Command -> Replan: "Re-plans Document\nStructure"

End: {
  shape: circle
  label: "Docs Updated"
}

Auto-Regen -> End
Manual-Regen -> End
Replan -> End
```

---

## Automatic Updates with Change Detection

When you run the `aigne doc generate` command, DocSmith analyzes your codebase, detects any changes since the last run, and regenerates only the documents that are affected. This process saves time and reduces unnecessary API calls.

```shell icon=lucide:terminal
# DocSmith will detect changes and update only what's necessary
aigne doc generate
```

![DocSmith detects changes and regenerates only the required documents.](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### Forcing a Full Regeneration

If you need to regenerate all documentation from scratch, ignoring any cached or previous state, use the `--forceRegenerate` flag. This is useful after significant configuration changes or when you want to ensure a completely fresh build.

```shell icon=lucide:terminal
# Regenerate all documentation from the ground up
aigne doc generate --forceRegenerate
```

---

## Refining Individual Documents

To improve a specific document without any corresponding code changes, use the `aigne doc update` command to provide targeted instructions for content refinement.

You can use this command in two ways: interactively or directly via command-line arguments.

### Interactive Mode

For a guided experience, run the command without any arguments. DocSmith will present a menu to select which document you want to update. After you choose, you'll be prompted to enter your feedback.

```shell icon=lucide:terminal
# Start the interactive update process
aigne doc update
```

![Interactively select the documents you wish to update.](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### Direct Command-Line Updates

For faster workflows or scripting, you can specify the document and feedback directly using flags. This allows for precise, non-interactive updates.

```shell icon=lucide:terminal
# Update a specific document with feedback
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

Key parameters for the `update` command:

| Parameter  | Description                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `--docs`     | The path to the document you want to update. You can use this flag multiple times for batch updates. |
| `--feedback` | The specific instructions to use when regenerating the content.                       |

---

## Optimizing the Overall Structure

Beyond refining the content of individual documents, you can also adjust the overall documentation structure. If a section is missing or the existing organization could be improved, you can provide feedback to the `generate` command.

This command instructs DocSmith to re-evaluate the entire document plan based on your new input.

```shell icon=lucide:terminal
# Regenerate the documentation structure with specific feedback
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

This approach is best for high-level changes to the document's table of contents, rather than line-by-line content edits.

With these tools, you can maintain accurate documentation that evolves alongside your project. Once your content is refined, you can make it available to a global audience. Learn how in the [Translate Documentation](./features-translate-documentation.md) guide.