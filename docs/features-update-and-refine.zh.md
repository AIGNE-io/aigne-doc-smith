---
labels: ["Reference"]
---

# 更新与优化

文档编写不是一次性任务，它必须与源代码同步演进。AIGNE DocSmith 提供了保持文档更新的机制，无论是通过智能自动更新，还是基于特定反馈进行有针对性的手动优化。

## 智能自动更新

初次生成文档后，源代码不可避免地会发生变化。当您再次运行 `aigne doc generate` 命令时，DocSmith 会自动检测代码库的哪些部分已被修改。然后，它会智能地仅重新生成受影响的文档，从而节省时间，并确保您的文档与代码保持同步，而无需从头开始。

![智能检测仅重新生成必要的文档](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

要强制重新生成所有文档，您可以使用 `--forceRegenerate` 标志：

```bash
aigne doc generate --forceRegenerate
```

## 定向文档重新生成

有时，您需要在不更改任何源代码的情况下优化特定文档的内容。`aigne doc update` 命令正是为此设计的，它允许您向 AI 提供直接反馈以改进单个文件。

该命令有两种使用方式：交互模式或直接模式。

### 交互模式

要获得引导式体验，请在不带任何参数的情况下运行该命令。DocSmith 将会显示一个交互式菜单，您可以在其中选择要更新的文档。

```bash
aigne doc update
```

选择文档后，系统将提示您为新版本提供反馈。

![交互式选择要重新生成的文档](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接模式

如果您已经知道要更新哪个文档以及要提供什么反馈，可以使用命令行参数以加快工作流程。这也适用于编写脚本。

**示例：**

```bash
aigne doc update --docs overview.md --feedback "Add more comprehensive FAQ entries"
```

该命令将使用新的反馈专门重新生成 `overview.md` 文件。

**参数**

| Parameter  | Description                                        |
|------------|----------------------------------------------------|
| `--docs`   | 指定要更新的文档路径。        |
| `--feedback` | 提供内容改进的说明。      |

## 改进整体结构

除了优化单个文档，您还可以提供反馈以改进整体文档结构。这可以通过使用带有 `--feedback` 标志的 `aigne doc generate` 命令来完成。它允许您请求更改，例如添加、删除或重组整个部分。

**示例：**

```bash
# 要求 AI 根据新需求重组结构
aigne doc generate --feedback "Remove the About section and add a detailed API Reference"
```

这有助于在项目发展过程中保持一个逻辑清晰、用户友好的结构。

---

一旦您的文档更新和优化到您满意的程度，您就可以着手将其发布。在下一节 [发布您的文档](./features-publish-your-docs.md) 中了解如何操作。
