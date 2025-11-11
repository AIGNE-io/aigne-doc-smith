# Interactive Chat

Feeling overwhelmed by command-line options? This guide explains how to use the interactive chat assistant, a conversational interface that simplifies every step of the documentation process. By the end, you will be able to generate, update, translate, and publish your documents using simple, natural language instructions.

The chat assistant is the recommended method for managing your documentation, as it provides a guided workflow that eliminates the need to memorize specific commands and their parameters.

## Starting an Interactive Session

To launch the chat assistant, execute the `chat` command from your project's root directory.

```bash aigne doc chat icon=lucide:terminal
aigne doc chat
```

This command starts the interactive session, and the assistant will prompt you for instructions.

## Core Capabilities

The chat assistant streamlines the entire documentation lifecycle by integrating several core functions into a single conversational interface. You can state your goal in plain language, and the assistant will execute the necessary steps.

<x-cards data-columns="2">
  <x-card data-title="Generate Documentation" data-icon="lucide:file-plus-2">
    Create a complete documentation structure and initial content by analyzing your project's source code.
  </x-card>
  <x-card data-title="Update and Refine" data-icon="lucide:edit">
    Modify specific documents or entire sections based on your feedback or recent changes in the source code.
  </x-card>
  <x-card data-title="Translate Content" data-icon="lucide:languages">
    Translate your documentation into multiple supported languages to serve a global audience.
  </x-card>
  <x-card data-title="Publish Your Docs" data-icon="lucide:upload-cloud">
    Follow a guided process to publish your documentation and make it available online.
  </x-card>
</x-cards>

## Interaction Methods

You can interact with the assistant in two primary ways:

1.  **Natural Language Instructions**: Describe the task you want to accomplish. The assistant interprets your request and initiates the appropriate workflow. For example, you can type "generate docs for the project" or "translate the installation guide into German and French."
2.  **Direct Commands**: You can also invoke a specific function by typing its command name directly into the chat prompt, such as `update` or `publish`.

## Available Commands

The chat assistant understands a set of commands that correspond to its primary functions. While you can trigger these functions using natural language, you may also use the commands directly.

| Command | Description |
| :--- | :--- |
| `generate` | Initiates the workflow to create a new documentation structure and content from source files. |
| `update` | Starts the process of modifying existing documents based on code changes or user feedback. |
| `translate` | Begins the process of translating documents into one or more supported languages. |
| `publish` | Guides you through the steps to publish your documentation online. |
| `init` | Helps create the initial configuration file (`docsmith.config.js`) for the project. |
| `clear` | Removes generated files, configurations, and cached data from your project. |
| `prefs` | Allows you to view and manage saved preferences for documentation generation. |
| `evaluate` | Assesses the quality and completeness of your generated documentation and provides a report. |
| `history` | Displays the history of updates and changes made to your documentation. |
| `exit` | Terminates the interactive chat session and returns to the standard terminal prompt. |

## Example Interaction

The following transcript demonstrates a typical workflow for generating new documentation using the chat assistant.

```text
You:
> I need to create documentation for this project.

AI Assistant:
Understood. I will start the documentation generation process for the current directory.
First, I will analyze your project to propose a documentation structure. This may take a few moments...
...
Analysis complete. I have created a proposed structure. Would you like to review it before I generate the content? (yes/no)

You:
> yes

AI Assistant:
(The proposed documentation structure is displayed here for your review.)
...
You can request changes, such as 'add a guide for API authentication' or 'merge the installation and setup guides'. If the structure is correct, simply type 'continue'.

You:
> continue

AI Assistant:
Great. I will now proceed with generating the content for each document. This may take some time depending on the size of your project.
```

This interaction shows how the assistant guides the user through analysis, review, and content generation, requiring only simple text-based responses.

## Summary

The interactive chat assistant provides a systematic and guided method for managing documentation. It consolidates the tool's complete functionality into a single, conversational interface, ensuring a precise and efficient workflow.

To see a practical application of the chat assistant, refer to the [Generating Documentation](./guides-generating-documentation.md) guide for a step-by-step walkthrough.