是否曾发现您的文档存在缺漏？`aigne doc add-document` 命令提供了一种直接、交互式的方式，将新主题引入您现有的文档结构中，确保您的内容与项目一同成长。

# 添加文档

`aigne doc add-document` 命令，也可用别名 `aigne doc add`，会启动一个交互式会话，向您项目的文档结构中添加一个或多个新文档。它不仅会添加新文件，还会智能地更新现有文档，添加相关链接，以确保新内容可被发现。

## 命令用法

要开始此过程，请导航至您项目的根目录并运行以下命令：

```sh aigne doc add-document icon=lucide:terminal
aigne doc add-document
```

此命令会启动一个交互式向导，引导您完成整个过程。

## 过程

该命令遵循一个结构化的、分步的过程，以无缝地集成新文档。

### 1. 初始提示

该命令首先会显示当前的文档结构，然后提示您指定希望添加的新文档。您可以用自然语言描述您的请求。

```sh
Current Document Structure:
  - /overview
  - /getting-started
  - /guides
    - /guides/generating-documentation
    - /guides/updating-documentation

You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish:
```

### 2. 添加文档

您可以逐一添加文档。每次添加后，该工具会显示更新后的结构，并提示您添加下一个。要完成添加文档，只需直接按 `Enter` 键，无需输入任何内容。

```sh
You can add a new document.
  • e.g. Add a new document 'Troubleshooting'

Press Enter to finish: Add a 'Deployment Guide' under 'Guides'
```

### 3. 自动链接分析

当您完成添加文档后，DocSmith 会分析新增内容和现有内容。它会识别出哪些现有文档可以从链接到您刚刚添加的新文档中受益。

### 4. 审查并确认更新

DocSmith 会列出它建议更新以添加新链接的现有文档。您可以审查此列表，并选择希望工具修改哪些文档。此步骤确保您对现有内容的更改拥有完全控制权。

![文档更新选择屏幕的截图。](../../../assets/screenshots/doc-update.png)

### 5. 内容生成和翻译

确认后，系统会并行进行两项主要任务：
*   **生成内容：** 为您添加的新文档创建完整内容。
*   **更新链接：** 修改所选的现有文档，以包含指向新页面的链接。

如果您配置了多种语言，新文档和更新后的文档都会自动加入翻译队列。

### 6. 摘要报告

最后，该命令会打印一份已执行操作的摘要。该报告包括所有新创建文档的列表，以及所有已更新并添加了新链接的现有文档的列表。

```text
📊 Summary

✨ Added Documents:
   Total: 1 document(s)

   1. /guides/deployment-guide - Deployment Guide

✅ Documents updated (Added new links):
   Total: 2 document(s)

   1. /overview - Overview
      New links added: /guides/deployment-guide

   2. /getting-started - Getting Started
      New links added: /guides/deployment-guide
```

这个结构化的过程确保了新文档不仅被创建出来，而且还融入到您现有内容的结构中，从而改善了导航和可发现性。