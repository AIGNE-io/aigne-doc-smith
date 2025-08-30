---
labels: ["Reference"]
---

# LLM Setup

AIGNE DocSmith leverages Large Language Models (LLMs) to generate high-quality documentation. You can configure DocSmith to use different AI models through two primary methods: the recommended AIGNE Hub service or by providing your own custom API keys.

This guide will walk you through both options.

## Using AIGNE Hub (Recommended)

The most straightforward way to use LLMs with DocSmith is through AIGNE Hub. This approach offers significant advantages:

- **No API Key Required:** You don't need to sign up for separate AI services or manage your own API keys.
- **Easy Model Switching:** You can switch between different state-of-the-art models from providers like Google, Anthropic, and OpenAI with a simple command-line flag.

To specify a model, use the `--model` flag with the `generate` command. DocSmith will handle the API requests through the AIGNE Hub.

### Examples

Here are some examples of how to generate documentation using different models available via AIGNE Hub:

**Using Google's Gemini 1.5 Flash:**
```bash
aigne doc generate --model google:gemini-2.5-flash
```

**Using Anthropic's Claude 3.5 Sonnet:**
```bash
aigne doc generate --model claude:claude-3-5-sonnet
```

**Using OpenAI's GPT-4o:**
```bash
aigne doc generate --model openai:gpt-4o
```

## Configuring Custom API Keys

If you prefer to use your own API keys for providers like OpenAI or Anthropic, you can configure them using the interactive setup wizard.

Run the `init` command to launch the wizard, which will guide you through setting up your LLM provider and credentials, among other project settings.

```bash
# Launch the interactive configuration wizard
aigne doc init
```

This process ensures your keys are stored correctly for all subsequent documentation generation and update tasks.

## How It Works

The following diagram illustrates how DocSmith processes requests with different LLM configurations.

```d2
direction: down

User: {
  shape: person
  label: "Developer"
}

CLI: "`aigne doc generate`"

DocSmith: {
  shape: package
  "Configuration Check": {
    "AIGNE Hub (Default)": "No API Key Needed"
    "Custom Provider": "User API Key Found"
  }
}

LLM_Providers: {
  label: "LLM Providers"
  shape: cloud
  "AIGNE Hub": "Manages access to multiple models"
  "Direct API (e.g., OpenAI)": "Uses custom key"
}

User -> CLI: "Runs command"
CLI -> DocSmith: "Initiates process"
DocSmith."Configuration Check"."AIGNE Hub (Default)" -> LLM_Providers."AIGNE Hub" : "Routes request via Hub"
DocSmith."Configuration Check"."Custom Provider" -> LLM_Providers."Direct API (e.g., OpenAI)" : "Routes request with user's key"

```

---

With your LLM provider configured, you are ready to customize language settings for your documentation. Learn more in the [Language Support](./configuration-language-support.md) guide.