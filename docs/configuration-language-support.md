---
labels: ["Reference"]
---

# Language Support

AIGNE DocSmith is designed for a global audience, offering automated translation capabilities for over a dozen languages. This allows you to generate and maintain documentation in multiple languages with minimal effort, ensuring your project is accessible to users worldwide. The entire translation process is handled by the `aigne doc translate` command.

### Translation Workflow

The translation process takes your source documents, processes them through the AIGNE AI engine, and generates high-quality versions in your specified target languages.

```d2
direction: down

Source-Doc: {
  label: "Source Document\n(e.g., English)"
  shape: document
}

AI-Engine: {
  label: "AIGNE DocSmith\nAI Translation Engine"
  shape: hexagon
}

Translated-Docs: {
  label: "Translated Documents"
  shape: package
  grid-columns: 3

  zh: "简体中文"
  ja: "日本語"
  es: "Español"
  fr: "Français"
  de: "Deutsch"
  more: "..."
}

Source-Doc -> AI-Engine: "`aigne doc translate`"
AI-Engine -> Translated-Docs: "Generates"
```

## Supported Languages

DocSmith provides AI-powered translations for the following languages. You can select your primary documentation language and any number of target languages for translation during the project setup or at any time afterward.

| Language | Language Code |
|---|---|
| English (en) | `en` |
| 简体中文 (zh) | `zh` |
| 繁體中文 (zh-TW) | `zh-TW` |
| 日本語 (ja) | `ja` |
| 한국어 (ko) | `ko` |
| Español (es) | `es` |
| Français (fr) | `fr` |
| Deutsch (de) | `de` |
| Português (pt) | `pt` |
| Русский (ru) | `ru` |
| Italiano (it) | `it` |
| العربية (ar) | `ar` |

## How to Enable and Use Translation

While translation languages are typically configured when you first initialize your project with `aigne doc init`, you can easily add new languages or translate documents at any time using the `aigne doc translate` command.

### Interactive Mode for Easy Translation

The simplest way to translate your documents is by running the command without any arguments. This launches an interactive wizard suitable for all users.

```bash
aigne doc translate
```

The interactive mode will guide you through:

- Selecting which existing documents you want to translate.
- Choosing target languages from the supported list.
- Adding new translation languages to your project's configuration if needed.

### Command-Line for Automation

For developers who need more direct control or want to include translation in automated scripts (like CI/CD pipelines), you can specify documents and languages as command-line arguments.

```bash
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

Key parameters include:

- `--langs`: Specify a target language code. You can use this flag multiple times for multiple languages.
- `--docs`: Specify the path to a document you want to translate. This can also be used multiple times.
- `--feedback`: Provide specific instructions to improve the quality of the translation (e.g., "Use formal tone").
- `--glossary`: Use a custom glossary file (`@path/to/glossary.md`) to ensure consistent terminology for your project's specific terms.

---

With this multi-language support, you can effectively reach a broader audience. For a more detailed walkthrough of the translation workflow and its advanced features, see the [Translate Documentation](./features-translate-documentation.md) guide.