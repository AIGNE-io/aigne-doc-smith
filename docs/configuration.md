---
labels: ["Reference"]
---

# Configuration Guide

AIGNE DocSmith's strength lies in its ability to be tailored to your specific needs. Proper configuration ensures the AI generates documentation with the right style, tone, and depth for your audience. This guide provides a detailed look at all the available settings.

You can set up your project in two main ways:

1.  **Interactive Setup**: Run the `aigne doc init` command. This will launch a step-by-step wizard that asks you questions and creates the configuration file for you. This is the recommended method for getting started.
2.  **Manual Editing**: Directly modify the `config.yaml` file located in the `.aigne/doc-smith/` directory of your project. This is useful for making quick changes or for advanced adjustments.

This guide covers the core settings you'll find in the `config.yaml` file. For more specific topics, please see our guides on [LLM Setup](./configuration-llm-setup.md) and [Language Support](./configuration-language-support.md).

## The `config.yaml` File

All settings are stored in a single `config.yaml` file. When you run `aigne doc init`, this file is generated with helpful comments explaining each option. You can edit it at any time.

A typical configuration file looks like this:

```yaml
# Project information for documentation publishing
projectName: My Awesome Project
projectDesc: A brief description of what this project does.
projectLogo: ""

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - developers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: balancedCoverage

# Custom Rules: Define specific documentation generation rules and requirements
rules: |


# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |


# Glossary: Define project-specific terms and definitions
# glossary: "@glossary.md"

locale: en
translateLanguages:
  - zh

docsDir: .aigne/doc-smith/docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./
```

## Core Configuration Settings

Let's break down the key settings you can customize.

### Document Purpose

This setting tells the AI what the primary goal of your documentation is. This influences the structure and content to best serve the reader's intent.

| Option | Name | Description |
| :--- | :--- | :--- |
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes. |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases. |
| `findAnswers` | Find answers fast | Provide searchable reference for all features and APIs. |
| `understandSystem` | Understand the system | Explain how it works and why design decisions were made. |
| `solveProblems` | Solve problems | Help users troubleshoot and fix issues. |
| `mixedPurpose` | Mix of above | Comprehensive documentation covering multiple needs. |

### Target Audience

Define who will be reading the documentation most often. This adjusts the writing style, technical language, and types of examples used.

| Option | Name | Description |
| :--- | :--- | :--- |
| `endUsers` | End users (non-technical) | People who use the product but don't code. |
| `developers` | Developers integrating | Engineers adding this to their projects. |
| `devops` | DevOps/Infrastructure | Teams deploying, monitoring, and maintaining systems. |
| `decisionMakers` | Technical decision makers | Architects or leads evaluating the implementation. |
| `supportTeams` | Support teams | People helping others use the product. |
| `mixedTechnical` | Mixed technical audience | Developers, DevOps, and other technical users. |

### Reader Knowledge Level

Specify the assumed knowledge level of your audience. This helps the AI decide whether to explain basic concepts or dive straight into advanced topics.

| Option | Name | Description |
| :--- | :--- | :--- |
| `completeBeginners` | Complete beginners | New to this domain or technology entirely. |
| `domainFamiliar` | Domain-familiar, tool-new | Know the problem space, but new to this specific solution. |
| `experiencedUsers` | Experienced users | Regular users needing reference or advanced topics. |
| `emergencyTroubleshooting` | Emergency/troubleshooting | Something's broken and needs a quick fix. |
| `exploringEvaluating` | Exploring/evaluating | Trying to understand if this product fits their needs. |

### Documentation Depth

Control how comprehensive the documentation should be. You can choose to cover just the essentials or every possible detail.

| Option | Name | Description |
| :--- | :--- | :--- |
| `essentialOnly` | Essential only | Cover the 80% use cases, keeping it concise. |
| `balancedCoverage` | Balanced coverage | Good depth with practical examples (Recommended). |
| `comprehensive` | Comprehensive | Cover all features, edge cases, and advanced scenarios. |
| `aiDecide` | Let AI decide | Analyze code complexity and suggest appropriate depth. |

### File and Directory Paths

- `docsDir`: The directory where your generated Markdown documentation files will be saved. The default is `.aigne/doc-smith/docs`.
- `sourcesPath`: A list of the source code files and directories that DocSmith should analyze to generate documentation. If left empty, it defaults to the entire project (`./`).

---

## Detailed Configuration Topics

For a deeper dive into specific areas of configuration, refer to the following sections:

- **[LLM Setup](./configuration-llm-setup.md)**: Learn how to connect DocSmith to different large language models, including using AIGNE Hub for key-free access.
- **[Language Support](./configuration-language-support.md)**: See the full list of supported languages and learn how to configure your primary language and enable automatic translations.

After configuring your project, the next step is to explore the core features. Learn more in the [Generate Documentation](./features-generate-documentation.md) guide.