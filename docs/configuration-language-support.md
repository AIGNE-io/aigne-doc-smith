# Language Support

AIGNE DocSmith uses AI to provide automated documentation translation into 12 languages. This allows you to generate and maintain documentation for a global audience using the `aigne doc translate` command.

The translation workflow processes your source documents through an AI engine to generate localized versions in your selected target languages.

```d2
direction: down

Source-Doc: {
  label: "Source Document\n(e.g., English)"
  shape: rectangle
}

AI-Engine: {
  label: "AIGNE DocSmith\nAI Translation Engine"
  shape: rectangle
}

Translated-Docs: {
  label: "Translated Documents"
  shape: rectangle
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

DocSmith offers AI-powered translations for the following languages. You can define your project's primary language during the initial setup and select any number of target languages for translation.

| Language | Language Code | Sample Text |
|---|---|---|
| English | `en` | Hello |
| 简体中文 | `zh` | 你好 |
| 繁體中文 | `zh-TW` | 你好 |
| 日本語 | `ja` | こんにちは |
| 한국어 | `ko` | 안녕하세요 |
| Español | `es` | Hola |
| Français | `fr` | Bonjour |
| Deutsch | `de` | Hallo |
| Português | `pt` | Olá |
| Русский | `ru` | Привет |
| Italiano | `it` | Ciao |
| العربية | `ar` | مرحبا |

## How to Configure and Use Translation

Translation languages are set when you initialize your project with `aigne doc init`. You can add new languages or translate documents at any time using the `aigne doc translate` command, which has two modes of operation.

### Interactive Mode for Guided Translation

For a step-by-step guided experience, run the command without any arguments. This is the recommended approach for most users.

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

The interactive mode will then present a series of prompts that allow you to:

1.  Select which of your existing documents to translate from a list.
2.  Choose one or more target languages from the supported list.
3.  Add new translation languages to your project's configuration if they are not already included.

### Command-Line Arguments for Automation

For direct control or for use in automated scripts, you can specify documents and languages directly as command-line arguments. This is ideal for developers and CI/CD pipelines.

```bash Command Example icon=lucide:terminal
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

Key parameters for the command include:

| Parameter | Description |
|---|---|
| `--langs` | Specify a target language code. This flag can be used multiple times to select several languages. |
| `--docs` | Specify the path to a document to translate (e.g., `overview.md`). This can also be used multiple times. |
| `--feedback` | Provide specific instructions to guide the translation model (e.g., `"Use a formal tone"`). |
| `--glossary` | Use a custom glossary file (e.g., `@path/to/glossary.md`) to ensure consistent translation of project-specific terms. |

---

This section covers the available languages and how to enable them. For a complete guide on the translation workflow, see the [Translate Documentation](./features-translate-documentation.md) guide.