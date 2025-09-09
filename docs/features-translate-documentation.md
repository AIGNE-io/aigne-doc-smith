---
labels: ["Reference"]
---

# Translate Documentation

AIGNE DocSmith breaks down language barriers, allowing you to automatically translate your documentation into over 12 languages. This powerful feature helps you reach a global audience with minimal effort, ensuring your content is accessible to users and developers worldwide.

## Translating with the Interactive Wizard

The easiest way to translate your documents is by using the interactive mode. Simply run the command without any arguments:

```bash Command icon=lucide:terminal
aigne doc translate
```

This will launch a step-by-step wizard that guides you through the process:

1.  **Select Documents:** You'll be presented with a list of your existing documents to choose from.

    ![Select documents to translate](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **Choose Languages:** Next, select one or more target languages from the list of supported options.

    ![Select languages for translation](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

DocSmith will then handle the translation and save the new language-specific files in your output directory.

## Translating via Command Line

For more control or for use in automated scripts, you can specify documents and languages directly using command-line arguments.

### Command Parameters

| Parameter | Description |
|---|---|
| `--langs` | Specify a target language. You can use this flag multiple times for multiple languages (e.g., `--langs zh --langs ja`). |
| `--docs` | Specify the path of a document to translate. Use this flag multiple times for multiple documents. |
| `--feedback` | Provide specific instructions or feedback to the AI to improve the quality of the translation. |
| `--glossary` | Use a glossary file for consistent terminology. The path should be prefixed with `@` (e.g., `--glossary @/path/to/glossary.md`). |

### Examples

**Translate specific documents into multiple languages:**

```bash Command icon=lucide:terminal
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

**Translate with a custom glossary and feedback:**

This is useful when you need to ensure specific technical terms are translated consistently and want to guide the AI's tone.

```bash Command icon=lucide:terminal
aigne doc translate --glossary @glossary.md --feedback "Use formal and technical terminology consistently" --docs overview.md --langs de
```

## Supported Languages

DocSmith supports automatic translation for the following languages:

| Language | Code |
|---|---|
| English | `en` |
| Simplified Chinese | `zh-CN` |
| Traditional Chinese | `zh-TW` |
| Japanese | `ja` |
| Korean | `ko` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |
| Portuguese | `pt-BR` |
| Russian | `ru` |
| Italian | `it` |
| Arabic | `ar` |

---

Now that you've learned how to make your documentation multilingual, the next step is to share it with the world. Learn how in the [Publish Your Docs](./features-publish-your-docs.md) guide.