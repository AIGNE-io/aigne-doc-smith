# 工作原理

AIGNE DocSmith 使用一个多 Agent 系统来自动化文档生成。DocSmith 不使用单个 AI 模型，而是协调一个由专业化 AI Agent 组成的流水线，其中每个 Agent 都是特定任务的专家。这种协作方法可以直接从您的源代码生成结构化且详细的文档。

其核心是，DocSmith 作为一个流水线运行，通过几个不同的阶段处理您的源代码，每个阶段都由一个或多个专用的 AI Agent 管理。

## 文档生成流水线

从分析代码到发布最终文档的整个过程，都遵循一个结构化的流水线。这确保了一致性，并允许在任何阶段进行有针对性的优化。

```d2
direction: down

Input: {
  label: "Source Code & Config"
  shape: rectangle
}

Pipeline: {
  label: "Documentation Generation Pipeline"
  shape: rectangle
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. Structure Planning\n(reflective-structure-planner)"
    shape: rectangle
  }

  Content-Generation: {
    label: "2. Content Generation\n(content-detail-generator)"
    shape: rectangle
  }

  Saving: {
    label: "3. Save Documents\n(save-docs)"
    shape: rectangle
  }
}

User-Feedback: {
  label: "User Feedback Loop\n(via --feedback flag)"
  shape: rectangle
}

Optional-Steps: {
  label: "Optional Steps"
  shape: rectangle
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "Translate\n(aigne doc translate)"
    shape: rectangle
  }

  Publishing: {
    label: "Publish\n(aigne doc publish)"
    shape: rectangle
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "Refine Structure"
User-Feedback -> Pipeline.Content-Generation: "Regenerate Content"
```

1.  **输入分析**：该过程始于 `load-sources` 和 `load-config` 等 Agent，它们会收集您的源代码、配置文件（`aigne.yaml`）以及任何用户定义的规则。

2.  **结构规划**：`reflective-structure-planner` Agent 会分析代码库，以提出一个逻辑化的文档结构。它会考虑您指定的目标受众、规则和反馈，以创建一个最佳大纲。

3.  **内容生成**：一旦结构确定，`content-detail-generator` 和 `batch-docs-detail-generator` Agent 就会接管。它们会用详细内容填充文档计划的每个部分，确保技术准确性并遵循定义的风格。

4.  **优化与更新**：如果您使用 `aigne doc update` 或 `aigne doc generate --feedback` 提供反馈，`detail-regenerator` 和 `feedback-refiner` Agent 将被激活。它们会根据您的输入更新特定文档或调整整体结构。

5.  **翻译与发布**：最后，像 `translate` 和 `publish-docs` 这样的可选 Agent 会处理多语言翻译和发布到 Discuss Kit 平台的工作，从而完成端到端的工作流。

## 关键 AI Agent

DocSmith 的功能源于其专业化的 Agent 团队。虽然许多 Agent 在幕后工作，但以下是文档生成流水线中的一些关键角色：

| Agent 角色 | 主要功能 | 相关文件 |
|---|---|---|
| **Structure Planner** | 分析源代码和规则，生成整体文档大纲。 | `structure-planning.yaml`, `reflective-structure-planner.yaml` |
| **Content Generator** | 根据计划为每个独立的文档部分撰写详细内容。 | `content-detail-generator.yaml`, `batch-docs-detail-generator.yaml` |
| **Translation Agent** | 将生成的文档翻译成多种目标语言。 | `translate.yaml`, `batch-translate.yaml` |
| **Refinement Agent** | 根据用户反馈重新生成或修改内容和结构。 | `detail-regenerator.yaml`, `feedback-refiner.yaml` |
| **Publishing Agent** | 管理将文档发布到 Discuss Kit 实例的过程。 | `publish-docs.mjs`, `team-publish-docs.yaml` |
| **Configuration Loader** | 读取并解析项目的配置文件和源文件。 | `load-config.mjs`, `load-sources.mjs` |

这种模块化的、基于 Agent 的架构使得 DocSmith 灵活而强大，允许流程中的每一步都能被独立优化。

---

现在您已经了解了 DocSmith 背后的工作原理，请在 [质量保证](./advanced-quality-assurance.md) 部分了解为保证输出质量而采取的措施。