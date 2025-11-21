Ever find your documentation has a gap? The `aigne doc add-document` command provides a straightforward, interactive way to introduce new topics into your existing documentation structure, ensuring your content grows alongside your project.

# Add a Document

The `aigne doc add-document` command, also available via the alias `aigne doc add`, initiates an interactive session to add one or more new documents to your project's documentation structure. It not only adds the new files but also intelligently updates existing documents with relevant links to ensure the new content is discoverable.

## Command Usage

To start the process, navigate to your project's root directory and run the following command:

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

Alternatively, you can use the shorter alias `add`:

```sh aigne doc add icon=lucide:terminal
aigne doc add
```

This command launches an interactive wizard that guides you through the process.

## The Process

The command follows a structured, step-by-step process to integrate new documents seamlessly.

### 1. Add New Documents Interactively

The command first displays the current documentation structure and then prompts you to specify new documents. You can describe your request in natural language. You can add documents one by one. After each addition, the tool displays the updated structure and prompts you to add another. To finish adding documents, simply press `Enter` without typing anything.

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 2. Review and Link to Existing Documents

After you finish adding documents, DocSmith analyzes the existing content and identifies which documents would benefit from linking to the new ones. It then presents a list of these documents for you to review and select which ones the tool should modify. This step gives you full control over changes to your existing content.

By default, all suggested documents are selected. You can press `Space` to unselect items and `Enter` to confirm your selection.

```sh
? Select documents that need new links added (all selected by default, press Enter to confirm, or unselect all to skip):
❯ ◯ Overview (overview.md)
  ◯ Getting Started (getting-started.md)
  ◉ Guides (guides.md)
```

### 3. Content Generation and Translation

After confirmation, the system proceeds with two main tasks in parallel:
*   **Generates Content:** Creates the full content for the new documents you added.
*   **Updates Links:** Modifies the selected existing documents to include links to the new pages.

If you have configured multiple languages, both the new documents and the updated ones are automatically added to the translation queue.

### 4. Summary Report

Finally, the command prints a summary of the operations performed. This report includes a list of all newly created documents and a list of all existing documents that were updated with new links.

```text
📊 Summary

✨ Added Documents:
   Total: 1 document(s)

   1. /guides/deployment-guide - Deployment Guide

✅ Documents updated (Added new links):
   Total: 2 document(s)

   1. /overview - Overview
      New links added: /guides/deployment-guide

   2. /getting-started - Getting Started
      New links added: /guides/deployment-guide
```

This structured process ensures that new documentation is not just created but is also woven into the fabric of your existing content, improving navigation and discoverability.

## Related Guides

For other document management tasks, refer to the following guides:

<x-cards data-columns="2">
  <x-card data-title="Remove a Document" data-icon="lucide:file-minus" data-href="/guides/removing-a-document">
    Learn how to remove documents from your project.
  </x-card>
  <x-card data-title="Update Content" data-icon="lucide:file-pen" data-href="/guides/updating-document">
    See how to modify the content of existing documents.
  </x-card>
</x-cards>