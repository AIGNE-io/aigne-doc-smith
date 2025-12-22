# Getting Started

This guide provides a direct, step-by-step procedure for installing AIGNE DocSmith and generating your first set of documents. The process is designed to be completed in a few minutes, enabling you to produce documents from your project files with minimal setup.

The following diagram illustrates the key steps from installation to creation:

<!-- DIAGRAM_IMAGE_START:guide:4:3:1765020134 -->
![Getting Started](assets/diagram/getting-started-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## Prerequisites

Before proceeding with the installation, ensure your system meets the following requirement:

*   **Node.js**: Version 20 or newer is required. AIGNE DocSmith is installed using the Node Package Manager (npm), which is included with the Node.js installation. To install Node.js, visit the official [Node.js website](https://nodejs.org/) and follow the instructions for your operating system. You can verify the installation by opening your terminal and running `node -v` and `npm -v`.

No API keys are required to begin. By default, DocSmith uses the AIGNE Hub service for AI-powered creation, which provides access to various large language models without direct configuration.

## Installation

The tool is distributed as part of the AIGNE command-line interface (CLI). The installation involves two main steps.

### Step 1: Install the AIGNE CLI

To install the AIGNE CLI globally on your system, execute the following command in your terminal. This makes the `aigne` command accessible from any directory.

```bash Install AIGNE CLI icon=lucide:terminal
npm install -g @aigne/cli
```

### Step 2: Verify the Installation

After the installation is complete, you can confirm its success by running the help command for the documentation tool.

```bash Verify Installation icon=lucide:terminal
aigne doc --help
```

A successful installation will result in a displayed list of available DocSmith commands and their options.

## Generating Your First Documents

Follow these steps to analyze your project and create a complete set of documents.

### Step 1: Navigate to Your Project Directory

Open your terminal and use the `cd` command to change the current directory to the root of the project you intend to document.

```bash Change Directory icon=mdi:folder-open
cd /path/to/your/project
```

### Step 2: Run the Create Command

Execute the `create` command. This single command initiates the entire document creation process, from project analysis to content creation.

```bash Run Create Command icon=lucide:terminal
aigne doc create
```

### Step 3: Complete the Interactive Setup

When you run the `create` command for the first time in a project, DocSmith launches a one-time interactive setup process. You will be guided through a series of questions to configure preferences for your documents, such as their purpose, target audience, and primary language.

![Screenshot of the interactive setup process](../../../assets/screenshots/doc-complete-setup.png)

These settings are saved to a `config.yaml` file located in the `.aigne/doc-smith` directory, which you can modify manually at any time.

### Step 4: Await Creation

After the setup is complete, DocSmith will automatically perform the following actions:

1.  **Analyze Codebase**: Scans your source files to understand the project's structure and logic.
2.  **Plan Structure**: Creates a logical outline for the documents, defining sections and topics.
3.  **Generate Content**: Writes the documents based on the analysis and your specified configuration.

Upon completion, a confirmation message will be displayed. The created files will be available in the output directory specified during setup, which defaults to `.aigne/doc-smith/docs`.

![Screenshot of the success message after creation](../../../assets/screenshots/doc-generated-successfully.png)

## What's Next?

You have now successfully created your first set of documents. The following are common next steps for managing and enhancing your documents:

<x-cards data-columns="2">
  <x-card data-title="Update Document" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    Modify or regenerate specific parts of your documents to reflect code changes or incorporate new feedback.
  </x-card>
  <x-card data-title="Localize Document" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    Translate your documents into any of the 12 supported languages, including Chinese, Spanish, and German.
  </x-card>
  <x-card data-title="Publish Documents" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    Make your documents accessible online for your team or the public.
  </x-card>
  <x-card data-title="Review Configuration" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    Review and modify the `config.yaml` file created during the initial setup to adjust your preferences.
  </x-card>
</x-cards>