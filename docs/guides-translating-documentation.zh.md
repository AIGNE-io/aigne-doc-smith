# 翻译文档

DocSmith 使您能够将文档翻译成多种语言，让您的内容能够触及全球受众。翻译过程设计得简单直接，利用 AI 提供上下文感知和技术上准确的翻译。本指南详细介绍了使用 `translate` 命令翻译文档的步骤。

DocSmith 支持 12 种语言的专业翻译，确保为国际用户提供广泛的覆盖。

## 如何翻译文档

用于翻译的主要命令是 `aigne doc translate`。您可以以交互方式运行它来选择您想要的文档和语言，也可以使用命令行标志直接指定这些选项以实现自动化工作流程。

### 交互模式

若需引导式体验，只需运行不带任何参数的命令即可。

```bash
aigne doc translate
```

该工具将提示您：
1.  **选择您希望翻译的文档**，从您的现有文档列表中选取。
2.  **选择目标语言**进行翻译。为方便起见，先前选择过的语言将被预先勾选。

![执行翻译命令](../assets/screenshots/doc-translate.png)

选择文档后，系统将为您呈现可用语言的列表。

![选择翻译语言](../assets/screenshots/doc-translate-langs.png)

一旦您确认选择，DocSmith 将继续为每个文档翻译成每种选定的语言。

### 命令行用法

为了更直接地控制或在脚本中使用，您可以使用标志来指定您的要求。

```bash
aigne doc translate [options]
```

#### 选项

`translate` 命令提供以下选项：

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定要翻译的一个或多个文档路径。如果未提供，系统将提示您以交互方式从列表中选择。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一个或多个目标语言代码（例如，`zh`、`ja`）。如果未提供，您可以以交互方式选择语言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>词汇表文件的路径（例如，`@/path/to/glossary.md`），以确保所有翻译中的术语保持一致。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>提供具体说明或反馈以指导 AI 的翻译风格（例如，“使用正式语气，技术术语保留英文”）。此反馈会记录在文档的历史记录中。</x-field-desc>
  </x-field>
</x-field-group>

#### 示例

要将 `overview.md` 和 `getting-started.md` 文档翻译成中文和日文，您需要运行以下命令：

```bash
aigne doc translate --docs overview.md --docs getting-started.md --langs zh ja
```

要提供风格反馈并确保术语一致，您可以添加 `--feedback` 和 `--glossary` 标志：

```bash
aigne doc translate --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## 支持的语言

DocSmith 为以下 12 种语言提供专业翻译。通过 `--langs` 标志指定语言时，请使用相应的代码。

| 语言 | 代码 |
|---|---|
| 英语 | `en` |
| 简体中文 | `zh` |
| 繁體中文 | `zh-TW` |
| 日本語 | `ja` |
| 한국어 | `ko` |
| 西班牙语 | `es` |
| 法语 | `fr` |
| 德语 | `de` |
| 葡萄牙语 | `pt` |
| 俄语 | `ru` |
| 意大利语 | `it` |
| 阿拉伯语 | `ar` |

## 总结

现在您已经学会了如何使用 `aigne doc translate` 命令，通过交互式流程或使用命令行选项实现自动化，使您的文档以多种语言提供。

翻译完文档后，合乎逻辑的下一步是将其提供给您的用户。有关如何执行此操作的说明，请参阅 [发布您的文档](./guides-publishing-your-docs.md) 指南。