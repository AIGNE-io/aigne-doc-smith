# Configuration

Proper configuration is fundamental to tailoring the documentation generation process to your project's specific requirements. AIGNE DocSmith uses a primary configuration file for project-wide settings and a separate command for managing personal preferences. This approach ensures that the generated documentation accurately aligns with your project's objectives, target audience, and structural needs.

This section provides a high-level overview of the configuration process. For detailed, step-by-step instructions, refer to the following guides:

<x-cards>
  <x-card data-title="Initial Setup" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">Learn how to run the interactive setup to create your config.yaml file. This is the recommended first step for any new project.</x-card>
  <x-card data-title="Managing Preferences" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">Understand how to view, enable, disable, or delete saved preferences to refine the documentation generation process over time.</x-card>
</x-cards>

## The `config.yaml` File

All project-level settings are stored in a file named `config.yaml`, located in the `.aigne/doc-smith/` directory of your project. The `aigne doc init` command creates this file for you through an interactive guided process. You can also modify this file manually with a text editor to adjust settings at any time.

Below is an example of a `config.yaml` file with comments explaining each configuration option.

```yaml config.yaml icon=logos:yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
# Available options: getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
# Available options: endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
# Available options: completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
# Available options: essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: comprehensive

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# Target Audience: Describe your specific target audience and their characteristics in detail
targetAudience: |
  
# Glossary: Define project-specific terms and definitions
# glossary: "@glossary.md"  # Path to markdown file containing glossary definitions

# Primary language for the documentation
locale: en

# List of additional languages for translation
translateLanguages:
  - zh
  - zh-TW
  - ja

# Directory where generated documentation will be saved
docsDir: ./docs

# Source code paths to analyze for documentation generation
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml

# =============================================================================
# Media Settings
# =============================================================================

# Image Quality Filter: Only images wider than this value will be included
# This helps maintain documentation quality by filtering out low-resolution images
# Recommended: 800px for general documentation, 1200px for high-quality documentation
media:
  minImageWidth: 800
```

## Managing User Preferences

In addition to the project-wide `config.yaml`, you can manage personal preferences that fine-tune the AI's behavior for your specific needs. These preferences are stored locally on your machine and can be activated, deactivated, or removed without altering the project's shared configuration file.

Preferences are managed using the `aigne doc prefs` command, which supports the following actions:
*   `--list`: View all saved preferences and their status (active/inactive).
*   `--remove`: Delete one or more saved preferences.
*   `--toggle`: Enable or disable specific preferences.

For a complete guide on using these commands, see [Managing Preferences](./configuration-managing-preferences.md).

## Summary

By correctly configuring `config.yaml` and managing your personal preferences, you provide the tool with a clear directive for your project, audience, and documentation goals. This results in more accurate and relevant generated content.

To begin setting up your project, proceed to the [Initial Setup](./configuration-initial-setup.md) guide.