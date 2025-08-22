---
labels: ["Reference"]
---

# 快速入门

本指南将引导你快速安装 AIGNE DocSmith 并生成第一套文档。整个过程只需几分钟。

## 前提条件

在开始之前，请确保你的系统上已安装以下软件：

- Node.js
- pnpm

## 步骤 1：安装 AIGNE CLI

首先，使用 npm 全局安装 AIGNE 命令行界面（CLI）。通过这一个命令，你就可以使用 DocSmith 和其他 AIGNE 工具。

```bash
npm i -g @aigne/cli
```

要确认安装是否成功，请运行帮助命令：

```bash
aigne doc -h
```

你应该会看到一个包含可用 `doc` 命令及其选项的列表。

## 步骤 2：生成你的第一套文档

安装 CLI 后，你现在可以通过一个命令从源代码生成一整套文档。

在终端中，导航到你的项目根目录并运行：

```bash
aigne doc generate
```

### 自动配置

如果这是你第一次在项目中运行该命令，DocSmith 会检测到没有配置文件，并自动启动一个交互式设置向导。

![运行 generate 命令，该命令会智能触发初始化向导。](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

该向导将通过一系列问题引导你，以了解你的项目和文档需求，包括：

- 你的文档用途
- 你的目标受众
- 主要语言和期望的翻译
- 你的源代码位置

只需回答这些问题即可完成项目设置。

![在交互式向导中回答问题以完成项目设置。](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### AI 驱动的生成

配置完成后，DocSmith 的 AI 将分析你的代码库，规划一个逻辑化的文档结构，并开始为每个部分生成内容。

![该工具展示了结构规划和内容生成的过程。](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

### 全部完成！

当流程结束时，你会看到一条成功消息。你的新文档现在已经准备好，位于你在设置过程中指定的输出目录中（默认为 `.aigne/doc-smith/docs`）。

![一条成功消息，表明文档已生成。](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 后续步骤

你已成功生成第一套文档！要了解有关 `generate` 命令的更多信息并探索其他功能，请继续阅读“核心功能”部分。

- [探索核心功能](./features.md)
