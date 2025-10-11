# Configuration

Proper configuration is essential for tailoring the documentation generation process to your project's specific needs. AIGNE DocSmith uses a primary configuration file and a command-line interface to manage your settings. This setup ensures that the generated documentation accurately reflects your project's goals, target audience, and structural requirements.

This section provides an overview of how to configure the tool. For step-by-step instructions, please refer to the following detailed guides:

<x-cards>
  <x-card data-title="Initial Setup" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">Learn how to run the interactive setup to create your config.yaml file. This is the recommended first step for any new project.</x-card>
  <x-card data-title="Managing Preferences" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">Understand how to view, enable, disable, or delete saved preferences to refine the documentation generation process over time.</x-card>
</x-cards>

## The `config.yaml` File

All project-level settings are stored in a file named `config.yaml`, located in the `.aigne/doc-smith/` directory within your project. The `aigne doc init` command creates this file for you through an interactive process. You can also modify this file manually with a text editor to adjust settings at any time.

Below is an example of a `config.yaml` file, with comments explaining each section.

```yaml Example config.yaml icon=logos:yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
# Available options (uncomment and modify as needed):
#   getStarted       - Get started quickly: Help new users go from zero to working in <30 minutes
#   completeTasks    - Complete specific tasks: Guide users through common workflows and use cases
#   findAnswers      - Find answers fast: Provide searchable reference for all features and APIs
#   understandSystem - Understand the system: Explain how it works, why design decisions were made
#   solveProblems    - Solve problems: Help users troubleshoot and fix issues
#   mixedPurpose     - Mix of above: Comprehensive documentation covering multiple needs
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
# Available options (uncomment and modify as needed):
#   endUsers         - End users (non-technical): People who use the product but don't code
#   developers       - Developers integrating: Engineers adding this to their projects
#   devops           - DevOps/Infrastructure: Teams deploying, monitoring, maintaining systems
#   decisionMakers   - Technical decision makers: Architects, leads evaluating or planning implementation
#   supportTeams     - Support teams: People helping others use the product
#   mixedTechnical   - Mixed technical audience: Developers, DevOps, and technical users
targetAudienceTypes:
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
# Available options (uncomment and modify as needed):
#   completeBeginners    - Complete beginners: New to this domain/technology entirely
#   domainFamiliar       - Domain-familiar, tool-new: Know the problem space, new to this specific solution
#   experiencedUsers     - Experienced users: Regular users needing reference/advanced topics
#   emergencyTroubleshooting - Emergency/troubleshooting: Something's broken, need to fix it quickly
#   exploringEvaluating  - Exploring/evaluating: Trying to understand if this fits their needs
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
# Available options (uncomment and modify as needed):
#   essentialOnly      - Essential only: Cover the 80% use cases, keep it concise
#   balancedCoverage   - Balanced coverage: Good depth with practical examples [RECOMMENDED]
#   comprehensive      - Comprehensive: Cover all features, edge cases, and advanced scenarios
#   aiDecide           - Let AI decide: Analyze code complexity and suggest appropriate depth
documentationDepth: comprehensive

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: ./docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./media.md
  - ./.aigne/doc-smith/config.yaml
```

## Summary

With your configuration in place, the tool will have a clear understanding of your project, audience, and documentation goals, resulting in more accurate and relevant content.

To begin setting up your project, proceed to the [Initial Setup](./configuration-initial-setup.md) guide.