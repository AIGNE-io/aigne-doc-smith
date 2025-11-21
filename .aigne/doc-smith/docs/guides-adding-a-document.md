Ever find your documentation has a gap? The `aigne doc add-document` command provides a straightforward, interactive way to introduce new topics into your existing documentation structure, ensuring your content grows alongside your project.

# Add a Document

The `aigne doc add-document` command, also available via the alias `aigne doc add`, initiates an interactive session to add one or more new documents to your project's documentation structure. It not only adds the new files but also intelligently updates existing documents with relevant links to ensure the new content is discoverable.

## Command Usage

To start the process, navigate to your project's root directory and run the following command:

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

This command launches an interactive wizard that guides you through the process.

## The Process

The command follows a structured, step-by-step process to integrate new documents seamlessly.

### 1. Initial Prompt

The command first displays the current documentation structure and then prompts you to specify the new document you wish to add. You can describe your request in natural language.

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish:
```

### 2. Adding Documents

You can add documents one by one. After each addition, the tool displays the updated structure and prompts you to add another. To finish adding documents, simply press `Enter` without typing anything.

```sh
You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 3. Automatic Link Analysis

Once you have finished adding documents, DocSmith analyzes the new additions and the existing content. It identifies which of your existing documents would benefit from linking to the new ones you've just added.

### 4. Review and Confirm Updates

DocSmith presents a list of existing documents that it suggests updating with new links. You can review this list and select which documents you want the tool to modify. This step ensures that you have full control over changes to your existing content.

![Screenshot of the document update selection screen.](../../../assets/screenshots/doc-update.png)

### 5. Content Generation and Translation

After confirmation, the system proceeds with two main tasks in parallel:
*   **Generates Content:** Creates the full content for the new documents you added.
*   **Updates Links:** Modifies the selected existing documents to include links to the new pages.

If you have configured multiple languages, both the new documents and the updated ones are automatically added to the translation queue.

### 6. Summary Report

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