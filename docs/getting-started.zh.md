---
labels: ["Reference"]
---

# 快速入门

欢迎使用 AIGNE DocSmith！本指南将引导你通过简单的三步流程，在几分钟内完成工具安装、项目配置，并生成你的第一套文档。

## 前提条件

在开始之前，请确保你的系统上已安装以下软件：

- Node.js (推荐使用最新的 LTS 版本)
- pnpm (可通过 `npm install -g pnpm` 安装)

## 步骤 1：安装 AIGNE CLI

DocSmith 作为 AIGNE 命令行界面 (CLI) 的一部分进行分发。要安装它，请打开你的终端并运行以下命令：

```bash Install AIGNE CLI icon=lucide:terminal
npm i -g @aigne/cli
```

安装完成后，你可以通过检查文档工具的帮助命令来验证安装是否成功：

```bash Verify Installation icon=lucide:terminal
aigne doc -h
```

如果你看到可用命令列表，则说明一切准备就绪！

## 步骤 2：配置你的项目

DocSmith 提供了一个交互式向导，让项目设置变得简单。最智能的启动方式是在你的项目根目录中运行 `generate` 命令。

```bash Start Generation icon=lucide:terminal
aigne doc generate
```

如果你是首次运行该命令，DocSmith 会自动检测到项目缺少配置文件，并为你启动设置向导。

![运行 generate 命令，智能触发初始化](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

该向导将引导你回答一系列问题，以了解你的文档需求，包括：

- 文档的主要目标（例如，教程、API 参考）。
- 目标受众（例如，开发者、最终用户）。
- 读者的预期知识水平。
- 内容的期望深度和全面性。
- 主要语言以及用于翻译的其他语言。
- 需要分析的源代码路径以及用于存放生成文档的输出目录。

![回答问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

回答完所有问题后，DocSmith 会将你的设置保存到配置文件 (`.aigne/doc-smith/config.yaml`) 中，并自动进入下一步。

## 步骤 3：生成你的文档

初始配置保存后，DocSmith 会立即开始分析你的源代码、规划文档结构，并利用 AI 生成内容。

![执行结构规划和文档生成](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

你将在终端中看到实时进度。该过程完成后，你会收到一条成功消息，新生成的文档将存放在你指定的输出目录中。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

就这样！你已成功为你的项目生成了一整套文档。

## 接下来做什么？

现在你已经拥有了初始文档，可以继续探索 DocSmith 提供的更多功能。

<x-cards data-columns="2">
  <x-card data-title="探索核心功能" data-icon="lucide:wand-sparkles" data-href="/features" data-cta="了解更多">
    探索如何更新、翻译和发布你的文档。
  </x-card>
  <x-card data-title="配置指南" data-icon="lucide:sliders-horizontal" data-href="/configuration" data-cta="了解更多">
    深入了解配置文件，以微调文档的风格、受众和语言。
  </x-card>
</x-cards>