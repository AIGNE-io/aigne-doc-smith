---
labels: ["Reference"]
---

# Language Support

AIGNE DocSmith is designed to help your project reach a global audience by providing powerful, AI-driven translation capabilities. You can automatically translate your documentation into more than 12 languages, ensuring that users around the world can understand and use your work.

This guide will show you the full list of supported languages and how to use the translation commands.

## Supported Languages

DocSmith offers automatic translation for the following languages. You can use the corresponding language code when running translation commands.

| Language | Code |
|---|---|
| English (en) | `en` |
| 简体中文 (zh-CN) | `zh-CN` |
| 繁體中文 (zh-TW) | `zh-TW` |
| 日本語 (ja) | `ja` |
| 한국어 (ko) | `ko` |
| Español (es) | `es` |
| Français (fr) | `fr` |
| Deutsch (de) | `de` |
| Português (pt-BR) | `pt-BR` |
| Русский (ru) | `ru` |
| Italiano (it) | `it` |
| العربية (ar) | `ar` |

## How to Translate Your Documentation

You can translate your documents using a simple command. There are two main ways to approach this: an interactive mode for ease of use and a direct command for more specific tasks.

### Interactive Translation (Recommended for Beginners)

If you're not sure which files to translate or what languages to choose, the interactive mode is the best place to start. Simply run the command without any options:

```bash
aigne doc translate
```

When you run this command, DocSmith will present you with an interactive menu that guides you through the process:
1.  **Select Documents:** You'll see a list of your existing documents to choose from.
2.  **Choose Languages:** You can select one or more of the 12+ supported languages.
3.  **Add Languages:** If you select a language not yet in your project's configuration, DocSmith will ask if you want to add it for future use.

### Translating Specific Documents

If you already know which documents you want to translate and to which languages, you can provide the details directly in the command. This is useful for automating translation tasks.

Use the `--docs` flag for each document path and the `--langs` flag for each target language code.

For example, to translate `overview.md` and `examples.md` into Chinese (zh) and Japanese (ja), you would run:

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

### Improving Translation Accuracy

For advanced use cases where translation accuracy is critical, you can use a glossary to ensure consistent terminology for your project's specific terms.

-   `--glossary`: Specify a glossary file to maintain consistent translations for technical or branded terms.
-   `--feedback`: Provide specific instructions to the AI to refine the translation style or tone.

**Example with a glossary:**

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

With your documentation now ready for a global audience, you may want to explore more advanced ways to manage your project. For more information, see the [Advanced Topics](./advanced.md) section.