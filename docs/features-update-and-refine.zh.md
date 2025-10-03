# 更新与优化

使文档与不断演进的代码库保持同步是一个系统性的过程。AIGNE DocSmith 提供了直接而灵活的命令，可以通过基于代码变更的自动更新或通过精确的、由反馈驱动的优化来保持您的内容为最新状态。

本指南提供了执行以下任务的步骤：

*   在源代码修改时自动更新文档。
*   使用有针对性的反馈重新生成特定文档。
*   调整整体文档结构。

### 文档更新工作流

下图说明了可用于更新文档的不同工作流：

```d2 文档更新工作流
direction: down

Developer: {
  shape: c4-person
}

Source-Code: {
  label: "源代码"
}

Documentation: {
  label: "文档"
}

Action-Choice: {
  label: "选择操作"
  shape: diamond
}

Generate-Sync: {
  label: "aigne doc generate"
  shape: rectangle

  Change-Detection: {
    label: "检测变更？"
    shape: diamond
  }
  Regenerate-Affected: "重新生成受影响部分"
  Regenerate-All: "重新生成全部"

  Change-Detection -> Regenerate-Affected: "是 (默认)"
  Change-Detection -> Regenerate-All: "否\n(--forceRegenerate)"
}

Refine-Content: {
  label: "aigne doc update"
}

Refine-Structure: {
  label: "aigne doc generate\n--feedback"
}

Developer -> Action-Choice

Action-Choice -> Generate-Sync: "与代码同步"
Action-Choice -> Refine-Content: "优化文档内容"
Action-Choice -> Refine-Structure: "优化文档结构"

Source-Code -> Generate-Sync

Generate-Sync.Regenerate-Affected -> Documentation: "更新"
Generate-Sync.Regenerate-All -> Documentation: "更新"
Refine-Content -> Documentation: "更新"
Refine-Structure -> Documentation: "更新"
```

---

## 通过变更检测自动更新

当您执行 `aigne doc generate` 命令时，DocSmith 会首先分析您的代码库，以检测自上次生成以来的变更。然后，它仅重新生成受这些变更影响的文档。这种默认行为通过避免冗余操作来节省时间并减少 API 使用。

```shell icon=lucide:terminal
# DocSmith 将检测变更并仅更新必要部分
aigne doc generate
```

![DocSmith 检测变更并仅重新生成所需文档。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 强制完全重新生成

要从头开始重新生成所有文档，绕过缓存和变更检测，请使用 `--forceRegenerate` 标志。当您进行了重大的配置更改或需要完全重建以确保所有文件的一致性时，这是必需的。

```shell icon=lucide:terminal
# 从头开始重新生成所有文档
aigne doc generate --forceRegenerate
```

---

## 使用反馈优化文档

您可以通过向 CLI 命令提供直接反馈来优化文档，而无需进行相应的代码更改。这对于提高清晰度、添加示例或调整结构非常有用。

### 优化单个文档内容

要改进特定文档的内容，请使用 `aigne doc update` 命令。该命令允许您提供有针对性的优化指令，并可以在两种模式下运行：交互式或非交互式。

#### 交互模式

要进行引导式流程，请在不带参数的情况下运行该命令。DocSmith 将显示一个菜单，供您选择要更新的文档。选择后，系统将提示您输入反馈。

```shell icon=lucide:terminal
# 启动交互式更新流程
aigne doc update
```

![以交互方式选择您希望更新的文档。](../assets/screenshots/doc-update.png)

#### 非交互模式

对于脚本化或更快速的工作流，您可以使用标志直接指定文档和反馈。这可以实现精确的非交互式更新。

```shell icon=lucide:terminal
# 使用反馈更新特定文档
aigne doc update --docs overview.md --feedback "在末尾添加一个更详细的常见问题解答部分。"
```

`update` 命令的主要参数如下：

| 参数  | 说明                                                                                          |
| :--------- | :--------------------------------------------------------------------------------------------------- |
| `--docs`     | 要更新的文档的路径。此标志可以多次使用以进行批量更新。      |
| `--feedback` | 包含在重新生成文档内容时要使用的具体说明的字符串。 |

### 优化整体结构

除了优化单个文档外，您还可以调整整体文档结构。如果现有组织结构不理想或缺少某个部分，您可以向 `generate` 命令提供反馈。这会指示 DocSmith 根据您的输入重新评估整个文档计划。

```shell icon=lucide:terminal
# 使用特定反馈重新生成文档结构
aigne doc generate --feedback "删除‘关于’部分，并添加一个详细的‘API 参考’。"
```

此方法旨在对文档的目录进行高级别更改，而非对单个文件内的次要内容进行编辑。

内容优化后，下一步是为全球受众做好准备。有关说明，请参阅 [翻译文档](./features-translate-documentation.md) 指南。