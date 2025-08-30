---
labels: ["Reference"]
---

# Getting Started

This guide will walk you through installing AIGNE DocSmith and generating your first set of documents. You can get from a fresh start to a fully documented project in just a few minutes.

## Step 1: Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js
- pnpm

DocSmith is distributed as part of the AIGNE Command Line Interface (CLI).

## Step 2: Installation

Install the latest version of the AIGNE CLI globally using npm. This single package includes all DocSmith commands.

```bash
npm i -g @aigne/cli
```

After the installation is complete, verify it by checking the help message for the `doc` command:

```bash
aigne doc -h
```

If you see a list of available commands and options, the installation was successful.

## Step 3: Generate Your First Docs

With the AIGNE CLI installed, navigate to your project's root directory and run a single command:

```bash
aigne doc generate
```

### Smart Auto-Configuration

If this is your first time running DocSmith in the project, it will automatically detect that no configuration exists and launch an interactive setup wizard.

![Running the generate command, which intelligently triggers initialization](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

The wizard will ask you a series of questions to understand your documentation goals, target audience, and project structure. This helps the AI tailor the content and style to your specific needs.

![Answering questions to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### Document Generation

Once the configuration is complete, DocSmith proceeds to:
1.  Analyze your source code.
2.  Plan a logical document structure.
3.  Generate detailed content for each section.

![Executing structure planning and generating documents](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

When the process is finished, you will find the generated markdown files in the output directory specified during setup (default is `.aigne/doc-smith/docs`).

![Successful documentation generation](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## A Note on LLM Configuration

DocSmith uses Large Language Models (LLMs) to generate content. By default, it connects to **AIGNE Hub**, which requires no API keys and allows you to easily switch between different models.

You can specify a model for a single run using the `--model` flag:

```bash
# Use Google's Gemini 1.5 Flash
aigne doc generate --model google:gemini-1.5-flash

# Use Anthropic's Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# Use OpenAI's GPT-4o
aigne doc generate --model openai:gpt-4o
```

For more advanced options, including how to use your own API keys, see the [LLM Setup](./configuration-llm-setup.md) guide.

## What's Next?

You have now successfully generated a full set of documentation for your project. You can explore the generated files and see how DocSmith has interpreted your codebase.

From here, you can learn more about how to manage your new documentation:

-   Explore the [Core Features](./features.md) to understand how to update, translate, and publish your docs.
-   Consult the [CLI Command Reference](./cli-reference.md) for a detailed list of all available commands and options.