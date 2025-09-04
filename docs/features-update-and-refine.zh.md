---
labels: ["Reference"]
---

# 更新与优化

让文档与不断演进的源代码保持同步至关重要。AIGNE DocSmith 提供了强大而灵活的方式来保持内容更新，无论是通过智能自动更新，还是通过精确、由反馈驱动的优化。

本指南涵盖以下内容：
- 在代码变更时自动更新文档。
- 通过有针对性的反馈手动重新生成特定文档。
- 优化整体文档结构。

### 更新工作流

下图说明了更新文档可采用的不同路径：

```d2
direction: down

Start: {
  shape: circle
  label: "开始"
}

Code-Change: {
  label: "源代码或\n配置变更"
  shape: document
}

Content-Tweak: {
  label: "需要内容\n改进？"
  shape: document
}

Structure-Tweak: {
  label: "需要结构\n改进？"
  shape: document
}

Start -> Code-Change
Start -> Content-Tweak
Start -> Structure-Tweak

Code-Change -> Generate-Command: "`aigne doc generate`"

Generate-Command -> Smart-Detection: {
  label: "智能检测\n(分析变更)"
  shape: diamond
}
Smart-Detection -> Auto-Regen: "重新生成\n受影响的文档"

Content-Tweak -> Update-Command: "`aigne doc update --feedback`"
Update-Command -> Manual-Regen: "重新生成\n特定文档"

Structure-Tweak -> Generate-Feedback-Command: "`aigne doc generate --feedback`"
Generate-Feedback-Command -> Replan: "重新规划文档\n结构"

End: {
  shape: circle
  label: "文档已更新"
}

Auto-Regen -> End
Manual-Regen -> End
Replan -> End
```

---

## 通过智能检测自动更新

当您运行 `aigne doc generate` 命令时，DocSmith 不会盲目地重新生成所有内容。它会智能地分析您的代码库，检测自上次运行以来的变更，并仅重新生成受影响的文档。这一高效流程可以节省时间并减少不必要的 LLM API 调用。

```bash
# DocSmith 将自动检测变更并仅更新必要的内容
aigne doc generate
```

![DocSmith 能够智能检测变更并仅重新生成必要的文档。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 强制完全重新生成

如果您需要从头开始重新生成所有文档，忽略缓存和先前的状态，请使用 `--forceRegenerate` 标志。这在配置发生重大更改或您希望确保完全重新构建时非常有用。

```bash
# 从头开始重新生成所有文档
aigne doc generate --forceRegenerate
```

---

## 通过反馈优化单个文档

有时，您需要在没有相应代码更改的情况下改进特定文档。`aigne doc update` 命令专为此目的设计，允许您向 AI 提供有针对性的反馈以优化内容。

您可以通过两种方式使用此命令：交互式或直接通过命令行参数。

### 交互模式

要获得简单、引导式的体验，只需运行不带任何参数的命令。DocSmith 将为您呈现一个交互式菜单，以选择您想要更新的文档。选择后，系统将提示您输入反馈。

```bash
# 启动交互式更新流程
aigne doc update
```

![以交互方式选择您希望更新的文档。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接通过命令行更新

为了实现更快的工作流或编写脚本，您可以使用标志直接指定文档和反馈。这允许进行精确的非交互式更新。

```bash
# 使用反馈更新特定文档
aigne doc update --docs overview.md --feedback "在末尾添加一个更全面的常见问题解答部分。"
```

`update` 命令的关键参数：

| Parameter  | Description                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `--docs`     | 您想要更新的文档路径。您可以多次使用此标志。                 |
| `--feedback` | 供 AI 在重新生成内容时使用的具体反馈或说明。           |

---

## 优化整体结构

除了优化单个文档的内容外，您还可以优化整体文档结构。如果您觉得某个部分缺失，或者现有组织结构可以改进，您可以使用 `generate` 命令向结构规划 agent 提供反馈。

此命令会告知 DocSmith 根据您的新输入重新考虑整个文档计划。

```bash
# 使用特定反馈重新生成结构计划
aigne doc generate --feedback "移除‘关于’部分，并添加一个更详细的‘API 参考’。"
```

这种方法最适合对目录进行高层级的更改，而不是逐行编辑内容。

借助这些工具，您可以维护与项目一同发展的准确、高质量的文档。内容优化后，您可能希望将其提供给全球受众。请在 [翻译文档](./features-translate-documentation.md) 指南中了解如何操作。