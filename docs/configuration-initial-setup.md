# Initial Setup

This guide provides a step-by-step walkthrough of the interactive setup process for AIGNE DocSmith. This process is initiated the first time you run the `generate` command, or it can be started manually. Its purpose is to create a `config.yaml` file that stores your preferences for generating documentation.

## Starting the Process

To manually begin the configuration, navigate to your project's root directory in your terminal and execute the following command:

```bash
aigne doc init
```

This command launches an interactive questionnaire that will guide you through configuring your documentation settings.

## Configuration Steps

The setup process consists of nine questions designed to tailor the documentation to your specific needs.

### Step 1: Define Documentation Purpose

You will first be asked to define the primary goals of your documentation. This selection influences the tone, structure, and focus of the generated content.

**Prompt:** `📝 [1/9]: What should your documentation help readers achieve?`

You can select multiple options from the list below:

| Option | Name | Description |
| :--- | :--- | :--- |
| `getStarted` | Get started quickly | Help new users go from zero to working in <30 minutes. |
| `completeTasks` | Complete specific tasks | Guide users through common workflows and use cases. |
| `findAnswers` | Find answers fast | Provide searchable reference for all features and APIs. |
| `understandSystem` | Understand the system | Explain how it works and the reasoning behind design decisions. |
| `solveProblems` | Solve problems | Help users troubleshoot and fix issues. |
| `mixedPurpose` | Mix of above | Cover multiple needs comprehensively. |

### Step 2: Identify Target Audience

Next, specify who will be the primary readers of your documentation. This helps tailor the language and technical depth appropriately.

**Prompt:** `👥 [2/9]: Who will be reading your documentation?`

You can select one or more of the following audiences:

| Option | Name | Description |
| :--- | :--- | :--- |
| `endUsers` | End users (non-technical) | People who use the product but do not code. |
| `developers` | Developers integrating | Engineers adding this to their projects. |
| `devops` | DevOps/Infrastructure | Teams deploying, monitoring, and maintaining systems. |
| `decisionMakers` | Technical decision makers | Architects or leads evaluating the technology. |
| `supportTeams` | Support teams | People helping others use the product. |
| `mixedTechnical` | Mixed technical audience | A combination of developers, DevOps, and other technical users. |

### Step 3: Provide Custom Rules

This optional step allows you to provide specific instructions or constraints for the AI to follow during content generation.

**Prompt:** `📋 [3/9]: Any custom rules or requirements for your documentation? (Optional, press Enter to skip)`

You can input any specific requirements, such as tone, style, or content to exclude. For example: "Avoid using marketing language and focus on technical accuracy."

### Step 4: Specify Reader Knowledge Level

Indicate the assumed knowledge level of your audience. This ensures the content is pitched at the right level, without being too basic or too complex.

**Prompt:** `🧠 [4/9]: How much do readers already know about your project?`

Select the option that best describes your readers:

| Option | Name | Description |
| :--- | :--- | :--- |
| `completeBeginners` | Complete beginners | New to the domain or technology entirely. |
| `domainFamiliar` | Domain-familiar, tool-new | Know the problem space but are new to this solution. |
| `experiencedUsers` | Experienced users | Regular users who need reference or advanced topics. |
| `emergencyTroubleshooting` | Emergency/troubleshooting | Users who need to fix a problem quickly. |
| `exploringEvaluating` | Exploring/evaluating | Users trying to determine if the tool fits their needs. |

### Step 5: Set Documentation Depth

Choose how detailed the documentation should be. This determines the scope and level of detail in the generated content.

**Prompt:** `📊 [5/9]: How detailed should your documentation be?`

Select one of the following levels of detail:

| Option | Name | Description |
| :--- | :--- | :--- |
| `essentialOnly` | Essential only | Covers the most common 80% of use cases concisely. |
| `balancedCoverage` | Balanced coverage | Provides good depth with practical examples. |
| `comprehensive` | Comprehensive | Covers all features, edge cases, and advanced scenarios. |
| `aiDecide` | Let AI decide | The tool analyzes code complexity to suggest an appropriate depth. |

### Step 6: Select Primary Language

Choose the main language for your documentation. The system will detect your operating system's language and suggest it as the default.

**Prompt:** `🌐 [6/9]: What's your main documentation language?`

You will be presented with a list of 12 supported languages, including English, Chinese (Simplified), and Spanish.

### Step 7: Choose Translation Languages

Select any additional languages you want the documentation to be translated into.

**Prompt:** `🔄 [7/9]: Which languages should we translate to?`

You can choose multiple languages from the list of supported options, excluding the primary language you selected in the previous step.

### Step 8: Define Output Directory

Specify the folder where the generated documentation files should be saved.

**Prompt:** `📁 [8/9]: Where should we save your documentation?`

The default path is `.aigne/doc-smith/docs`. You can accept this or provide a different path.

### Step 9: Specify Content Sources

Indicate which files and folders the tool should analyze to generate documentation. You can add multiple paths and use glob patterns for advanced filtering.

**Prompt:** `🔍 [9/9]: Content Sources`

You will be prompted to enter file paths, folder paths, or glob patterns (e.g., `src/**/*.js`). If you do not provide any paths, the tool will analyze the entire project directory by default.

## Generated Configuration File

After completing the questionnaire, DocSmith saves your responses to a configuration file named `config.yaml` in the `.aigne/doc-smith/` directory. This file serves as the blueprint for all future documentation generation and can be manually edited at any time.

Here is an example of a generated `config.yaml` file:

```yaml config.yaml title="config.yaml"
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation generation tool...
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: comprehensive

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  Avoid using vague or empty words...

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |
  
# Language settings
locale: en
translateLanguages:
  - zh
  - ja

# Directory and source path configurations
docsDir: ./docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - ./README.md
  - ./agents
```

## Next Steps

With your initial configuration complete, you are now ready to create your documentation.

*   Proceed to the [Generating Documentation](./guides-generating-documentation.md) guide to learn how to run the generation process.