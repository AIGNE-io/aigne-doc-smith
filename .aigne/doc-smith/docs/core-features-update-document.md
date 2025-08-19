---
labels: ["Reference"]
---

# Update a Single Document

When you only need to make minor adjustments or additions to a document without regenerating the entire project, the `update` command is the ideal choice. It allows you to provide specific feedback for an individual document page, enabling precise content optimization and regeneration, which saves time and computing resources.

## Interactive Update (Recommended)

For most users, the interactive mode is the most intuitive and convenient method. You don't need to know the exact path of the document in advance; you can simply select it from a list.

Run the following command to start the interactive update process:

```bash
aigne doc update
```

After running this command, the system will:
1.  List all available documents in the current project.
2.  Allow you to move the cursor up and down to select the document you wish to update from the list.
3.  Once selected, the system will prompt you to enter specific optimization feedback (e.g., "add an example for parameter configuration" or "this description is unclear, please rewrite it in simpler language").
4.  Press the Enter key, and AIGNE will regenerate only this document based on your feedback.

![Interactively selecting a single document to update](https://www.aigne.io/image-bin/uploads/ac9ce10c1e9a98b5a9e834f9b3d4472e.png)

## Update by Specifying a Path

If you already know the path of the document you want to modify and want to provide feedback directly in the command, you can use the command format with parameters.

```bash
aigne doc update --doc-path <document-path> --feedback "<your-feedback>"
```

**Command Parameters**

| Parameter | Description |
|---|---|
| `--doc-path` | The path of the document you want to regenerate. This path corresponds to the `path` field in the project's structural plan, such as `/faq` or `/configuration/llm-providers`. |
| `--feedback` | Specific optimization suggestions and instructions for the document's content. It is recommended to enclose the feedback in quotes. |

**Example**

Suppose you want to add more content to the "Frequently Asked Questions" page. You can run the following command:

```bash
aigne doc update --doc-path /faq --feedback "Add more FAQ entries about installation failures and configuration errors"
```

## Use Cases

- **Correcting Errors**: Quickly correct spelling errors, technical inaccuracies, or outdated information in a document.
- **Adding Content**: Add more details, code examples, or usage scenarios for specific feature descriptions.
- **Optimizing Phrasing**: Improve the clarity and readability of a passage based on reader feedback.
- **Iterative Refinement**: Optimize each section individually during the initial drafting stage.

The `update` command allows for fine-grained management of your documentation, ensuring each page meets the highest quality standards. After the update is complete, you can proceed to [publish the documentation](./core-features-publish-docs.md) to share the latest content with your readers.