---
labels: ["Reference"]
---

# Interactive Setup

Setting up a new documentation project is straightforward with the interactive setup wizard. By running a single command, `aigne doc init`, you can generate a comprehensive `config.yaml` file tailored to your project's needs. The wizard guides you through a series of questions, provides intelligent defaults, and helps prevent configuration mistakes.

This is the recommended way to start a new DocSmith project, as it ensures all necessary settings are considered from the beginning.

## The Setup Process

The `init` command launches a guided, 8-step process to understand your documentation goals. At each step, it asks a question and often suggests a default based on your previous answers.

```d2
direction: down

start: "Start: `aigne doc init`" {
  shape: hexagon
}

step1: "[1/8] Define Primary Goal"
step2: "[2/8] Select Target Audience"
step3: "[3/8] Set Reader Knowledge Level"
step4: "[4/8] Choose Documentation Depth"
step5: "[5/8] Select Primary Language"
step6: "[6/8] Add Translation Languages"
step7: "[7/8] Specify Output Directory"
step8: "[8/8] Configure Source Paths"

finish: "config.yaml is generated!" {
  shape: hexagon
}

start -> step1 -> step2 -> step3 -> step4 -> step5 -> step6 -> step7 -> step8 -> finish

subsystem: "Throughout the process, DocSmith provides intelligent defaults and detects potential configuration conflicts to ensure a coherent setup." {
    shape: callout
}

subsystem -- step3
subsystem -- step4
```

Here is a breakdown of each step:

1.  **Primary Goal**: Define the main purpose of your documentation. This choice heavily influences the style and structure of the generated content.
2.  **Target Audience**: Specify who will be reading the documentation. This helps tailor the tone, language, and examples to the right audience.
3.  **Reader Knowledge Level**: Indicate the typical starting knowledge of your readers. The wizard filters this list to show only options compatible with your previous selections.
4.  **Documentation Depth**: Decide how comprehensive the documentation should be. A recommended default is provided based on your goal and audience.
5.  **Primary Language**: Choose the main language for your documentation. It defaults to your detected system language.
6.  **Translation Languages**: Select any additional languages you want to translate the documentation into.
7.  **Documentation Directory**: Set the output folder for the generated documentation files.
8.  **Source Code Paths**: Specify which files and folders DocSmith should analyze to generate documentation. You can use both direct paths (e.g., `./src`) and glob patterns (e.g., `src/**/*.js`).

## Intelligent Conflict Prevention

A key feature of the interactive setup is its ability to prevent conflicting configurations. As you make selections, the wizard intelligently filters the options in subsequent steps to ensure your final configuration is logical and effective.

For example, if you select **"Get started quickly"** as your primary goal, the wizard will prevent you from choosing **"Is an expert trying to do something specific"** as the reader's knowledge level. A quick-start guide is fundamentally incompatible with the needs of an expert who requires advanced, in-depth reference material. This mechanism guides you toward creating a coherent documentation strategy without requiring you to memorize every possible combination of settings.

## Handling Complex Scenarios

Sometimes, you may want to target multiple, distinct audiences. For instance, you might need documentation for both non-technical **End Users** and expert **Developers**. While these audiences have conflicting needs, the setup wizard allows you to select both.

Instead of treating this as an error, DocSmith uses this information as a guideline for the documentation's structure. It will resolve the conflict by planning separate user paths:

*   **A User Guide**: Written in plain language, focusing on UI and business outcomes.
*   **A Developer Guide**: Featuring code snippets, API references, and technical details.

This approach ensures that the final documentation can serve diverse needs effectively through intelligent structural design rather than simple concatenation.

After completing the wizard, your configuration will be saved, and you'll be ready to generate your first set of documents.

<x-cards>
  <x-card data-title="Configuration Guide" data-icon="lucide:file-cog" data-href="/configuration">
    Learn how to manually edit the `config.yaml` file for advanced customization.
  </x-card>
  <x-card data-title="Generate Documentation" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    Run the command to generate your first set of documents based on your new configuration.
  </x-card>
</x-cards>