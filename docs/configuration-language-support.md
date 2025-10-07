# Language Support

AIGNE DocSmith provides automated documentation translation into 12 languages, enabling you to generate and maintain localized content for a global audience. This functionality is primarily managed through the `aigne doc translate` command.

The translation workflow uses an AI engine to process your source documents and generate versions in your selected target languages. The `aigne doc translate` command offers an interactive interface to guide you through selecting documents and languages for translation.

![Interactive document translation flow](../assets/screenshots/doc-translate.png)

## Supported Languages

DocSmith supports AI-powered translations for the following languages. Your project's primary language can be defined during the initial setup with `aigne doc init`, and you can select any number of the following languages for translation.

| Language | Language Code |
|---|---|
| English | `en` |
| 简体中文 | `zh` |
| 繁體中文 | `zh-TW` |
| 日本語 | `ja` |
| 한국어 | `ko` |
| Español | `es` |
| Français | `fr` |
| Deutsch | `de` |
| Português | `pt` |
| Русский | `ru` |
| Italiano | `it` |
| العربية | `ar` |

## How to Configure and Use Translation

Language settings are configured when you initialize a project. You can add new languages or translate existing documents at any time using the `aigne doc translate` command, which supports two operational modes.

### Interactive Mode for Guided Translation

For a step-by-step guided process, run the command without any arguments. This method is recommended for most users.

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

The interactive mode presents a series of prompts, allowing you to select which documents to translate and choose your target languages from a list. This mode also allows you to add new translation languages to your project's configuration if they are not already included.

![Selecting target languages for translation](../assets/screenshots/doc-translate-langs.png)

### Command-Line Arguments for Automation

For direct control or for use in automated scripts, you can specify documents and languages as command-line arguments. This method is suitable for integration into CI/CD pipelines.

```bash Command Example icon=lucide:terminal
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

The following table details the key parameters for the `translate` command:

| Parameter | Description |
|---|---|
| `--langs` | Specifies a target language code. This flag can be used multiple times to select several languages. |
| `--docs` | Specifies the path to a document to translate (e.g., `overview.md`). This flag can also be used multiple times. |
| `--feedback` | Provides specific instructions to guide the translation model (e.g., `"Use a formal tone"`). |
| `--glossary` | Uses a custom glossary file (e.g., `@path/to/glossary.md`) to ensure consistent translation of project-specific terms. |

---

This section provides an overview of the available languages and how to enable them. For a complete guide on the translation workflow, refer to the [Translate Documentation](./features-translate-documentation.md) guide.