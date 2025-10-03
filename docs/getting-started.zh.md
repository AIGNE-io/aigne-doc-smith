# 快速入门

本指南将引导您逐步完成安装 AIGNE DocSmith、配置项目以及在几分钟内从源代码生成完整文档集的全过程。

## 第一步：先决条件

在开始之前，请确保您的系统中已安装 Node.js 20 或更高版本。DocSmith 是一个在 Node.js 环境中运行的命令行工具。我们建议使用 Node.js 自带的节点包管理器（npm）进行安装。

有关详细的安装说明，请参阅 [Node.js 官方网站](https://nodejs.org/)。下面提供了适用于常见操作系统的简要指南。

**Windows**
1.  从 [Node.js 下载页面](https://nodejs.org/en/download) 下载 Windows 安装程序（`.msi`）。
2.  运行安装程序，并按照设置向导中的提示进行操作。

**macOS**

推荐的安装方法是使用 [Homebrew](https://brew.sh/)，它是一款适用于 macOS 的包管理器。

```bash Terminal icon=lucide:apple
# 如果尚未安装 Homebrew，请先安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node
```

或者，您也可以直接从 [Node.js 网站](https://nodejs.org/) 下载 macOS 安装程序（`.pkg`）。

**Linux**

对于基于 Debian 和 Ubuntu 的发行版，请使用以下命令：

```bash Terminal icon=lucide:laptop
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

对于 Red Hat、CentOS 和 Fedora，请使用以下命令：

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### 验证安装

安装完成后，打开您的终端并运行以下命令，以确认 Node.js 和 npm 已正确安装：

```bash Terminal
node --version
npm --version
```

## 第二步：安装 AIGNE CLI

DocSmith 工具作为官方 AIGNE 命令行界面（CLI）的一部分进行分发。请使用 npm 在您的系统上全局安装 CLI：

```bash Terminal icon=logos:npm
npm install -g @aigne/cli
```

安装完成后，运行其帮助命令来验证 DocSmith 是否可用：

```bash Terminal
aigne doc --help
```

此命令应显示 DocSmith 的帮助菜单，确认其已安装并可供使用。

## 第三步：生成您的文档

安装 AIGNE CLI 后，您现在可以生成您的文档了。在终端中，导航到您项目的根目录，并执行以下命令：

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### 自动配置

当您首次在新项目中运行此命令时，DocSmith 会检测到不存在配置文件，并会自动启动一个交互式设置向导来引导您完成整个过程。

该向导会提出一系列问题，以定义您文档的特性，包括：

*   主要目的和写作风格。
*   目标受众（例如，开发者、最终用户）。
*   主要语言以及用于翻译的其他语言。
*   供 AI 分析的源代码路径。
*   生成的文档文件的输出目录。

在您回答完提示后，DocSmith 会将您的选择保存到配置文件中，然后开始分析您的代码库、规划文档结构并生成内容。

## 第四步：查阅您的输出

生成过程完成后，您的终端中会显示一条确认消息，表明您的文档已成功创建。您的新文档现在位于您在设置过程中指定的输出目录中。如果您使用了默认设置，可以在 `.aigne/doc-smith/docs` 找到它。

## 后续步骤

您已成功生成第一批文档。现在，您可以开始探索更高级的功能和自定义选项了。

<x-cards>
  <x-card data-title="核心功能" data-icon="lucide:box" data-href="/features">
    探索主要命令和功能，从更新文档到在线发布。
  </x-card>
  <x-card data-title="配置指南" data-icon="lucide:settings" data-href="/configuration">
    了解如何通过编辑配置文件来微调文档的风格、受众和语言。
  </x-card>
  <x-card data-title="CLI 命令参考" data-icon="lucide:terminal" data-href="/cli-reference">
    获取所有可用的 `aigne doc` 命令及其选项的完整参考。
  </x-card>
</x-cards>