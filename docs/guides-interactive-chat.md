# Interactive Chat

The interactive chat assistant provides a conversational command-line interface to manage all aspects of your documentation lifecycle. It interprets natural language instructions to execute commands for document generation, updates, translation, and publishing.

This guided approach removes the need to memorize individual commands and options, making it the recommended method for most documentation tasks.

## Starting the Chat Assistant

To begin an interactive session, run the `chat` command from your project's root directory:

```bash
aigndoc chat
```

This command launches the assistant and presents a prompt, ready to receive your instructions.

## Core Capabilities

The chat assistant is designed to handle the entire documentation lifecycle. Its primary functions are based on a set of specialized skills that it can call upon based on your requests.

<x-cards data-columns="2">
  <x-card data-title="Generate Documentation" data-icon="lucide:file-plus-2">
    Creates a complete documentation structure and initial content by analyzing your project's source code.
  </x-card>
  <x-card data-title="Refine and Update" data-icon="lucide:edit">
    Modifies specific documents or sections based on your feedback or changes in the source code.
  </x-card>
  <x-card data-title="Translate Content" data-icon="lucide:languages">
    Translates existing documentation into multiple supported languages to reach a broader audience.
  </x-card>
  <x-card data-title="Publish and Manage" data-icon="lucide:upload-cloud">
    Guides you through the process of publishing your documentation and managing team-based workflows.
  </x-card>
</x-cards>

## How It Works

You can interact with the assistant in two ways:

1.  **Natural Language**: State your goal in plain language. The assistant will identify the correct tool and guide you through the required steps. For example, you can type "update the getting started guide" or "I need to translate my docs into French."
2.  **Direct Commands**: You can also type specific commands directly into the chat prompt to initiate a task, such as `generate` or `publish`.

## Available Commands

The assistant understands a set of core commands that correspond to its specialized skills. You can invoke these directly or describe a task that requires them.

| Command | Description |
| :--- | :--- |
| `generate` | Starts the process of creating a new documentation structure from your source files. |
| `update` | Modifies existing documents based on code changes or specific feedback. |
| `translate` | Translates documents into one or more supported languages. |
| `publish` | Publishes your documentation to make it accessible online. |
| `init` | Guides you through creating an initial configuration file for the project. |
| `clear` | Removes generated files, configurations, and cached data. |
| `prefs` | Manages your saved preferences for document generation. |
| `evaluate` | Assesses the quality and completeness of your generated documentation. |
| `history` | Shows the history of updates and changes made to your documentation. |
| `exit` | Ends the interactive chat session and returns you to the standard terminal prompt. |

## Example Interaction

The following is a sample conversation that illustrates a typical workflow for generating new documentation.

```text
You:
> I need to create documentation for my project located in the 'src' folder.

AI Assistant:
Understood. I will start the documentation generation process for the directory './src'.
First, I will analyze your project to propose a documentation structure. This may take a few moments...
...
Analysis complete. I have created a proposed structure. Would you like to review it before I generate the content? (yes/no)

You:
> yes

AI Assistant:
(The proposed documentation structure is displayed here for your review.)
...
You can request changes, such as 'add a guide for API authentication' or 'remove the section on deployment'. If the structure is correct, simply type 'continue'.

You:
> continue

AI Assistant:
Great. I will now proceed with generating the content for each document. This may take a few minutes.
```

## Summary

The interactive chat assistant provides a structured and guided method for managing your documentation. It consolidates the functionality of all individual commands into a single, conversational interface, ensuring a consistent and straightforward workflow.

For a detailed walkthrough of creating your first set of documents using the assistant, please proceed to the [Generating Documentation](./guides-generating-documentation.md) guide.