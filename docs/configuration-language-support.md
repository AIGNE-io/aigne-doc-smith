---
labels: ["Reference"]
---

# Language Support

AIGNE DocSmith is designed to help your project reach a global audience by providing powerful, AI-driven translation capabilities. It can automatically translate your documentation into over a dozen languages, ensuring that users from different regions can understand and use your work effectively.

This guide provides a complete list of all supported languages and explains how to enable and manage translations for your project.

## Supported Languages

DocSmith supports a wide range of languages for automatic translation. The table below lists all currently available languages along with their corresponding language codes, which are used in the configuration and command-line interface.

| Language | Code |
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

You can configure languages during the initial project setup or add them later. The primary tool for translation is the `aigne doc translate` command.

### During Initial Setup

When you first run `aigne doc init` or `aigne doc generate` in a new project, you'll enter an interactive setup wizard. The wizard will prompt you to:

1.  Select a **primary language** for your documentation.
2.  Choose one or more **additional languages** for translation from the supported list.

Your selections are saved in the project's configuration file, making them available for future translation tasks.

### Using the `translate` Command

Once your languages are configured, you can translate your documents using the `aigne doc translate` command.

#### Interactive Mode

For a user-friendly, guided experience, simply run the command without any arguments. This is ideal for most users.

```bash Interactive Translation icon=lucide:mouse-pointer-click
aigne doc translate
```

This will launch an interactive menu that allows you to:
- Select which of your existing documents you want to translate.
- Choose the target languages from your configured list.
- Add new languages to your project configuration if needed.

#### Command-Line Mode

For scripting, automation, or more advanced control, you can specify all options as arguments. This is particularly useful for developers and in CI/CD pipelines.

```bash Translate Specific Documents icon=lucide:terminal
# Translate overview.md and examples.md into Chinese and Japanese
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

You can also provide feedback or a glossary to improve the quality and consistency of the translation.

```bash Translation with a Glossary icon=lucide:book-check
# Use a glossary file for consistent terminology
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

### Key Command Parameters

| Parameter | Description |
|---|---|
| `--langs` | Specify a target language code. You can use this option multiple times for multiple languages. |
| `--docs` | Specify the path to a document to translate. You can use this option multiple times. |
| `--feedback` | Provide feedback to the AI to improve the translation quality. |
| `--glossary` | Provide a path to a glossary file (e.g., `@path/to/glossary.md`) to ensure consistent terminology. |

---

With DocSmith's built-in translation features, maintaining multi-language documentation becomes a seamless part of your development workflow. To dive deeper into the translation process with more detailed examples, see the [Translate Documentation](./features-translate-documentation.md) guide.