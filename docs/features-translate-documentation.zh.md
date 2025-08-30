---
labels: ["Reference"]
---

# 翻译文档

AIGNE DocSmith 可将您的文档自动翻译成 12 种以上的语言，帮助您触及全球受众。该功能简化了本地化流程，确保您的内容仅需一条命令即可触达全球用户。

## 使用交互模式轻松翻译

如需引导式体验，最简单的方式是直接运行 `translate` 命令，无需添加任何参数：

```bash
aigne doc translate
```

这将启动一个交互式向导，逐步引导您完成整个过程：

1.  **选择待翻译文档：** 系统将列出您现有的所有文档。您只需选择想要翻译的文档即可。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择目标语言：** 选择文档后，您可以从支持的语言列表中选择一个或多个目标语言。

    ![选择要翻译成的语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **确认并运行：** DocSmith 随后将处理翻译任务，为每种选定的语言生成相应的文件新版本。

## 使用命令行标志进行高级控制

对于自动化或更具体的任务，您可以使用命令行标志直接控制翻译过程。这非常适合集成到 CI/CD 流程中，也适合偏好使用命令行的资深用户。

以下是可用的主要选项：

| 参数 | 描述 |
|---|---|
| `--langs` | 指定一个或多个目标语言。此标志可以多次使用（例如，--langs zh --langs ja）。 |
| `--docs` | 指定要翻译的文档的路径。此标志也可以多次使用。 |
| `--feedback` | 向 AI 提供反馈，以提升未来翻译的质量（例如，--feedback "Use formal tone"）。 |
| `--glossary` | 使用 Markdown 格式的术语表文件，以确保特定术语的翻译保持一致（例如，--glossary @path/to/glossary.md）。 |

### 示例：翻译特定文档

要将 `overview.md` 和 `examples.md` 翻译成中文和日文，您需要运行：

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

### 示例：使用术语表和反馈

为确保品牌名称和技术术语翻译准确，您可以提供一个术语表文件。您还可以提供反馈以优化翻译风格。

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

## 支持的语言

DocSmith 支持以下语言的自动翻译：

| 语言 | 代码 |
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
  一份关于如何轻松将您的文档发布到公共平台或您自己的私人网站的指南。
</x-card>