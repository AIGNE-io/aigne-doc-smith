# 快速入门

本指南将引导您完成安装 AIGNE DocSmith、配置首个项目以及在几分钟内生成一套完整文档的基本步骤。

## 第 1 步：先决条件

在开始之前，请确保您的系统上已安装 Node.js。AIGNE DocSmith 是一个需要 Node.js 才能运行的命令行工具。安装过程还包括 npm (Node Package Manager)，您将在下一步中使用它。

以下是针对常见操作系统的简要安装说明。

### macOS

在 macOS 上安装 Node.js 的推荐方法是使用 [Homebrew](https://brew.sh/)。

```bash
brew install node
```

### Windows

访问 [Node.js 官方网站](https://nodejs.org/) 并下载推荐的 Windows 版 LTS (长期支持) 安装程序。运行安装程序并按照屏幕上的说明进行操作。

### Linux

您可以使用发行版的包管理器安装 Node.js。对于基于 Debian 和 Ubuntu 的系统，请使用以下命令：

```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

有关其他发行版的详细说明，请访问 [Node.js 官方网站](https://nodejs.org/)。

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

安装 CLI 后，您只需一条命令即可生成第一套文档。请导航至您项目的根目录并运行：

```bash
aigne doc generate
```

### 自动配置

当您在新项目中首次运行此命令时，DocSmith 的交互式设置向导将自动启动，引导您完成配置。

![运行 generate 命令会启动智能设置](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统会询问您几个问题，以根据您的需求定制文档，包括：

- 文档的主要目的和风格。
- 您写作的目标受众。
- 主要语言以及用于翻译的其他语言。
- 供 AI 分析的源代码路径。
- 用于保存文档的输出目录。

![回答问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将分析您的源代码，规划文档结构，并开始生成内容。

![DocSmith 规划结构并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## 第 4 步：检查您的输出

就这样！流程结束后，您将看到一条确认消息。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

您可以在设置期间指定的输出目录中找到新创建的文档。默认情况下，该目录是 `.aigne/doc-smith/docs`。

## 下一步

您已成功生成第一套文档。接下来，您可以浏览以下内容：

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