# 工作原理

AIGNE DocSmith 在一个多 Agent 系统上运行。它不是一个单一的整体流程，而是协调一个由专门的 AI Agent 组成的管道，其中每个 Agent 负责一项特定任务。这种方法允许通过一个结构化和模块化的流程将源代码转换为完整的文档。

该工具是更广泛的 AIGNE 生态系统的一个组成部分，该生态系统为开发和部署 AI 应用程序提供了一个平台。

![AIGNE 生态系统架构](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 文档生成管道

DocSmith 的核心是一个通过几个不同阶段处理您的源代码的管道。每个阶段都由一个或多个专用 Agent 管理。主要工作流程通常由 `aigne doc generate` 命令启动，可以可视化如下：

```d2
direction: down

Input: {
  label: "源代码和配置"
  shape: rectangle
}

Pipeline: {
  label: "核心生成管道"
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

1.  **输入分析**：当 Agent 加载您的源代码和项目配置（`aigne.yaml`）时，该过程开始。

2.  **结构规划**：一个 Agent 分析代码库以提出一个逻辑化的文档结构。它会根据项目的构成和任何指定的规则创建一个大纲。

3.  **内容生成**：结构确定后，内容生成 Agent 会为文档计划的每个部分填充详细的文本、代码示例和解释。

4.  **优化和更新**：当您通过 `aigne doc update` 或 `aigne doc generate --feedback` 提供输入时，特定的 Agent 会被激活以更新单个文档或调整整体结构。

5.  **翻译和发布**：在主要内容生成后，可选的 Agent 会处理多语言翻译和将最终文档发布到 Web 平台等任务。

## 关键 AI Agent

DocSmith 的功能由项目配置中定义的一系列 Agent 提供。每个 Agent 都有特定的角色。下表列出了一些关键 Agent 及其功能。

| 功能角色 | 关键 Agent 文件 | 描述 |
| :--- | :--- | :--- |
| **结构规划** | `generate/generate-structure.yaml` | 分析源代码以提出初始文档大纲。 |
| **结构优化** | `generate/refine-document-structure.yaml` | 根据用户反馈修改文档结构。 |
| **内容生成** | `update/batch-generate-document.yaml`, `update/generate-document.yaml` | 为文档结构的每个部分填充详细内容。 |
| **翻译** | `translate/translate-document.yaml`, `translate/translate-multilingual.yaml` | 将生成的文档翻译成多种目标语言。 |
| **发布** | `publish/publish-docs.mjs` | 管理将文档发布到 Discuss Kit 实例的过程。 |
| **数据 I/O** | `utils/load-sources.mjs`, `utils/save-docs.mjs` | 负责读取源文件并将最终的 Markdown 文档写入磁盘。 |

这种基于 Agent 的架构允许文档流程的每一步都由专门的工具处理，从而确保一个结构化且可维护的工作流程。

---

要了解 DocSmith 为确保输出的准确性和格式而采取的措施，请继续阅读[质量保证](./advanced-quality-assurance.md)部分。