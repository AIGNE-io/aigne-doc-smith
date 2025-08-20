---
labels: ["Reference"]
---

# Getting Started

Follow this simple guide to install AIGNE DocSmith and generate your first set of documents in just a few minutes. The process is designed to be straightforward, getting you from installation to complete documentation with a single command.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js
- pnpm

DocSmith is distributed as part of the AIGNE Command Line Interface (CLI).

## Step 1: Install the AIGNE CLI

First, install the latest version of the AIGNE CLI globally using npm. Open your terminal and run the following command:

```bash
npm i -g @aigne/cli
```

Once the installation is complete, you can verify it by checking the help command for DocSmith:

```bash
aigne doc -h
```

If the command runs successfully and displays a list of options, you're ready to proceed.

## Step 2: Generate Your Documentation

Now for the main step. Navigate to your project's root directory in your terminal and run the generate command:

```bash
aigne doc generate
```

### Smart Auto-Configuration

If this is your first time running the command in your project, DocSmith will automatically detect that no configuration exists and will launch an interactive setup wizard to guide you.

![Running the generate command initiates smart setup](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You will be prompted to answer a series of questions to define:

- The primary purpose of your documentation
- Your target audience
- Language settings
- Source code and output directories

![Answer questions to configure your project](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### Automatic Generation

After you complete the configuration, DocSmith takes over. It will analyze your source code, plan a logical document structure, and then generate high-quality content for each section.

![DocSmith plans the structure and generates the documents](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

When the process is finished, you will see a confirmation message, and your new documentation will be available in the output directory you specified.

![Documentation generation successful](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## A Note on AI Models (LLMs)

DocSmith uses AIGNE Hub by default, which allows you to generate documentation without needing to provide your own API keys for AI models. The setup is ready to use immediately after installation. If you wish to configure custom models or use your own API keys, please refer to the [LLM Setup](./configuration-llm-setup.md) guide.

## What's Next?

That's it! You have successfully generated a full set of documentation for your project. To learn more about what you can do with DocSmith, such as updating, refining, and publishing your documents, explore our [Core Features](./features.md).