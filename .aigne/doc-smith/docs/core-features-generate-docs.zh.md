---
labels: ["Reference"]
---

# 生成文档

`aigne doc generate` 是创建和更新整个文档集的核心命令。它能够自动分析您的源代码，规划文档结构，并生成详细、高质量的内容。首次在项目中运行时，它还会智能地引导您完成一个快速的配置向导，以确保生成的文档完全符合您的需求。

## 首次生成与自动配置

要开始生成文档，只需在您的项目根目录下运行以下命令：

```bash
aigne doc generate
```

如果您尚未配置过项目，DocSmith 会自动检测并启动一个交互式的配置向导。这个过程被称为“智能自动配置”。

![运行 generate 命令，智能执行初始化](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

您只需根据提示回答几个简单的问题，例如文档的目标读者、主要语言以及需要翻译的语言等，即可完成所有基本设置。

![回答问题完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 会立即开始分析您的代码库，进行结构规划，并逐篇生成文档内容。

![执行结构规划和生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

整个过程完全自动化，完成后您会看到成功提示，所有文档都已保存在指定的输出目录中。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 智能更新

当您修改了源代码后，再次运行 `aigne doc generate` 命令时，DocSmith 不会盲目地重新生成所有内容。它内置了智能更新机制，能够自动检测自上次生成以来发生变化的文件。

系统会根据这些变更来决定是否需要更新文档结构或重新生成与之相关的内容，从而最大限度地节省时间和资源。

![智能检测，只重新生成需要的文档](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

## 强制完整重新生成

在某些情况下，您可能希望忽略所有缓存和变更检测，从头开始完整地重新生成所有文档。例如，当您对配置文件进行了重大修改，或者希望确保所有内容都基于最新的代码库时，可以使用 `--forceRegenerate` 标志。

```bash
aigne doc generate --forceRegenerate
```

此命令将强制 DocSmith 重新执行所有步骤，包括结构规划和每一篇文档的内容生成。

## 结合反馈优化结构

`generate` 命令不仅用于创建，还可以在现有基础上进行优化。通过使用 `--feedback` 参数，您可以向 AI 提供具体的指导，以调整文档的整体结构。例如，您可以要求它增加、删除或重组某些章节。

```bash
aigne doc generate --feedback "移除“关于”部分，并增加 API 参考章节"
```

这种方式非常适合对自动生成的文档结构进行宏观调控。要了解更多关于如何精确调整结构的信息，请参阅 [优化文档结构](./core-features-refine-structure.md) 章节。

## 接下来做什么？

现在您已经掌握了如何生成和更新整个文档集。接下来，您可以：

- 如果您想对某一篇特定的文档进行微调，请查阅 [更新单个文档](./core-features-update-document.md)。
- 如果文档已经准备就绪，可以学习如何将其 [发布文档](./core-features-publish-docs.md) 与他人分享。