---
labels: ["Reference"]
---

# Language Support

AIGNE DocSmith is designed to help you reach a global audience by providing built-in support for automatic documentation translation. You can generate and maintain documentation in over a dozen languages directly from a single source.

## Supported Languages

DocSmith supports a wide range of languages for translation. When using the `translate` command, you can specify any of the following language codes as your target.

| Language | Code | Native Name |
|---|---|---|
| English | `en` | English |
| Simplified Chinese | `zh` | 简体中文 |
| Traditional Chinese | `zh-TW` | 繁體中文 |
| Japanese | `ja` | 日本語 |
| Korean | `ko` | 한국어 |
| Spanish | `es` | Español |
| French | `fr` | Français |
| German | `de` | Deutsch |
| Portuguese | `pt` | Português |
| Russian | `ru` | Русский |
| Italian | `it` | Italiano |
| Arabic | `ar` | العربية |

## Enabling and Using Translations

There is no complex setup required to enable a language. You can start translating your documents immediately using the `aigne doc translate` command. 

### Interactive Translation

For an easy, guided experience, simply run the command without any arguments. This will launch an interactive wizard that allows you to:

1.  Select which of your existing documents you want to translate.
2.  Choose one or more target languages from the supported list.
3.  Add new translation languages to your project's configuration for future use.

```bash
# Start the interactive translation wizard
aigne doc translate
```

### Command-Line Translation

If you prefer to work from the command line directly, you can specify the documents and target languages using flags. You can use the `--langs` flag multiple times to translate into several languages at once.

```bash
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

To ensure consistent terminology across translations, especially for technical terms, you can provide a glossary file.

```bash
# Translate with a custom glossary for consistent terminology
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

This section provides an overview of the languages DocSmith supports. To learn more about the translation workflow and all available command options, please see the [Translate Documentation](./features-translate-documentation.md) guide.