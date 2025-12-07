# Overview

Struggling to keep your documents in sync with your ever-changing codebase? AIGNE DocSmith automates the entire process, analyzing your source code to generate accurate, structured, and multi-language documents, so you can focus on building great software.

AIGNE DocSmith is an AI-driven tool that automatically creates documents from your project's source code. It is built on the [AIGNE Framework](https://www.aigne.io/en/framework) and is designed to produce structured, multi-language documents that accurately reflect your codebase.

The tool addresses the common challenges of manual document creation, such as being time-consuming to create, quickly becoming outdated as code evolves, and lacking consistency across different sections. By automating this process, DocSmith helps ensure your documents remain current, accurate, and useful.

## How It Works

DocSmith operates by analyzing your project's source code to understand its structure, components, and functionality. Based on this analysis, it generates a complete documentation set, from high-level guides to detailed API references.

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Overview](assets/diagram/overview-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## Core Features

DocSmith provides a set of features to handle the document lifecycle from creation to publication.

*   **AI-Powered Generation**: Analyzes your codebase to propose a logical document structure and generates content that explains your code's functionality.
*   **Multi-Language Support**: Translates documents into 12 languages, including English, Chinese (Simplified), and Japanese. The translation process is context-aware to maintain technical accuracy.
*   **Integration with LLMs**: Connects with various Large Language Models (LLMs). By default, it uses [AIGNE Hub](https://www.aigne.io/en/hub), a service that allows you to switch between models like Google Gemini and OpenAI GPT without needing separate API keys. You can also configure your own API keys for direct provider access.
*   **Smart Updates**: Detects changes in your source code and updates the corresponding sections of your documents. You can also provide specific feedback to refine generated content.
*   **Publishing Options**: Publish your created documents with a single command. You can deploy to the official DocSmith platform or run your own instance of [Discuss Kit](https://www.web3kit.rocks/discuss-kit). Discuss Kit is a service for hosting and displaying documents.

## Available Commands

DocSmith is operated through a command-line interface. The following table provides a summary of the main commands and their functions.

| Command | Description |
| :--- | :--- |
| `create` | Creates a new set of documents from your source files. |
| `update` | Modifies existing documents based on code changes or new feedback. |
| `localize` | Translates documents into one or more of the 12 supported languages. |
| `publish` | Deploys your documents to a live, accessible URL. |
| `evaluate` | Assesses the quality and completeness of your created documents. |
| `history` | Views the history of updates made to your documents. |
| `chat` | Starts an interactive mode session to generate and manage documents. |
| `clear` | Removes created files, configurations, and cached data. |
| `init` | Guides you through an interactive process to create an initial configuration file. |
| `prefs` | Manages saved preferences and configurations for document creation. |

---

This overview provides a summary of AIGNE DocSmith's purpose and capabilities. To begin using the tool, proceed to the [Getting Started](./getting-started.md) guide for installation and setup instructions.
