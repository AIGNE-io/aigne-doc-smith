---
labels: ["Reference"]
---

# Translate Documentation

DocSmith makes it easy to reach a global audience by translating your documentation into multiple languages. This process leverages AI to provide translations for over 12 languages, ensuring your content is accessible to users worldwide.

The primary command for this feature is `aigne doc translate`.

## Interactive Translation

For a guided experience, simply run the command without any arguments. This is the recommended approach for most users.

```bash
aigne doc translate
```

This will launch an interactive wizard that walks you through the process:

1.  **Select Documents:** First, you'll be prompted to select the documents you wish to translate from a list of your existing documentation.

    ![Select documents to translate](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **Choose Languages:** Next, you can choose one or more target languages from the supported list.

    ![Select languages to translate to](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

The wizard also allows you to add new translation languages to your project configuration directly.

## Translating with Command-Line Arguments

For more direct control or for use in automated scripts, you can specify all options directly on the command line. This allows you to precisely define which documents to translate, into which languages, and with specific instructions.

### Command Parameters

| Parameter | Description | Example |
|---|---|---|
| `--langs` | Specify one or more target languages. This flag can be used multiple times. | `--langs zh --langs ja` |
| `--docs` | Specify one or more document paths to translate. This flag can be used multiple times. | `--docs overview.md` |
| `--feedback` | Provide feedback to the AI to improve translation quality. | `--feedback "Use formal tone"` |
| `--glossary` | Use a glossary file for consistent terminology. The path must be prefixed with `@`. | `--glossary @path/to/glossary.md` |

### Examples

#### Translate Specific Documents

To translate the `examples.md` and `overview.md` files into Chinese and Japanese:

```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

#### Improve Translation Quality

You can enhance translation accuracy by providing a glossary for consistent terminology and feedback for the AI model:

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

## Language Support

DocSmith supports automatic translation for a wide array of languages, including Chinese, Spanish, French, German, and Japanese. For a complete and up-to-date list of all supported languages and their codes, please refer to the [Language Support](./configuration-language-support.md) guide.

## Next Steps

Once your documentation is translated, you're ready to share it with the world. Learn how to make your documents public in the next section.

Continue to [Publish Your Docs](./features-publish-your-docs.md).