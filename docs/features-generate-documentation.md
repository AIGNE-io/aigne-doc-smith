---
labels: ["Reference"]
---

# Generate Documentation

The primary command for creating a complete set of documentation from your source code is `generate`. This single command initiates a process that analyzes your codebase, designs a logical document structure, and then writes detailed content for each section.

### The Main Command

To begin, navigate to your project's root directory and run the following command:

```bash
aigne doc generate
```

### Smart Auto-Configuration on First Run

If you are running DocSmith in a project for the first time, the `generate` command will automatically detect the absence of a configuration file. It will then launch an interactive setup wizard to guide you through the initial setup.

![Running the generate command, which intelligently triggers the initialization process](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You will be prompted to define key aspects of your documentation, including:

- Document generation rules and style
- The target audience
- Primary and translation languages
- Source code paths
- The output directory

![Answering a series of questions to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, DocSmith will proceed with planning the document structure and generating the content.

![DocSmith executing the structure planning and document generation phases](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Upon completion, you will see a success message confirming that your documentation is ready.

![A success message indicating that the documentation has been generated](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

### Forcing a Full Regeneration

If you need to regenerate all documentation from scratch, discarding any previous versions, you can use the `--forceRegenerate` flag. This is useful after making significant changes to your source code or configuration file.

```bash
aigne doc generate --forceRegenerate
```

This command ensures that the entire documentation set is rebuilt based on the latest state of your project.

### Refining the Structure with Feedback

You can also guide the AI to improve the overall document structure by providing targeted feedback during the generation process. Use the `--feedback` flag to suggest changes, such as adding or removing sections.

```bash
# Example: Ask the AI to add an API Reference section
aigne doc generate --feedback "Remove About section and add API Reference"
```

This allows you to refine the high-level organization of your documents without manual intervention.

---

Now that you understand how to generate a new set of documents, the next step is to learn how to maintain and improve them over time. For this, proceed to the [Update and Refine](./features-update-and-refine.md) guide.