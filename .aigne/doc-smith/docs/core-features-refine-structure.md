---
labels: ["Reference"]
---

# Refine Document Structure

AIGNE DocSmith can intelligently analyze your codebase to generate a logically clear document structure. However, every project has unique requirements, and you may want to fine-tune this automatically generated structure to better align with your vision. This section will guide you on how to adjust and optimize your documentation outline by providing simple, natural language feedback.

You don't need to manually edit complex configuration files. By appending the `--feedback` parameter to the `generate` command, you can tell DocSmith what changes you want for the overall structure, just as you would communicate with a person. This is ideal for high-level adjustments like adding new sections, removing unnecessary parts, or reorganizing existing content.

Please note that this feature is primarily intended for adjusting the **overall framework** of the documentation. If you only want to modify the specific content of a single page, please refer to the [Update a Single Document](./core-features-update-document.md) section.

### Core Command

To refine the structure based on feedback, use the following command format:

```bash
aigne doc generate --feedback "Type your specific adjustment requirements here"
```

### Common Scenarios and Examples

Here are some practical scenarios demonstrating how to refine the document structure using feedback:

**1. Add or Remove Sections**

If you find that the documentation is missing a key part (such as an API reference) or a section is redundant, you can do the following:

```bash
aigne doc generate --feedback "Add an API reference section and remove the 'About' section"
```

DocSmith will parse this instruction, update the documentation structure plan, remove the "About" section, and generate a new "API Reference" section.

**2. Deepen Content or Add New Sections**

If you feel an existing section isn't detailed enough, you can request to expand it and add relevant content:

```bash
aigne doc generate --feedback "Add a more detailed installation guide to the quick start, and add a troubleshooting section"
```

This command will guide the AI to replan and generate content, enriching the "Quick Start" section and adding a new "Troubleshooting" page.

![DocSmith replans the document structure based on your feedback](https://www.aigne.io/image-bin/uploads/ab876626943f4542ca9f21267da001a8.png)

With this iterative feedback mechanism, you can easily guide the AI to adjust the documentation's high-level structure, ensuring the final output is both comprehensive and tailored to your project's needs.

---

Now that you understand how to refine the overall document structure, the next step is to learn about personalization. Continue to the [Configuration Guide](./configuration.md) for more information.