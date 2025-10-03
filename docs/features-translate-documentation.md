# Translate Documentation

AIGNE DocSmith can translate your documentation into 12 different languages, including English, Chinese, and Spanish, making your project accessible to a global audience. The tool provides two ways to manage translations: an interactive mode for a guided setup and command-line arguments for precise control and automation.

## Interactive Translation

For a guided experience, run the `translate` command without any arguments. This method is ideal for users who prefer a step-by-step process.

```bash
aigne doc translate
```

This command launches an interactive wizard that guides you through the process:

1.  **Select Documents to Translate:** You will be presented with a list of your existing documents. Use the spacebar to select the ones you want to translate.

    ![Select documents to translate](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **Choose Target Languages:** After selecting your documents, pick one or more target languages from the list of supported options.

    ![Select languages to translate into](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **Confirm and Run:** DocSmith will then process the translation, generating new versions of your selected files for each chosen language.

## Command-Line Translation

For automation in scripts or CI/CD pipelines, use command-line flags to control the translation process. This method provides greater flexibility for developers and advanced users.

### Command Parameters

<x-field-group>
  <x-field data-name="--langs" data-type="string" data-required="false" data-desc="Specify one target language. This flag can be used multiple times to include several languages (e.g., --langs zh --langs ja)."></x-field>
  <x-field data-name="--docs" data-type="string" data-required="false" data-desc="Specify the path of a document to translate. This can also be used multiple times for batch translation."></x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false" data-desc="Provide suggestions to the AI to guide the translation quality (e.g., --feedback &quot;Use a formal tone&quot;)."></x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false" data-desc="Use a glossary file in Markdown format to ensure consistent terminology for specific terms (e.g., --glossary @path/to/glossary.md)."></x-field>
  <x-field data-name="--model" data-type="string" data-required="false" data-desc="Specify the translation model to use, for example, 'openai:gpt-4o' or 'anthropic:claude-sonnet-4-5'."></x-field>
</x-field-group>

### Examples

#### Translating Specific Documents

To translate `overview.md` and `examples.md` into Chinese and Japanese, run the following command:

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

#### Using a Glossary and Feedback

To ensure brand names and technical terms are translated correctly, you can provide a glossary file. You can also give feedback to refine the translation style.

```bash
aigne doc translate --glossary @path/to/glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

#### Specifying a Translation Model

To use a specific AI model for the translation task, use the `--model` flag.

```bash
aigne doc translate --docs overview.md --langs fr --model openai:gpt-4o
```

## Supported Languages

DocSmith supports automatic translation for the following 12 languages:

| Language             | Code    |
| -------------------- | ------- |
| English              | `en`    |
| Simplified Chinese   | `zh-CN` |
| Traditional Chinese  | `zh-TW` |
| Japanese             | `ja`    |
| Korean               | `ko`    |
| Spanish              | `es`    |
| French               | `fr`    |
| German               | `de`    |
| Portuguese           | `pt-BR` |
| Russian              | `ru`    |
| Italian              | `it`    |
| Arabic               | `ar`    |

---

Once your documentation is translated, you are ready to share it with the world.

<x-card data-title="Next: Publish Your Docs" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="Read More">
  A guide on how to publish your documentation to a public platform or your own private website.
</x-card>