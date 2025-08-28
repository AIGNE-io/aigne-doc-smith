---
labels: ["Reference"]
---

# Configuration Guide

AIGNE DocSmith's behavior is controlled by a central configuration file, `config.yaml`, located in the `.aigne/doc-smith/` directory of your project. This file allows you to precisely define the style, audience, scope, and languages for your documentation, ensuring the generated content perfectly matches your needs. 

You can create and modify this file using the interactive `aigne doc init` command or by editing it manually.

## The `config.yaml` File Structure

Here is an example of a complete `config.yaml` file. It includes comments explaining each available option, which you can uncomment and modify to suit your project.

```yaml
# Project information for documentation publishing
projectName: My Awesome Project
projectDesc: A brief description of what this project does.
projectLogo: "path/to/your/logo.png"

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
  - Always include a 'Troubleshooting' section in 'How-to' guides.
  - Code examples must be compatible with Node.js v18 and later.

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |
  Mid-level software engineers who are familiar with JavaScript and REST APIs but are new to our specific platform.

# Glossary: Define project-specific terms and definitions
# glossary: "@glossary.md"  # Path to markdown file containing glossary definitions

# Primary language for the documentation
locale: en

# List of languages to translate the documentation into
translateLanguages:
  - zh
  - ja

# Directory to save generated documentation
docsDir: .aigne/doc-smith/docs

# Source code paths to analyze
sourcesPath:
  - ./src
  - ./lib
```

## Documentation Strategy

These core settings define the AI's approach to generating content, influencing its tone, structure, and depth.

### Document Purpose (`documentPurpose`)

This setting specifies the primary goal of your documentation. You can select one or more options.

| Option | Name | Description |
|---|---|---|
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes. Optimizes for speed and essential steps. |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases with step-by-step instructions. |
| `findAnswers` | Find answers fast | Provide a searchable, comprehensive reference for all features and APIs. |
| `understandSystem` | Understand the system | Explain how the system works, its architecture, and the rationale behind design decisions. |
| `solveProblems` | Troubleshoot common issues | Help users diagnose and fix common problems with a focus on error scenarios. |
| `mixedPurpose` | Serve multiple purposes | Create comprehensive documentation covering multiple needs, balancing different goals. |

### Target Audience (`targetAudienceTypes`)

Define who will be reading the documentation. This helps tailor the language, examples, and technical depth appropriately.

| Option | Name | Description |
|---|---|---|
| `endUsers` | End users (non-technical) | People who use the product but don't code. Content will use plain language and focus on UI. |
| `developers` | Developers | Engineers integrating your product/API. Content will be code-first with technical accuracy. |
| `devops` | DevOps / SRE | Teams deploying and maintaining the system. Content will focus on operations and troubleshooting. |
| `decisionMakers` | Technical decision makers | Architects and leads evaluating the product. Content will be high-level with architecture diagrams. |
| `supportTeams` | Support teams | People helping others use the product. Content will focus on diagnostics and common issues. |
| `mixedTechnical` | Mixed technical audience | A combination of developers, DevOps, and other technical users. Content will be layered. |

### Reader Knowledge Level (`readerKnowledgeLevel`)

Specify the assumed starting knowledge of your audience.

| Option | Name | Description |
|---|---|---|
| `completeBeginners` | Is a total beginner | New to the domain entirely. Content will define all terms and assume no prior knowledge. |
| `domainFamiliar` | Has used similar tools | Knows the problem space but is new to your solution. Content focuses on differences and unique features. |
| `experiencedUsers` | Is an expert | Regular users needing reference or advanced topics. Content is dense and technically precise. |
| `emergencyTroubleshooting` | Emergency/troubleshooting | Someone needs to fix a problem quickly. Content is structured as symptom -> diagnosis -> solution. |
| `exploringEvaluating` | Is evaluating this tool | Trying to understand if the tool fits their needs. Content focuses on use cases and quick starts. |

### Documentation Depth (`documentationDepth`)

Control how comprehensive the generated documentation should be.

| Option | Name | Description |
|---|---|---|
| `essentialOnly` | Essential only | Covers the core features and most common use cases to keep it concise. |
| `balancedCoverage` | Balanced coverage | Good depth with practical examples for most features. [RECOMMENDED] |
| `comprehensive` | Comprehensive | Covers all features, edge cases, and advanced scenarios with extensive examples. |
| `aiDecide` | Let AI decide | The AI analyzes your code complexity and API surface to suggest an appropriate depth. |

## Customization and Content Control

Beyond the core strategy, you can provide more specific guidance.

*   **`rules`**: A free-text field where you can provide specific, persistent instructions for the AI to follow during generation (e.g., "Always include a 'Prerequisites' section").
*   **`targetAudience`**: A free-text field to describe your audience in more detail than the presets allow.
*   **`glossary`**: Path to a Markdown file containing project-specific terms. This ensures consistent terminology in all generated and translated content.

---

This guide provides an overview of the main configuration options. For more specific setups, see the following sections:

*   **For AI models:** Learn how to connect to different LLMs in the [LLM Setup](./configuration-llm-setup.md) guide.
*   **For translations:** See the full list of supported languages and how to configure them in [Language Support](./configuration-language-support.md).
