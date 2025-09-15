# LLM Setup

AIGNE DocSmith uses Large Language Models (LLMs) to generate documentation content. The tool provides two primary methods for configuring your AI model provider: using the integrated AIGNE Hub for a streamlined experience, or connecting your own custom API keys for direct provider access.

## AIGNE Hub (Recommended)

The simplest way to get started is with AIGNE Hub. It acts as a gateway to multiple LLM providers, offering two key advantages:

- **No API Key Required:** Generate documents without needing to manage your own API keys or service subscriptions.
- **Easy Model Switching:** Change the AI model for any command using a simple flag.

To use a specific model through AIGNE Hub, add the `--model` flag to your command. Here are a few examples:

```bash Use Google's Gemini 2.5 Flash model
aigne doc generate --model google:gemini-2.5-flash

# Use Anthropic's Claude 3.5 Sonnet model
aigne doc generate --model claude:claude-3-5-sonnet

# Use OpenAI's GPT-4o model
aigne doc generate --model openai:gpt-4o
```

If you don't specify a model, DocSmith will use the default model defined in your project's configuration.

## Using Custom API Keys

If you prefer to use your own accounts with providers like OpenAI or Anthropic, you can configure DocSmith with your personal API keys. This gives you direct control over API usage and billing.

Configuration is handled through an interactive wizard. To launch it, run:

```bash
aigne doc init
```

The wizard will prompt you to select your provider and enter your credentials. For a complete guide, please see the [Interactive Setup](./configuration-interactive-setup.md) documentation.

## Setting a Default Model

To ensure consistency across all documentation generation tasks, you can set a default LLM in your project's `aigne.yaml` configuration file. This model will be used automatically unless you override it with the `--model` flag.

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

In this configuration, DocSmith defaults to using Google's `gemini-2.5-pro` model with a `temperature` of `0.8` for all generation tasks.

---

Now that your LLM provider is configured, you can explore how to manage translations for your documentation. Proceed to the [Language Support](./configuration-language-support.md) guide to see the full list of supported languages and learn how to enable them.