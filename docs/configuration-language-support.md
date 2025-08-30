---
labels: ["Reference"]
---

# Language Support

AIGNE DocSmith is designed for a global audience, offering automated translation capabilities for over a dozen languages. This allows you to generate and maintain documentation in multiple languages with minimal effort, ensuring your project is accessible to users worldwide. The translation feature is powered by the `aigne doc translate` command.

## Supported Languages

DocSmith provides high-quality, AI-powered translations for the following languages. You can select your primary documentation language and any number of target languages for translation during the project setup.

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

Translation languages are typically configured when you first initialize your project using `aigne doc init`. However, you can easily add new languages or translate documents at any time using the `aigne doc translate` command.

### Interactive Mode

The simplest way to translate your documents is by running the command without any arguments. This will launch an interactive wizard.

```bash
aigne doc translate
```

The interactive mode will guide you through:

- Selecting which existing documents you want to translate.
- Choosing target languages from the supported list.
- Adding new translation languages to your project's configuration.

### Command-Line Mode

For automation or more direct control, you can specify documents and languages as command-line arguments. This is ideal for use in scripts or CI/CD environments.

```bash
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

Key parameters include:

- `--langs`: Specify a target language code. You can use this flag multiple times for multiple languages.
- `--docs`: Specify the path to a document you want to translate. This can also be used multiple times.
- `--feedback`: Provide specific instructions to improve the quality of the translation.
- `--glossary`: Use a custom glossary file to ensure consistent terminology.

---

Now that you know which languages are supported and how to enable them, you can start reaching a broader audience. For a more detailed walkthrough of the translation workflow and its advanced features, see the [Translate Documentation](./features-translate-documentation.md) guide.