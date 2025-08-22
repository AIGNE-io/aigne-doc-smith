---
labels: ["Reference"]
---

# 核心功能

AIGNE DocSmith 提供了一套完整的工具包，用于管理您的文档生命周期，从直接基于源代码进行初始创建，到最终的发布和翻译。本节概述了用于创建和维护高质量文档的主要命令和功能。

每项功能都设计得简单明了，通常只需一个命令即可执行复杂的任务。

---

## 从代码生成文档

DocSmith 的主要功能是通过分析源代码，自动创建一套完整的文档。`aigne doc generate` 命令能够智能地规划文档的逻辑结构，并为每个部分撰写详细内容，让您在几分钟内就能获得一个全面的文档初稿。

![执行结构规划并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

要获取创建第一套文档的完整指南，请参阅 **[生成文档](./features-generate-documentation.md)**。

## 智能更新与优化

随着代码的演进，您的文档可以轻松保持同步。DocSmith 会自动检测源代码的变更，并仅更新必要的文档。您还可以使用 `aigne doc update` 命令，根据有针对性的反馈重新生成特定文档，确保内容始终准确且切题。

![交互式选择要更新的文档](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

在 **[更新与优化](./features-update-and-refine.md)** 部分了解如何保持文档的实时性。

## 面向全球受众翻译文档

通过将文档翻译成中文、西班牙语、德语和日语等 12 种以上的语言，触达更广泛的受众。`aigne doc translate` 命令提供了一种交互式的方式，让您可以选择要翻译的文档和目标语言。

![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

![从超过 12 种支持的语言中进行选择](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

在 **[翻译文档](./features-translate-documentation.md)** 指南中了解详细信息。

## 在线发布文档

文档准备就绪后，您可以轻松地将其发布，供他人查阅。`aigne doc publish` 命令允许您将文档部署到官方 DocSmith 平台或您自托管的 Discuss Kit 实例，以便您的团队或公众访问。

![将文档发布到官方平台或自托管实例](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

阅读 **[发布文档](./features-publish-your-docs.md)** 指南，了解如何分享您的成果。

---

这些核心功能协同工作，简化了整个文档流程。要开始使用，让我们从最基础的命令入手。

下一步，学习如何 **[生成文档](./features-generate-documentation.md)**。