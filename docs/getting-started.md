---
labels: ["Reference"]
---

# Getting Started

This guide provides the quickest path to installing AIGNE DocSmith and generating your first set of documents. You'll be up and running in just a few minutes.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js
- pnpm

## Step 1: Install AIGNE CLI

First, install the AIGNE Command Line Interface (CLI) globally using npm. This single command gives you access to DocSmith and other AIGNE tools.

```bash
npm i -g @aigne/cli
```

To confirm the installation was successful, run the help command:

```bash
aigne doc -h
```

You should see a list of available `doc` commands and their options.

## Step 2: Generate Your First Documents

With the CLI installed, you can now generate a complete set of documentation from your source code with a single command.

Navigate to your project's root directory in your terminal and run:

```bash
aigne doc generate
```

### Automatic Configuration

If this is your first time running the command in your project, DocSmith will detect that there is no configuration file and automatically start an interactive setup wizard.

![Running the generate command, which intelligently triggers the initialization wizard.](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

The wizard will guide you through a series of questions to understand your project and documentation needs, including:

- The purpose of your documentation
- Your target audience
- The primary language and desired translations
- The location of your source code

Simply answer the questions to complete the project setup.

![Answering questions in the interactive wizard to complete project settings.](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### AI-Powered Generation

Once the configuration is complete, DocSmith's AI will analyze your codebase, plan a logical document structure, and begin generating the content for each section.

![The tool showing the process of structure planning and content generation.](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

### All Done!

When the process is finished, you will see a success message. Your new documentation is now ready in the output directory you specified during setup (the default is `.aigne/doc-smith/docs`).

![A success message indicating that the documentation has been generated.](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## Next Steps

You have successfully generated your first set of documents! To learn more about the `generate` command and explore other features, proceed to the Core Features section.

- [Explore Core Features](./features.md)