# Overview

Struggling to keep your documentation in sync with your ever-changing codebase? AIGNE DocSmith automates the entire process, analyzing your source code to generate accurate, structured, and multi-language documentation, so you can focus on building great software.

AIGNE DocSmith is an AI-driven tool that automatically creates documentation from your project's source code. It is built on the [AIGNE Framework](https://www.aigne.io/en/framework) and is designed to produce structured, multi-language documents that accurately reflect your codebase.

The tool addresses the common challenges of manual documentation, such as being time-consuming to create, quickly becoming outdated as code evolves, and lacking consistency across different sections. By automating this process, DocSmith helps ensure your documentation remains current, accurate, and useful.

## How It Works

DocSmith operates by analyzing your project's source code to understand its structure, components, and functionality. Based on this analysis, it generates a complete documentation set, from high-level guides to detailed API references.

```d2
direction: down

Source-Code: {
  label: "Source Code"
  shape: rectangle
}

AIGNE-DocSmith: {
  label: "AIGNE DocSmith"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Analysis-Engine: {
    label: "Analysis Engine"
    shape: rectangle
  }

  Generation-Engine: {
    label: "Generation Engine"
    shape: rectangle
  }

  Translation-Engine: {
    label: "Translation Engine"
    shape: rectangle
  }

  LLMs: {
    label: "Large Language Models"
    shape: rectangle

    AIGNE-Hub: {
      label: "AIGNE Hub"
    }

    Direct-Access: {
      label: "Direct Access"
      shape: rectangle
      Google-Gemini: {}
      OpenAI-GPT: {}
    }
  }
}

Published-Documentation: {
  label: "Published Documentation"
  shape: rectangle

  DocSmith-Platform: {
    label: "DocSmith Platform"
  }

  Discuss-Kit: {
    label: "Discuss Kit"
  }
}

Source-Code -> AIGNE-DocSmith.Analysis-Engine: "Analyzes"
AIGNE-DocSmith.Analysis-Engine -> AIGNE-DocSmith.Generation-Engine: "Generates"
AIGNE-DocSmith.Generation-Engine <-> AIGNE-DocSmith.LLMs: "Utilizes"
AIGNE-DocSmith.Generation-Engine -> AIGNE-DocSmith.Translation-Engine: "Translates"
AIGNE-DocSmith.Translation-Engine -> Published-Documentation: "Publishes"

```

## Core Features

DocSmith provides a set of features to handle the documentation lifecycle from creation to publication.

*   **AI-Powered Generation**: Analyzes your codebase to propose a logical documentation structure and generates content that explains your code's functionality.
*   **Multi-Language Support**: Translates documentation into 12 languages, including English, Chinese (Simplified), and Japanese. The translation process is context-aware to maintain technical accuracy.
*   **Integration with LLMs**: Connects with various Large Language Models (LLMs). By default, it uses [AIGNE Hub](https://www.aigne.io/en/hub), a service that allows you to switch between models like Google Gemini and OpenAI GPT without needing separate API keys. You can also configure your own API keys for direct provider access.
*   **Smart Updates**: Detects changes in your source code and updates the corresponding sections of your documentation. You can also provide specific feedback to refine generated content.
*   **Publishing Options**: Publish your generated documentation with a single command. You can deploy to the official DocSmith platform or run your own instance of [Discuss Kit](https://www.web3kit.rocks/discuss-kit). Discuss Kit is a service for hosting and displaying documentation.

## Available Commands

DocSmith is operated through a command-line interface. The following table provides a summary of the main commands and their functions.

| Command | Description |
| :--- | :--- |
| `generate` | Creates a new set of documentation from your source files. |
| `update` | Modifies existing documents based on code changes or new feedback. |
| `translate` | Translates documents into one or more of the 12 supported languages. |
| `publish` | Deploys your documentation to a live, accessible URL. |
| `evaluate` | Assesses the quality and completeness of your generated documentation. |
| `history` | Views the history of updates made to your documentation. |
| `chat` | Starts an interactive chat session to generate and manage documentation. |
| `clear` | Removes generated files, configurations, and cached data. |
| `init` | Guides you through an interactive process to create an initial configuration file. |
| `prefs` | Manages saved preferences and configurations for documentation generation. |

---

This overview provides a summary of AIGNE DocSmith's purpose and capabilities. To begin using the tool, proceed to the [Getting Started](./getting-started.md) guide for installation and setup instructions.