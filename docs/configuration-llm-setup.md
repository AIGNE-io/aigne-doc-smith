---
labels: ["Reference"]
---

# LLM Setup

AIGNE DocSmith leverages the power of Large Language Models (LLMs) to generate high-quality documentation. You have the flexibility to choose from various LLM providers to best suit your project's needs. This guide will walk you through the available configuration options.

## AIGNE Hub (Recommended)

The simplest and most recommended way to configure your LLM is through AIGNE Hub. This integrated service acts as a gateway to multiple state-of-the-art models without requiring you to manage your own API keys.

**Key Benefits:**

- **No API Key Required:** Start generating documentation immediately without signing up for third-party AI services.
- **Easy Model Switching:** Effortlessly switch between different LLMs using a simple command-line flag to find the best fit for your content style and complexity.

To use a specific model via AIGNE Hub, simply use the `--model` flag with the `aigne doc generate` command. This allows you to experiment with different models on-the-fly.

```bash Using AIGNE Hub with different models icon=lucide:terminal
# Generate documentation using Google's Gemini 1.5 Flash
aigne doc generate --model google:gemini-2.5-flash

# Generate documentation using Anthropic's Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# Generate documentation using OpenAI's GPT-4o
aigne doc generate --model openai:gpt-4o
```

## Using Custom API Keys

If you prefer to use your own API keys for providers like OpenAI, Anthropic, or others, DocSmith supports this as well. You can configure your custom keys during the project setup using the interactive configuration wizard.

To set up your custom API keys, run the `init` command:

```bash Start Interactive Configuration icon=lucide:terminal
aigne doc init
```

The wizard will guide you through selecting your preferred LLM provider and entering the necessary credentials. For a complete walkthrough of the guided setup, please see the [Interactive Setup](./configuration-interactive-setup.md) guide.

---

With your LLM configured, you're ready to start creating documentation. Learn more about the core generation process in the [Generate Documentation](./features-generate-documentation.md) section.