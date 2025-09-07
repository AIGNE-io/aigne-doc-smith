# LLM Setup

AIGNE DocSmith uses Large Language Models (LLMs) to generate documentation. The platform is designed for flexibility, allowing you to connect to various AI model providers. You can use the integrated AIGNE Hub for a setup-free experience or configure your own API keys for direct control.

## AIGNE Hub (Recommended)

The simplest way to get started is by using AIGNE Hub. It acts as a gateway to multiple leading LLM providers, offering several key benefits:

- **No API Key Required:** You can start generating documents immediately without signing up for separate AI services or managing secret keys.
- **Easy Model Switching:** You can experiment with different models by specifying them as a command-line argument. This allows you to choose the best model for a specific task.

To use a specific model via AIGNE Hub, use the `--model` flag with the `generate` command:

```bash
# Generate content using Google's Gemini 2.5 Flash
aigne doc generate --model google:gemini-2.5-flash

# Generate content using Anthropic's Claude 3.5 Sonnet
aigne doc generate --model anthropic:claude-3-5-sonnet

# Generate content using OpenAI's GPT-4o
aigne doc generate --model openai:gpt-4o
```

If no model is specified, DocSmith will use the default model configured for your project.

## Using Custom API Keys

If you prefer to use your own API keys from providers like OpenAI, Anthropic, or others, DocSmith supports this as well. This approach gives you direct control over your API usage and billing with your chosen provider.

Configuration for custom API keys is handled through the interactive setup wizard. You can launch it by running:

```bash
aigne doc init
```

The wizard will guide you through the process of selecting your provider and entering the necessary credentials. For a complete walkthrough, see the [Interactive Setup](./configuration-interactive-setup.md) guide.

## Default Model Configuration

For project-wide consistency, you can define a default LLM in your project's `aigne.yaml` configuration file. This model will be used for all generation tasks unless a different one is specified with the `--model` flag in a command.

Here is an example of how to set a default model in your `aigne.yaml`:

```yaml
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

In this example, all documentation generation will default to using Google's `gemini-2.5-pro` model with a `temperature` setting of `0.8`.

---

With your LLM provider configured, you are ready to generate content in various languages. To see the full list of supported languages and how to enable them, proceed to the [Language Support](./configuration-language-support.md) guide.