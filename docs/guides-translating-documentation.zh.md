# 翻译文档

DocSmith 允许您将文档翻译成多种语言，从而让全球受众都能访问您的内容。翻译过程设计得简单直接，利用 AI 提供具有上下文感知能力且技术上准确的翻译。本指南详细介绍了使用 `translate` 命令翻译文档的步骤。

DocSmith 支持 12 种语言的专业翻译，确保为国际用户提供广泛的覆盖范围。

## 如何翻译文档

用于翻译的主要命令是 `aigne doc translate`。您可以以交互方式运行它来选择您想要的文档和语言，也可以使用命令行标志直接指定这些选项以实现自动化工作流程。

### 交互模式

要获得引导式体验，只需运行不带任何参数的命令即可。

```bash
aigne doc translate
```

该工具将提示您：
1.  从现有文档列表中**选择您希望翻译的文档**。
2.  **选择翻译的目标语言**。为方便起见，先前选择的语言将被预先勾选。

![执行翻译命令](https://docsmith.aigne.io/image-bin/uploads/9b47a9f979745a3089c287f73715c0a3.png)

选择文档后，系统将向您显示可用语言的列表。

![选择翻译语言](https://docsmith.aigne.io/image-bin/uploads/c53f880f08a9f65f377038198f1a1d1d.png)

一旦您确认选择，DocSmith 将开始将每个文档翻译成所选的每种语言。

### 命令行用法

为了更直接地控制或在脚本中使用，您可以使用标志来指定您的需求。

```bash
aigne doc translate [options]
```

#### 选项

以下选项可用于 `translate` 命令：

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定要翻译的一个或多个文档路径。如果未提供，系统将提示您以交互方式从列表中选择。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一个或多个目标语言代码（例如 `zh`、`ja`）。如果未提供，您可以通过交互方式选择语言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>术语表文件的路径（例如 `@/path/to/glossary.md`），以确保所有翻译中的术语一致。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>提供具体说明或反馈以指导 AI 的翻译风格（例如，“使用正式语气，技术术语保留英文”）。此反馈会记录在文档的历史记录中。</x-field-desc>
  </x-field>
</x-field-group>

#### 示例

要将 `overview.md` 和 `getting-started.md` 文档翻译成中文和日文，您需要运行以下命令：

```bash
aigne doc translate --docs /overview --docs /getting-started --langs zh ja
```

要提供风格反馈并确保术语一致，您可以添加 `--feedback` 和 `--glossary` 标志：

```bash
aigne doc translate --docs /overview --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
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
| Español | `es` |
| Français | `fr` |
| Deutsch | `de` |
| Português | `pt` |
| Русский | `ru` |
| Italiano | `it` |
| العربية | `ar` |

## 总结

您现在已经学会了如何使用 `aigne doc translate` 命令，通过交互式过程或使用命令行选项实现自动化，从而使您的文档能够以多种语言提供。

翻译完文档后，合乎逻辑的下一步是将其提供给您的用户。有关如何执行此操作的说明，请参阅 [发布您的文档](./guides-publishing-your-docs.md) 指南。