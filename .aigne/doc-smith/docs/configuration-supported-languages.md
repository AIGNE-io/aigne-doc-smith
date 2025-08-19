# Supported Languages

AIGNE DocSmith offers powerful multi-language capabilities, automatically translating your source documents into various languages to help your project reach a global audience. Enabling multi-language support is straightforward and can be easily set up during the initial configuration.

## List of Supported Languages

DocSmith currently supports automatic translation for the following languages. During the configuration process, you can select one as the primary language and choose multiple other languages as translation targets.

| Language | Code |
|---|---|
| English (en) | `en` |
| Simplified Chinese (zh) | `zh` |
| Traditional Chinese (zh-TW) | `zh-TW` |
| Japanese (ja) | `ja` |
| Korean (ko) | `ko` |
| Spanish (es) | `es` |
| French (fr) | `fr` |
| German (de) | `de` |
| Portuguese (pt) | `pt` |
| Russian (ru) | `ru` |
| Italian (it) | `it` |
| Arabic (ar) | `ar` |

## How to Configure Languages

Language configuration for your documentation is done during the project initialization phase. You can start an interactive configuration wizard by running the `aigne doc init` command. This wizard will also start automatically if you are running `aigne doc generate` for the first time.

In the wizard, the system will guide you through a series of settings, which include language selection:

1.  **Select the Primary Language**: You will first need to select a language from the list above to be the source or primary language for your documentation.
2.  **Select Translation Languages**: Next, you can select one or more target languages into which you want your documentation to be translated.

The entire process can be completed with simple keyboard operations, without the need to manually edit configuration files.

```bash
# Run this command to start or modify your documentation configuration, including language settings
aigne doc init
```

After completing the setup, every time you run `aigne doc generate`, DocSmith will automatically generate documentation versions for all the selected languages.

---

After setting up multiple languages, you can continue to explore other configuration options to better customize your documentation. Next, you can learn how to configure [AI Model Providers](./configuration-llm-providers.md).