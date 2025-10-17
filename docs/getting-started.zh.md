# 快速入门

本指南提供了安装 AIGNE DocSmith 并生成您的第一套文档的分步流程。该过程设计得简单直接，几分钟内即可完成。

## 前提条件

在继续安装之前，请确保您的系统满足以下要求：

*   **Node.js**：需要 20 或更高版本。DocSmith 使用 Node Package Manager (npm) 进行安装，npm 已包含在 Node.js 的安装包中。要安装 Node.js，请访问 [Node.js 官方网站](https://nodejs.org/) 并按照您操作系统的说明进行操作。您可以通过打开终端并运行 `node -v` 和 `npm -v` 来验证安装。

*   **API 密钥**：开始时无需任何 API 密钥。默认情况下，DocSmith 使用 AIGNE Hub 服务进行 AI 驱动的生成，这使您无需直接配置即可使用各种大型语言模型。

## 安装

该工具作为 AIGNE 命令行界面 (CLI) 的一部分进行分发。安装过程包括两个简单的步骤。

### 第 1 步：安装 AIGNE CLI

要在您的系统上全局安装 AIGNE CLI，请在终端中执行以下命令：

```bash title="安装 AIGNE CLI" icon=logos:npm-icon
npm install -g @aigne/cli
```

此命令会从 npm 注册表下载并安装该软件包，使 `aigne` 命令在您终端的任何目录中都可用。

### 第 2 步：验证安装

安装完成后，您可以通过运行文档工具的帮助命令来验证它：

```bash title="验证安装"
aigne doc --help
```

此命令应显示可用的 DocSmith 命令及其选项列表，这确认了安装成功。

## 生成您的第一份文档

请按照以下步骤分析您的项目并生成一套完整的文档。

### 第 1 步：导航到您的项目目录

打开您的终端，使用 `cd` 命令将当前目录更改为您希望记录的项目的根目录。

```bash title="更改目录" icon=mdi:folder-open
cd /path/to/your/project
```

### 第 2 步：运行生成命令

执行主要的 `generate` 命令。这一个命令处理从分析到内容生成的整个文档创建过程。

```bash title="运行生成命令"
aigne doc generate
```

### 第 3 步：完成交互式设置

当您第一次在项目中运行 `generate` 命令时，DocSmith 将启动一次性的交互式设置过程。您将被引导通过一系列问题来配置您的文档偏好，例如其主要目的、目标受众和语言。

![交互式设置过程的屏幕截图](../assets/screenshots/doc-complete-setup.png)

您的答案将保存到位于 `.aigne/doc-smith` 目录中的 `config.yaml` 文件中。如果需要，以后可以手动编辑此文件。

### 第 4 步：等待生成

设置完成后，DocSmith 将自动执行以下操作：

1.  **分析代码库**：扫描您的源文件以了解项目的结构、功能和逻辑。
2.  **规划结构**：为文档创建一个逻辑计划，概述章节和主题。
3.  **生成内容**：根据分析和您的配置编写文档内容。

完成后，将出现一条确认消息，生成的文件将位于设置期间指定的输出目录中（默认为 `.aigne/doc-smith/docs`）。

![生成成功后的消息屏幕截图](../assets/screenshots/doc-generated-successfully.png)

## 下一步做什么？

您已成功生成第一套文档。以下是管理和增强文档的常见后续步骤：

<x-cards data-columns="2">
  <x-card data-title="更新文档" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    根据代码更改或新要求，修改或重新生成文档的特定部分。
  </x-card>
  <x-card data-title="翻译文档" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    将您的文档翻译成 12 种支持的语言中的任何一种，例如中文、西班牙语或德语。
  </x-card>
  <x-card data-title="发布您的文档" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    将您的文档在线发布，供您的团队或公众使用。
  </x-card>
  <x-card data-title="审查配置" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    审查和修改在初始设置期间创建的 config.yaml 文件以调整您的偏好。
  </x-card>
</x-cards>