---
labels: ["Reference"]
---

# 快速入门

本指南将引导你完成 AIGNE DocSmith 的安装、首个项目的配置，并在短短几分钟内生成一套完整的文档。整个过程设计得非常简单，只需一个命令即可开始。

## 前提条件

在开始之前，请确保你的系统上已安装以下软件：

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

## 第 1 步：安装 AIGNE CLI

DocSmith 通过 AIGNE 命令行界面 (CLI) 提供。使用 npm 全局安装最新版本：

```bash
npm i -g @aigne/cli
```

安装完成后，通过检查文档工具的帮助命令来验证是否安装成功：

```bash
aigne doc -h
```

该命令应显示可用的 `doc` 命令及其选项列表。

## 第 2 步：生成文档

安装 AIGNE CLI 后，你只需一个命令即可生成文档。进入项目根目录并运行：

```bash
aigne doc generate
```

### 智能自动配置

如果你是首次在项目中运行 DocSmith，它会自动检测到尚无配置，并启动一个交互式设置向导来引导你完成配置。

![运行 generate 命令会触发智能初始化向导](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

## 第 3 步：配置项目

交互式向导将提出一系列问题，以根据你的具体需求定制文档。系统将提示你定义以下内容：

- 文档的主要用途和风格。
- 目标受众及其技术知识水平。
- 主要语言以及任何需要翻译的其他语言。
- 供 AI 分析的源代码路径。
- 用于保存文档的输出目录。

![回答一系列问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

## 第 4 步：查看新文档

完成配置后，DocSmith 将开始生成过程。它会分析你的代码，规划出逻辑清晰的文档结构，并为每个部分撰写内容。

![DocSmith 规划文档结构并生成内容](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

完成后，你将在终端中看到一条成功消息。你的新文档现已在你指定的输出目录（例如 `.aigne/doc-smith/docs`）中准备就绪。

![成功消息确认你的文档已准备就绪](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 接下来呢？

你已成功安装 DocSmith 并生成了第一套文档。现在，你可以开始更详细地探索其功能了。

<x-card data-title="探索核心功能" data-icon="lucide:compass" data-href="/features" data-cta="了解更多">
  深入了解 DocSmith 的主要命令和功能，从更新文档到在线发布。
</x-card>