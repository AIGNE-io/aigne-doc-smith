---
labels: ["Reference"]
---

# Interactive Setup

The `aigne doc init` command is a guided setup wizard designed to help you create a comprehensive `config.yaml` file for your documentation project. By answering a series of questions, you can quickly define your documentation's goals, audience, and structure. The wizard also includes intelligent conflict detection to prevent misconfigurations and ensure your settings are logical and effective.

This is the recommended starting point for any new DocSmith project.

## Starting the Wizard

To begin the interactive setup process, run the following command in your project's root directory:

```bash AIGNE DocSmith Initialization icon=lucide:terminal
aigne doc init
```

This will launch the wizard, which will guide you through the configuration questions step-by-step.

## The Setup Process

The wizard asks a series of eight questions to tailor the documentation generation to your specific needs. It provides smart defaults based on your previous answers to speed up the process.

<br/>

```d2 The Interactive Setup Flow
direction: down

User: { 
  shape: c4-person 
}

CLI: {
  label: "AIGNE CLI"
  shape: rectangle

  Wizard: {
    label: "Interactive Wizard"
  }

  Detector: {
    label: "Conflict Detector"
  }
}

ConfigFile: {
  label: "config.yaml"
  shape: rectangle
}

User -> CLI.Wizard: "1. aigne doc init"
CLI.Wizard <-> User: "2. Asks configuration questions"
CLI.Wizard -> CLI.Detector: "3. Validate selections"
CLI.Detector -> CLI.Wizard: "4. Return filtered options"
CLI.Wizard -> ConfigFile: "5. Generate config.yaml"
User -> CLI: "6. aigne doc generate"
```

### Step-by-Step Questions

1.  **Primary Goal (`documentPurpose`):** What is the main outcome you want readers to achieve? Your selection here determines the overall style and focus of the documentation.
2.  **Primary Audience (`targetAudienceTypes`):** Who will be reading this documentation most often? This influences the writing style, tone, and technical depth.
3.  **Reader's Knowledge Level (`readerKnowledgeLevel`):** What do readers typically know when they arrive? This helps tailor the content to the appropriate starting point, from complete beginners to experts.
4.  **Documentation Depth (`documentationDepth`):** How comprehensive should the documentation be? This controls the scope, from covering only essential use cases to exhaustive detail on every feature.
5.  **Primary Language (`locale`):** What is the main language for the documentation? The wizard will detect your system's language as a default.
6.  **Translation Languages (`translateLanguages`):** Do you want to provide translations? You can select additional languages to generate.
7.  **Documentation Directory (`docsDir`):** Where should the generated documentation files be saved?
8.  **Source Code Paths (`sourcesPath`):** What files and directories should be analyzed to generate the documentation? You can provide specific paths or use glob patterns (e.g., `src/**/*.js`).

## Intelligent Conflict Detection

A key feature of the interactive setup is its ability to identify and help resolve conflicting configuration choices. This ensures that the generated documentation structure is coherent and serves your audience effectively.

### Filtering Incompatible Options

As you answer questions, the wizard dynamically filters options in subsequent steps to prevent logical contradictions. For example, if you select the primary goal as **"Get started quickly,"** which is for new users, the wizard will remove **"Is an expert trying to do something specific"** from the reader knowledge level choices. The system understands that these two goals are fundamentally incompatible.

### Resolving Complex Scenarios

Sometimes, you may want to target multiple, seemingly conflicting audiences or purposes (e.g., both non-technical **End Users** and **Developers**). Instead of preventing this, the wizard allows it and then generates specific guidelines in your `config.yaml` file to resolve the conflict through intelligent document structure.

For instance, if you select both `endUsers` and `developers`, the generated configuration might include a recommendation to create separate user paths:
- A **User Guide** written in simple language with UI-focused examples.
- A **Developer Guide** that is code-first, technically precise, and includes API examples.

## Generated Configuration File

After you answer all the questions, the wizard saves your choices to a `config.yaml` file in the `.aigne/doc-smith` directory. This file is heavily commented, explaining each option and listing all available choices, making it easy to review and modify later.

Here is a snippet of what a generated `config.yaml` might look like:

```yaml config.yaml icon=logos:yaml
# Project information for documentation publishing
projectName: my-awesome-project
projectDesc: A description of my awesome project.
projectLogo: ''

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
# Available options (uncomment and modify as needed):
#   getStarted       - Get started quickly: Help new users go from zero to working in <30 minutes
#   completeTasks    - Complete specific tasks: Guide users through common workflows and use cases
documentPurpose:
  - getStarted

# Target Audience: Who will be reading this most often?
# Available options (uncomment and modify as needed):
#   endUsers         - End users (non-technical): People who use the product but don't code
#   developers       - Developers integrating your product/API: Engineers adding this to their projects
targetAudienceTypes:
  - developers

# ... and so on for other settings

# Paths
docsDir: .aigne/doc-smith/docs  # Directory to save generated documentation
sourcesPath:  # Source code paths to analyze
  - src/
```

## Next Steps

Once your configuration is set up, you're ready to move on. You can either fine-tune the settings manually or proceed directly to generating your documentation.

<x-cards data-columns="2">
  <x-card data-title="Configuration Guide" data-icon="lucide:settings" data-href="/configuration">
    Review and manually edit all available settings in the config.yaml file.
  </x-card>
  <x-card data-title="Generate Documentation" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    Now that your project is configured, learn how to generate your first set of documents.
  </x-card>
</x-cards>