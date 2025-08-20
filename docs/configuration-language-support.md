---
labels: ["Reference"]
---

# Language Support

AIGNE DocSmith is designed for a global audience and can automatically translate your documentation into a wide range of languages. This allows you to maintain a single source of truth in your primary language and effortlessly reach users worldwide.

## Supported Languages

DocSmith currently supports automatic translation for the following languages. The tool uses the language code to create different versions of your documentation.

| Language | Code | Example |
|---|---|---|
| English | en | Hello |
| 简体中文 | zh | 你好 |
| 繁體中文 | zh-TW | 你好 |
| 日本語 | ja | こんにちは |
| 한국어 | ko | 안녕하세요 |
| Español | es | Hola |
| Français | fr | Bonjour |
| Deutsch | de | Hallo |
| Português | pt | Olá |
| Русский | ru | Привет |
| Italiano | it | Ciao |
| العربية | ar | مرحبا |

## How to Enable Multiple Languages

You can select your primary documentation language and additional languages for translation during the setup process. This is handled through an interactive configuration wizard.

1.  **Start the Configuration Wizard**
    You can start the wizard in two ways:
    *   **Automatic Setup**: If you have not configured DocSmith before, the wizard will launch automatically the first time you run the `aigne doc generate` command.
    *   **Manual Setup**: To start the wizard manually at any time to change your settings, run the command:
        ```bash
        aigne doc init
        ```

2.  **Select Your Primary Language**
    The wizard will first prompt you to choose the main language for your documentation. This is the language you will primarily write in, and it will serve as the source for all translations.

3.  **Choose Translation Languages**
    After setting the primary language, you will be shown a list of all supported languages. Here, you can select as many additional languages as you need for translation. The system will automatically generate a version of your documentation for each language you select.

Once you complete these steps, DocSmith saves your preferences. The next time you run `aigne doc generate`, it will produce documentation in your primary language and all the translated versions you selected.

---

Now that you understand how to manage language settings, you can learn more about the different AI models available for content generation in the [LLM Setup](./configuration-llm-setup.md) guide.