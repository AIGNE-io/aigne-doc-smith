---
labels: ["Reference"]
---

# 核心功能

AIGNE DocSmith 提供了一套命令来管理整个文档生命周期，从基于源代码的初始创建到多语言翻译和在线发布。本节概述了主要功能。每个功能都旨在自动化复杂任务，让你能专注于代码。

---

## 生成文档

`aigne doc generate` 命令是所有文档的起点。它会智能地分析你的代码库，规划逻辑化的文档结构，然后为每个部分生成高质量的内容。如果你是首次在项目中运行该命令，它将自动引导你通过一个快速设置向导来配置语言、样式和范围。

![执行结构规划和文档生成](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

[了解更多关于生成文档的信息。](./features-generate-documentation.md)

## 更新与优化

保持文档与代码同步非常简单。当你运行 `generate` 命令时，DocSmith 会自动检测源代码变更并仅更新必要的文档。对于更具针对性的修改，你可以使用 `aigne doc update` 根据新的反馈重新生成特定文档，确保你的内容始终准确且相关。

![以交互方式选择要用新反馈更新的文档](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

[了解如何更新和优化你的文档。](./features-update-and-refine.md)

## 翻译文档

将你的文档翻译成超过 12 种语言，以触达全球受众。`aigne doc translate` 命令可自动化此过程。你可以在交互模式下运行它，以选择要翻译的文档和目标语言，从而简化本地化工作。

![从超过 12 种支持的翻译语言中进行选择](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

[查看如何翻译你的文档。](./features-translate-documentation.md)

## 发布文档

文档准备就绪后，使用 `aigne doc publish` 将其发布到线上。该命令会提供一个交互式提示，让你选择发布到官方 DocSmith 平台，或是发布到你自行托管的 Discuss Kit 实例，从而让你完全控制文档的托管位置。

![将文档发布到官方平台或自托管实例](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

[阅读关于发布文档的指南。](./features-publish-your-docs.md)

---

这些核心功能协同工作，创建了一个简化的文档工作流。有关所有可用命令及其具体选项的完整列表，请参阅 [CLI 命令参考](./cli-reference.md)。