---
labels: ["Reference"]
---

# 翻译文档

DocSmith 通过将您的文档翻译成多种语言，让您轻松触达全球受众。此过程利用 AI 提供超过 12 种语言的翻译，确保全球用户都能访问您的内容。

此功能的主要命令是 `aigne doc translate`。

## 交互式翻译

要获得引导式体验，只需运行不带任何参数的命令即可。这是我们向大多数用户推荐的方法。

```bash
aigne doc translate
```

这将启动一个交互式向导，引导您完成整个过程：

1.  **选择文档：** 首先，系统将提示您从现有文档列表中选择要翻译的文档。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择语言：** 接下来，您可以从支持的语言列表中选择一种或多种目标语言。

    ![选择要翻译的目标语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

该向导还允许您直接将新的翻译语言添加到项目配置中。

## 使用命令行参数进行翻译

为了更直接地控制或在自动化脚本中使用，您可以直接在命令行中指定所有选项。这使您可以精确地定义要翻译哪些文档、翻译成哪些语言以及使用哪些特定指令。

### 命令参数

| 参数 | 描述 | 示例 |
|---|---|---|
| `--langs` | 指定一种或多种目标语言。此标志可以多次使用。 | `--langs zh --langs ja` |
| `--docs` | 指定要翻译的一个或多个文档路径。此标志可以多次使用。 | `--docs overview.md` |
| `--feedback` | 向 AI 提供反馈以提高翻译质量。 | `--feedback "使用正式语气"` |
| `--glossary` | 使用术语表文件以确保术语一致。路径必须以 `@` 为前缀。 | `--glossary @path/to/glossary.md` |

### 示例

#### 翻译特定文档

要将 `examples.md` 和 `overview.md` 文件翻译成中文和日文：

```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

#### 提高翻译质量

您可以通过提供术语表以确保术语一致，并向 AI 模型提供反馈来提高翻译准确性：

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

## 语言支持

DocSmith 支持多种语言的自动翻译，包括中文、西班牙语、法语、德语和日语。有关所有支持的语言及其代码的完整最新列表，请参阅 [语言支持](./configuration-language-support.md) 指南。

## 后续步骤

文档翻译完成后，您就可以与世界分享了。在下一节中，您将学习如何公开您的文档。

继续阅读 [发布您的文档](./features-publish-your-docs.md)。