# Interactive Mode (Beta)

Feeling overwhelmed by command-line options? This guide explains how to use the interactive mode, a conversational interface that simplifies every step of the document process. By the end, you will be able to generate, update, translate, and publish your documents using simple, natural language instructions.

The interactive mode is the recommended method for managing your documents, as it provides a guided workflow that eliminates the need to memorize specific commands and their parameters.

## Starting an Interactive Session

To launch the interactive mode, execute the `chat` command from your project's root directory.

```bash aigne doc chat icon=lucide:terminal
aigne doc chat
```

This command starts the interactive session, and the assistant will prompt you for instructions.

## Core Capabilities

The interactive mode streamlines the entire document lifecycle by integrating several core functions into a single conversational interface. You can state your goal in plain language, and the assistant will execute the necessary steps.

<x-cards data-columns="2">
  <x-card data-title="Create Document" data-icon="lucide:file-plus-2">
    Create a complete document structure and initial content by analyzing your project's source code.
  </x-card>
  <x-card data-title="Update and Refine" data-icon="lucide:edit">
    Modify specific documents or entire sections based on your feedback or recent changes in the source code.
  </x-card>
  <x-card data-title="Translate Content" data-icon="lucide:languages">
    Translate your documents into multiple supported languages to serve a global audience.
  </x-card>
  <x-card data-title="Publish Your Documents" data-icon="lucide:upload-cloud">
    Follow a guided process to publish your documents and make it available online.
  </x-card>
</x-cards>

## Interaction Methods

You can interact with the assistant in two primary ways:

1.  **Natural Language Instructions**: Describe the task you want to accomplish. The assistant interprets your request and initiates the appropriate workflow. For example, you can type "generate documents for the project" or "translate the installation guide into German and French."
2.  **Direct Commands**: You can also invoke a specific function by typing its command name directly into the chat prompt, such as `update` or `publish`.

## Available Commands

The interactive mode understands a set of commands that correspond to its primary functions. While you can trigger these functions using natural language, you may also use the commands directly.

| Command | Description |
| :--- | :--- |
| `create` | Initiates the workflow to create a new document structure and content from source files. |
| `update` | Starts the process of modifying existing documents based on code changes or user feedback. |
| `localize` | Begins the process of translating documents into one or more supported languages. |
| `publish` | Guides you through the steps to publish your documents online. |
| `init` | Helps create the initial configuration file (`docsmith.config.js`) for the project. |
| `clear` | Removes generated files, configurations, and cached data from your project. |
| `prefs` | Allows you to view and manage saved preferences for document creation. |
| `evaluate` | Assesses the quality and completeness of your generated documents and provides a report. |
| `history` | Displays the history of updates and changes made to your documents. |
| `exit` | Terminates the interactive session and returns to the standard terminal prompt. |

## Example Interaction

The following transcript demonstrates a typical workflow for generating new documents using the interactive mode.

```text
You:
> I need to create documents for this project.

AI Assistant:
Understood. I will start the document creation process for the current directory.
First, I will analyze your project to propose a document structure. This may take a few moments...
...
Analysis complete. I have created a proposed structure. Would you like to review it before I generate the content? (yes/no)

You:
> yes

AI Assistant:
(The proposed document structure is displayed here for your review.)
...
You can request changes, such as 'add a guide for API authentication' or 'merge the installation and setup guides'. If the structure is correct, simply type 'continue'.

You:
> continue

AI Assistant:
Great. I will now proceed with generating the content for each document. This may take some time depending on the size of your project.
```

This interaction shows how the assistant guides the user through analysis, review, and content creation, requiring only simple text-based responses.

## Summary

The interactive mode provides a systematic and guided method for managing documents. It consolidates the tool's complete functionality into a single, conversational interface, ensuring a precise and efficient workflow.

To see a practical application of the interactive mode, refer to the [Create Document](./guides-generating-documentation.md) guide for a step-by-step walkthrough.
