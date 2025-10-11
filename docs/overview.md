# Overview

AIGNE DocSmith is a tool that uses Artificial Intelligence to automatically create documentation from your project's source code. It is built on the AIGNE Framework and is designed to produce structured, multi-language documents that accurately reflect your codebase.

The primary goal of DocSmith is to address the common challenges of manual documentation, such as being time-consuming to write, becoming outdated as code changes, and lacking consistency. By automating this process, DocSmith helps ensure your documentation remains current and accurate.

## How It Works

DocSmith operates by analyzing your project's source code to understand its structure, components, and functionality. Based on this analysis, it generates a complete documentation set, from high-level guides to detailed API references.

```d2
direction: down

Source-Code: {
  label: "Project Source Code"
  shape: rectangle
}

DocSmith: {
  label: "AIGNE DocSmith\n(AI Analysis Engine)"
  shape: rectangle
}

Docs: {
  label: "Generated Documentation"
  shape: rectangle
}

Source-Code -> DocSmith: "Analyzes"
DocSmith -> Docs: "Generates"
```

## Core Features

DocSmith provides a set of features to handle the documentation lifecycle from creation to publication.

*   **AI-Powered Generation**: Analyzes your codebase to propose a logical documentation structure and generates content that explains your code's functionality.
*   **Multi-Language Support**: Translates documentation into 12 languages, including English, Chinese (Simplified), and Japanese. The translation process is context-aware to maintain technical accuracy.
*   **Integration with LLMs**: Connects with various Large Language Models (LLMs). By default, it uses [AIGNE Hub](https://www.aigne.io/en/hub), a service that allows you to switch between models like Google Gemini and OpenAI GPT without needing separate API keys. You can also configure your own API keys for direct provider access.
*   **Smart Updates**: Detects changes in your source code and updates the corresponding sections of your documentation. You can also provide specific feedback to refine generated content.
*   **Publishing Options**: Publish your generated documentation with a single command. You can deploy to the official DocSmith platform or to your own instance of [Discuss Kit](https://www.web3kit.rocks/discuss-kit). Discuss Kit is a service for hosting and displaying documentation.

## Available Commands

DocSmith is operated through a set of commands. The following table provides a summary of the main commands and their functions.

| Command | Description |
| :--- | :--- |
| `generate` | Creates a new set of documentation from your source files. |
| `update` | Modifies existing documents based on code changes or new feedback. |
| `translate` | Translates documents into one or more of the 12 supported languages. |
| `publish` | Deploys your documentation to a live, accessible URL. |
| `evaluate` | Assesses the quality and completeness of your generated documentation. |
| `history` | Views the history of updates made to your documentation. |
| `chat` | Starts an interactive chat session to assist with documentation tasks. |
| `clear` | Removes generated files, configurations, and cached data. |
| `prefs` | Manages saved preferences and configurations for documentation generation. |

---

This overview provides a high-level summary of AIGNE DocSmith's purpose and capabilities. To begin using the tool, proceed to the [Getting Started](./getting-started.md) guide for installation and setup instructions.