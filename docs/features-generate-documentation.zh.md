---
labels: ["Reference"]
---

# 生成文档

从源代码创建一套完整的文档是 AIGNE DocSmith 的主要功能。只需一个命令，即可智能地处理从初始设置到内容创建的所有事务。

## 主要命令

要生成您的文档，请导航至项目根目录并运行以下命令：

```bash
aigne doc generate
```

### 智能自动配置

如果这是您首次在项目中运行该命令，DocSmith 将自动检测到尚无配置，并会启动一个交互式设置向导来引导您完成设置。

![运行 generate 命令会触发智能初始化过程。](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

该向导将询问您几个问题，以便根据您的需求定制文档：

- **风格和规则：**定义基调和写作风格。
- **目标受众：**指明文档的适用对象（例如，开发者、最终用户）。
- **语言：**设置主要语言以及用于翻译的其他语言。
- **代码路径：**指向您想要记录的源代码目录。
- **输出目录：**选择生成的文档文件的保存位置。

![在交互式向导中回答问题以完成项目设置。](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

回答完问题后，DocSmith 会保存您的设置并继续进行生成过程。要详细了解所有可用设置，请参阅 [配置指南](./configuration.md)。

### 生成过程

配置完成后，DocSmith 会开始分析您的代码，规划逻辑文档结构，并为每个部分撰写内容。

![该工具正在执行结构规划和文档生成阶段。](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

完成后，您将看到一条确认消息，新文档将在指定的输出目录中准备就绪。

![一条成功消息，表明文档生成已完成。](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 强制完全重新生成

如果您对源代码或配置进行了重大更改，并希望从头开始重新生成所有文档，可以使用 `--forceRegenerate` 标志。该操作将忽略所有现有文档，并创建一套全新的文档。

```bash
aigne doc generate --forceRegenerate
```

## 优化文档结构

您还可以通过直接向 `generate` 命令提供反馈来优化整体文档结构。这对于添加、删除或重组整个章节非常有用。

```bash
# 示例：通过具体反馈优化结构
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'"
```

该命令会在生成内容之前，根据您的输入重新评估结构规划。

---

既然您已经生成了文档，下一步就是学习如何随着项目的发展使其保持最新。请继续阅读 [更新与优化](./features-update-and-refine.md) 指南，了解如何管理更新并进行有针对性的改进。