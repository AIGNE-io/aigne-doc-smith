---
labels: ["Reference"]
---

# 生成文档

从源代码创建一套完整文档的主要命令是 `generate`。该命令会启动一个流程，分析您的代码库，设计逻辑化的文档结构，然后为每个部分编写详细内容。

### 主要命令

首先，请导航至您项目的根目录并运行以下命令：

```bash
aigne doc generate
```

### 首次运行时的智能自动配置

如果您首次在项目中运行 DocSmith，`generate` 命令会自动检测到配置文件的缺失。然后，它将启动一个交互式设置向导，引导您完成初始设置。

![运行 generate 命令，该命令会智能地触发初始化流程](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统将提示您定义文档的关键方面，包括：

- 文档生成规则和风格
- 目标受众
- 主要语言和翻译语言
- 源代码路径
- 输出目录

![回答一系列问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将继续规划文档结构并生成内容。

![DocSmith 执行结构规划和文档生成阶段](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

完成后，您将看到一条成功消息，确认您的文档已准备就绪。

![一条成功消息，表示文档已生成](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

### 强制完全重新生成

如果您需要从头开始重新生成所有文档，并丢弃任何先前的版本，可以使用 `--forceRegenerate` 标志。当您对源代码或配置文件进行了重大更改后，该选项非常有用。

```bash
aigne doc generate --forceRegenerate
```

此命令可确保整个文档集都根据项目的最新状态进行重建。

### 通过反馈优化结构

您还可以在生成过程中提供有针对性的反馈，以引导 AI 改进整体文档结构。使用 `--feedback` 标志来建议更改，例如添加或删除章节。

```bash
# 示例：要求 AI 添加 API 参考章节
aigne doc generate --feedback "Remove About section and add API Reference"
```

这使您无需手动干预即可优化文档的顶层结构。

---

现在您已经了解了如何生成一套新文档，下一步是学习如何长期维护和改进它们。为此，请继续阅读[更新和优化](./features-update-and-refine.md)指南。