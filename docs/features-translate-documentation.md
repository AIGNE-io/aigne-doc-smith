---
labels: ["Reference"]
---

# Translate Documentation

AIGNE DocSmith helps you reach a global audience by automatically translating your documentation into over 12 languages. This feature streamlines the localization process, ensuring your content is accessible to users worldwide with a single command.

## Easy Translation with Interactive Mode

For a guided experience, the simplest way to start is by running the `translate` command without any arguments:

```bash
aigne doc translate
```

This will launch an interactive wizard that walks you through the process:

1.  **Select Documents to Translate:** You'll be presented with a list of your existing documents. Simply choose the ones you want to translate.

    ![Select documents to translate](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **Choose Target Languages:** After selecting your documents, you can pick one or more target languages from the list of supported options.

    ![Select languages to translate into](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **Confirm and Run:** DocSmith will then handle the translation, generating new versions of your selected files for each language.

## Advanced Control with Command-Line Flags

For automation or more specific tasks, you can use command-line flags to control the translation process directly. This is ideal for integrating into CI/CD pipelines or for power users who prefer the command line.

Here are the primary options available:

| Parameter | Description |
|---|---|
| `--langs` | Specify one or more target languages. This flag can be used multiple times (e.g., `--langs zh --langs ja`). |
| `--docs` | Specify the paths of the documents to translate. This flag can also be used multiple times. |
| `--feedback` | Provide feedback to the AI to improve the quality of future translations (e.g., `--feedback "Use formal tone"`). |
| `--glossary` | Use a glossary file in markdown format to ensure consistent terminology for specific terms (e.g., `--glossary @path/to/glossary.md`). |

### Example: Translating Specific Documents

To translate `overview.md` and `examples.md` into Chinese and Japanese, you would run:

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

### Example: Using a Glossary and Feedback

To ensure brand names and technical terms are translated correctly, you can provide a glossary file. You can also give feedback to refine the translation style.

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

## Supported Languages

DocSmith supports automatic translation for the following languages:

| Language | Code |
|---|---|
| English | en |
| Simplified Chinese | zh-CN |
| Traditional Chinese | zh-TW |
| Japanese | ja |
| Korean | ko |
| Spanish | es |
| French | fr |
| German | de |
| Portuguese | pt-BR |
| Russian | ru |
| Italian | it |
| Arabic | ar |

---

Once your documentation is translated, you're ready to share it with the world. Learn how in the next section.

<x-card data-title="Next: Publish Your Docs" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="Read More">
  A guide on how to easily publish your documentation to a public platform or your own private website.
</x-card>