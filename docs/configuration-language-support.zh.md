# 语言支持

AIGNE DocSmith 提供 12 种语言的自动翻译功能，让你能够为全球用户生成和维护文档。整个过程由 `aigne doc translate` 命令处理，该命令使用 AI 引擎处理你的源文档并创建本地化版本。

翻译工作流通过 AIGNE AI 引擎处理你的源文档，以在你选择的目标语言中生成本地化版本。

```d2
direction: down

Source-Doc: {
  label: "源文档\n（例如，英语）"
  shape: rectangle
}

AI-Engine: {
  label: "AIGNE DocSmith\nAI 翻译引擎"
  shape: rectangle
}

Translated-Docs: {
  label: "翻译后文档"
  shape: rectangle
  grid-columns: 3

  zh: "简体中文"
  ja: "日本語"
  es: "Español"
  fr: "Français"
  de: "Deutsch"
  more: "..."
}

Source-Doc -> AI-Engine: "`aigne doc translate`"
AI-Engine -> Translated-Docs: "生成"
```

## 支持的语言

DocSmith 为以下语言提供 AI 翻译功能。你可以在初始设置期间定义项目的主要语言，并选择任意数量的目标语言进行翻译。

| 语言 | 语言代码 | 示例文本 |
|---|---|---|
| 英语 | `en` | Hello |
| 简体中文 | `zh` | 你好 |
| 繁體中文 | `zh-TW` | 你好 |
| 日本語 | `ja` | こんにちは |
| 한국어 | `ko` | 안녕하세요 |
| Español | `es` | Hola |
| Français | `fr` | Bonjour |
| Deutsch | `de` | Hallo |
| Português | `pt` | Olá |
| Русский | `ru` | Привет |
| Italiano | `it` | Ciao |
| العربية | `ar` | مرحبا |

## 如何配置和使用翻译功能

翻译语言在你使用 `aigne doc init` 初始化项目时设置。你可以随时使用 `aigne doc translate` 命令添加新语言或翻译文档，该命令提供两种操作模式。

### 交互模式

如需引导式体验，请在不带任何参数的情况下运行该命令。这是为大多数用户推荐的方法。

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

交互模式将提示你：

- 选择要翻译的现有文档。
- 从支持的语言列表中选择一个或多个目标语言。
- 如果项目中尚未包含新的翻译语言，则将其添加到项目配置中。

### 命令行参数

为了直接控制或在自动化脚本（如 CI/CD 流水线）中使用，你可以直接将文档和语言指定为命令行参数。

```bash Command Example icon=lucide:terminal
# 将 overview.md 和 examples.md 翻译成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

该命令的关键参数包括：

| 参数 | 描述 |
|---|---|
| `--langs` | 指定目标语言代码。该标志可以多次使用以选择多种语言。 |
| `--docs` | 指定要翻译的文档路径（例如 `overview.md`）。该标志也可以多次使用。 |
| `--feedback` | 提供具体指令以指导翻译模型（例如，`"Use a formal tone"`）。 |
| `--glossary` | 使用自定义术语表文件（例如 `@path/to/glossary.md`）以确保项目特定术语的翻译一致性。 |

---

本节介绍了可用语言以及如何启用它们。有关翻译工作流的完整指南，包括高级选项和最佳实践，请参阅[翻译文档](./features-translate-documentation.md)指南。