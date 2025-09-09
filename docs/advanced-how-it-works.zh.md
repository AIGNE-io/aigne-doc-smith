---
labels: ["Reference"]
---

# 工作原理

AIGNE DocSmith 通过基于 AIGNE 框架构建的复杂多 Agent AI 流水线，将你的源代码转换为全面的文档。DocSmith 并非采用单一、庞大的流程，而是使用一组专业的 AI Agent，每个 Agent 负责文档生命周期中的特定任务。本节将对该流程进行架构概述。

## 基于 Agent 的架构

DocSmith 的核心是其 AI Agent 集合。每个 Agent 都是一个专门的 AI 模型，配置用于执行不同的功能，例如规划文档结构、生成详细内容或翻译文本。这些 Agent 在配置文件（如 `structure-planning.yaml` 和 `content-detail-generator.yaml`）中定义，并通过编排在流水线中协同工作。

这种模块化的方法可以实现更好的控制、质量和可维护性。流程中的每一步都由专家处理，确保高质量的成果。

## 文档生成流水线

文档生成过程遵循一个清晰的多步骤流水线：

```d2
direction: down

Source-Code: {
  label: "源代码和用户输入"
  shape: cylinder
}

Structure-Planner: {
  label: "1. 结构规划 Agent"
  shape: rectangle
}

Structure-Plan: {
  label: "逻辑文档结构 (structurePlan.yaml)"
  shape: rectangle
}

Content-Generator: {
  label: "2. 内容生成 Agent"
  shape: rectangle
}

Markdown-Docs: {
  label: "详细的 Markdown 文档"
  shape: rectangle
}

Translation-Agent: {
  label: "3. 翻译 Agent"
  shape: rectangle
}

Translated-Docs: {
  label: "多语言文档"
  shape: rectangle
}

Source-Code -> Structure-Planner: "分析代码库"
Structure-Planner -> Structure-Plan: "生成蓝图"
Structure-Plan -> Content-Generator: "提供上下文"
Source-Code -> Content-Generator: "提供细节"
Content-Generator -> Markdown-Docs: "为每个部分编写内容"
Markdown-Docs -> Translation-Agent: "翻译"
Translation-Agent -> Translated-Docs: "输出本地化版本"

```

### 1. 结构规划

该过程始于 `structurePlanGenerator` agent 分析你的代码库、用户需求和任何现有文档。在一个复杂的提示（`prompts/structure-planning.md`）的指导下，它会生成一个全面且合乎逻辑的文档结构，称为 `structurePlan`。该计划就像一张蓝图，定义了每个部分、其标题、描述以及应基于的相关源文件。

DocSmith 还使用了一个 `reflective-structure-planner`，它可以根据反馈审查和完善初始计划，确保最终结构是最佳的。

### 2. 内容生成

一旦结构被定义，`contentDetailGenerator` agent 就会接管。它会遍历 `structurePlan` 中的每一项，并生成详细、高质量的内容。对于每个部分，它会收到：

- 该部分的**标题、描述和路径**。
- 与该部分相关的特定**源代码片段**。
- 用于提供上下文的**整体结构计划**。
- 一个详细的**提示** (`prompts/content-detail-generator.md`)，用于指导其语气、风格和格式。

这确保了内容不仅技术上准确，而且具有上下文感知能力，并与文档的其余部分保持一致。

### 3. 翻译和优化

在主语言文档生成后，可以调用像 `translate` 和 `batch-translate` 这样的 Agent。它们会接收生成的 Markdown 文件，并利用强大的语言模型将其翻译成你配置的多种语言，提供准确且听起来自然的翻译。

此外，像 `detail-regenerator` 这样的 Agent 允许你根据特定反馈更新和优化单个文档，确保文档可以随着时间的推移进行迭代改进。