# Update Content

This guide explains how to use the `update` command to modify existing documents. You can update document content, add or update diagrams, and remove diagrams through feedback.

## Basic Usage

### Interactive Mode

Run the command without arguments to enter interactive mode:

```bash icon=lucide:terminal
aigne doc update
```

Select documents and provide feedback to update them.

### Command-Line Mode

Update documents directly with command-line flags:

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "Add a more detailed explanation of the core features."
```

## Updating Diagrams

You can update diagrams in documents by providing feedback. The tool supports updating existing diagrams or adding new ones.

### Update a Specific Diagram

Provide feedback to update a diagram:

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "Update the diagram to show the new architecture"
```

### Update All Diagrams

Use the `--diagram` flag to filter and select documents with diagrams:

```bash icon=lucide:terminal
aigne doc update --diagram
```

Or use `--diagram-all` to automatically update all documents with diagrams:

```bash icon=lucide:terminal
aigne doc update --diagram-all
```

### Delete a Diagram

Remove a diagram by providing feedback:

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "Remove the diagram"
```

## Diagram Styles

DocSmith supports multiple diagram styles. You can specify a style in your feedback or configure a default style. The supported styles include:

### Modern
Clean, professional style with contemporary design elements.

![Modern Style](../../../assets/images/diagram-styles/modern.jpg)

### Standard Flowchart
Traditional flowchart style with conventional symbols.

![Standard Flowchart Style](../../../assets/images/diagram-styles/standard.jpg)

### Hand-drawn
Sketch-like style with natural, organic lines.

![Hand-drawn Style](../../../assets/images/diagram-styles/hand-drawn.jpg)

### Anthropomorphic
Personified elements with vivid, human-like features.

![Anthropomorphic Style](../../../assets/images/diagram-styles/anthropomorphic.jpg)

### Flat Design
Flat design without shadows or 3D effects.

![Flat Design Style](../../../assets/images/diagram-styles/flat.jpg)

### Minimalist
Minimal elements with maximum clarity.

![Minimalist Style](../../../assets/images/diagram-styles/minimalist.jpg)

### 3D
Three-dimensional effects with depth and perspective.

![3D Style](../../../assets/images/diagram-styles/3d.jpg)

## Command Parameters

| Parameter | Description | Required |
| :--- | :--- | :--- |
| `--docs` | Specifies the path(s) of the document(s) to update. Can be used multiple times. | Optional |
| `--feedback` | Provides textual instructions for the changes to be made. | Optional |
| `--reset` | Recreate the document(s) from scratch, ignoring existing content. | Optional |
| `--glossary` | Specifies the path to a glossary file (`@/path/to/glossary.md`). | Optional |
| `--diagram` | Filter to show only documents with diagrams and let user select which ones to update. | Optional |
| `--diagram-all` | Auto-select all documents with diagrams and update them without user selection. | Optional |

---

For information on adding or removing documents, see the [Add a Document](./guides-adding-a-document.md) and [Remove a Document](./guides-removing-a-document.md) guides.
