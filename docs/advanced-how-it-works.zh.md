---
labels: ["Reference"]
---

# 工作原理

AIGNE DocSmith 基于 AIGNE 框架构建的多 Agent 系统，提供了一套精密的自动化文档解决方案。 DocSmith 并非依赖单一、庞大的 AI，而是通过协调一系列专业的 AI Agent 组成的流水线，每个 Agent 都是其特定任务的专家。 这种协作方式确保了能够直接从您的源代码生成结构化、详细且高质量的文档。

## 架构概述

DocSmith 是 AIGNE 生态系统不可或缺的一部分，AIGNE 是一个用于 AI 应用开发的综合平台。 它与其他 AIGNE 组件无缝集成，利用平台的核心 AI 能力和基础设施。

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

DocSmith 的核心是一个处理流水线，它将您的源代码经过几个不同阶段的处理，每个阶段都由一个或多个专用的 AI Agent 管理。

## 文档生成流水线

从分析代码到发布最终文档的整个过程，都遵循一个结构化的流水线。 这确保了过程的一致性，并允许在任何阶段进行有针对性的优化。

```d2
direction: down

"Source Code & Config": {
  shape: step
  label: "输入：源代码与配置"
}

"Structure Planning": {
  shape: step
  label: "1. 结构规划"
}

"Content Generation": {
  shape: step
  label: "2. 内容生成"
}

"Saving & Output": {
  shape: step
  label: "3. 保存与输出"
}

"Optional Processes": {
  shape: diamond
  label: "4. 可选流程"
}

"Translation": {
  shape: step
  label: "翻译"
}

"Publishing": {
  shape: step
  label: "发布"
}

"Feedback Loop": {
  shape: callout
  label: "用户反馈循环"
}

"Source Code & Config" -> "Structure Planning"
"Structure Planning" -> "Content Generation"
"Content Generation" -> "Saving & Output"
"Saving & Output" -> "Optional Processes"

"Optional Processes" -> "Translation": "翻译文档"
"Optional Processes" -> "Publishing": "发布文档"

"Structure Planning" <- "Feedback Loop": "优化结构"
"Content Generation" <- "Feedback Loop": "重新生成内容"

```

1.  **输入分析**：该过程始于 `load-sources` 和 `load-config` 等 Agent，它们负责收集您的源代码、配置文件（`aigne.yaml`）以及任何用户定义的规则。

2.  **结构规划**：`reflective-structure-planner` Agent 会分析代码库，以提出一个全面且逻辑清晰的文档结构。它会考虑您指定的目标受众、规则和反馈，以创建最佳大纲。

3.  **内容生成**：一旦结构获得批准，`content-detail-generator` 和 `batch-docs-detail-generator` Agent 就会接手。它们会用详细、高质量的内容填充文档计划的每个部分，确保技术准确性并遵循定义的风格。

4.  **优化与更新**：如果您使用 `aigne doc update` 或 `aigne doc generate --feedback` 提供反馈，`detail-regenerator` 和 `feedback-refiner` Agent 将被激活。它们会根据您的输入智能地更新特定文档或调整整体结构。

5.  **翻译与发布**：最后，像 `translate` 和 `publish-docs` 这样的可选 Agent 会处理多语言翻译和发布到 Discuss Kit 平台的工作，从而完成端到端的工作流。

## 关键 AI Agent

DocSmith 的强大之处在于其专业的 Agent 团队。虽然许多 Agent 在幕后工作，但以下是文档生成流水线中的一些关键角色：

| Agent 角色 | 主要功能 | 相关文件 |
|---|---|---|
| **结构规划器** | 分析源代码和规则，以生成整体的文档大纲。 | `structure-planning.yaml`, `reflective-structure-planner.yaml` |
| **内容生成器** | 根据计划为每个文档部分撰写详细内容。 | `content-detail-generator.yaml`, `batch-docs-detail-generator.yaml` |
| **Translation Agent** | 将生成的文档翻译成多种目标语言。 | `translate.yaml`, `batch-translate.yaml` |
| **Refinement Agent** | 根据用户反馈重新生成或修改内容和结构。 | `detail-regenerator.yaml`, `feedback-refiner.yaml` |
| **Publishing Agent** | 管理将文档发布到 Discuss Kit 实例的过程。 | `publish-docs.mjs`, `team-publish-docs.yaml` |
| **配置加载器** | 从 `aigne.yaml` 读取并解释项目的配置。 | `load-config.mjs` |

这种模块化的、基于 Agent 的架构使 DocSmith 变得高度灵活和健壮，允许流程的每一步都可以独立优化。

---

现在您已经了解了 DocSmith 背后的工作机制，接下来请在 [质量保证](./advanced-quality-assurance.md) 部分了解为确保高质量输出而采取的措施。
