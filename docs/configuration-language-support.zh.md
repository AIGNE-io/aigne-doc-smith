---
labels: ["Reference"]
---

# 语言支持

AIGNE DocSmith 专为全球用户设计，提供十几种语言的自动翻译功能。这使你能够以最小的精力生成和维护多语言文档，确保你的项目能够触达世界各地的用户。整个翻译过程由 `aigne doc translate` 命令处理。

### 翻译工作流

翻译过程会接收你的源文档，通过 AIGNE AI 引擎进行处理，并生成你所指定目标语言的高质量版本。

```d2
direction: down

Source-Doc: {
  label: "源文档\n（例如，英语）"
  shape: document
}

AI-Engine: {
  label: "AIGNE DocSmith\nAI 翻译引擎"
  shape: hexagon
}

Translated-Docs: {
  label: "翻译后文档"
  shape: package
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

DocSmith 为以下语言提供 AI 驱动的翻译。你可以在项目初始化设置时或之后的任何时间，选择你的主要文档语言以及任意数量的目标翻译语言。

| 语言 | 语言代码 |
|---|---|
| English (en) | `en` |
| 简体中文 (zh) | `zh` |
| 繁體中文 (zh-TW) | `zh-TW` |
| 日本語 (ja) | `ja` |
| 한국어 (ko) | `ko` |
| Español (es) | `es` |
| Français (fr) | `fr` |
| Deutsch (de) | `de` |
| Português (pt) | `pt` |
| Русский (ru) | `ru` |
| Italiano (it) | `it` |
| العربية (ar) | `ar` |

## 如何启用和使用翻译

翻译语言通常在首次使用 `aigne doc init` 初始化项目时进行配置，但你也可以随时使用 `aigne doc translate` 命令轻松添加新语言或翻译文档。

### 便于翻译的交互模式

翻译文档最简单的方法是直接运行不带任何参数的命令。该操作会启动一个适合所有用户的交互式向导。

```bash
aigne doc translate
```

交互模式将引导你完成以下操作：

- 选择你想要翻译的现有文档。
- 从支持的语言列表中选择目标语言。
- 如果需要，将新的翻译语言添加到你的项目配置中。

### 用于自动化的命令行

对于需要更直接控制或希望将翻译功能集成到自动化脚本（如 CI/CD 流水线）中的开发者，可以将文档和语言指定为命令行参数。

```bash
# 将 overview.md 和 examples.md 翻译成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

关键参数包括：

- `--langs`: 指定目标语言代码。你可以多次使用该标志来指定多种语言。
- `--docs`: 指定要翻译的文档路径。该参数也可以多次使用。
- `--feedback`: 提供具体指令以提高翻译质量（例如，“使用正式语气”）。
- `--glossary`: 使用自定义术语表文件（`@path/to/glossary.md`），以确保项目特定术语的表达一致。

---

借助此多语言支持，你可以有效地触达更广泛的受众。关于翻译工作流及其高级功能的更详细说明，请参阅 [翻译文档](./features-translate-documentation.md) 指南。