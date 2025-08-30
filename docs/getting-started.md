---
labels: ["Reference"]
---

# Getting Started

This guide will walk you through installing AIGNE DocSmith, configuring your first project, and generating a complete set of documentation in just a few minutes. The process is designed to be straightforward, with a single command to get you started.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

## Step 1: Install AIGNE CLI

DocSmith is available through the AIGNE Command Line Interface (CLI). Install the latest version globally using npm:

```bash
npm i -g @aigne/cli
```

Once the installation is complete, verify that it was successful by checking the help command for the documentation tool:

```bash
aigne doc -h
```

This command should display a list of available `doc` commands and their options.

## Step 2: Generate Your Documentation

With the AIGNE CLI installed, you can generate your documentation with a single command. Navigate to your project's root directory and run:

```bash
aigne doc generate
```

### Smart Auto-Configuration

If this is your first time running DocSmith in the project, it will automatically detect that no configuration exists and launch an interactive setup wizard to guide you.

![Running the generate command triggers the smart initialization wizard](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

## Step 3: Configure Your Project

The interactive wizard will ask a series of questions to tailor the documentation to your specific needs. You will be prompted to define:

- The primary purpose and style of the documentation.
- Your target audience and their technical knowledge level.
- The primary language and any additional languages for translation.
- The source code paths for the AI to analyze.
- The output directory where the documents will be saved.

![Answer a series of questions to complete your project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

## Step 4: Review Your New Docs

After you complete the configuration, DocSmith will begin the generation process. It analyzes your code, plans a logical document structure, and writes the content for each section.

![DocSmith plans the document structure and generates content](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Once finished, you'll see a success message in your terminal. Your new documentation is now ready in the output directory you specified (e.g., `.aigne/doc-smith/docs`).

![A success message confirms your documentation is ready](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## What's Next?

You've successfully installed DocSmith and generated your first set of documents. Now you're ready to explore its capabilities in more detail.

<x-card data-title="Explore Core Features" data-icon="lucide:compass" data-href="/features" data-cta="Learn More">
  Dive deeper into the main commands and capabilities of DocSmith, from updating documents to publishing them online.
</x-card>