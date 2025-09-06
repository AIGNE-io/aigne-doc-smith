---
labels: ["Reference"]
---

# 翻译文档

AIGNE DocSmith 可将您的文档自动翻译成超过 12 种语言，帮助您触及全球受众。该功能简化了本地化流程，确保您的内容可供全球用户访问。您可以通过交互式向导轻松翻译文档，也可以使用命令行标志自动化该流程以进行更高级的控制。

### 翻译工作流概述

`aigne doc translate` 命令提供两种主要的操作模式，如下所示：

```d2
direction: down

start: {
  label: "运行 'aigne doc translate'"
  shape: rectangle
}

interactive_vs_cli: {
  label: "带或不带\n参数？"
  shape: diamond
}

interactive_path: {
  label: "交互模式"
  shape: package
  grid-columns: 1

  select_docs: {
    label: "1. 选择文档"
    shape: step
  }
  select_langs: {
    label: "2. 选择语言"
    shape: step
  }
}

cli_path: {
  label: "CLI 模式"
  shape: package

  flags: {
    label: "提供参数\n--docs, --langs 等"
    shape: step
  }
}

ai_translation: {
  label: "AI 驱动的翻译"
  shape: rectangle
}

end: {
  label: "已翻译文档\n已保存"
  shape: document
}

start -> interactive_vs_cli
interactive_vs_cli -> interactive_path: "不带参数"
interactive_vs_cli -> cli_path: "带参数"
interactive_path -> ai_translation
cli_path -> ai_translation
ai_translation -> end
```

## 通过交互模式轻松翻译

如需引导式体验，最简单的方式是运行不带任何参数的 `translate` 命令：

```bash
aigne doc translate
```

这将启动一个交互式向导，引导您完成整个流程：

1.  **选择要翻译的文档：** 您将看到现有文档的列表。只需选择您想要翻译的文档即可。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择目标语言：** 选择文档后，您可以从支持的选项列表中选择一种或多种目标语言。

    ![选择要翻译成的语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **确认并运行：** DocSmith 随后将处理翻译，为每种语言生成所选文件的新版本。

## 使用命令行标志进行高级控制

对于自动化或更具体的任务，您可以使用命令行标志直接控制翻译流程。这非常适合集成到 CI/CD 流水线中，或适合偏好使用命令行的高级用户。

以下是可用的主要选项：

| Parameter | Description |
|---|---|
| `--langs` | 指定一种或多种目标语言。该标志可多次使用（例如，`--langs zh --langs ja`）。 |
| `--docs` | 指定要翻译的文档路径。该标志也可多次使用。 |
| `--feedback` | 向 AI 提供反馈以提高未来翻译的质量（例如，`--feedback "Use formal tone"`）。 |
| `--glossary` | 使用 Markdown 格式的术语表文件，以确保特定术语的一致性（例如，`--glossary @path/to/glossary.md`）。 |

### 示例：翻译特定文档

要将 `overview.md` 和 `examples.md` 翻译成中文和日文，您可以运行：

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

### 示例：使用术语表和反馈

为确保品牌名称和技术术语翻译正确，您可以提供一个术语表文件。您还可以提供反馈以优化翻译风格。

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

## 支持的语言

DocSmith 支持以下语言的自动翻译：

| Language | Code |
|---|---|
| 英语 | en |
| 简体中文 | zh-CN |
| 繁体中文 | zh-TW |
| 日语 | ja |
| 韩语 | ko |
| 西班牙语 | es |
| 法语 | fr |
| 德语 | de |
| 葡萄牙语 | pt-BR |
| 俄语 | ru |
| 意大利语 | it |
| 阿拉伯语 | ar |

---

文档翻译完成后，您就可以与世界分享了。请在下一节中了解如何操作。

<x-card data-title="下一步：发布您的文档" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="阅读更多">
  关于如何轻松将文档发布到公共平台或您自己的私人网站的指南。
</x-card>