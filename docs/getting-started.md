# Getting Started

This guide provides a step-by-step walkthrough to install AIGNE DocSmith, configure a project, and generate a complete set of documentation from your source code in minutes.

## Step 1: Prerequisites

Before you begin, ensure you have Node.js version 20 or higher installed on your system. DocSmith is a command-line tool that operates within the Node.js environment. We recommend using the Node Package Manager (npm), which is included with Node.js, for installation.

For detailed installation instructions, please refer to the official [Node.js website](https://nodejs.org/). A brief guide for common operating systems is provided below.

**Windows**
1.  Download the Windows Installer (`.msi`) from the [Node.js downloads page](https://nodejs.org/en/download).
2.  Execute the installer and follow the prompts in the setup wizard.

**macOS**

The recommended installation method is using [Homebrew](https://brew.sh/), a package manager for macOS.

```bash Terminal icon=lucide:apple
# Install Homebrew if it is not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

Alternatively, you can download the macOS Installer (`.pkg`) directly from the [Node.js website](https://nodejs.org/).

**Linux**

For Debian and Ubuntu-based distributions, use the following commands:

```bash Terminal icon=lucide:laptop
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

For Red Hat, CentOS, and Fedora, use the following commands:

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### Verify Installation

After the installation is complete, open your terminal and run the following commands to confirm that Node.js and npm are correctly installed:

```bash Terminal
node --version
npm --version
```

## Step 2: Install AIGNE CLI

The DocSmith tool is distributed as part of the official AIGNE Command Line Interface (CLI). Install the CLI globally on your system using npm:

```bash Terminal icon=logos:npm
npm install -g @aigne/cli
```

Once the installation is finished, verify that DocSmith is available by running its help command:

```bash Terminal
aigne doc --help
```

This command should display the help menu for DocSmith, confirming that it is installed and ready to use.

## Step 3: Generate Your Documentation

With the AIGNE CLI installed, you can now generate your documentation. Navigate to the root directory of your project in your terminal and execute the following command:

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### Automatic Configuration

The first time you run this command in a new project, DocSmith will detect that no configuration file exists and will automatically launch an interactive setup wizard to guide you through the process.

The wizard will ask a series of questions to define the characteristics of your documentation, including:

*   The primary purpose and writing style.
*   The intended target audience (e.g., developers, end-users).
*   The primary language and any additional languages for translation.
*   The source code paths for the AI to analyze.
*   The output directory for the generated document files.

After you answer the prompts, DocSmith will save your choices to a configuration file, begin analyzing your codebase, plan the document structure, and generate the content.

## Step 4: Review Your Output

When the generation process is complete, a confirmation message will appear in your terminal, indicating the successful creation of your documents. Your new documentation is now located in the output directory you specified during setup. If you used the default setting, you can find it at `.aigne/doc-smith/docs`.

## What's Next?

You have successfully generated your first set of documents. Now you are ready to explore more advanced features and customization options.

<x-cards>
  <x-card data-title="Core Features" data-icon="lucide:box" data-href="/features">
    Explore the main commands and capabilities, from updating documents to publishing them online.
  </x-card>
  <x-card data-title="Configuration Guide" data-icon="lucide:settings" data-href="/configuration">
    Learn how to fine-tune your documentation's style, audience, and languages by editing the configuration file.
  </x-card>
  <x-card data-title="CLI Command Reference" data-icon="lucide:terminal" data-href="/cli-reference">
    Get a complete reference for all available `aigne doc` commands and their options.
  </x-card>
</x-cards>