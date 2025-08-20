---
labels: ["Reference"]
---

# Quick Start

This guide will walk you through the installation and basic setup of AIGNE DocSmith. In just a few simple steps, you'll successfully generate your first project document.

### Step 1: Prepare Your Environment

Before you begin, make sure you have the following tools installed in your development environment:

- Node.js and pnpm
- AIGNE CLI (to be installed in the next step)

### Step 2: Install AIGNE CLI

Open your terminal and run the following command to globally install the latest version of the AIGNE CLI. This is a one-time setup, and once installed, you can use it in any project.

```bash
npm i -g @aigne/cli
```

After the installation is complete, you can verify its success by running the following command:

```bash
aigne doc -h
```

If the terminal displays help information related to DocSmith, the installation was successful.

### Step 3: Generate Documents with One Click

Now, navigate to your project's root directory and run the following command:

```bash
aigne doc generate
```

If you are running this command in your project for the first time, DocSmith's smart auto-configuration feature will detect the missing configuration file and automatically launch an interactive setup wizard.

![Run the generate command for smart initialization](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

### Step 4: Complete the Interactive Configuration

Next, you'll need to answer a series of questions based on the terminal prompts. These questions are designed to help the AI understand your documentation requirements and generate the most suitable content for you. The configuration process includes:

- **Document Purpose**: What do you want readers to achieve with the documentation?
- **Target Audience**: Who is the documentation written for?
- **Language Settings**: Choose the primary language for the documentation and any other languages for translation.
- **Source Code Path**: Specify the source code directory to be analyzed.

![Answer questions to complete the project setup](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### Step 5: Review the Generated Results

Once the configuration is complete, DocSmith will automatically start analyzing your code, planning the document structure, and generating detailed content. The entire process requires no manual intervention.

![Executing structure planning and document generation](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

Upon successful generation, you will see a confirmation message. All documents are saved in your configured output directory (which defaults to `.aigne/doc-smith/docs`).

![Document generation successful](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

### Congratulations!

You have successfully generated your first document. Now you can start exploring other features of DocSmith.

- To learn more about the detailed usage of commands like `generate`, `update`, and `publish`, continue to the [Core Features](./core-features.md) section.
- To dive deeper into customizing the style, language, and scope of your documentation through the configuration file, please refer to the [Configuration Guide](./configuration.md).