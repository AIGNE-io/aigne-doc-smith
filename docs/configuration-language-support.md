# Language Support

AIGNE DocSmith uses AI to provide automated documentation translation into 12 languages. This feature enables you to generate and maintain documentation for a global audience using the `aigne doc translate` command.

The translation workflow processes your source documents through an AI engine to generate localized versions in your selected target languages.

```d2
direction: down

Developer: {
  shape: c4-person
}

Source-Documents: {
  label: "Source Documents\n(Primary Language)"
  shape: rectangle
}

AIGNE-CLI: {
  label: "`aigne doc translate`"
  shape: rectangle
}

AI-Engine: {
  label: "AI Translation Engine"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Translated-Documents: {
  label: "Translated Documents\n(Target Languages)"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. Runs command"
AIGNE-CLI -> Source-Documents: "2. Reads content"
AIGNE-CLI -> AI-Engine: "3. Sends for translation"
AI-Engine -> AIGNE-CLI: "4. Returns translations"
AIGNE-CLI -> Translated-Documents: "5. Writes localized files"
```

## Supported Languages

DocSmith offers AI-powered translations for the following languages. You can define your project's primary language during the initial setup with `aigne doc init` and select any number of target languages for translation.

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

Translation languages are configured when you initialize your project. You can add new languages or translate documents at any time using the `aigne doc translate` command, which supports two modes of operation.

### Interactive Mode for Guided Translation

For a step-by-step guided experience, run the command without any arguments. This is the recommended approach for most users.

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

The interactive mode will present a series of prompts that allow you to:

1.  Select which of your existing documents to translate from a list.
2.  Choose one or more target languages from the supported list.
3.  Add new translation languages to your project's configuration if they are not already included.

### Command-Line Arguments for Automation

For direct control or for use in automated scripts, you can specify documents and languages as command-line arguments. This method is ideal for developers and for integration into CI/CD pipelines.

```bash Command Example icon=lucide:terminal
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

Key parameters for the `translate` command include:

| Parameter | Description |
|---|---|
| `--langs` | Specify a target language code. This flag can be used multiple times to select several languages. |
| `--docs` | Specify the path to a document to translate (e.g., `overview.md`). This can also be used multiple times. |
| `--feedback` | Provide specific instructions to guide the translation model (e.g., `"Use a formal tone"`). |
| `--glossary` | Use a custom glossary file (e.g., `@path/to/glossary.md`) to ensure consistent translation of project-specific terms. |

---

This section covers the available languages and how to enable them. For a complete guide on the translation workflow, see the [Translate Documentation](./features-translate-documentation.md) guide.