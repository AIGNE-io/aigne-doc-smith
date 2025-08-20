---
labels: ["Reference"]
---

# Getting Started

This guide will walk you through the entire process, from installation to generating your first set of documents with AIGNE DocSmith. You can have your documentation ready in just a few minutes.

## Step 1: Prerequisites

Before you begin, make sure you have the following installed on your system:
- Node.js
- pnpm

## Step 2: Install the AIGNE CLI

AIGNE DocSmith is distributed as part of the AIGNE Command Line Interface (CLI). Open your terminal and run the following command to install it globally:

```bash
npm i -g @aigne/cli
```

After the installation is complete, you can verify it by checking the help menu for the documentation command:

```bash
aigne doc -h
```

If you see a list of available commands, the installation was successful.

## Step 3: Generate Your Documentation

With the AIGNE CLI installed, you can now generate your documentation with a single command. Navigate to your project's root directory in your terminal and run:

```bash
aigne doc generate
```

### Smart Auto-Configuration

The first time you run this command in a project, DocSmith will detect that no configuration file exists and will automatically launch an interactive setup wizard to guide you.

![Running the generate command, which intelligently starts the initialization process](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

This wizard will ask you a series of questions to tailor the documentation to your specific needs, including:

- The main purpose of your documentation
- Your target audience
- The primary language and any additional languages for translation
- The source code paths to analyze
- The output directory for the generated files

Simply answer the prompts to complete the project setup.

![Answer the questions to complete the project settings](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, DocSmith will begin analyzing your code, planning the document structure, and generating the content.

![Executing structure planning and generating documents](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

When the process is finished, you'll see a success message, and your new documentation will be available in the output directory you specified.

![Documentation generation successful](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## That's It!

You have now successfully generated a complete set of documentation for your project. You can explore the generated files and see the results.

To learn more about the different commands and capabilities, dive into the [Core Features](./features.md) section. If you want to customize the settings further, check out the [Configuration Guide](./configuration.md).
