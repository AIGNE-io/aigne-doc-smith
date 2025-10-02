# Generate Documentation

The `aigne doc generate` command is the primary function for creating a complete documentation set from your source code. This command initiates a process that analyzes your codebase, plans a logical documentation structure, and then generates content for each section. It is the standard method for creating your documentation from an initial state.

## Your First Generation

To begin, navigate to your project's root directory and run the following command:

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### Automatic Configuration

If you are running this command for the first time in a project, DocSmith will detect that no configuration exists. It will then automatically launch an interactive setup wizard to guide you through the required setup steps. This process ensures a valid configuration is in place before generation begins.

![Running the generate command for the first time triggers the setup wizard](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You will be prompted to answer a series of questions to define key aspects of your documentation, including:

- Document generation rules and style
- The target audience
- Primary language and any additional translation languages
- Source code input and documentation output paths

![Answer the questions to configure your documentation style, languages, and source paths](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

After the configuration is complete, DocSmith proceeds with the documentation generation.

![DocSmith analyzes your code, plans the structure, and generates each document](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Upon successful completion, the newly created documentation will be available in the output directory specified during setup.

![Once complete, you'll find your new documentation in the specified output directory](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## The Generation Process

The `generate` command executes an automated, multi-step workflow. The process is outlined below:

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Config-Check: {
  label: "Configuration\nExists?"
  shape: diamond
}

Setup-Wizard: {
  label: "Interactive\nSetup Wizard"
}

Generation-Process: {
  label: "Generation Process"
  grid-columns: 1

  Analyze: { label: "Analyze Codebase" }
  Plan: { label: "Plan Structure" }
  Generate: { label: "Generate Content" }
}

Source-Code: {
  label: "Source Code"
  shape: cylinder
}

Config-File: {
  label: "config.yaml"
  shape: cylinder
}

Output-Directory: {
  label: "Output Directory"
  shape: cylinder
}

User -> AIGNE-CLI: "1. aigne doc generate"
AIGNE-CLI -> Config-Check: "2. Check for config"

Config-Check -> Setup-Wizard: "3a. No"
Setup-Wizard -> User: "Prompt for input"
User -> Setup-Wizard: "Provide answers"
Setup-Wizard -> Config-File: "Creates"
Config-File -> Generation-Process: "Uses"
Setup-Wizard -> Generation-Process: "4. Proceed"

Config-Check -> Generation-Process: "3b. Yes"

Source-Code -> Generation-Process.Analyze: "Input"
Generation-Process.Analyze -> Generation-Process.Plan
Generation-Process.Plan -> Generation-Process.Generate
Generation-Process.Generate -> Output-Directory: "5. Write documentation"

Output-Directory -> User: "6. Review documentation"
```

## Command Options

The default `generate` command is sufficient for most use cases. However, several options are available to modify its behavior, which can be useful for forcing a full regeneration or refining the documentation structure.

| Option              | Description                                                                                                                              | Example                                                              |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | Deletes all existing documents and regenerates them from scratch. Use this after making significant changes to your source code or configuration. | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | Provides high-level feedback to refine the overall documentation structure, such as adding, removing, or reorganizing sections.           | `aigne doc generate --feedback "Add an API Reference section"`         |
| `--model`           | Specifies a particular Large Language Model from AIGNE Hub to use for content generation. This allows you to switch between different models.       | `aigne doc generate --model anthropic:claude-3-5-sonnet`                |

## What's Next?

After generating the initial documentation, your project will continue to evolve. To keep your documents synchronized with your code, you will need to perform updates. The next section explains how to make targeted changes and regenerate specific files based on new requirements or code modifications.

<x-card data-title="Update and Refine" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  Learn how to update documents when your code changes or make specific improvements using feedback.
</x-card>