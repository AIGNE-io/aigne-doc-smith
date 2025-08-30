---
labels: ["Reference"]
---

# Translate Documentation

Reach a global audience by automatically translating your documentation into multiple languages. AIGNE DocSmith simplifies this process with the `aigne doc translate` command, which can be run interactively or with specific command-line options for automation.

### Interactive Translation

For the most straightforward approach, you can run the command without any arguments. This will launch an interactive wizard that guides you through the process.

```bash
aigne doc translate
```

The interactive mode will prompt you to:
1.  **Select documents to translate:** You'll be presented with a list of your existing documents to choose from.

    ![Select documents to translate](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **Choose target languages:** Select one or more of the 12+ supported languages for translation.

    ![Select languages to translate](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

This mode is ideal when you want to visually confirm your choices before starting the translation process.

### Command-Line Translation

For scripting or more specific needs, you can use command-line parameters to define the translation task directly.

#### Command Parameters

| Parameter | Description |
| --- | --- |
| `--langs` | Specify a target language. This option can be used multiple times to select several languages (e.g., `--langs zh --langs ja`). |
| `--docs` | Specify a document path to translate. This can also be used multiple times to select several documents. |
| `--feedback` | Provide specific instructions to guide and improve the quality of the translation. |
| `--glossary` | Use a glossary file for consistent terminology. The path should be prefixed with `@` (e.g., `--glossary @path/to/glossary.md`). |

#### Examples

**Translate Specific Documents to Multiple Languages**

This command translates `examples.md` and `overview.md` into Chinese and Japanese.
```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

**Translate with a Custom Glossary**

This command uses a glossary file to ensure brand names and technical terms are translated consistently, along with feedback to guide the tone.
```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

### Supported Languages

DocSmith provides automatic translation for the following languages:

| Language | Code |
| --- | --- |
| English | en |
| 简体中文 (Simplified Chinese) | zh-CN |
| 繁體中文 (Traditional Chinese) | zh-TW |
| 日本語 (Japanese) | ja |
| 한국어 (Korean) | ko |
| Español (Spanish) | es |
| Français (French) | fr |
| Deutsch (German) | de |
| Português (Portuguese) | pt-BR |
| Русский (Russian) | ru |
| Italiano (Italian) | it |
| العربية (Arabic) | ar |

---

Once your documentation is translated, the next step is to make it available to your audience. Learn how in the [Publish Your Docs](./features-publish-your-docs.md) guide.