# Remove a Document

Keeping your documentation accurate involves not just adding content, but also pruning it. This guide details how to use the `aigne doc remove-document` command to safely delete documents from your project, ensuring that your documentation set remains clean and relevant.

## Overview

The `remove-document` command provides an interactive way to select and delete one or more documents from your existing structure. A key feature of this command is its ability to handle cascading deletes; removing a parent document will also remove all of its child documents.

Furthermore, after the selected documents are removed, the tool automatically scans the remaining files for any broken links that pointed to the deleted documents. It then attempts to intelligently fix these links or remove them, ensuring the integrity of your entire documentation set.

## How to Remove Documents

To begin the removal process, navigate to your project's root directory and execute the command:

```sh icon=lucide:terminal
aigne doc remove-document
```

You can also use the shorter aliases `remove` or `rm`:

```sh icon=lucide:terminal
aigne doc rm
```

### Step-by-Step Process

1.  **Select Documents:** Upon running the command, you will be presented with a list of your current documents, displayed in a hierarchical tree structure. You can navigate this list using the arrow keys and select the documents you wish to remove by pressing the spacebar.

2.  **Confirm Selection:** Once you have selected all the documents for deletion, press `Enter` to confirm. If you decide not to remove any documents, you can press `Enter` with no selections to cancel the operation.

3.  **Link Verification and Fixing:** After the documents are deleted, DocSmith automatically scans your remaining documentation for any links that now point to non-existent files. You will be prompted to confirm the automatic fixing of these invalid links.

4.  **Review Summary:** Finally, a summary is displayed in your terminal, listing all the documents that were successfully removed and detailing which documents had invalid links fixed.

This process ensures that removing files is straightforward and doesn't leave behind broken references in your other documents.

## Related Guides

After tidying up your documentation, you might need to perform other updates. For more information on managing your document structure, please see the following guides:

<x-cards data-columns="2">
  <x-card data-title="Add a Document" data-icon="lucide:file-plus" data-href="/guides/adding-a-document">
    Learn how to add new documents to your existing documentation structure.
  </x-card>
  <x-card data-title="Update Document" data-icon="lucide:file-pen-line" data-href="/guides/updating-documentation">
    Find out how to modify and regenerate existing documents with new content or feedback.
  </x-card>
</x-cards>