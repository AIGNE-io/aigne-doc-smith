# 本地化文档

将文档本地化为多种语言对于触达全球受众至关重要。本指南提供了使用 `aigne doc localize` 命令将内容本地化为 12 种支持语言之一的详细步骤，确保您的文档易于各地用户访问和理解。

## 本地化流程概述

本地化文档的主要命令是 `aigne doc localize`。该命令可以在两种模式下执行：交互式或非交互式（使用命令行标志）。两种方法都设计得简单直接，让您能够高效地管理单语言或多语言的本地化工作。

### 交互模式

如需引导式体验，请在不带任何参数的情况下运行该命令。对于不熟悉此本地化功能或偏好分步操作的用户，推荐使用此方法。

```bash icon=lucide:terminal
aigne doc localize
```

当您运行此命令时，DocSmith 将启动一个交互式会话：

1.  首先，系统会提示您从项目中所有可用的文档文件列表中选择要本地化的具体文档。
2.  接着，系统会要求您选择目标语言。系统支持 12 种语言，您之前选择过的任何语言都会被预先勾选，以简化流程。

![执行本地化命令](../../../assets/screenshots/doc-translate.png)

选择文档后，您将看到一个可用语言列表供您选择。

![选择本地化语言](../../../assets/screenshots/doc-translate-langs.png)

确认选择后，DocSmith 将开始把每个文档本地化为您选择的每一种语言。

### 命令行用法

为了实现自动化、脚本化或更直接的控制，您可以直接在命令行中提供参数。

```bash icon=lucide:terminal
aigne doc localize [options]
```

#### 选项

`translate` 命令接受以下选项来指定文档、语言和其他设置。

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一个或多个要本地化的文档路径。如果省略此选项，工具将进入交互模式以供选择文档。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>目标语言代码列表（例如 `zh`、`ja`、`de`）。如果未提供，系统将提示您以交互方式选择语言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>术语表文件的路径（例如 `@/path/to/glossary.md`）。该文件有助于在所有本地化版本中为特定术语保持一致性。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>向 AI 提供具体指令以指导其本地化风格（例如，"使用正式语气，并保持技术术语为英文"）。此反馈也会记录在文档的历史记录中，以备将来参考。</x-field-desc>
  </x-field>
</x-field-group>

#### 示例

1.  **将指定文档本地化为多种语言：**

    要将 `overview.md` 和 `getting-started.md` 本地化为中文和日文，请使用以下命令：
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --docs getting-started.md --langs zh ja
    ```

2.  **使用术语表和风格反馈进行本地化：**

    要将 `overview.md` 本地化为德语，同时确保术语一致并采用正式语气，您可以加入 `--glossary` 和 `--feedback` 选项：
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
    ```

## 支持的语言

DocSmith 为 12 种语言提供专业级本地化。在使用 `--langs` 标志时，请使用下表中的语言代码。

| Language | Code |
|---|---|
| English | `en` |
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

本指南介绍了如何使用 `aigne doc localize` 命令，使您的文档能够触达全球受众。您可以使用交互模式进行引导式操作，或使用命令行选项实现自动化和精确控制。

文档本地化完成后，下一步就是发布它们。有关此流程的详细说明，请参阅[发布文档](./guides-publishing-your-docs.md)指南。
