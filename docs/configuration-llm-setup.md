# LLM Setup

AIGNE DocSmith uses Large Language Models (LLMs) to generate documentation content. Configuration of the AI model provider can be accomplished through two primary methods: utilizing the integrated AIGNE Hub or connecting your own custom API keys from a provider of your choice.

## AIGNE Hub (Recommended)

The most direct method for configuring the LLM is through AIGNE Hub. It functions as a gateway to multiple LLM providers, offering two main benefits:

- **No API Key Required:** You can generate documents without the need to manage your own API keys or service subscriptions.
- **Flexible Model Switching:** You can change the AI model for any command by using the `--model` flag.

To use a specific model through AIGNE Hub, append the `--model` flag to your command. The following examples demonstrate its usage:

```bash Using Different Models via AIGNE Hub icon=mdi:code-braces
# Use OpenAI's GPT-4o model
aigne doc generate --model openai:gpt-4o

# Use Anthropic's Claude 4.5 Sonnet model
aigne doc generate --model anthropic:claude-sonnet-4-5

# Use Google's Gemini 2.5 Pro model
aigne doc generate --model google:gemini-2.5-pro
```

If the `--model` flag is not specified, DocSmith will default to the model defined in your project's configuration file.

## Using Custom API Keys

For users who prefer to use their own accounts with providers such as OpenAI, Anthropic, or Google, DocSmith can be configured with personal API keys. This method provides direct control over API usage and billing.

Configuration is handled through an interactive wizard. To launch it, run the following command:

```bash Launching the Interactive Wizard icon=lucide:magic-wand
aigne doc init
```

The wizard will prompt you to select your provider and enter the necessary credentials. For a complete, step-by-step guide on this process, refer to the [Interactive Setup](./configuration-interactive-setup.md) documentation.

## Setting a Default Model

To maintain consistency across all documentation generation tasks, a default LLM can be set in your project's `aigne.yaml` configuration file. This model will be used for any command that does not explicitly include the `--model` flag.

The following is an example configuration:

```yaml aigne.yaml icon=mdi:file-code
chat_model:
  provider: google
  name: gemini-2.5-pro
  temperature: 0.8
```

In this example, DocSmith is configured to use Google's `gemini-2.5-pro` model with a `temperature` setting of `0.8` as the default for all generation tasks.

---

With the LLM provider configured, the next step is to manage language settings for your documentation. Proceed to the [Language Support](./configuration-language-support.md) guide to see the full list of supported languages and learn how to enable them.