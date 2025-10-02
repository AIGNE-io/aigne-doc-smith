# 快速入门

本指南将引导您逐步安装 AIGNE DocSmith、配置项目，并从您的源代码生成一套完整的文档。

## 第 1 步：先决条件

在开始之前，请确保您的系统上已安装 Node.js 及其包管理器 npm。DocSmith 是一个在 Node.js 环境下运行的命令行工具。

### 安装 Node.js

以下是在各种操作系统上安装 Node.js 的简要说明。

**Windows**
1.  从 [Node.js 官方网站](https://nodejs.org/) 下载安装程序。
2.  运行 `.msi` 安装程序，并按照安装向导中的步骤操作。

**macOS**

推荐的方法是使用 [Homebrew](https://brew.sh/)：

```bash 终端 icon=lucide:apple
# 如果您还没有安装 Homebrew，请先安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node
```

或者，您也可以从 [Node.js 网站](https://nodejs.org/) 下载 `.pkg` 安装程序。

**Linux**

对于基于 Ubuntu/Debian 的系统：

```bash 终端 icon=lucide:laptop
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

对于基于 CentOS/RHEL/Fedora 的系统：

```bash 终端 icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### 验证

安装完成后，在终端中运行以下命令，验证 Node.js 和 npm 是否可用：

```bash 终端
node --version
npm --version
```

## 第 2 步：安装 AIGNE CLI

DocSmith 工具包含在 AIGNE 命令行界面 (CLI) 中。使用 npm 全局安装最新版本的 AIGNE CLI：

```bash 终端 icon=logos:npm
npm i -g @aigne/cli
```

安装完成后，运行文档工具的帮助命令进行验证：

```bash 终端
aigne doc -h
```

该命令将显示 DocSmith 的帮助菜单，确认其已准备就绪。

## 第 3 步：生成文档

安装 CLI 后，您只需一个命令即可生成文档。在终端中导航到您项目的根目录并运行：

```bash 终端 icon=lucide:sparkles
aigne doc generate
```

### 自动配置

当您在项目中首次运行此命令时，DocSmith 会检测到尚无配置，并自动启动一个交互式设置向导。

![运行 generate 命令会启动设置向导](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统将提示您一系列问题，以定义文档的特性，包括：

- 主要目的和风格。
- 目标受众。
- 主要语言及其他需要翻译的语言。
- 供 AI 分析的源代码路径。
- 生成文档的输出目录。

![回答提示以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将开始分析您的源代码，规划文档结构，并生成内容。

![DocSmith 正在规划结构并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## 第 4 步：查看您的输出

生成过程结束后，您的终端将显示一条确认消息。

![文档生成成功消息](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

您的新文档现已位于您在设置过程中指定的输出目录中。默认位置是 `.aigne/doc-smith/docs`。

## 接下来做什么？

既然您已经生成了第一套文档，您可以探索其他功能：

<x-cards>
  <x-card data-title="核心功能" data-icon="lucide:box" data-href="/features">
    探索从更新文档到在线发布的主要命令和功能。
  </x-card>
  <x-card data-title="配置指南" data-icon="lucide:settings" data-href="/configuration">
    了解如何通过编辑 config.yaml 文件来微调文档的风格、受众和语言。
  </x-card>
  <x-card data-title="CLI 命令参考" data-icon="lucide:terminal" data-href="/cli-reference">
    获取所有可用的 `aigne doc` 命令及其选项的完整参考。
  </x-card>
</x-cards>