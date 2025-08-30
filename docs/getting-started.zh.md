---
labels: ["Reference"]
---

# 快速入门

本指南将引导你完成 AIGNE DocSmith 的安装，并生成你的第一套文档。只需几分钟，你就可以从零开始，为一个项目生成完整的文档。

## 步骤 1：准备工作

在开始之前，请确保你的系统上已安装以下软件：

- Node.js
- pnpm

DocSmith 作为 AIGNE 命令行界面 (CLI) 的一部分进行分发。

## 步骤 2：安装

使用 npm 全局安装最新版本的 AIGNE CLI。这个软件包包含了所有 DocSmith 命令。

```bash
npm i -g @aigne/cli
```

安装完成后，通过检查 `doc` 命令的帮助信息来验证安装是否成功：

```bash
aigne doc -h
```

如果你看到可用命令和选项的列表，则表示安装成功。

## 步骤 3：生成你的第一份文档

安装 AIGNE CLI 后，导航到你的项目根目录并运行一个命令：

```bash
aigne doc generate
```

### 智能自动配置

如果这是你第一次在项目中运行 DocSmith，它会自动检测到没有配置文件，并启动一个交互式设置向导。

![运行 generate 命令，智能触发初始化](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

向导会询问你一系列问题，以了解你的文档目标、目标受众和项目结构。这有助于 AI 根据你的具体需求定制内容和风格。

![回答问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

### 文档生成

配置完成后，DocSmith 会执行以下步骤：
1.  分析你的源代码。
2.  规划一个逻辑清晰的文档结构。
3.  为每个部分生成详细内容。

![执行结构规划并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

当流程结束后，你会在设置过程中指定的输出目录（默认为 `.aigne/doc-smith/docs`）中找到生成的 Markdown 文件。

![成功生成文档](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 关于 LLM 配置的说明

DocSmith 使用大型语言模型 (LLM) 来生成内容。默认情况下，它会连接到 **AIGNE Hub**，该服务无需 API 密钥，并允许你轻松地在不同模型之间切换。

你可以使用 `--model` 标志为单次运行指定模型：

```bash
# 使用 Google 的 Gemini 1.5 Flash
aigne doc generate --model google:gemini-1.5-flash

# 使用 Anthropic 的 Claude 3.5 Sonnet
aigne doc generate --model claude:claude-3-5-sonnet

# 使用 OpenAI 的 GPT-4o
aigne doc generate --model openai:gpt-4o
```

有关更多高级选项，包括如何使用你自己的 API 密钥，请参阅 [LLM 设置](./configuration-llm-setup.md) 指南。

## 接下来做什么？

现在，你已经成功为你的项目生成了一整套文档。你可以浏览生成的文件，看看 DocSmith 是如何解析你的代码库的。

接下来，你可以进一步了解如何管理你的新文档：

-   浏览 [核心功能](./features.md)，了解如何更新、翻译和发布你的文档。
-   查阅 [CLI 命令参考](./cli-reference.md)，获取所有可用命令和选项的详细列表。