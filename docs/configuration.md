---
labels: ["Reference"]
---

# Configuration Guide

AIGNE DocSmith's behavior is controlled by a single, powerful configuration file: `config.yaml`. This file, located in the `.aigne/doc-smith` directory of your project, allows you to customize every aspect of the documentation generation process—from the intended audience and style to language support and file structure.

This guide provides a detailed reference for all available settings. While you can edit this file manually at any time, we recommend using the [Interactive Setup](./configuration-interactive-setup.md) wizard for your initial configuration.

## Configuration Overview

DocSmith offers a flexible configuration system to match your project's unique needs. You can define the goals of your documentation, specify your audience, set up AI models, and manage multiple languages. Explore the key areas of configuration below.

<x-cards data-columns="2">
  <x-card data-title="Interactive Setup" data-href="/configuration/interactive-setup" data-icon="lucide:wand-2">
    Learn how to use the `aigne doc init` command to run a guided wizard that creates your initial configuration file effortlessly.
  </x-card>
  <x-card data-title="LLM Setup" data-href="/configuration/llm-setup" data-icon="lucide:brain-circuit">
    Configure different Large Language Models, including using the integrated AIGNE Hub for key-free access to popular models.
  </x-card>
  <x-card data-title="Language Support" data-href="/configuration/language-support" data-icon="lucide:languages">
    Set your primary documentation language and choose from over 12 supported languages for automatic translation.
  </x-card>
  <x-card data-title="Managing Preferences" data-href="/configuration/preferences" data-icon="lucide:sliders-horizontal">
    Understand how DocSmith learns from your feedback to create persistent rules and how to manage them.
  </x-card>
</x-cards>

## Parameter Reference

The `config.yaml` file contains several key sections that define how your documentation is generated. Below is a comprehensive breakdown of each parameter.

### Project Information

These settings are used for display purposes when you publish your documentation.

```yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: An AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png
```

- `projectName`: The name of your project.
- `projectDesc`: A short description of your project.
- `projectLogo`: A URL to your project's logo.

### Documentation Style

These parameters define the purpose, audience, and overall tone of your documentation.

#### `documentPurpose`

Defines the primary goal for your readers. You can select multiple purposes.

| Key | Name | Description |
|---|---|---|
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes. |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases. |
| `findAnswers` | Find answers fast | Provide searchable reference for all features and APIs. |
| `understandSystem` | Understand the system | Explain how it works, why design decisions were made. |
| `solveProblems` | Troubleshoot common issues | Help users troubleshoot and fix issues. |
| `mixedPurpose` | Serve multiple purposes | Comprehensive documentation covering multiple needs. |

**Example:**
```yaml
documentPurpose:
  - getStarted
  - findAnswers
```

#### `targetAudienceTypes`

Specifies the primary audience for the documentation.

| Key | Name | Description |
|---|---|---|
| `endUsers` | End users (non-technical) | People who use the product but don't code. |
| `developers` | Developers integrating your product/API | Engineers adding this to their projects. |
| `devops` | DevOps / SRE / Infrastructure teams | Teams deploying, monitoring, maintaining systems. |
| `decisionMakers` | Technical decision makers | Architects, leads evaluating or planning implementation. |
| `supportTeams` | Support teams | People helping others use the product. |
| `mixedTechnical` | Mixed technical audience | Developers, DevOps, and technical users. |

**Example:**
```yaml
targetAudienceTypes:
  - developers
```

#### `readerKnowledgeLevel`

Describes the typical starting knowledge level of your readers.

| Key | Name | Description |
|---|---|---|
| `completeBeginners` | Is a total beginner, starting from scratch | New to this domain/technology entirely. |
| `domainFamiliar` | Has used similar tools before | Knows the problem space, new to this specific solution. |
| `experiencedUsers` | Is an expert trying to do something specific | Regular users needing reference/advanced topics. |
| `emergencyTroubleshooting` | Emergency/troubleshooting | Something's broken, need to fix it quickly. |
| `exploringEvaluating` | Is evaluating this tool against others | Trying to understand if this fits their needs. |

**Example:**
```yaml
readerKnowledgeLevel: completeBeginners
```

#### `documentationDepth`

Controls how comprehensive the documentation should be.

| Key | Name | Description |
|---|---|---|
| `essentialOnly` | Essential only | Cover the 80% use cases, keep it concise. |
| `balancedCoverage` | Balanced coverage | Good depth with practical examples [RECOMMENDED]. |
| `comprehensive` | Comprehensive | Cover all features, edge cases, and advanced scenarios. |
| `aiDecide` | Let AI decide | Analyze code complexity and suggest appropriate depth. |

**Example:**
```yaml
documentationDepth: balancedCoverage
```

### Custom Rules & Descriptions

These fields allow for more specific instructions to the AI.

- `rules`: A multi-line string where you can define specific rules and requirements for generation, such as "Always include a 'Prerequisites' section in tutorials."
- `targetAudience`: A multi-line string to describe your target audience in more detail than the presets allow.

**Example:**
```yaml
rules: |
  - All code examples must be complete and copy-paste ready.
  - Avoid using technical jargon without explaining it first.
targetAudience: |
  Our audience consists of front-end developers who are familiar with JavaScript but may be new to backend concepts. They value clear, practical examples.
```

### Language and Path Settings

These parameters configure the languages and file locations for your documentation.

- `locale`: The primary language for the documentation (e.g., `en`, `zh`).
- `translateLanguages`: A list of language codes to translate the documentation into.
- `glossary`: Path to a Markdown file containing project-specific terms to ensure consistent translations.
- `docsDir`: The directory where the generated documentation will be saved.
- `sourcesPath`: A list of source code paths or glob patterns for the AI to analyze.

**Example:**
```yaml
# Language settings
locale: en
translateLanguages:
  - zh
  - ja

# Glossary for consistent terminology
glossary: "@glossary.md"

# Directory and source path configurations
docsDir: .aigne/doc-smith/docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./src
  - ./README.md
```

---

With your `config.yaml` file tailored to your project, you're ready to create your documentation. The next step is to run the generation command.

➡️ **Next:** Learn how to [Generate Documentation](./features-generate-documentation.md).