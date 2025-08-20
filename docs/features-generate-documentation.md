---
labels: ["Reference"]
---

# Generate Documentation

Creating a complete set of documentation from your source code is the primary function of AIGNE DocSmith. This can be accomplished with a single command that intelligently handles everything from initial setup to content creation.

## The Main Command

To generate your documentation, navigate to your project's root directory and run the following command:

```bash
aigne doc generate
```

### Smart Auto-Configuration

If this is the first time you're running the command in your project, DocSmith will automatically detect that no configuration is present and will launch an interactive setup wizard to guide you.

![Running the generate command triggers the smart initialization process.](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

The wizard will ask you a few questions to tailor the documentation to your needs:

- **Style and Rules:** Define the tone and writing style.
- **Target Audience:** Specify who the documentation is for (e.g., developers, end-users).
- **Languages:** Set the primary language and any additional languages for translation.
- **Code Path:** Point to the source code directories you want to document.
- **Output Directory:** Choose where the generated documentation files will be saved.

![Answering questions in the interactive wizard to complete the project setup.](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once you answer the questions, DocSmith saves your settings and proceeds with the generation process. For a detailed look at all available settings, see the [Configuration Guide](./configuration.md).

### The Generation Process

After configuration, DocSmith begins analyzing your code, planning a logical document structure, and writing the content for each section.

![The tool executing the structure planning and document generation phases.](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Upon completion, you will see a confirmation message, and your new documentation will be ready in the specified output directory.

![A success message indicating that the documentation generation is complete.](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## Forcing a Full Regeneration

If you have made significant changes to your source code or configuration and want to regenerate all documents from scratch, you can use the `--forceRegenerate` flag. This will ignore any existing documentation and create a completely new set.

```bash
aigne doc generate --forceRegenerate
```

## Optimizing the Document Structure

You can also refine the overall documentation structure by providing feedback directly to the `generate` command. This is useful for adding, removing, or reorganizing entire sections.

```bash
# Example: Refine the structure with specific feedback
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'"
```

This command will re-evaluate the structure plan based on your input before generating the content.

---

Now that you have generated your documentation, the next step is to learn how to keep it current as your project evolves. Proceed to the [Update and Refine](./features-update-and-refine.md) guide to discover how to manage updates and make targeted improvements.