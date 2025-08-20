---
labels: ["Reference"]
---

# LLM Setup

AIGNE DocSmith uses Large Language Models (LLMs) to generate high-quality documentation content. You have the flexibility to choose from various LLM providers, and this guide will walk you through the setup options.

## Using AIGNE Hub (Recommended)

The simplest way to get started is by using AIGNE Hub. This is the recommended approach for most users because it doesn't require you to provide your own API keys and allows you to easily switch between different models from various providers.

To use a specific model via AIGNE Hub, simply add the `--model` flag to your command. No prior API key configuration is needed.

**Examples of Switching Models:**

```bash
# Generate documentation using Google's Gemini 1.5 Flash
aigne doc generate --model google:gemini-2.5-flash

# Generate documentation using Anthropic's Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# Generate documentation using OpenAI's GPT-4o
aigne doc generate --model openai:gpt-4o
```

## Using Custom API Keys

If you prefer to use your personal or enterprise accounts with LLM providers like OpenAI or Anthropic, you can configure DocSmith with your own API keys.

This setup is handled through the interactive configuration wizard. To start, run the `init` command:

```bash
aigne doc init
```

This wizard will guide you through the process of selecting your LLM provider and securely entering your API key. This is a one-time setup, and the settings will be saved for all future commands.

---

Whether you choose the convenience of AIGNE Hub or the control of custom API keys, DocSmith makes it easy to leverage powerful AI for your documentation. Once you have your LLM configured, you are ready to [Generate Documentation](./features-generate-documentation.md).