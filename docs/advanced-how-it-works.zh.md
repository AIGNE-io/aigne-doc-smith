# 工作原理

AIGNE DocSmith 在 AIGNE 框架内构建的多 Agent 系统上运行。它并非一个单一的整体进程，而是协调一个由专业化 AI Agent 组成的流水线，其中每个 Agent 负责一项特定任务。这种方法实现了一个结构化和模块化的流程，可将源代码转换为完整的文档。

该工具是更庞大的 AIGNE 生态系统的一个组成部分，该生态系统为开发和部署 AI 应用程序提供了一个平台。

![AIGNE 生态系统架构](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 文档生成流水线

DocSmith 的核心是一个通过几个不同阶段处理源代码的流水线。每个阶段都由一个或多个专用 Agent 管理。主要工作流程通常由 `aigne doc generate` 命令启动，其可视化如下：

```d2
direction: down

Input: {
  label: "源代码和配置"
  shape: rectangle
}

Pipeline: {
  label: "核心生成流水线"
  shape: rectangle
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. 结构规划"
    shape: rectangle
  }

  Content-Generation: {
    label: "2. 内容生成"
    shape: rectangle
  }

  Saving: {
    label: "3. 保存文档"
    shape: rectangle
  }
}

User-Feedback: {
  label: "用户反馈循环\n(通过 --feedback 标志)"
  shape: rectangle
}

Optional-Steps: {
  label: "可选的生成后步骤"
  shape: rectangle
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "翻译\n(aigne doc translate)"
    shape: rectangle
  }

  Publishing: {
    label: "发布\n(aigne doc publish)"
    shape: rectangle
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "优化结构"
User-Feedback -> Pipeline.Content-Generation: "重新生成内容"
```

1.  **输入分析**：当 Agent 加载你的源代码和项目配置（`aigne.yaml`）时，该过程开始。

2.  **结构规划**：一个 Agent 会分析代码库，以提出一个逻辑性的文档结构。它会根据项目的构成和任何指定的规则创建一个大纲。

3.  **内容生成**：结构就位后，内容生成 Agent 会为文档计划的每个部分填充详细的文本、代码示例和解释。

4.  **优化和更新**：当你通过 `aigne doc update` 或 `aigne doc generate --feedback` 提供输入时，特定的 Agent 会被激活，以更新单个文档或调整整体结构。

5.  **翻译和发布**：主要内容生成后，可选的 Agent 会处理多语言翻译和将最终文档发布到网络平台等任务。

## 关键 AI Agent

DocSmith 的功能由项目配置中定义的一组 Agent 提供。每个 Agent 都有特定的角色。下表列出了一些关键 Agent 及其功能。

| 功能角色 | 关键 Agent 文件 | 描述 |
| --- | --- | --- |
| **结构规划** | `generate/generate-structure.yaml` | 分析源代码以提出初始文档大纲。 |
| **结构优化** | `generate/refine-document-structure.yaml` | 根据用户反馈修改文档结构。 |
| **内容生成** | `update/batch-generate-document.yaml`, `generate-document.yaml` | 为每个部分填充详细内容，以充实文档结构。 |
| **翻译** | `translate/translate-document.yaml`, `translate-multilingual.yaml` | 将生成的文档翻译成多种目标语言。 |
| **发布** | `publish/publish-docs.mjs` | 管理将文档发布到 Discuss Kit 实例的过程。 |
| **数据 I/O** | `utils/load-sources.mjs`, `utils/save-docs.mjs` | 负责读取源文件并将最终的 markdown 文档写入磁盘。 |

这种基于 Agent 的架构使得文档流程的每一步都由一个专门的工具来处理，从而确保了工作流程的结构化和可维护性。

---

要了解 DocSmith 为确保输出的准确性和格式而采取的措施，请继续阅读[质量保证](./advanced-quality-assurance.md)部分。