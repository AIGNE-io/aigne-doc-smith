# 概述

AIGNE DocSmith 是一款由 AI 驱动的工具，可直接从源代码生成文档。它基于 [AIGNE 框架](https://www.aigne.io/en/framework) 构建，能够自动化创建结构化、多语言的文档。这一过程减少了编写和维护文档的人工投入，并确保文档与代码库保持同步。

下图展示了 DocSmith 的高级工作流程：

```d2
direction: right
style: {
  font-size: 14
}

# Actors
source_code: "源代码仓库" {
  shape: cloud
  style: {
    fill: "#F0F4F8"
    stroke: "#4A5568"
  }
}

docsmith: "AIGNE DocSmith 引擎" {
  shape: hexagon
  style: {
    fill: "#E6FFFA"
    stroke: "#2C7A7B"
  }
}

published_docs: "已发布的文档" {
  shape: document
  style: {
    fill: "#FEFCBF"
    stroke: "#B7791F"
  }
}

# Main Flow
source_code -> docsmith: "1. 分析代码"
docsmith -> published_docs: "2. 生成并发布"

# DocSmith Internal Process
subflow: {
  direction: down
  
  analyze: "分析并规划结构"
  generate: "生成内容"
  translate: "翻译（可选）"
  publish: "发布"
  
  analyze -> generate -> translate -> publish
}

docsmith.subflow: subflow
```

## 核心功能

DocSmith 提供了一系列功能来自动化和简化文档处理过程：

*   **结构规划：** 分析代码库以生成逻辑清晰的文档结构。
*   **内容生成：** 使用从源代码生成的内容填充已规划的文档结构。
*   **多语言支持：** 可将文档翻译成 12 种语言，包括英语、中文、日语和西班牙语。
*   **AIGNE Hub 集成：** 使用 [AIGNE Hub](https://www.aigne.io/en/hub) 作为 LLM 提供商，无需管理单个 API 密钥即可切换模型。
*   **一键发布：** 通过可共享的链接发布您的文档。您可以发布到官方平台 [docsmith.aigne.io](https://docsmith.aigne.io/app/)，也可以发布到您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 实例。
*   **迭代更新：** 检测源代码变更以更新文档，并支持根据用户反馈对特定文档进行定向重新生成。

## AIGNE 生态系统的一部分

DocSmith 是 [AIGNE](https://www.aigne.io) 生态系统的重要组成部分，该生态系统是一个用于开发 AI 应用的平台。它与其他 AIGNE 组件集成，以利用平台的人工智能能力和基础设施。

下图展示了 DocSmith 如何融入 AIGNE 架构：

![AIGNE 生态系统架构](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 后续步骤

要开始使用 DocSmith，请继续阅读安装和配置指南。

<x-card data-title="下一步：开始使用" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="开始阅读指南">
遵循分步指南安装工具、配置您的第一个项目并生成文档。
</x-card>