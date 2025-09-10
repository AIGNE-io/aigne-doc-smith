# Translate Documentation

AIGNE DocSmith helps you reach a global audience by translating your documentation into 12 languages. This process can be managed through a simple interactive wizard or automated with command-line arguments for advanced control.

### Translation Workflow

The `aigne doc translate` command offers two primary modes of operation: interactive for a guided setup and command-line for automation.

```d2
direction: down

start: {
  label: "Run 'aigne doc translate'"
  shape: rectangle
}

interactive_vs_cli: {
  label: "With or without\narguments?"
  shape: diamond
}

interactive_path: {
  label: "Interactive Mode"
  shape: rectangle

  select_docs: {
    label: "1. Select Documents"
    shape: rectangle
  }
  select_langs: {
    label: "2. Choose Languages"
    shape: rectangle
  }
  select_docs -> select_langs
}

cli_path: {
  label: "CLI Mode"
  shape: rectangle

  flags: {
    label: "Provide arguments\n--docs, --langs, etc."
    shape: rectangle
  }
}

ai_translation: {
  label: "AI-Powered Translation"
  shape: rectangle
}

end: {
  label: "Translated Documents\nSaved"
  shape: rectangle
}

start -> interactive_vs_cli
interactive_vs_cli -> interactive_path: "Without args"
interactive_vs_cli -> cli_path: "With args"
interactive_path -> ai_translation
cli_path -> ai_translation
ai_translation -> end
```

## Interactive Translation

For a guided experience, run the `translate` command without any arguments:

```bash
aigne doc translate
```

This launches an interactive wizard that guides you through the process:

1.  **Select Documents to Translate:** You will be presented with a list of your existing documents. Use the spacebar to select the ones you want to translate.

    ![Select documents to translate](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **Choose Target Languages:** After selecting your documents, pick one or more target languages from the list of supported options.

    ![Select languages to translate into](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **Confirm and Run:** DocSmith will then process the translation, generating new versions of your selected files for each chosen language.

## Command-Line Translation

For automation or more specific tasks, you can use command-line flags to control the translation process. This method is suitable for integration into CI/CD pipelines.

Here are the primary options available:

| Parameter | Description |
|---|---|
| `--langs` | Specify one or more target languages. This flag can be used multiple times (e.g., `--langs zh --langs ja`). |
| `--docs` | Specify the paths of the documents to translate. This flag can also be used multiple times. |
| `--feedback` | Provide suggestions to the AI to improve the quality of future translations (e.g., `--feedback "Use a formal tone"`). |
| `--glossary` | Use a glossary file in Markdown format to ensure consistent terminology for specific terms (e.g., `--glossary @path/to/glossary.md`). |

### Example: Translating Specific Documents

To translate `overview.md` and `examples.md` into Chinese and Japanese, run:

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

Once your documentation is translated, you are ready to share it with the world.

<x-card data-title="Next: Publish Your Docs" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="Read More">
  A guide on how to easily publish your documentation to a public platform or your own private website.
</x-card>