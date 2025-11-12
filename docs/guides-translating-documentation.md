# Localize Document

Making your documents available in multiple languages is essential for reaching a global audience. This guide provides a step-by-step process for using the `aigne doc localize` command to localize your content into any of the 12 supported languages, ensuring your documents are accessible and easy to understand for users everywhere.

## Translation Process Overview

The primary command for translating documents is `aigne doc localize`. This command can be executed in two modes: interactive or non-interactive (using command-line flags). Both methods are designed to be straightforward, allowing you to manage single or multi-language translations efficiently.

### Interactive Mode

For a guided experience, run the command without any arguments. This is the recommended approach for users who are new to the translation feature or prefer a step-by-step process.

```bash icon=lucide:terminal
aigne doc localize
```

When you run this command, DocSmith will initiate an interactive session:

1.  First, you will be prompted to select the specific documents you wish to localize from a list of all available document files in your project.
2.  Next, you will be asked to choose the target languages. The system supports 12 languages, and any languages you have previously selected will be pre-checked to streamline the process.

![Executing the translate command](../assets/screenshots/doc-translate.png)

After selecting the documents, you will be presented with a list of available languages to choose from.

![Selecting translation languages](../assets/screenshots/doc-translate-langs.png)

Once your selections are confirmed, DocSmith will begin the translation process for each document into every language you selected.

### Command-Line Usage

For automation, scripting, or more direct control, you can provide arguments directly on the command line.

```bash icon=lucide:terminal
aigne doc localize [options]
```

#### Options

The `localize` command accepts the following options to specify documents, languages, and other settings.

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>Specify one or more document paths to be translated. If this option is omitted, the tool will enter interactive mode for document selection.</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>A list of target language codes (e.g., `zh`, `ja`, `de`). If not provided, you will be prompted to select languages interactively.</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>Path to a glossary file (e.g., `@/path/to/glossary.md`). This file helps maintain consistent terminology for specific terms across all translations.</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>Provide specific instructions to the AI to guide its translation style (e.g., "Use a formal tone and keep technical terms in English"). This feedback is also recorded in the document's history for future reference.</x-field-desc>
  </x-field>
</x-field-group>

#### Examples

1.  **Translate specific documents into multiple languages:**

    To translate `overview.md` and `getting-started.md` into Chinese and Japanese, use the following command:
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --docs getting-started.md --langs zh ja
    ```

2.  **Translate with a glossary and stylistic feedback:**

    To translate `overview.md` into German while ensuring consistent terminology and a formal tone, you can include the `--glossary` and `--feedback` options:
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
    ```

## Supported Languages

DocSmith provides professional-grade translations for 12 languages. Use the language code from the table below when using the `--langs` flag.

| Language | Code |
|---|---|
| English | `en` |
| 简体中文 | `zh` |
| 繁體中文 | `zh-TW` |
| 日本語 | `ja` |
| 한국어 | `ko` |
| Español | `es` |
| Français | `fr` |
| Deutsch | `de` |
| Português | `pt` |
| Русский | `ru` |
| Italiano | `it` |
| العربية | `ar` |

## Summary

This guide has covered the use of the `aigne doc localize` command to make your documents accessible to a global audience. You can use the interactive mode for a guided process or command-line options for automation and precision.

Once your documents are translated, the next step is to publish them. For detailed instructions on this process, please see the [Publishing Your Documents](./guides-publishing-your-docs.md) guide.