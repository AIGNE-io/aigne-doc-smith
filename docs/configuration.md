---
labels: ["Reference"]
---

# Configuration Guide

AIGNE DocSmith offers a range of settings to tailor the generated documentation to your specific needs. All these settings are managed in a single file named `config.yaml`, located in the `.aigne/doc-smith/` directory of your project. This guide provides a detailed look at all available options.

The easiest way to create and manage this file is by running the interactive setup wizard:

```bash
aigne doc init
```

This command will guide you through a series of questions to create your initial configuration. You can edit the `config.yaml` file directly at any time to refine your settings.

For specific details on setting up different AI models or managing languages, please see our dedicated guides:

*   **[LLM Setup](./configuration-llm-setup.md):** Learn how to use different AI models, including AIGNE Hub.
*   **[Language Support](./configuration-language-support.md):** See the full list of supported languages and how to enable translations.

---

## The `config.yaml` File

Your configuration file centralizes all the instructions for the AI, from the intended audience to the output directory. Below is an overview of the key sections and what they control.

### Documentation Strategy

These settings define the high-level goals for your documentation, influencing its tone, style, and content.

#### `documentPurpose`

This setting answers the question: "What is the main outcome you want readers to achieve?" It helps the AI focus on the most important information.

| Option | Name | Description |
| --- | --- | --- |
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases |
| `findAnswers` | Find answers fast | Provide searchable reference for all features and APIs |
| `understandSystem` | Understand the system | Explain how it works, why design decisions were made |
| `solveProblems` | Solve problems | Help users troubleshoot and fix issues |
| `mixedPurpose` | Mix of above | Comprehensive documentation covering multiple needs |

#### `targetAudienceTypes`

This specifies who will be reading the documentation most often. This choice has a major impact on the language and examples used.

| Option | Name | Description |
| --- | --- | --- |
| `endUsers` | End users (non-technical) | People who use the product but don't code |
| `developers` | Developers integrating | Engineers adding this to their projects |
| `devops` | DevOps/Infrastructure | Teams deploying, monitoring, maintaining systems |
| `decisionMakers` | Technical decision makers | Architects, leads evaluating or planning implementation |
| `supportTeams` | Support teams | People helping others use the product |
| `mixedTechnical` | Mixed technical audience | Developers, DevOps, and technical users |

#### `readerKnowledgeLevel`

This setting clarifies the assumed knowledge of your audience when they arrive at the documentation.

| Option | Name | Description |
| --- | --- | --- |
| `completeBeginners` | Complete beginners | New to this domain/technology entirely |
| `domainFamiliar` | Domain-familiar, tool-new | Know the problem space, new to this specific solution |
| `experiencedUsers` | Experienced users | Regular users needing reference/advanced topics |
| `emergencyTroubleshooting` | Emergency/troubleshooting | Something's broken, need to fix it quickly |
| `exploringEvaluating` | Exploring/evaluating | Trying to understand if this fits their needs |

#### `documentationDepth`

This determines how comprehensive the documentation should be.

| Option | Name | Description |
| --- | --- | --- |
| `essentialOnly` | Essential only | Cover the 80% use cases, keep it concise |
| `balancedCoverage` | Balanced coverage | Good depth with practical examples [RECOMMENDED] |
| `comprehensive` | Comprehensive | Cover all features, edge cases, and advanced scenarios |
| `aiDecide` | Let AI decide | Analyze code complexity and suggest appropriate depth |

### Custom Rules and Descriptions

For more fine-grained control, you can provide free-text instructions.

*   `rules`: Use this field to define specific rules or requirements for generation. For example, "All code examples must include comments explaining each line."
*   `targetAudience`: Provide a detailed paragraph describing your target audience and their characteristics beyond the predefined types.

### File and Language Settings

These settings control the practical aspects of file locations and languages.

*   `projectName`: The name of your project, used for publishing.
*   `projectDesc`: A short description of your project.
*   `projectLogo`: A URL to your project's logo image.
*   `locale`: The primary language for the documentation (e.g., `en`).
*   `translateLanguages`: A list of additional languages to translate the documentation into. See the [Language Support](./configuration-language-support.md) guide for all options.
*   `docsDir`: The directory where the generated documentation files will be saved.
*   `sourcesPath`: A list of source code paths that DocSmith should analyze to generate documentation.

---

## Example `config.yaml`

Here is an example of what a complete configuration file might look like:

```yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: An AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/logo.png

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - developers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: domainFamiliar

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: balancedCoverage

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  Ensure all API examples are complete and can be run directly.
  Avoid technical jargon where possible.

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |
  The primary audience is developers who are familiar with JavaScript and Node.js but are new to the AIGNE ecosystem. They are looking to integrate DocSmith into their existing CI/CD pipelines.

locale: en
translateLanguages:
  - zh
  - ja

docsDir: .aigne/doc-smith/docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./src
  - ./agents
```

## Next Steps

With your configuration file set up, you are ready to create your documentation. Proceed to the [Generate Documentation](./features-generate-documentation.md) guide to learn how to run the generation process.