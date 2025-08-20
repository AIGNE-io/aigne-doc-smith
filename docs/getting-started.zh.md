---
labels: ["Reference"]
---

# 快速入门

本指南将引导您完成从安装到使用 AIGNE DocSmith 生成第一套文档的整个过程。只需几分钟，您就可以准备好您的文档。

## 步骤 1：准备工作

在开始之前，请确保您的系统中已安装以下软件：
- Node.js
- pnpm

## 步骤 2：安装 AIGNE CLI

AIGNE DocSmith 是 AIGNE 命令行界面（CLI）的一部分。请打开终端并运行以下命令进行全局安装：

```bash
npm i -g @aigne/cli
```

安装完成后，您可以通过查看文档命令的帮助菜单来验证安装是否成功：

```bash
aigne doc -h
```

如果您看到可用命令列表，则表示安装成功。

## 步骤 3：生成文档

安装 AIGNE CLI 后，您现在只需一个命令即可生成文档。请在终端中进入您项目的根目录，然后运行：

```bash
aigne doc generate
```

### 智能自动配置

首次在项目中运行此命令时，DocSmith 会检测到尚不存在配置文件，并会自动启动一个交互式设置向导来引导您。

![运行 generate 命令，智能地启动初始化流程](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

该向导将询问您一系列问题，以根据您的具体需求定制文档，包括：

- 文档的主要用途
- 目标受众
- 主要语言及用于翻译的其他语言
- 需要分析的源代码路径
- 生成文件的输出目录

只需回答提示即可完成项目设置。

![回答问题以完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将开始分析您的代码、规划文档结构并生成内容。

![执行结构规划并生成文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

流程结束后，您会看到一条成功消息，新生成的文档将位于您指定的输出目录中。

![文档生成成功](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 大功告成！

您已成功为您的项目生成了一整套文档。现在，您可以浏览生成的文件并查看结果。

要了解更多关于不同命令和功能的信息，请深入阅读 [核心功能](./features.md) 部分。如果您想进一步自定义设置，请查阅 [配置指南](./configuration.md)。