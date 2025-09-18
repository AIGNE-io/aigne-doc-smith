# LLM Setup

AIGNE DocSmith uses Large Language Models (LLMs) to generate documentation content. You can configure the AI model provider in two ways: using the integrated AIGNE Hub, or by connecting your own custom API keys.

## AIGNE Hub (Recommended)

The most direct way to start is with AIGNE Hub. It functions as a gateway to multiple LLM providers, offering two main benefits:

- **No API Key Required:** You can generate documents without managing your own API keys or service subscriptions.
- **Easy Model Switching:** You can change the AI model for any command by using the `--model` flag.

To use a specific model through AIGNE Hub, add the `--model` flag to your command. Here are a few examples:

```bash Using Different Models via AIGNE Hub icon=mdi:code-braces
# Use Google's Gemini 2.5 Flash model
aigne doc generate --model google:gemini-2.5-flash

# Use Anthropic's Claude 3.5 Sonnet model
aigne doc generate --model claude:claude-3-5-sonnet

# Use OpenAI's GPT-4o model
aigne doc generate --model openai:gpt-4o
```

If you do not specify a model, DocSmith will use the default model defined in your project's configuration.

## Using Custom API Keys

If you prefer to use your own accounts with providers like OpenAI or Anthropic, you can configure DocSmith with your personal API keys. This method gives you direct control over API usage and billing.

Configuration is handled through an interactive wizard. To launch it, run the following command:

```bash
aigne doc init
```

The wizard will prompt you to select your provider and enter your credentials. For a complete guide, refer to the [Interactive Setup](./configuration-interactive-setup.md) documentation.

## Setting a Default Model

To maintain consistency across all documentation generation tasks, you can set a default LLM in your project's `aigne.yaml` configuration file. This model will be used for any command that does not include the `--model` flag.

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

In this example, DocSmith is configured to use Google's `gemini-2.5-pro` model with a `temperature` setting of `0.8` by default.

---

With your LLM provider configured, you are ready to manage language settings for your documentation. Proceed to the [Language Support](./configuration-language-support.md) guide to see the full list of supported languages and learn how to enable them.