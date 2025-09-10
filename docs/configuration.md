# Configuration Guide

AIGNE DocSmith's behavior is controlled by a central file, `config.yaml`, typically located at `.aigne/doc-smith/config.yaml`. This file dictates the style, target audience, languages, and structure of your documentation.

You can create and manage this file using the interactive setup wizard by running `aigne doc init`. For a step-by-step walkthrough, see the [Interactive Setup](./configuration-interactive-setup.md) guide.

## Core Configuration Areas

Your documentation is shaped by several key areas of configuration. Explore these guides to understand how to fine-tune each aspect of the generation process.

<x-cards data-columns="2">
  <x-card data-title="Interactive Setup" data-icon="lucide:wand-2" data-href="/configuration/interactive-setup">
    Learn about the guided wizard that helps you configure your documentation project from scratch, including setting recommendations.
  </x-card>
  <x-card data-title="LLM Setup" data-icon="lucide:brain-circuit" data-href="/configuration/llm-setup">
    Discover how to connect different AI models, including using the built-in AIGNE Hub which requires no API keys.
  </x-card>
  <x-card data-title="Language Support" data-icon="lucide:languages" data-href="/configuration/language-support">
    See the full list of supported languages and learn how to set a primary language and enable automatic translations.
  </x-card>
  <x-card data-title="Managing Preferences" data-icon="lucide:sliders-horizontal" data-href="/configuration/preferences">
    Understand how DocSmith uses your feedback to create persistent rules and how to manage them via the CLI.
  </x-card>
</x-cards>

## Parameter Reference

The `config.yaml` file contains several key-value pairs that control the documentation output. Below is a detailed reference for each parameter.

### Project Information

These settings provide basic context about your project, which is used when publishing the documentation.

| Parameter | Description |
|---|---|
| `projectName` | The name of your project. Automatically detected from `package.json` if available. |
| `projectDesc` | A short description of your project. Automatically detected from `package.json`. |
| `projectLogo` | A path or URL to your project's logo image. |

### Documentation Strategy

These parameters define the tone, style, and depth of the generated content.

#### `documentPurpose`
What is the main outcome you want readers to achieve? This setting influences the overall structure and focus of the documentation.

| Option | Name | Description |
|---|---|---|
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes. |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases. |
| `findAnswers` | Find answers fast | Provide searchable reference for all features and APIs. |
| `understandSystem`| Understand the system | Explain how it works and why design decisions were made. |
| `solveProblems` | Troubleshoot common issues | Help users troubleshoot and fix issues. |
| `mixedPurpose` | Serve multiple purposes | Documentation covering multiple needs. |

#### `targetAudienceTypes`
Who will be reading this documentation most often? This choice affects the writing style and examples.

| Option | Name | Description |
|---|---|---|
| `endUsers` | End users (non-technical) | People who use the product but don't code. |
| `developers` | Developers integrating your product/API | Engineers adding this to their projects. |
| `devops` | DevOps / SRE / Infrastructure teams | Teams deploying, monitoring, and maintaining systems. |
| `decisionMakers`| Technical decision makers | Architects or leads evaluating or planning implementation. |
| `supportTeams` | Support teams | People helping others use the product. |
| `mixedTechnical`| Mixed technical audience | Developers, DevOps, and other technical users. |

#### `readerKnowledgeLevel`
What do readers typically know when they arrive? This adjusts how much foundational knowledge is assumed.

| Option | Name | Description |
|---|---|---|
| `completeBeginners` | Is a total beginner, starting from scratch | New to this domain/technology entirely. |
| `domainFamiliar` | Has used similar tools before | Knows the problem space, but new to this specific solution. |
| `experiencedUsers` | Is an expert trying to do something specific | Regular users needing reference or advanced topics. |
| `emergencyTroubleshooting`| Emergency/troubleshooting | Something is broken and needs to be fixed quickly. |
| `exploringEvaluating` | Is evaluating this tool against others | Trying to understand if this fits their needs. |

#### `documentationDepth`
How comprehensive should the documentation be?

| Option | Name | Description |
|---|---|---|
| `essentialOnly` | Essential only | Cover the 80% use cases, keeping it concise. |
| `balancedCoverage`| Balanced coverage | Good depth with practical examples [RECOMMENDED]. |
| `comprehensive` | Comprehensive | Cover all features, edge cases, and advanced scenarios. |
| `aiDecide` | Let AI decide | Analyze code complexity and suggest appropriate depth. |

### Custom Directives

For more granular control, you can provide free-text instructions.

| Parameter | Description |
|---|---|
| `rules` | A multi-line string where you can define specific documentation generation rules and requirements (e.g., "Always include performance benchmarks"). |
| `targetAudience`| A multi-line string to describe your specific target audience and their characteristics in more detail than the presets allow. |

### Language and Path Configuration

These settings control localization and file locations.

| Parameter | Description |
|---|---|
| `locale` | The primary language for the documentation (e.g., `en`, `zh`). |
| `translateLanguages` | A list of language codes to translate the documentation into (e.g., `[ja, fr, es]`). |
| `docsDir` | The directory where generated documentation files will be saved. |
| `sourcesPath` | A list of source code paths or glob patterns for DocSmith to analyze (e.g., `['./src', './lib/**/*.js']`). |
| `glossary` | Path to a markdown file (`@glossary.md`) containing project-specific terms to ensure consistent translations. |

## Example `config.yaml`

Here is an example of a complete configuration file with comments explaining each section. You can edit this file directly to change settings at any time.

```yaml Example config.yaml icon=logos:yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: A powerful, AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
# Available options (uncomment and modify as needed):
#   getStarted       - Get started quickly: Help new users go from zero to working in <30 minutes
#   completeTasks    - Complete specific tasks: Guide users through common workflows and use cases
#   findAnswers      - Find answers fast: Provide searchable reference for all features and APIs
#   understandSystem - Understand the system: Explain how it works, why design decisions were made
#   solveProblems    - Troubleshoot common issues: Help users troubleshoot and fix issues
#   mixedPurpose     - Serve multiple purposes: Comprehensive documentation covering multiple needs
documentPurpose:
  - completeTasks
  - findAnswers

# Target Audience: Who will be reading this most often?
# Available options (uncomment and modify as needed):
#   endUsers         - End users (non-technical): People who use the product but don't code
#   developers       - Developers integrating your product/API: Engineers adding this to their projects
#   devops           - DevOps / SRE / Infrastructure teams: Teams deploying, monitoring, maintaining systems
#   decisionMakers   - Technical decision makers: Architects, leads evaluating or planning implementation
#   supportTeams     - Support teams: People helping others use the product
#   mixedTechnical   - Mixed technical audience: Developers, DevOps, and technical users
targetAudienceTypes:
  - developers

# Reader Knowledge Level: What do readers typically know when they arrive?
# Available options (uncomment and modify as needed):
#   completeBeginners    - Is a total beginner, starting from scratch: New to this domain/technology entirely
#   domainFamiliar       - Has used similar tools before: Know the problem space, new to this specific solution
#   experiencedUsers     - Is an expert trying to do something specific: Regular users needing reference/advanced topics
#   emergencyTroubleshooting - Emergency/troubleshooting: Something's broken, need to fix it quickly
#   exploringEvaluating  - Is evaluating this tool against others: Trying to understand if this fits their needs
readerKnowledgeLevel: domainFamiliar

# Documentation Depth: How comprehensive should the documentation be?
# Available options (uncomment and modify as needed):
#   essentialOnly      - Essential only: Cover the 80% use cases, keep it concise
#   balancedCoverage   - Balanced coverage: Good depth with practical examples [RECOMMENDED]
#   comprehensive      - Comprehensive: Cover all features, edge cases, and advanced scenarios
#   aiDecide           - Let AI decide: Analyze code complexity and suggest appropriate depth
documentationDepth: balancedCoverage

# Custom Rules: Define specific documentation generation rules and requirements
rules: |+
  

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |+
  

# Glossary: Define project-specific terms and definitions
# glossary: "@glossary.md"  # Path to markdown file containing glossary definitions

locale: en
# translateLanguages:  # List of languages to translate the documentation to
#   - zh  # Example: Chinese translation
#   - fr  # Example: French translation
docsDir: .aigne/doc-smith/docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./
```

With your configuration set, you are ready to create documentation that matches your project's needs. The next step is to run the generation command.

➡️ **Next:** [Generate Documentation](./features-generate-documentation.md)