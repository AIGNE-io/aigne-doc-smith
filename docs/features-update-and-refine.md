# Update and Refine

Keeping documentation synchronized with an evolving codebase is a methodical process. AIGNE DocSmith provides direct and flexible commands to keep your content current, either through automatic updates based on code changes or through precise, feedback-driven refinements.

This guide provides procedures for the following tasks:

*   Automatically updating documents when source code is modified.
*   Regenerating specific documents using targeted feedback.
*   Adjusting the overall documentation structure.

### Document Update Workflows

The following diagram illustrates the different workflows available for updating your documentation:

```d2 Document Update Workflows
direction: down

Developer: {
  shape: c4-person
}

Source-Code: {
  label: "Source Code"
}

Documentation: {
  label: "Documentation"
}

Action-Choice: {
  label: "Choose Action"
  shape: diamond
}

Generate-Sync: {
  label: "aigne doc generate"
  shape: rectangle

  Change-Detection: {
    label: "Detect Changes?"
    shape: diamond
  }
  Regenerate-Affected: "Regenerate Affected"
  Regenerate-All: "Regenerate All"

  Change-Detection -> Regenerate-Affected: "Yes (Default)"
  Change-Detection -> Regenerate-All: "No\n(--forceRegenerate)"
}

Refine-Content: {
  label: "aigne doc update"
}

Refine-Structure: {
  label: "aigne doc generate\n--feedback"
}

Developer -> Action-Choice

Action-Choice -> Generate-Sync: "Sync with Code"
Action-Choice -> Refine-Content: "Refine Doc Content"
Action-Choice -> Refine-Structure: "Refine Doc Structure"

Source-Code -> Generate-Sync

Generate-Sync.Regenerate-Affected -> Documentation: "Update"
Generate-Sync.Regenerate-All -> Documentation: "Update"
Refine-Content -> Documentation: "Update"
Refine-Structure -> Documentation: "Update"
```

---

## Automatic Updates with Change Detection

When you execute the `aigne doc generate` command, DocSmith first analyzes your codebase to detect changes since the last generation. It then regenerates only the documents affected by these changes. This default behavior conserves time and reduces API usage by avoiding redundant operations.

```shell icon=lucide:terminal
# DocSmith will detect changes and update only what is necessary
aigne doc generate
```

![DocSmith detects changes and regenerates only the required documents.](../assets/screenshots/doc-regenerate.png)

### Forcing a Full Regeneration

To regenerate all documentation from scratch, bypassing the cache and change detection, use the `--forceRegenerate` flag. This is necessary when you have made significant configuration changes or require a complete rebuild to ensure consistency across all files.

```shell icon=lucide:terminal
# Regenerate all documentation from the ground up
aigne doc generate --forceRegenerate
```

---

## Refining Documents with Feedback

You can refine documentation without corresponding code changes by providing direct feedback to the CLI commands. This is useful for improving clarity, adding examples, or adjusting the structure.

### Refining Individual Document Content

To improve a specific document's content, use the `aigne doc update` command. This command allows you to provide targeted instructions for refinement and can be run in two modes: interactive or non-interactive.

#### Interactive Mode

For a guided process, run the command without arguments. DocSmith will present a menu to select the document you wish to update. After selection, you will be prompted to enter your feedback.

```shell icon=lucide:terminal
# Start the interactive update process
aigne doc update
```

![Interactively select the documents you wish to update.](../assets/screenshots/doc-update.png)

#### Non-Interactive Mode

For scripted or faster workflows, you can specify the document and feedback directly using flags. This enables precise, non-interactive updates.

```shell icon=lucide:terminal
# Update a specific document with feedback
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

The primary parameters for the `update` command are as follows:

| Parameter | Description |
| :--- | :--- |
| `--docs` | The path to the document to be updated. This flag can be used multiple times for batch updates. |
| `--feedback` | A string containing the specific instructions to be used when regenerating the document's content. |

### Optimizing the Overall Structure

In addition to refining individual documents, you can adjust the overall documentation structure. If the existing organization is suboptimal or a section is missing, you can provide feedback to the `generate` command. This instructs DocSmith to re-evaluate the entire document plan based on your input.

```shell icon=lucide:terminal
# Regenerate the documentation structure with specific feedback
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

This approach is intended for high-level changes to the document's table of contents, not for minor content edits within a single file.

Once your content is refined, the next step is to prepare it for a global audience. For instructions, see the [Translate Documentation](./features-translate-documentation.md) guide.