# Update and Refine

Keeping documentation synchronized with an evolving codebase is a methodical process. AIGNE DocSmith provides direct and flexible commands to keep your content current, either through automatic updates based on code changes or through precise, feedback-driven refinements.

This guide covers the procedures to:

- Automatically update documents when source code is modified.
- Regenerate specific documents using targeted feedback.
- Adjust the overall documentation structure.

### Document Update Workflows

The following diagram illustrates the different workflows available for updating your documentation:

```d2 Document Update Workflows
direction: down

developer: {
  shape: c4-person
  label: "Developer"
}

codebase: {
  shape: cylinder
  label: "Source Code"
}

updated-documentation: {
  shape: cylinder
  label: "Updated\nDocumentation"
}

workflows: {
  label: "Document Update Workflows"
  shape: rectangle

  automatic-updates: {
    label: "Automatic Updates (Code-Driven)"
    shape: rectangle

    cmd-generate: {
      label: "aigne doc generate"
    }

    decision-force: {
      label: "--forceRegenerate?"
      shape: diamond
    }

    detect-changes: {
      label: "Detect Changes"
    }

    regen-affected: {
      label: "Regenerate\nAffected Docs"
    }

    regen-all: {
      label: "Regenerate\nAll Docs"
    }
  }

  manual-refinements: {
    label: "Manual Refinements (Feedback-Driven)"
    shape: rectangle
    grid-columns: 2
    grid-gap: 100

    refine-individual: {
      label: "Refine Individual Docs"
      shape: rectangle

      cmd-update: {
        label: "aigne doc update\n--feedback"
      }

      regen-specific: {
        label: "Regenerate\nSpecific Doc"
      }
    }

    optimize-structure: {
      label: "Optimize Overall Structure"
      shape: rectangle

      cmd-generate-feedback: {
        label: "aigne doc generate\n--feedback"
      }

      re-evaluate-plan: {
        label: "Re-evaluate\nDocument Plan"
      }
    }
  }
}

# --- Connections ---

# Path 1: Automatic Updates
developer -> codebase: "1. Makes changes"
codebase -> workflows.automatic-updates.cmd-generate: "2. Runs command"
workflows.automatic-updates.cmd-generate -> workflows.automatic-updates.decision-force
workflows.automatic-updates.decision-force -> workflows.automatic-updates.detect-changes: "No"
workflows.automatic-updates.detect-changes -> workflows.automatic-updates.regen-affected
workflows.automatic-updates.decision-force -> workflows.automatic-updates.regen-all: "Yes"
workflows.automatic-updates.regen-affected -> updated-documentation
workflows.automatic-updates.regen-all -> updated-documentation

# Path 2: Individual Refinement
developer -> workflows.manual-refinements.refine-individual.cmd-update: "3. Provides\ncontent feedback"
workflows.manual-refinements.refine-individual.cmd-update -> workflows.manual-refinements.refine-individual.regen-specific
workflows.manual-refinements.refine-individual.regen-specific -> updated-documentation

# Path 3: Structural Refinement
developer -> workflows.manual-refinements.optimize-structure.cmd-generate-feedback: "4. Provides\nstructural feedback"
workflows.manual-refinements.optimize-structure.cmd-generate-feedback -> workflows.manual-refinements.optimize-structure.re-evaluate-plan
workflows.manual-refinements.optimize-structure.re-evaluate-plan -> updated-documentation: "Regenerate with\nNew Structure"
```

---

## Automatic Updates with Change Detection

When you execute the `aigne doc generate` command, DocSmith first analyzes your codebase to detect changes since the last generation. It then regenerates only the documents affected by these changes. This default behavior conserves time and reduces API usage.

```shell icon=lucide:terminal
# DocSmith will detect changes and update only what's necessary
aigne doc generate
```

![DocSmith detects changes and regenerates only the required documents.](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### Forcing a Full Regeneration

To regenerate all documentation from scratch, bypassing the cache and change detection, use the `--forceRegenerate` flag. This is necessary when you have made significant configuration changes or require a complete rebuild to ensure consistency.

```shell icon=lucide:terminal
# Regenerate all documentation from the ground up
aigne doc generate --forceRegenerate
```

---

## Refining Individual Documents

To improve a specific document's content without corresponding code changes, use the `aigne doc update` command. This command allows you to provide targeted instructions for refinement.

This can be done interactively or non-interactively via command-line arguments.

### Interactive Mode

For a guided process, run the command without arguments. DocSmith will present a menu to select the document you wish to update. After selection, you will be prompted to enter your feedback.

```shell icon=lucide:terminal
# Start the interactive update process
aigne doc update
```

![Interactively select the documents you wish to update.](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### Direct Command-Line Updates

For scripted or faster workflows, you can specify the document and feedback directly using flags. This enables precise, non-interactive updates.

```shell icon=lucide:terminal
# Update a specific document with feedback
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

Key parameters for the `update` command are as follows:

| Parameter | Description |
| --- | --- |
| `--docs` | The path to the document to be updated. This flag can be used multiple times for batch updates. |
| `--feedback` | The specific instructions to be used when regenerating the content. |

---

## Optimizing the Overall Structure

In addition to refining individual document content, you can adjust the overall documentation structure. If the existing organization is suboptimal or a section is missing, you can provide feedback to the `generate` command.

This instructs DocSmith to re-evaluate the entire document plan based on your input.

```shell icon=lucide:terminal
# Regenerate the documentation structure with specific feedback
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

This approach is intended for high-level changes to the document's table of contents, not for minor content edits.

Once your content is refined, the next step is to prepare it for a global audience. For instructions, see the [Translate Documentation](./features-translate-documentation.md) guide.
