# Getting Started

This guide will walk you through the essential steps to install AIGNE DocSmith, configure your first project, and generate a complete set of documentation in just a few minutes.

## Step 1: Prerequisites

Before you begin, ensure you have Node.js and pnpm installed on your system. AIGNE DocSmith is a command-line tool built on this ecosystem.

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

## Step 2: Install AIGNE CLI

Install the latest version of the AIGNE CLI globally using npm. This single package gives you access to the full suite of AIGNE tools, including DocSmith.

```bash
npm i -g @aigne/cli
```

To verify that the installation was successful, run the help command:

```bash
aigne doc -h
```

This command displays the help menu for DocSmith, confirming it's ready to use.

## Step 3: Generate Your Documentation

With the CLI installed, you can generate your first set of documents with a single command. Navigate to your project's root directory and run:

```bash
aigne doc generate
```

### Smart Auto-Configuration

The first time you run this command in a new project, DocSmith's interactive setup wizard will automatically launch to guide you through the configuration.

![Running the generate command initiates the smart setup](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You'll be asked a few questions to tailor the documentation to your needs, including:

- The primary purpose and style of your documentation.
- The target audience you are writing for.
- The primary language and any additional languages for translation.
- The source code paths for the AI to analyze.
- The output directory where the documents will be saved.

![Answer questions to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, DocSmith will analyze your source code, plan the document structure, and begin generating the content.

![DocSmith plans the structure and generates the documents](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## Step 4: Review Your Output

That's it! Once the process is finished, you will see a confirmation message.

![Documentation generation successful](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

You can find your newly created documentation in the output directory specified during setup. By default, this is `.aigne/doc-smith/docs`.

## What's Next?

You have successfully generated your first set of documents. Here are a few places you might want to go next:

<x-cards>
  <x-card data-title="Core Features" data-icon="lucide:box" data-href="/features">
    Explore the main commands and capabilities, from updating documents to publishing them online.
  </x-card>
  <x-card data-title="Configuration Guide" data-icon="lucide:settings" data-href="/configuration">
    Dive deeper into the config.yaml file to fine-tune your documentation's style, audience, and languages.
  </x-card>
  <x-card data-title="CLI Command Reference" data-icon="lucide:terminal" data-href="/cli-reference">
    Get a complete reference for all available `aigne doc` commands and their options.
  </x-card>
</x-cards>