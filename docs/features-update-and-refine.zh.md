# 更新与优化

保持文档与不断演进的代码库同步是一项至关重要的任务。AIGNE DocSmith 提供了直接而灵活的方法来确保内容保持最新，无论是通过基于代码变更的自动更新，还是通过由反馈驱动的精确优化。

本指南将介绍如何：

- 在源代码变更时自动更新文档。
- 使用有针对性的反馈重新生成特定文档。
- 调整整体文档结构。

### 文档更新工作流

下图说明了更新文档可采用的不同路径：

```d2 Update Workflows
direction: down

Start: {
  shape: circle
  label: "开始"
}

Code-Change: {
  label: "源代码或\n配置变更"
  shape: rectangle
}

Content-Tweak: {
  label: "需要内容\n改进？"
  shape: rectangle
}

Structure-Tweak: {
  label: "需要结构\n改进？"
  shape: rectangle
}

Start -> Code-Change
Start -> Content-Tweak
Start -> Structure-Tweak

Code-Change -> Generate-Command: "aigne doc generate"

Generate-Command -> Change-Detection: {
  label: "变更检测"
  shape: diamond
}
Change-Detection -> Auto-Regen: "重新生成\n受影响的文档"

Content-Tweak -> Update-Command: "aigne doc update\n--feedback"
Update-Command -> Manual-Regen: "重新生成\n特定文档"

Structure-Tweak -> Generate-Feedback-Command: "aigne doc generate\n--feedback"
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

## 通过变更检测自动更新

当您运行 `aigne doc generate` 命令时，DocSmith 会分析您的代码库，检测自上次运行以来的所有变更，并仅重新生成受影响的文档。这一过程可以节省时间并减少不必要的 API 调用。

```shell icon=lucide:terminal
# DocSmith 将检测变更并仅更新必要部分
aigne doc generate
```

![DocSmith 检测变更并仅重新生成所需文档。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 强制完全重新生成

如果您需要从头开始重新生成所有文档，忽略任何缓存或先前的状态，请使用 `--forceRegenerate` 标志。这在进行重大配置更改后，或当您希望确保构建一个全新的版本时非常有用。

```shell icon=lucide:terminal
# 从头开始重新生成所有文档
aigne doc generate --forceRegenerate
```

---

## 优化单个文档

如果想在没有相应代码变更的情况下改进特定文档，可以使用 `aigne doc update` 命令提供有针对性的内容优化指令。

您可以通过两种方式使用此命令：交互式模式或直接通过命令行参数。

### 交互模式

如需引导式体验，请直接运行该命令，不带任何参数。DocSmith 将会展示一个菜单，供您选择要更新的文档。选择后，系统将提示您输入反馈。

```shell icon=lucide:terminal
# 启动交互式更新流程
aigne doc update
```

![以交互方式选择您希望更新的文档。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接通过命令行更新

为了实现更快的工作流或用于脚本编写，您可以使用标志直接指定文档和反馈。这支持精确的非交互式更新。

```shell icon=lucide:terminal
# 使用反馈更新特定文档
aigne doc update --docs overview.md --feedback "在末尾添加一个更详细的 FAQ 部分。"
```

`update` 命令的关键参数：

| Parameter  | Description                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `--docs`     | 您希望更新的文档路径。您可以多次使用此标志进行批量更新。 |
| `--feedback` | 重新生成内容时要使用的具体指令。                       |

---

## 优化整体结构

除了优化单个文档的内容，您还可以调整整体文档结构。如果缺少某个部分或现有组织结构有待改进，您可以向 `generate` 命令提供反馈。

该命令会指示 DocSmith 根据您的新输入重新评估整个文档计划。

```shell icon=lucide:terminal
# 使用特定反馈重新生成文档结构
aigne doc generate --feedback "删除‘关于’部分，并添加一个详细的‘API 参考’。"
```

这种方法最适合对文档的目录进行高层级的更改，而不是逐行编辑内容。

借助这些工具，您可以维护与项目共同演进的准确文档。内容优化后，您可以将其提供给全球用户。具体方法请参阅[翻译文档](./features-translate-documentation.md)指南。