---
labels: ["Reference"]
---

# 快速入门

本指南将引导您完成 AIGNE DocSmith 的安装和基本设置。只需几个简单的步骤，您就能成功生成您的第一份项目文档。

### 第 1 步：环境准备

在开始之前，请确保您的开发环境中已安装以下工具：

- Node.js 和 pnpm
- AIGNE CLI (将在下一步中安装)

### 第 2 步：安装 AIGNE CLI

打开您的终端，运行以下命令来全局安装最新版本的 AIGNE CLI。这是一次性操作，安装后即可在任何项目中使用。

```bash
npm i -g @aigne/cli
```

安装完成后，您可以通过运行以下命令来验证是否安装成功：

```bash
aigne doc -h
```

如果终端显示了 DocSmith 相关的帮助信息，说明已成功安装。

### 第 3 步：一键生成文档

现在，进入您的项目根目录，然后运行以下命令：

```bash
aigne doc generate
```

如果您是第一次在项目中运行此命令，DocSmith 的智能自动配置功能会检测到缺少配置文件，并自动引导您进入交互式设置向导。

![运行 generate 命令，智能执行初始化](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

### 第 4 步：完成交互式配置

接下来，您需要根据终端的提示回答一系列问题。这些问题旨在帮助 AI 理解您的文档需求，以便生成最符合您期望的内容。配置过程包括：

- **文档目的**：您希望读者通过文档达到什么目的？
- **目标读者**：文档是为谁编写的？
- **语言设置**：选择文档的主要语言以及需要翻译的其他语言。
- **源代码路径**：指定需要分析的源代码目录。

![回答问题完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### 第 5 步：查看生成结果

完成配置后，DocSmith 将自动开始分析您的代码、规划文档结构并生成详细内容。整个过程无需人工干预。

![执行结构规划和生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

生成成功后，您会看到相应的提示信息。所有文档都已保存在您配置的输出目录中（默认为 `.aigne/doc-smith/docs`）。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

### 恭喜！

您已经成功生成了第一份文档。现在，您可以开始探索 DocSmith 的其他功能了。

- 要了解更多关于 `generate`, `update`, `publish` 等命令的详细用法，请继续阅读 [核心功能](./core-features.md)。
- 要深入了解如何通过配置文件自定义文档的风格、语言和范围，请参阅 [配置指南](./configuration.md)。