# Translating Documentation

This guide provides instructions on how to translate your generated documentation into multiple languages using the `aigne doc translate` command. The process uses AI to ensure translations are contextually aware and maintain technical accuracy.

The tool supports 12 languages, such as Chinese, Japanese, and German, allowing you to make your documentation accessible to a global audience. The primary language of your source documents is automatically excluded from the list of available translation languages.

## The `translate` Command

The `aigne doc translate` command generates translations for your existing documentation files. You can run it in an interactive mode for a step-by-step process or specify options directly on the command line for faster, automated workflows.

### Interactive Mode

For a guided experience, run the command without any arguments. This is the recommended approach for new users.

```bash
aigne doc translate
```

When you run this command, the tool will guide you through the following steps:

1.  **Select Documents:** You will be prompted to choose the specific documents you wish to translate from a list of all available files in your project.

    ![Select documents to translate](../assets/screenshots/doc-translate.png)

2.  **Select Languages:** Next, you will be asked to select the target languages for translation. Any languages you have used before will be pre-selected to save time.

    ![Select languages for translation](../assets/screenshots/doc-translate-langs.png)

3.  **Process and Save:** The tool begins the translation process. Once complete, the translated files are saved in the same directory as the original files. The new files are named by adding a language code to the original filename. For example, a Chinese translation of `overview.md` will be saved as `overview.zh.md`.

### Command-Line Options

For non-interactive use or scripting, you can use command-line flags to control the translation process. This method is efficient when you already know which files and languages you need.

<x-field-group>
  <x-field data-name="--docs" data-type="array<string>">
    <x-field-desc markdown>Specify one or more document paths to translate. If this flag is not used, the tool will start in interactive mode to let you select from a list of available documents.</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array<string>">
    <x-field-desc markdown>Specify one or more target language codes (e.g., `zh`, `ja`, `de`). If omitted, you will be prompted to select languages interactively.</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string">
    <x-field-desc markdown>Provide a path to a glossary file (e.g., `@path/to/glossary.md`). This ensures that specific technical terms, brand names, or acronyms are translated consistently across all documents.</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string">
    <x-field-desc markdown>Provide specific instructions to guide the AI's translation style. For example, you can ask for a more formal tone or specify how to handle certain phrases.</x-field-desc>
  </x-field>
</x-field-group>

### Usage Examples

#### 1. Translate Specific Documents into Multiple Languages

To translate `overview.md` and `examples.md` into Chinese (`zh`) and Japanese (`ja`) without any interactive prompts, run the following command:

```bash
aigne doc translate --docs overview.md --docs examples.md --langs zh --langs ja
```

#### 2. Use a Glossary for Consistent Terminology

If your documentation contains specialized vocabulary or brand names, you can use a glossary file to ensure they are always translated correctly.

```bash
aigne doc translate --glossary @./project-glossary.md
```

#### 3. Provide Feedback to Refine Translation Style

You can guide the translation style by providing feedback. For instance, to request a more formal and technical tone for the output:

```bash
aigne doc translate --feedback "Use a formal, technical tone for all translations."
```

This feedback is recorded in the document's update history, which can be useful for tracking changes.

## Supported Languages

The tool provides translation support for 12 languages. The native language of the documentation is English (`en`).

| Language              | Code    |
| --------------------- | ------- |
| Chinese (Simplified)  | `zh`    |
| Chinese (Traditional) | `zh-TW` |
| Japanese              | `ja`    |
| Korean                | `ko`    |
| Spanish               | `es`    |
| French                | `fr`    |
| German                | `de`    |
| Portuguese            | `pt`    |
| Russian               | `ru`    |
| Italian               | `it`    |
| Arabic                | `ar`    |

## Summary

The `translate` command offers a structured and reliable method for localizing your documentation. You can use its interactive mode for a guided process or its command-line options for efficient, automated workflows. Features like glossaries and feedback help maintain the quality and consistency of the translated content.

After translating your documents, the next step is to make them available to your users. For instructions on how to do this, see the [Publishing Your Docs](./guides-publishing-your-docs.md) guide.
