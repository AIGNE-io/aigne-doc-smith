# Interactive Setup

AIGNE DocSmith includes an interactive setup wizard, launched with the `aigne doc init` command, to streamline project configuration. This guided process asks a series of questions about your documentation goals and generates a `config.yaml` file based on your answers. It is the recommended method for starting a new documentation project, as it helps prevent configuration errors and provides specific recommendations based on your inputs.

## Running the Wizard

To start the process, run the following command in the root directory of your project:

```bash aigne doc init icon=lucide:sparkles
npx aigne doc init
```

The wizard will then walk you through an 8-step process to configure your documentation.

## The Guided Process

The wizard prompts for the following key configuration details:

1.  **Primary Goal**: Defines the main purpose for your readers (e.g., getting started, finding answers).
2.  **Target Audience**: Specifies the primary readers of the documentation (e.g., non-technical end-users, developers).
3.  **Reader Knowledge Level**: Assesses the typical starting knowledge of your audience.
4.  **Documentation Depth**: Determines the level of detail and scope of the content.
5.  **Primary Language**: Sets the main language for the documentation.
6.  **Translation Languages**: Selects additional languages for translation.
7.  **Output Directory**: Specifies the location for the generated documentation files.
8.  **Source Code Paths**: Defines which files and directories to analyze, with support for glob patterns.

## Assisted Configuration

The wizard uses a set of predefined rules to help you create a coherent and effective configuration.

```d2
direction: down

User-Selections: {
  label: "1. User provides input\n(Purpose, Audience, etc.)"
  shape: rectangle
}

Wizard-Engine: {
  label: "2. Wizard's Rule Engine"
  shape: rectangle
  grid-columns: 2

  Filtering: {
    label: "Option Filtering\n(Prevents incompatible selections)"
  }

  Conflict-Detection: {
    label: "Conflict Detection\n(Identifies complex needs)"
  }
}

Guided-Experience: {
  label: "3. Guided Experience"
  shape: rectangle
  content: "User sees simplified, relevant options"
}

Final-Config: {
  label: "4. Final Configuration"
  content: "config.yaml is generated with\nconflict resolution strategies"
}

User-Selections -> Wizard-Engine
Wizard-Engine.Filtering -> Guided-Experience
Wizard-Engine.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "Refines"
```

### Option Filtering

As you make selections, the wizard filters subsequent options to guide you toward a logical configuration. This is based on a set of cross-question conflict rules that prevent incompatible choices.

For example, if you select "End users (non-technical)" as your target audience, the wizard will hide the "Is an expert" knowledge level option. The rule's reasoning is that "Non-technical users are typically not experienced technical users," thus preventing an illogical selection.

### Conflict Detection and Resolution

In some cases, you may have multiple goals or audiences that require a specific documentation structure to be effective, such as creating documentation for both non-technical **End Users** and expert **Developers**. The wizard identifies these as "resolvable conflicts."

It then formulates a strategy to address these needs within the documentation structure. For the End User vs. Developer example, the resolution strategy is to create separate user paths:

-   **User Guide Path**: Uses plain language, focuses on UI interactions, and is oriented toward business outcomes.
-   **Developer Guide Path**: Is code-first, technically precise, and includes SDK examples and configuration snippets.

This approach ensures the final documentation is structured to serve multiple audiences effectively, rather than creating a single, confusing mix of content.

## Generated Output

After you complete the wizard, it saves a `config.yaml` file in your project. This file is fully commented, explaining each option and listing all available choices, which makes it easy to review and modify manually later.

Here is a snippet of a generated file:

```yaml config.yaml icon=logos:yaml
# Project information for documentation publishing
projectName: your-project-name
projectDesc: Your project description.
projectLogo: ""

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
# Available options (uncomment and modify as needed):
#   getStarted       - Get started quickly: Help new users go from zero to working in <30 minutes
#   completeTasks    - Complete specific tasks: Guide users through common workflows and use cases
documentPurpose:
  - completeTasks
  - findAnswers

# Target Audience: Who will be reading this most often?
# Available options (uncomment and modify as needed):
#   endUsers         - End users (non-technical): People who use the product but don't code
#   developers       - Developers integrating your product/API: Engineers adding this to their projects
targetAudienceTypes:
  - endUsers
  - developers

# ... other settings
```

## Next Steps

With your configuration file in place, you are ready to generate, translate, or publish your documentation.

<x-cards>
  <x-card data-title="Generate Documentation" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    Learn how to use a single command to automatically create a complete set of documentation from your source code.
  </x-card>
  <x-card data-title="Configuration Guide" data-icon="lucide:settings" data-href="/configuration">
    Dive deeper into all available settings and learn how to fine-tune the config.yaml file manually.
  </x-card>
</x-cards>