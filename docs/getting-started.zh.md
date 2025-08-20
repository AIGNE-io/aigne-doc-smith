---
labels: ["Reference"]
---

# 快速入门

遵循本篇简单指南，安装 AIGNE DocSmith，只需几分钟即可生成你的第一套文档。整个过程简单明了，仅需一条命令即可完成从安装到生成完整文档的全部流程。

## 前提条件

在开始之前，请确保你的系统已安装以下软件：

- Node.js
- pnpm

DocSmith 作为 AIGNE 命令行界面 (CLI) 的一部分进行分发。

## 步骤一：安装 AIGNE CLI

首先，请使用 npm 全局安装最新版本的 AIGNE CLI。打开终端并运行以下命令：

```bash
npm i -g @aigne/cli
```

安装完成后，你可以通过检查 DocSmith 的帮助命令来验证安装是否成功：

```bash
aigne doc -h
```

如果命令成功运行并显示选项列表，则说明你已准备好继续下一步。

## 步骤二：生成文档

现在进入主要步骤。在终端中进入项目根目录，并运行 generate 命令：

```bash
aigne doc generate
```

### 智能自动配置

如果你是首次在项目中运行此命令，DocSmith 会自动检测到尚无配置文件，并启动一个交互式设置向导来引导你完成配置。

![运行 generate 命令启动智能设置](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统将提示你回答一系列问题以定义：

- 文档的主要用途
- 目标受众
- 语言设置
- 源代码和输出目录

![回答问题以配置你的项目](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### 自动生成

完成配置后，DocSmith 将接管后续工作。它会分析你的源代码，规划出逻辑清晰的文档结构，然后为每个章节生成高质量的内容。

![DocSmith 规划结构并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

流程结束后，你将看到一条确认消息，同时新生成的文档会保存在你指定的输出目录中。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 关于 AI 模型 (LLMs) 的说明

DocSmith 默认使用 AIGNE Hub，它允许你在无需提供自己 AI 模型 API 密钥的情况下生成文档。安装后即可立即使用。如果你希望配置自定义模型或使用自己的 API 密钥，请参阅 [LLM Setup](./configuration-llm-setup.md) 指南。

## 后续步骤

就这样！你已成功为你的项目生成了一整套文档。如需了解 DocSmith 的更多功能，例如更新、优化和发布文档，请浏览我们的 [Core Features](./features.md) 页面。