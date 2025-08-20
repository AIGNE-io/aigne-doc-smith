---
labels: ["Reference"]
---

# 核心功能

AIGNE DocSmith 通过一系列直观的命令简化了整个文档生命周期。本节概述了其主要功能，涵盖从初始创建、持续更新到最终发布的整个过程。每项功能都旨在实现手动任务自动化，并直接与您的开发工作流集成。

---

## 生成文档

`aigne doc generate` 命令是创建文档的起点。它会分析您的源代码以构建逻辑结构，然后为每个部分生成详细内容。如果您是首次在项目中运行该命令，它会自动启动一个交互式向导，帮助您配置目标受众、语言和源路径等设置。

![执行结构规划与文档生成](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

欲了解从零开始创建文档的完整指南，请参阅 [生成文档](./features-generate-documentation.md) 部分。

## 更新与优化

保持文档与代码同步非常简单。当您运行 `generate` 命令时，DocSmith 会自动检测源代码中的变更，并仅更新必要的文档。对于更具体的修改，您可以使用 `aigne doc update` 命令，根据特定反馈重新生成单个文档。这对于提高文档清晰度、添加示例或修正信息非常有用。

![以交互方式选择单个文档进行更新](https://docsmith.aigne.io/image-bin/uploads/b2bab8e5a727f168628a1cc8c5020697.png)

欲深入了解更新过程，请参阅 [更新与优化](./features-update-and-refine.md) 部分。

## 发布文档

文档准备就绪后，可通过 `aigne doc publish` 命令将其发布到线上。您可以选择发布到官方 DocSmith 平台，也可以发布到自己托管的 Discuss Kit 实例。该命令会提供一个交互式菜单，引导您完成发布选项。

![将文档发布到官方或自托管平台](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

详细说明请参阅 [发布文档](./features-publish-your-docs.md) 指南。

---

以上核心功能为管理项目文档提供了一套完整的工具。要自定义这些命令的行为，接下来您可以探索可用的设置。

请前往 [配置指南](./configuration.md)，了解如何根据您的特定需求定制 DocSmith。