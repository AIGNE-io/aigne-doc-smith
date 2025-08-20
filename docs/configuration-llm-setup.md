---
labels: ["Reference"]
---

# LLM Setup

AIGNE DocSmith utilizes Large Language Models (LLMs) to generate the content for your documentation. You can configure DocSmith to use different AI models, giving you control over the quality, style, and cost of content generation. 

This guide covers the primary ways to set up your LLM provider.

## Using AIGNE Hub (Recommended)

The most straightforward method is to use AIGNE Hub. This approach allows you to access a variety of models from different providers without needing to supply your own API keys. It's the recommended choice for most users due to its simplicity and flexibility.

**Key Benefits:**
- **No API Key Required:** You can start generating documentation immediately without any complex setup.
- **Easy Model Switching:** You can easily switch between different large language models from providers like Google, Anthropic, and OpenAI directly from the command line.

To use a specific model for a generation task, simply use the `--model` flag with the `aigne doc generate` command. This allows you to experiment with different models to see which one produces the best results for your project.

### Command Examples

Here’s how you can select different models on the fly:

```bash
# Generate documentation using Google's Gemini 2.5 Flash model
aigne doc generate --model google:gemini-2.5-flash

# Generate documentation using Anthropic's Claude 3.5 Sonnet model
aigne doc generate --model claude:claude-3-5-sonnet

# Generate documentation using OpenAI's GPT-4o model
aigne doc generate --model openai:gpt-4o
```

If you run the generate command without the `--model` flag, DocSmith will use the default model configured through AIGNE Hub.

## Using Custom API Keys

Alternatively, DocSmith supports the use of custom API keys if you prefer to use your personal or enterprise accounts with providers like OpenAI, Anthropic, and others. This gives you more direct control over your API usage and billing.

---

With your LLM configured, you are ready to control another powerful aspect of DocSmith: multi-language output. To learn more, proceed to the [Language Support](./configuration-language-support.md) guide.