---
labels: ["Reference"]
---

# 生成文档

AIGNE DocSmith 将创建全面文档的过程简化为一个功能强大的命令。它会分析您的源代码，自动规划出逻辑结构，然后为每个部分生成详细内容。本页将介绍如何从零开始生成文档，以及如何优化整体结构。

## 主要生成命令

要开始此过程，请在终端中导航到您项目的根目录，并运行以下命令：

```bash
aigne doc generate
```

### 智能自动配置

当您首次在新项目中运行此命令时，DocSmith 的 **智能自动配置** 功能将被激活。它会检测到项目缺少配置文件，并自动启动一个交互式向导来引导您完成设置。

![首次运行生成命令将智能触发设置向导。](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

您需要回答几个简单的问题来定义：

- 生成的风格和规则
- 您的目标受众
- 主要语言以及用于翻译的其他语言
- 您的源代码位置
- 生成文档的输出目录

![回答几个问题以完成初始项目设置。](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将继续分析您的代码、规划文档结构并生成内容。

![DocSmith 正在执行结构规划和文档生成阶段。](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

成功完成后，您将看到一条确认消息，并且您的新文档将在指定的输出目录中准备就绪。

![成功消息表示您的文档已生成。](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 强制完全重新生成

如果您对源代码进行了重大更改或更新了配置，并希望从头开始重新构建所有文档，可以使用 `--forceRegenerate` 标志。这将确保所有现有内容被丢弃，并替换为新生成的文档。

```bash
aigne doc generate --forceRegenerate
```

## 通过反馈优化文档结构

您可以通过向 AI 提供直接反馈来影响文档的整体结构。使用 `--feedback` 标志可以建议更改，例如添加、删除或重组章节。这对于在内容撰写前优化 DocSmith 创建的顶层大纲非常有用。

**示例：添加新章节**

```bash
aigne doc generate --feedback "添加更详细的安装指南和故障排除章节"
```

**示例：重组内容**

```bash
aigne doc generate --feedback "删除 '关于' 章节并添加详细的 'API 参考'"
```

## 命令选项

以下是 `generate` 命令的可用选项摘要。

| 参数 | 描述 | 示例 |
| --- | --- | --- |
| (none) | 开始生成过程。如果未配置，则触发设置向导。 | `aigne doc generate` |
| `--forceRegenerate` | 删除所有现有文档并从头开始重新生成。 | `aigne doc generate --forceRegenerate` |
| `--feedback "<text>"` | 提供反馈以优化和完善整体文档结构计划。 | `aigne doc generate --feedback "添加高级用法指南"` |
| `--model <provider:model>` | 指定通过 AIGNE Hub 用于生成的特定大语言模型。 | `aigne doc generate --model openai:gpt-4o` |

---

现在，您可以生成一套完整的文档，并引导 AI 以获得更好的结构化结果。文档创建后，您可能需要进行一些微调，或随着代码的演进而更新它们。

要了解如何高效地完成这些操作，请继续阅读下一章节：[更新和优化](./features-update-and-refine.md)。