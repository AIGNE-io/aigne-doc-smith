# 工作原理

AIGNE DocSmith 通过使用多 Agent 系统提供自动化文档解决方案。DocSmith 不依赖单一的 AI 模型，而是编排了一个由专业 AI Agent 组成的流水线，每个 Agent 都是其特定任务的专家。这种协作方法直接从您的源代码生成结构化且详细的文档。

DocSmith 的核心是一个流水线，通过几个不同阶段处理您的源代码，每个阶段由一个或多个专用的 AI Agent 管理。

## 文档生成流水线

从分析代码到发布最终文档的整个过程，都遵循一个结构化的流水线。这确保了一致性，并允许在任何阶段进行有针对性的优化。

```d2
direction: down

Input: {
  label: "源代码和配置"
  shape: package
}

Pipeline: {
  label: "文档生成流水线"
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. 结构规划\n(reflective-structure-planner)"
    shape: step
  }

  Content-Generation: {
    label: "2. 内容生成\n(content-detail-generator)"
    shape: step
  }

  Saving: {
    label: "3. 保存文档\n(save-docs)"
    shape: step
  }
}

User-Feedback: {
  label: "用户反馈循环\n(通过 --feedback 标志)"
  shape: callout
}

Optional-Steps: {
  label: "可选步骤"
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "翻译\n(aigne doc translate)"
    shape: step
  }

  Publishing: {
    label: "发布\n(aigne doc publish)"
    shape: step
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "优化结构"
User-Feedback -> Pipeline.Content-Generation: "重新生成内容"
```

1.  **输入分析**：该过程从 `load-sources` 和 `load-config` 等 Agent 开始，它们负责收集您的源代码、配置文件（`aigne.yaml`）以及任何用户定义的规则。

2.  **结构规划**：`reflective-structure-planner` Agent 会分析代码库，提出一个逻辑化的文档结构。它会考虑您指定的目标受众、规则和反馈，以创建最佳大纲。

3.  **内容生成**：一旦结构获得批准，`content-detail-generator` 和 `batch-docs-detail-generator` Agent 就会接管工作。它们会为文档计划的每个部分填充详细内容，确保技术准确性并遵循定义的风格。

4.  **优化与更新**：如果您使用 `aigne doc update` 或 `aigne doc generate --feedback` 提供反馈，`detail-regenerator` 和 `feedback-refiner` Agent 将被激活。它们会根据您的输入更新特定文档或调整整体结构。

5.  **翻译与发布**：最后，像 `translate` 和 `publish-docs` 这样的可选 Agent 会处理多语言翻译并发布到 Discuss Kit 平台，从而完成端到端的工作流程。

## 关键 AI Agent

DocSmith 的功能来自于其专业的 Agent 团队。虽然许多 Agent 在幕后工作，但以下是文档流水线中的一些关键角色：

| Agent 角色 | 主要功能 | 相关文件 |
|---|---|---|
| **结构规划 Agent** | 分析源代码和规则以生成整体文档大纲。 | `structure-planning.yaml`, `reflective-structure-planner.yaml` |
| **内容生成 Agent** | 根据计划为每个文档部分编写详细内容。 | `content-detail-generator.yaml`, `batch-docs-detail-generator.yaml` |
| **翻译 Agent** | 将生成的文档翻译成多种目标语言。 | `translate.yaml`, `batch-translate.yaml` |
| **优化 Agent** | 根据用户反馈重新生成或修改内容和结构。 | `detail-regenerator.yaml`, `feedback-refiner.yaml` |
| **发布 Agent** | 管理将文档发布到 Discuss Kit 实例的过程。 | `publish-docs.mjs`, `team-publish-docs.yaml` |
| **配置加载 Agent** | 读取并解析项目的配置文件和源文件。 | `load-config.mjs`, `load-sources.mjs` |

这种模块化的、基于 Agent 的架构使 DocSmith 灵活而强大，允许流程中的每一步都能独立优化。

---

现在您已经了解了 DocSmith 背后的工作原理，接下来请在 [质量保证](./advanced-quality-assurance.md) 部分了解为保证输出质量而采取的措施。
