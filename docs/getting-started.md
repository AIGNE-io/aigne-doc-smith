---
labels: ["Reference"]
---

# Getting Started

Welcome to AIGNE DocSmith! This guide will walk you through a simple, three-step process to install the tool, configure your project, and generate your first set of documents in minutes.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js (latest LTS version recommended)
- pnpm (can be installed with `npm install -g pnpm`)

## Step 1: Install AIGNE CLI

DocSmith is distributed as part of the AIGNE Command Line Interface (CLI). To install it, open your terminal and run the following command:

```bash Install AIGNE CLI icon=lucide:terminal
npm i -g @aigne/cli
```

Once the installation is complete, you can verify it by checking the help command for the documentation tool:

```bash Verify Installation icon=lucide:terminal
aigne doc -h
```

If you see a list of available commands, you're all set!

## Step 2: Configure Your Project

DocSmith makes project setup easy with an interactive wizard. The smartest way to start is by running the `generate` command in your project's root directory.

```bash Start Generation icon=lucide:terminal
aigne doc generate
```

If this is your first time running the command, DocSmith will automatically detect that there's no configuration file and launch the setup wizard for you.

![Running the generate command, which intelligently triggers initialization](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

The wizard will guide you through a series of questions to understand your documentation needs, including:

- The primary goal of your documentation (e.g., tutorials, API reference).
- Your target audience (e.g., developers, end-users).
- The expected knowledge level of your readers.
- The desired depth and comprehensiveness of the content.
- The primary language and any additional languages for translation.
- The source code paths to analyze and the output directory for the generated documents.

![Answering questions to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once you've answered all the questions, DocSmith will save your settings to a configuration file (`.aigne/doc-smith/config.yaml`) and automatically proceed to the next step.

## Step 3: Generate Your Documentation

After the initial configuration is saved, DocSmith will immediately begin analyzing your source code, planning the document structure, and generating the content with AI.

![Executing structure planning and document generation](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

You'll see real-time progress in your terminal. Once the process is complete, you'll get a success message, and your new documentation will be ready in the output directory you specified.

![Documentation generation successful](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

That's it! You've successfully generated a full set of documentation for your project.

## What's Next?

Now that you have your initial documents, you can explore more of what DocSmith has to offer.

<x-cards data-columns="2">
  <x-card data-title="Explore Core Features" data-icon="lucide:wand-sparkles" data-href="/features" data-cta="Learn More">
    Discover how to update, translate, and publish your documentation.
  </x-card>
  <x-card data-title="Configuration Guide" data-icon="lucide:sliders-horizontal" data-href="/configuration" data-cta="Learn More">
    Dive deeper into the configuration file to fine-tune your documentation's style, audience, and languages.
  </x-card>
</x-cards>