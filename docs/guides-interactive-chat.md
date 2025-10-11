# Interactive Chat

The interactive chat assistant provides a conversational interface for generating, modifying, and managing your documentation. Instead of running individual commands, you can describe what you need to do, and the assistant will guide you through the process, calling on the appropriate tools to complete the task.

This approach simplifies the documentation workflow by handling the underlying commands for you. It is the recommended method for most interactions with the tool.

## Starting the Chat Assistant

To begin an interactive session, run the `chat` command from your terminal:

```bash
aigndoc chat
```

This will launch the assistant, and you can begin typing your requests.

## Core Capabilities

The chat assistant is designed to handle the entire documentation lifecycle. Its primary functions include:

<x-cards data-columns="2">
  <x-card data-title="Generate Documentation" data-icon="lucide:file-plus-2">
    Create a complete documentation structure and initial content by analyzing your project's source files.
  </x-card>
  <x-card data-title="Refine and Update" data-icon="lucide:edit">
    Regenerate specific sections or entire documents based on your feedback or changes in the source code.
  </x-card>
  <x-card data-title="Translate Content" data-icon="lucide:languages">
    Translate existing documentation into multiple languages to reach a broader audience.
  </x-card>
  <x-card data-title="Publish and Manage" data-icon="lucide:upload-cloud">
    Assist with publishing your documentation and managing team-based workflows.
  </x-card>
</x-cards>

## Available Commands

Within the chat, you can state your goal in plain language (e.g., "update the getting started guide") or invoke specific commands. The assistant understands the following core commands, which correspond to its specialized skills:

| Command | Description |
| :--- | :--- |
| `generate` | Starts the process of creating a new documentation structure from source files. |
| `update` | Modifies existing documents based on code changes or user feedback. |
| `translate` | Translates documents into one or more supported languages. |
| `publish` | Publishes your documentation to make it accessible online. |
| `init` | Guides you through creating an initial configuration file for the project. |
| `clear` | Removes generated files, configurations, and cached data. |
| `prefs` | Manages your saved preferences for document generation. |
| `evaluate` | Assesses the quality and completeness of your generated documentation. |
| `history` | Shows the history of updates made to your documentation. |
| `exit` | Ends the interactive chat session. |

## Example Interaction

Here is a sample conversation to illustrate how the interactive assistant works.

```text
You:
> Hello, I need to create documentation for a new project.

AI Assistant:
Of course. To get started, I need to analyze your project structure. Could you please provide the path to your source code directory?

You:
> ./src

AI Assistant:
Thank you. I will now analyze the files in ./src to propose a documentation structure. This may take a few moments...
...
I have analyzed your project and created a proposed structure. Would you like to review it before I proceed with generating the content? (yes/no)

You:
> yes

AI Assistant:
(Displays the proposed documentation structure for review)
...
Please review the structure above. You can ask me to add, remove, or modify any part of it.
```

## Summary

The interactive chat assistant is a powerful tool for managing your documentation in a guided, conversational manner. It streamlines complex tasks by handling the necessary steps and commands for you.

For a more detailed walkthrough of a specific workflow, see the [Generating Documentation](./guides-generating-documentation.md) guide.