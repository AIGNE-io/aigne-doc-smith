---
labels: ["Reference"]
---

# 生成文档

了解如何使用单个命令从源代码自动创建一套完整的文档。 `aigne doc generate` 命令是从头开始创建完整文档套件的主要工具，它会智能分析您的代码库，以生成逻辑结构和高质量的内容。

## 生成过程

在最简单的情况下，生成一套完整的文档仅需一个命令。

```bash 基本生成命令 icon=lucide:play-circle
aigne doc generate
```

### 智能自动配置

如果您是第一次在项目中运行 DocSmith，则无需运行单独的设置命令。 `generate` 命令会自动检测是否缺少配置，并启动一个交互式向导来引导您完成设置过程。这包括：

- 定义文档生成规则和样式。
- 指定目标受众。
- 设置主要语言和翻译语言。
- 配置源代码和输出路径。

这一智能功能可确保您通过一个直观的命令即可立即上手。

![运行 generate 命令会启动智能设置](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

![回答几个问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 会规划文档结构并生成内容，同时让您随时了解其进度。

![DocSmith 随后规划结构并生成内容](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

![成功生成文档](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

### 生成工作流

下图阐释了 `generate` 命令的完整工作流，从初始检查到最终输出。

```d2 文档生成工作流 icon=lucide:workflow
direction: down

User: { 
  shape: c4-person 
  label: "用户"
}

CLI: {
  label: "AIGNE CLI"
  shape: rectangle
}

DocSmith-Engine: {
  label: "DocSmith 引擎"
  shape: rectangle

  Config-Check: { label: "1. 检查配置" }
  Interactive-Setup: { label: "2. 运行交互式设置" }
  Structure-Planner: { label: "3. 规划结构 (AI)" }
  Content-Generator: { label: "4. 生成内容 (AI)" }
  File-Saver: { label: "5. 保存文档" }
}

Source-Code: {
    label: "源代码"
    shape: cylinder
}

Output-Docs: {
    label: "输出目录"
    shape: cylinder
}

User -> CLI: "aigne doc generate"
CLI -> DocSmith-Engine.Config-Check

DocSmith-Engine.Config-Check -> DocSmith-Engine.Interactive-Setup: "未找到"
DocSmith-Engine.Interactive-Setup -> DocSmith-Engine.Config-Check: "保存配置"

DocSmith-Engine.Config-Check -> DocSmith-Engine.Structure-Planner: "已找到"
DocSmith-Engine.Structure-Planner <-> Source-Code: "分析"
DocSmith-Engine.Structure-Planner -> DocSmith-Engine.Content-Generator
DocSmith-Engine.Content-Generator <-> Source-Code: "分析"
DocSmith-Engine.Content-Generator -> DocSmith-Engine.File-Saver
DocSmith-Engine.File-Saver -> Output-Docs: "写入文件"

```

## 高级生成选项

虽然基本命令功能强大，但您可以使用多个选项自定义其行为，以适应不同场景。

### 强制重新生成

如果您希望舍弃所有现有文档，并根据最新的源代码和配置从头开始重新生成所有内容，请使用 `--forceRegenerate` 标志。

```bash 强制重新生成 icon=lucide:refresh-cw
aigne doc generate --forceRegenerate
```

当您对项目结构进行了重大更改或希望完全从头开始时，此功能非常有用。

### 使用反馈优化结构

您可以通过提供直接反馈来指导 AI 的结构规划。使用 `--feedback` 标志来建议添加、删除或重组。这使您无需手动编辑配置文件即可完善整体文档结构。

```bash 使用反馈优化结构 icon=lucide:lightbulb
# 添加一个新章节
aigne doc generate --feedback "添加一个更详细的安装指南和一个故障排除章节"

# 删除或重组章节
aigne doc generate --feedback "删除“关于”章节并添加一个 API 参考"
```

### 指定 AI 模型

DocSmith 与 AIGNE Hub 集成，使您能够轻松在不同的大型语言模型 (LLMs) 之间切换，而无需管理 API 密钥。使用 `--model` 选项指定用于生成的模型。

```bash 使用不同的 LLM icon=lucide:bot
# 使用 Google 的 Gemini 1.5 Flash
aigne doc generate --model google:gemini-1.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o
aigne doc generate --model openai:gpt-4o
```

## 命令摘要

| 选项 | 描述 | 示例 |
| ------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| (无) | 生成文档。如果未配置，则运行交互式设置。 | `aigne doc generate` |
| `--forceRegenerate` | 删除现有文档并从头开始重新生成所有内容。 | `aigne doc generate --forceRegenerate` |
| `--feedback` | 向 AI 提供反馈以完善整体文档结构。 | `aigne doc generate --feedback "添加一个新的快速入门指南"` |
| `--model` | 通过 AIGNE Hub 指定用于生成的不同 LLM。 | `aigne doc generate --model openai:gpt-4o` |

---

### 后续步骤

生成初始文档后，随着代码的演进，您通常需要进行小幅调整或更新。在 [更新和完善](./features-update-and-refine.md) 部分中，了解如何高效地完成此操作。