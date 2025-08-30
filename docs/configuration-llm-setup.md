---
labels: ["Reference"]
---

# LLM Setup

DocSmith is designed to work with various Large Language Models (LLMs) to generate your documentation content. You have the flexibility to choose the model that best suits your needs. Configuration can be handled in two primary ways: using the integrated AIGNE Hub service or by providing your own custom API keys.

## Using AIGNE Hub (Recommended)

The simplest and recommended method for connecting to an LLM is through AIGNE Hub. This approach offers significant advantages:

- **No API Key Required:** You don't need to sign up for separate AI services or manage your own API keys.
- **Easy Model Switching:** You can easily switch between different LLMs from leading providers directly via the command line, allowing you to experiment and find the best model for your project.

To specify a model from AIGNE Hub, use the `--model` flag with the `generate` command. 

### Examples

Here are a few examples of how to generate documentation using different models available through AIGNE Hub:

```bash
# Using Google's Gemini 2.5 Flash
aigne doc generate --model google:gemini-2.5-flash

# Using Anthropic's Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# Using OpenAI's GPT-4o
aigne doc generate --model openai:gpt-4o
```


## Using Custom API Keys

If you prefer to use your own API keys for services like OpenAI, Anthropic, or others, you can configure them during the setup process. DocSmith will prompt you for your API keys when you run the interactive configuration wizard.

To set up or modify your LLM provider settings with custom keys, run the `init` command:

```bash
aigne doc init
```

This will guide you through all necessary configuration steps, including selecting your LLM provider and entering the corresponding API key. For more detailed information on the setup wizard, see the [Configuration Guide](./configuration.md).
