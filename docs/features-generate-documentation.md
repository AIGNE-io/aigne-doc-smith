---
labels: ["Reference"]
---

# Generate Documentation

The `aigne doc generate` command is the core function of DocSmith, designed to transform your source code into a comprehensive and well-structured documentation suite with a single command.

This process involves analyzing your codebase, planning a logical document structure, and then generating detailed content for each section. It's the primary way to create your documentation from scratch.

## Your First Generation

To begin, navigate to your project's root directory and run the following command:

```bash
aigne doc generate
```

### Smart Auto-Configuration

If you're running this command for the first time in a project, DocSmith will intelligently detect that no configuration exists. It will automatically launch an interactive setup wizard to guide you through the initial setup. This ensures you have a properly configured environment before generation begins.

![Running the generate command for the first time triggers the setup wizard](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You will be asked a series of questions to define:
- Document generation rules and style
- The target audience
- Primary and translation languages
- Source code and output paths

![Answer a few questions to configure your documentation style, languages, and source paths](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, DocSmith proceeds with the documentation generation.

![DocSmith analyzes your code, plans the structure, and generates each document](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Upon successful completion, your newly created documentation will be available in the output directory you specified.

![Once complete, you'll find your new documentation in the specified output directory](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## The Generation Process

The `generate` command follows a clear, automated workflow to ensure consistent and high-quality results. The process can be visualized as follows:

```d2
direction: down

start: "Start"
run_cmd: "Run `aigne doc generate`"
check_config: "Configuration exists?" {
  shape: diamond
}
interactive_setup: "Interactive Setup Wizard"
plan_structure: "Analyze Code & Plan Structure"
gen_content: "Generate Document Content"
save_docs: "Save Documents to Output Directory"
end: "End"

start -> run_cmd -> check_config
check_config -> interactive_setup: "No"
interactive_setup -> plan_structure
check_config -> plan_structure: "Yes"
plan_structure -> gen_content -> save_docs -> end
```

## Fine-Tuning Your Generation

While the default `generate` command is sufficient for most use cases, you can use several options to control the generation process. These are particularly useful for regenerating content or refining the document structure.

| Option              | Description                                                                                                                              | Example                                                              |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | Deletes all existing documents and regenerates them from scratch. Use this after making significant changes to your source code or configuration. | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | Provides high-level feedback to refine the overall document structure plan, such as adding, removing, or reorganizing sections.           | `aigne doc generate --feedback "Add an API Reference section"`         |
| `--model`           | Specifies a particular Large Language Model from AIGNE Hub to use for content generation, allowing you to switch between models easily.       | `aigne doc generate --model claude:claude-3-5-sonnet`                |

## What's Next?

Now that you have generated your initial documentation, your project will continue to evolve. To keep your documents synchronized with your code, you will need to update them. Proceed to the next section to learn how to make targeted changes and regenerate specific files.

<x-card data-title="Update and Refine" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  Discover how to intelligently update documents when your code changes or make specific improvements using feedback.
</x-card>.