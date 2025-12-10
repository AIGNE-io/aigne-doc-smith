# 本地化文档

将您的文档提供多种语言版本对于触及全球受众至关重要。本指南提供了使用 `aigne doc localize` 命令将您的内容本地化为 12 种受支持语言中任意一种的分步过程，确保您的文档对世界各地的用户来说都易于访问和理解。

## 翻译流程概述

翻译文档的主要命令是 `aigne doc localize`。此命令可以以两种模式执行：交互式或非交互式（使用命令行标志）。两种方法都设计得简单明了，让您能够高效地管理单语言或多语言的翻译。

### 交互模式 (Beta)

要获得引导式体验，请在不带任何参数的情况下运行该命令。对于不熟悉翻译功能或偏好分步流程的用户，这是推荐的方法。

```bash icon=lucide:terminal
aigne doc localize
```

当您运行此命令时，DocSmith 将启动一个交互式会话：

1.  首先，系统会提示您从项目中所有可用的文档文件列表中选择您希望本地化的特定文档。
2.  接下来，系统会要求您选择目标语言。系统支持 12 种语言，您之前选择过的任何语言都将被预先选中，以简化流程。

![执行翻译命令](../../../assets/screenshots/doc-translate.png)

选择文档后，您将看到一个可用语言列表供您选择。

![选择翻译语言](../../../assets/screenshots/doc-translate-langs.png)

一旦您的选择被确认，DocSmith 将开始将每个文档翻译成您选择的每一种语言。

### 命令行用法

为了实现自动化、脚本编写或更直接的控制，您可以直接在命令行上提供参数。

```bash icon=lucide:terminal
aigne doc localize [options]
```

#### 选项

`localize` 命令接受以下选项来指定文档、语言和其他设置。

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一个或多个要翻译的文档路径。如果省略此选项，工具将进入交互模式以供选择文档。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>目标语言代码列表（例如 `zh`、`ja`、`de`）。如果未提供，系统将提示您以交互方式选择语言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>术语表文件的路径（例如 `@/path/to/glossary.md`）。此文件有助于在所有翻译中保持特定术语的一致性。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>向 AI 提供具体指令以指导其翻译风格（例如，“使用正式语气，并保留技术术语为英文”）。此反馈也会记录在文档的历史记录中，以备将来参考。</x-field-desc>
  </x-field>
  <x-field data-name="--diagram" data-type="boolean" data-required="false">
    <x-field-desc markdown>仅翻译图表图像而不翻译文档内容。使用此选项可更新图表中的文本标签，同时保持文档正文不变。</x-field-desc>
  </x-field>
</x-field-group>

#### 示例

1.  **将特定文档翻译成多种语言：**

    要将 `overview.md` 和 `getting-started.md` 翻译成中文和日文，请使用以下命令：
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --docs getting-started.md --langs zh ja
    ```

2.  **使用术语表和风格反馈进行翻译：**

    要将 `overview.md` 翻译成德语，同时确保术语一致和语气正式，您可以包含 `--glossary` 和 `--feedback` 选项：
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
    ```

## 支持的语言

DocSmith 为 12 种语言提供专业级翻译。在使用 `--langs` 标志时，请使用下表中的语言代码。

| 语言 | 代码 |
|---|---|
| 英语 | `en` |
| 简体中文 | `zh` |
| 繁體中文 | `zh-TW` |
| 日语 | `ja` |
| 韩语 | `ko` |
| 西班牙语 | `es` |
| 法语 | `fr` |
| 德语 | `de` |
| 葡萄牙语 | `pt` |
| 俄语 | `ru` |
| 意大利语 | `it` |
| 阿拉伯语 | `ar` |

## 总结

本指南介绍了如何使用 `aigne doc localize` 命令，使您的文档能够被全球受众访问。您可以使用交互模式以获得引导式流程，或使用命令行选项以实现自动化和精确控制。

文档翻译完成后，下一步就是发布它们。有关此过程的详细说明，请参阅[发布文档](./guides-publishing-your-docs.md)指南。