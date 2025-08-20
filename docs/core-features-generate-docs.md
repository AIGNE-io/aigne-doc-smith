---
labels: ["Reference"]
---

# Generate Documents

`aigne doc generate` is the core command for creating and updating your entire documentation set. It automatically analyzes your source code, plans the document structure, and generates detailed, high-quality content. When run for the first time in a project, it intelligently guides you through a quick configuration wizard to ensure the generated documentation fully meets your needs.

## First-Time Generation and Auto-Configuration

To start generating your documentation, simply run the following command in your project's root directory:

```bash
aigne doc generate
```

If you haven't configured your project yet, AIGNE will automatically detect this and launch an interactive configuration wizard. This process is known as "smart auto-configuration."

![Running the generate command for smart initialization](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You just need to answer a few simple questions based on the prompts, such as the documentation's target audience, primary language, and languages for translation, to complete all the basic settings.

![Answering questions to complete project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, AIGNE will immediately begin analyzing your codebase, planning the structure, and generating the documentation content piece by piece.

![Executing structure planning and document generation](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

The entire process is fully automated. Upon completion, you will see a success message, and all documents will be saved in the specified output directory.

![Documentation generated successfully](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## Smart Updates

After you modify your source code and run the `aigne doc generate` command again, AIGNE will not blindly regenerate everything. It has a built-in smart update mechanism that automatically detects which files have changed since the last generation.

Based on these changes, the system decides whether to update the document structure or regenerate related content, thereby maximizing time and resource savings.

![Smart detection, regenerating only necessary documents](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

## Forcing a Complete Regeneration

In some cases, you may want to ignore all caches and change detection to completely regenerate all documentation from scratch. For example, you can use the `--forceRegenerate` flag when you have made significant changes to the configuration file or want to ensure all content is based on the latest codebase.

```bash
aigne doc generate --forceRegenerate
```

This command forces AIGNE to re-execute all steps, including structure planning and content generation for every document.

## Optimizing Structure with Feedback

The `generate` command is not just for creation; it can also optimize an existing foundation. By using the `--feedback` parameter, you can provide specific guidance to the AI to adjust the overall documentation structure. For example, you can ask it to add, delete, or reorganize certain sections.

```bash
aigne doc generate --feedback "Remove the 'About' section and add an API reference section"
```

This method is ideal for making high-level adjustments to the automatically generated document structure. To learn more about how to fine-tune the structure, please see the [Refine Document Structure](./core-features-refine-structure.md) section.

## What's Next?

Now that you know how to generate and update your entire documentation set, you can:

- If you want to fine-tune a specific document, see [Update a Single Document](./core-features-update-document.md).
- If your documentation is ready, learn how to [Publish Your Docs](./core-features-publish-docs.md) to share it with others.