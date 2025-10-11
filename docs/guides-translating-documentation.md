# Translating Documentation

This guide provides instructions on how to translate your generated documentation into multiple languages using the `aigne doc translate` command. The process uses AI to ensure translations are contextually aware and maintain technical accuracy.

The tool supports 12 languages, allowing you to reach a global audience. The primary language of your source documents will be automatically excluded from the list of available translation languages.

## The `translate` Command

The `aigne doc translate` command is used to generate translations for your existing documentation files. You can run it interactively to select which documents and languages you want, or you can specify these options directly using command-line flags for automated workflows.

### Interactive Mode

For a guided experience, run the command without any arguments:

```bash
aigne doc translate
```

When executed, the tool will perform the following steps:
1.  Scan for existing documents.
2.  Prompt you to select the specific documents you wish to translate from a list.
3.  Prompt you to select the target languages for translation. Previously selected languages will be pre-checked for convenience.
4.  Begin the translation process for each selected document and language pair.
5.  Save the translated files in the appropriate language-specific directories.

### Command-Line Options

For non-interactive use or scripting, you can use the following command-line flags to control the translation process.

<x-field-group>
  <x-field data-name="--docs" data-type="array<string>">
    <x-field-desc markdown>Specify one or more document paths to translate. If not provided, the tool will enter interactive mode to let you select from a list of available documents.</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array<string>">
    <x-field-desc markdown>Specify one or more target language codes (e.g., `zh`, `ja`). If omitted, you will be prompted to select languages interactively.</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string">
    <x-field-desc markdown>Provide a path to a glossary file (e.g., `@path/to/glossary.md`). This ensures that specific technical terms are translated consistently across all documents.</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string">
    <x-field-desc markdown>Provide specific instructions or feedback to guide the AI's translation style, such as adjusting the tone or terminology.</x-field-desc>
  </x-field>
</x-field-group>

### Usage Examples

#### 1. Translate Specific Documents into Multiple Languages

To translate `overview.md` and `examples.md` into Chinese (`zh`) and Japanese (`ja`) without interactive prompts:

```bash
aigne doc translate --docs overview.md --docs examples.md --langs zh --langs ja
```

#### 2. Use a Glossary for Consistent Terminology

To ensure technical terms are translated correctly, provide a glossary file. This is useful for maintaining consistency for brand names or specialized vocabulary.

```bash
aigne doc translate --glossary @./glossary.md
```

#### 3. Provide Feedback to Refine Translation Style

You can guide the translation style by providing feedback. For instance, to request a more formal tone:

```bash
aigne doc translate --feedback "Use a formal, technical tone for all translations."
```

This feedback will be recorded in the history for the updated documents.

## Supported Languages

The tool provides translation support for 12 languages. The native language of the documentation is English (`en`).

| Language | Code |
| :--- | :--- |
| Chinese (Simplified) | `zh` |
| Chinese (Traditional)| `zh-TW`|
| Japanese | `ja` |
| Korean | `ko` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |
| Portuguese | `pt` |
| Russian | `ru` |
| Italian | `it` |
| Arabic | `ar` |

## Summary

The `translate` command offers a structured method for localizing your documentation. You can use its interactive mode for guided translations or command-line options for automated workflows. Using features like glossaries and feedback helps maintain the quality and consistency of the translated content.

After translating your documents, you can proceed to [Publishing Your Docs](./guides-publishing-your-docs.md).