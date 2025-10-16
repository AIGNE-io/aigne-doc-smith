# Getting Started

This guide provides a step-by-step procedure for installing AIGNE DocSmith and generating your first set of documentation. The process is designed to be straightforward and can be completed in a few minutes.

## Prerequisites

Before proceeding with the installation, ensure your system meets the following requirements:

*   **Node.js**: Version 20 or newer is required. DocSmith is installed using the Node Package Manager (npm), which is included with the Node.js installation. To install Node.js, visit the official [Node.js website](https://nodejs.org/) and follow the instructions for your operating system. You can verify the installation by opening your terminal and running `node -v` and `npm -v`.

*   **API Keys**: No API keys are required to start. By default, DocSmith uses the AIGNE Hub service for AI-powered generation, which allows you to use various large language models without direct configuration.

## Installation

The tool is distributed as part of the AIGNE command-line interface (CLI). The installation process consists of two simple steps.

### Step 1: Install the AIGNE CLI

To install the AIGNE CLI globally on your system, execute the following command in your terminal:

```bash title="Install AIGNE CLI" icon=logos:npm-icon
npm install -g @aigne/cli
```

This command downloads and installs the package from the npm registry, making the `aigne` command available from any directory in your terminal.

### Step 2: Verify the Installation

After the installation is complete, you can verify it by running the help command for the documentation tool:

```bash title="Verify Installation"
aigne doc --help
```

This command should display a list of available DocSmith commands and their options, which confirms that the installation was successful.

## Generating Your First Documents

Follow these steps to analyze your project and generate a complete set of documentation.

### Step 1: Navigate to Your Project Directory

Open your terminal and use the `cd` command to change the current directory to the root of the project you wish to document.

```bash title="Change Directory" icon=mdi:folder-open
cd /path/to/your/project
```

### Step 2: Run the Generate Command

Execute the primary `generate` command. This single command handles the entire documentation creation process from analysis to content generation.

```bash title="Run Generate Command"
aigne doc generate
```

### Step 3: Complete the Interactive Setup

The first time you run the `generate` command in a project, DocSmith will initiate a one-time interactive setup process. You will be guided through a series of questions to configure your documentation preferences, such as its primary purpose, target audience, and language.

![Screenshot of the interactive setup process](../assets/screenshots/doc-complete-setup.png)

Your answers are saved to a `config.yaml` file located in the `.aigne/doc-smith` directory. This file can be manually edited later if needed.

### Step 4: Await Generation

Once the setup is complete, DocSmith will perform the following actions automatically:

1.  **Analyze Codebase**: It scans your source files to understand the project's structure, functions, and logic.
2.  **Plan Structure**: It creates a logical plan for the documentation, outlining sections and topics.
3.  **Generate Content**: It writes the documentation content based on the analysis and your configuration.

Upon completion, a confirmation message will appear, and the generated files will be located in the output directory specified during setup (by default, `.aigne/doc-smith/docs`).

![Screenshot of the success message after generation](../assets/screenshots/doc-generated-successfully.png)

## Exploring All Commands

DocSmith provides a set of commands to manage the full lifecycle of your documentation. The table below lists all available commands and their functions.

| Command     | Description                                                                                                   |
| :---------- | :------------------------------------------------------------------------------------------------------------ |
| `generate`  | Analyzes the codebase and generates a complete set of documentation based on the configuration.               |
| `update`    | Interactively selects and regenerates specific parts of existing documentation, often with new feedback.      |
| `translate` | Translates existing documentation into one or more of the 12 supported languages, such as `zh` or `ja`.       |
| `publish`   | Publishes the generated documentation to a live platform, making it accessible via a URL.                     |
| `init`      | Starts the interactive setup wizard to create or overwrite the `config.yaml` configuration file.              |
| `prefs`     | Displays the current configuration settings from the `config.yaml` file.                                      |

## What's Next?

You have successfully generated your first set of documents. Here are the common next steps to manage and enhance your documentation:

<x-cards data-columns="2">
  <x-card data-title="Update Documentation" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    Modify or regenerate specific sections of your documentation based on code changes or new requirements.
  </x-card>
  <x-card data-title="Translate Documentation" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    Translate your documents into any of the 12 supported languages, such as Chinese, Spanish, or German.
  </x-card>
  <x-card data-title="Publish Your Docs" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    Make your documentation available online for your team or the public.
  </x-card>
  <x-card data-title="Review Configuration" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    Review and modify the config.yaml file that was created during the initial setup to adjust your preferences.
  </x-card>
</x-cards>