# Getting Started

This guide provides a step-by-step walkthrough to install AIGNE DocSmith, configure a project, and generate a complete set of documentation from your source code.

## Step 1: Prerequisites

Before you begin, ensure you have Node.js and its package manager, npm, installed on your system. DocSmith is a command-line tool that runs on the Node.js environment.

### Installing Node.js

Here are brief instructions for installing Node.js on various operating systems.

**Windows**
1.  Download the installer from the official [Node.js website](https://nodejs.org/).
2.  Run the `.msi` installer and follow the steps in the installation wizard.

**macOS**

The recommended method is using [Homebrew](https://brew.sh/):

```bash Terminal icon=lucide:apple
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

Alternatively, you can download the `.pkg` installer from the [Node.js website](https://nodejs.org/).

**Linux**

For Ubuntu/Debian-based systems:

```bash Terminal icon=lucide:laptop
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

For CentOS/RHEL/Fedora systems:

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### Verification

After installation, verify that Node.js and npm are available by running these commands in your terminal:

```bash Terminal
node --version
npm --version
```

## Step 2: Install AIGNE CLI

The DocSmith tool is included within the AIGNE Command Line Interface (CLI). Install the latest version of the AIGNE CLI globally using npm:

```bash Terminal icon=logos:npm
npm i -g @aigne/cli
```

After the installation is complete, verify it by running the help command for the documentation tool:

```bash Terminal
aigne doc -h
```

This command will display the help menu for DocSmith, confirming it is ready for use.

## Step 3: Generate Your Documentation

With the CLI installed, you can generate your documents with a single command. Navigate to your project's root directory in your terminal and run:

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### Automatic Configuration

When you run this command for the first time in a project, DocSmith detects that no configuration exists and automatically launches an interactive setup wizard.

![Running the generate command initiates the setup wizard](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

You will be prompted with a series of questions to define the documentation's characteristics, including:

- The primary purpose and style.
- The intended target audience.
- The primary language and any additional languages for translation.
- The source code paths for the AI to analyze.
- The output directory for the generated documents.

![Answer the prompts to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

Once the configuration is complete, DocSmith will proceed to analyze your source code, plan the documentation structure, and generate the content.

![DocSmith planning the structure and generating documents](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## Step 4: Review Your Output

After the generation process is finished, a confirmation message will be displayed in your terminal.

![Successful documentation generation message](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

Your new documentation is now available in the output directory you specified during the setup process. The default location is `.aigne/doc-smith/docs`.

## What's Next?

Now that you have generated your first set of documents, you can explore other features:

<x-cards>
  <x-card data-title="Core Features" data-icon="lucide:box" data-href="/features">
    Explore the main commands and capabilities, from updating documents to publishing them online.
  </x-card>
  <x-card data-title="Configuration Guide" data-icon="lucide:settings" data-href="/configuration">
    Learn how to fine-tune your documentation's style, audience, and languages by editing the config.yaml file.
  </x-card>
  <x-card data-title="CLI Command Reference" data-icon="lucide:terminal" data-href="/cli-reference">
    Get a complete reference for all available `aigne doc` commands and their options.
  </x-card>
</x-cards>