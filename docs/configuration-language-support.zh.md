---
labels: ["Reference"]
---

# 语言支持

AIGNE DocSmith 旨在通过提供内置的自动文档翻译支持，帮助您触及全球受众。您可以直接从单一源文件生成和维护十几种语言的文档。

## 支持的语言

DocSmith 支持多种语言的翻译。当使用 `translate` 命令时，您可以指定以下任何语言代码作为目标。

| 语言 | 代码 | 原生名称 |
|---|---|---|
| 英语 | `en` | English |
| 简体中文 | `zh` | 简体中文 |
| 繁體中文 | `zh-TW` | 繁體中文 |
| 日语 | `ja` | 日本語 |
| 韩语 | `ko` | 한국어 |
| 西班牙语 | `es` | Español |
| 法语 | `fr` | Français |
| 德语 | `de` | Deutsch |
| 葡萄牙语 | `pt` | Português |
| 俄语 | `ru` | Русский |
| 意大利语 | `it` | Italiano |
| 阿拉伯语 | `ar` | العربية |

## 启用和使用翻译

启用语言无需复杂的设置。您可以使用 `aigne doc translate` 命令立即开始翻译您的文档。

### 交互式翻译

为获得简单的引导式体验，只需运行不带任何参数的命令。这将启动一个交互式向导，允许您：

1.  选择您想要翻译的现有文档。
2.  从支持的列表中选择一个或多个目标语言。
3.  将新的翻译语言添加到您项目的配置中，以备将来使用。

```bash
# 启动交互式翻译向导
aigne doc translate
```

### 命令行翻译

如果您更喜欢直接在命令行工作，可以使用标志来指定文档和目标语言。您可以多次使用 `--langs` 标志，以一次性翻译成多种语言。

```bash
# 将 overview.md 和 examples.md 翻译成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

为确保翻译中术语的一致性，特别是技术术语，您可以提供一个术语表文件。

```bash
# 使用自定义术语表进行翻译以确保术语一致
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

本节概述了 DocSmith 支持的语言。要了解有关翻译工作流和所有可用命令选项的更多信息，请参阅 [翻译文档](./features-translate-documentation.md) 指南。