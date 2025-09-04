# 快速入门

本指南将引导您完成安装 AIGNE DocSmith、配置您的第一个项目以及在几分钟内生成一套完整文档的基本步骤。

## 第 1 步：先决条件

在开始之前，请确保您的系统上已安装 Node.js 和 pnpm。AIGNE DocSmith 是一个基于此生态系统构建的命令行工具。

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

## 第 2 步：安装 AIGNE CLI

使用 npm 全局安装最新版本的 AIGNE CLI。这个单一的软件包让您可以访问全套的 AIGNE 工具，包括 DocSmith。

```bash
npm i -g @aigne/cli
```

要验证安装是否成功，请运行帮助命令：

```bash
aigne doc -h
```

此命令会显示 DocSmith 的帮助菜单，确认其已准备就绪。

## 第 3 步：生成您的文档

安装 CLI 后，您可以通过一个命令生成您的第一套文档。导航到您项目的根目录并运行：

```bash
aigne doc generate
```

### 智能自动配置

当您在一个新项目中首次运行此命令时，DocSmith 的交互式设置向导将自动启动，引导您完成配置。

![运行 generate 命令会启动智能设置](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统会询问您几个问题，以根据您的需求定制文档，包括：

- 文档的主要目的和风格。
- 您为之写作的目标受众。
- 主要语言以及用于翻译的其他语言。
- 供 AI 分析的源代码路径。
- 用于保存文档的输出目录。

![回答问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将分析您的源代码，规划文档结构，并开始生成内容。

![DocSmith 规划结构并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## 第 4 步：查看您的输出

就是这样！流程结束后，您会看到一条确认消息。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

您可以在设置期间指定的输出目录中找到新创建的文档。默认情况下，该目录是 `.aigne/doc-smith/docs`。

## 接下来做什么？

您已成功生成第一套文档。接下来，您可能想了解以下内容：

<x-cards>
  <x-card data-title="核心功能" data-icon="lucide:box" data-href="/features">
    探索主要命令和功能，从更新文档到在线发布。
  </x-card>
  <x-card data-title="配置指南" data-icon="lucide:settings" data-href="/configuration">
    深入了解 config.yaml 文件，以微调文档的风格、受众和语言。
  </x-card>
  <x-card data-title="CLI 命令参考" data-icon="lucide:terminal" data-href="/cli-reference">
    获取所有可用的 `aigne doc` 命令及其选项的完整参考。
  </x-card>
</x-cards>