# Interactive Setup

To simplify project configuration, AIGNE DocSmith provides an interactive setup wizard launched with the `aigne doc init` command. This guided process asks a series of questions about your documentation goals and generates a `config.yaml` file based on your answers. It is the recommended way to start a new documentation project, as it helps prevent configuration errors and provides specific recommendations.

## Running the Wizard

To begin, run the following command in your project's root directory:

```bash aigne doc init icon=lucide:sparkles
npx aigne doc init
```

The wizard will then guide you through an 8-step process to configure your documentation.

## The Guided Process

The wizard covers the following key areas:

1.  **Primary Goal**: Defines the main outcome for your readers (e.g., getting started quickly, finding answers fast).
2.  **Target Audience**: Specifies who will be reading the documentation (e.g., non-technical end-users, developers).
3.  **Reader Knowledge Level**: Assesses the typical starting knowledge of your audience.
4.  **Documentation Depth**: Determines how comprehensive the content should be.
5.  **Primary Language**: Sets the main language for the documentation.
6.  **Translation Languages**: Selects additional languages for translation.
7.  **Output Directory**: Specifies where to save the generated documentation files.
8.  **Source Code Paths**: Defines which files and directories to analyze, with support for glob patterns.

## Assisted Configuration

The wizard includes built-in logic to help you create a more effective and coherent configuration.

```d2
direction: down

User-Selections: {
  label: "1. User provides input\n(Purpose, Audience, etc.)"
  shape: rectangle
}

Wizard-Engine: {
  label: "2. Wizard's Logic Engine"
  shape: rectangle
  grid-columns: 2

  Filtering: {
    label: "Option Filtering\n(Prevents invalid combos)"
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
  shape: document
  content: "config.yaml is generated with\nconflict resolution strategies"
}

User-Selections -> Wizard-Engine
Wizard-Engine.Filtering -> Guided-Experience
Wizard-Engine.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "Refines"
```

### Default Suggestions and Option Filtering

As you answer questions, the wizard provides defaults and filters subsequent options to guide you toward a logical configuration. For instance:

-   **Default Suggestions**: If you select "Get started quickly" as your primary goal, the wizard will recommend "Is a total beginner" as the reader's knowledge level.
-   **Real-time Filtering**: If your target audience is "End users (non-technical)," the wizard will hide technically advanced knowledge levels like "Is an expert trying to do something specific" to prevent incompatible selections.

### Conflict Detection and Resolution

Sometimes, you may have multiple goals or audiences that seem to conflict, such as creating documentation for both non-technical **End Users** and expert **Developers**. The wizard identifies these as "resolvable conflicts."

It then formulates a strategy to address these diverse needs within the documentation's structure. For the End User vs. Developer example, the resolution strategy is to create separate user paths:

-   **User Guide Path**: Uses plain language, focuses on UI interactions, and is oriented toward business outcomes.
-   **Developer Guide Path**: Is code-first, technically precise, and includes SDK examples and configuration snippets.

This approach ensures that the final documentation is structured to serve multiple audiences effectively, rather than creating a confusing mix of content.

## Generated Output

Upon completion, the wizard saves a `config.yaml` file in your project. This file is fully commented, explaining each option and listing all available choices, making it easy to review and modify manually later.

Here is a snippet of what the generated file looks like:

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