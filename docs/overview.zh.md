# 概述

AIGNE DocSmith 是一款 AI 驱动的工具，可直接从源代码生成文档。它基于 [AIGNE 框架](https://www.aigne.io/en/framework)，可自动创建结构化的多语言文档。此过程减少了编写和维护文档的人工工作量，确保文档与代码库保持同步。

## AIGNE 生态系统的一部分

DocSmith 是 [AIGNE](https://www.aigne.io) 生态系统的一个关键组件，该生态系统是一个用于开发 AI 应用的平台。它与其他 AIGNE 组件集成，以使用该平台的 AI 功能和基础设施。

下图说明了 DocSmith 如何融入 AIGNE 架构：

![AIGNE 生态系统架构](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## 核心功能

DocSmith 提供了一系列功能来自动化和简化文档流程：

*   **结构规划：** 分析代码库以生成逻辑化的文档结构。
*   **内容生成：** 使用从源代码生成的内容填充规划好的文档结构。
*   **多语言支持：** 将文档翻译成 12 种语言，包括英语、中文、日语和西班牙语。
*   **AIGNE Hub 集成：** 使用 [AIGNE Hub](https://www.aigne.io/en/hub) 作为 LLM 提供商，无需管理独立的 API 密钥即可切换模型。
*   **文档发布：** 将文档发布到官方平台 [docsmith.aigne.io](https://docsmith.aigne.io/app/) 或用户自己的 [Discuss Kit](https://www.arcblock.io/docs/web3-kit/en/discuss-kit) 实例。
*   **迭代更新：** 检测源代码变更以更新文档，并支持根据用户反馈对特定文档进行定向重新生成。

## 后续步骤

要开始使用 DocSmith，请继续阅读安装和配置指南。

<x-card data-title="下一步：开始入门" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="开始阅读指南">
  按照分步指南安装工具、配置你的第一个项目并生成文档。
</x-card>