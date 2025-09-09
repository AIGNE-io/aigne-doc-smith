---
labels: ["Reference"]
---

# Configuration Guide

AIGNE DocSmith offers a powerful and flexible configuration system to tailor the documentation generation process to your specific needs. All settings are managed through a central file, `config.yaml`, located in the `.aigne/doc-smith/` directory of your project.

While the recommended way to create and manage this file is through the [interactive setup wizard](./configuration-interactive-setup.md), this guide provides a detailed reference for all available options, allowing you to fine-tune your documentation's style, audience, and structure directly.

## Configuration File Structure

The `config.yaml` file is the heart of your documentation project. It defines everything from the project's name to the specific style and depth of content the AI should generate. Below is a complete example of a configuration file, followed by a detailed breakdown of each section.

```yaml config.yaml icon=mdi:file-cog-outline
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: A powerful, AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted
  - findAnswers

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - developers
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: balancedCoverage

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  - Emphasize practical, copy-paste ready code examples.
  - Avoid jargon where possible, but maintain technical accuracy.

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |
  Primary audience is developers looking to integrate DocSmith into their workflow. Secondary audience is non-technical users who want to understand the tool's capabilities.

# Glossary: Define project-specific terms and definitions
# glossary: "@glossary.md"

# Language and Path settings
locale: en
translateLanguages:
  - zh
  - ja
docsDir: .aigne/doc-smith/docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./src
  - README.md
```

## Key Configuration Parameters

### Documentation Strategy

This group of settings defines the high-level strategy for the AI, guiding its tone, style, and content focus.

#### `documentPurpose`
Specifies the primary goal you want readers to achieve. You can select multiple purposes.

| Option | Name | Description |
|---|---|---|
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes. |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases. |
| `findAnswers` | Find answers fast | Provide searchable reference for all features and APIs. |
| `understandSystem` | Understand the system | Explain how it works and why design decisions were made. |
| `solveProblems` | Troubleshoot common issues | Help users troubleshoot and fix issues. |
| `mixedPurpose` | Serve multiple purposes | Comprehensive documentation covering multiple needs. |

#### `targetAudienceTypes`
Defines who will be reading the documentation most often. This influences the writing style and examples.

| Option | Name | Description |
|---|---|---|
| `endUsers` | End users (non-technical) | People who use the product but don't code. |
| `developers` | Developers | Engineers adding this to their projects. |
| `devops` | DevOps / SRE | Teams deploying, monitoring, and maintaining systems. |
| `decisionMakers` | Technical decision makers | Architects or leads evaluating the implementation. |
| `supportTeams` | Support teams | People helping others use the product. |
| `mixedTechnical` | Mixed technical audience | Developers, DevOps, and other technical users. |

#### `readerKnowledgeLevel`
Describes the typical starting knowledge level of your readers.

| Option | Name | Description |
|---|---|---|
| `completeBeginners` | Is a total beginner | New to this domain/technology entirely. |
| `domainFamiliar` | Has used similar tools | Knows the problem space, new to this specific solution. |
| `experiencedUsers` | Is an expert | Regular users needing reference or advanced topics. |
| `emergencyTroubleshooting` | Emergency/troubleshooting | Something's broken and needs a quick fix. |
| `exploringEvaluating` | Is evaluating this tool | Trying to understand if this fits their needs. |

#### `documentationDepth`
Controls how comprehensive the documentation should be.

| Option | Name | Description |
|---|---|---|
| `essentialOnly` | Essential only | Covers the 80% use cases, keeping it concise. |
| `balancedCoverage` | Balanced coverage | Good depth with practical examples (Recommended). |
| `comprehensive` | Comprehensive | Covers all features, edge cases, and advanced scenarios. |
| `aiDecide` | Let AI decide | Analyzes code complexity to suggest appropriate depth. |

### Customization and Fine-Tuning

- **`rules`**: A multi-line string where you can provide custom, persistent instructions for the AI. This is useful for defining specific formatting rules, content requirements, or a desired tone that isn't covered by the standard options.
- **`targetAudience`**: A multi-line string to provide a more detailed, free-text description of your target audience, complementing the `targetAudienceTypes` selection.
- **`glossary`**: Path to a Markdown file containing a glossary. This helps the AI use project-specific terminology consistently across all documents and translations.

### Paths and Languages

- **`locale`**: The primary language for the documentation (e.g., `en`, `zh`).
- **`translateLanguages`**: A list of language codes to translate the documentation into.
- **`docsDir`**: The output directory where the generated documentation files will be saved.
- **`sourcesPath`**: A list of source code paths or glob patterns for the AI to analyze. If left empty, it defaults to the entire project (`./`).

---

## Dive Deeper

For more detailed information on specific configuration areas, explore the following sections:

<x-cards data-columns="3">
  <x-card data-title="Interactive Setup" data-icon="lucide:wand-2" data-href="/configuration/interactive-setup">
    Learn about the guided setup wizard that helps you configure your project and intelligently detects conflicting settings.
  </x-card>
  <x-card data-title="LLM Setup" data-icon="lucide:brain-circuit" data-href="/configuration/llm-setup">
    Discover how to connect different AI models, including using AIGNE Hub without needing your own API keys.
  </x-card>
  <x-card data-title="Language Support" data-icon="lucide:languages" data-href="/configuration/language-support">
    See the full list of supported languages and learn how to enable automatic translation for your project.
  </x-card>
</x-cards>

After configuring your project, you are ready to [generate your first set of documents](./features-generate-documentation.md).
