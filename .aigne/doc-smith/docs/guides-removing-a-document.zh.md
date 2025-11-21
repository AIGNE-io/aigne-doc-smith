# 移除文档

要保持文档的准确性，不仅需要添加内容，还需要进行精简。本指南详细介绍如何使用 `aigne doc remove-document` 命令从项目中安全地删除文档，确保您的文档集保持整洁和相关性。

## 概述

`remove-document` 命令提供了一种交互式的方式来选择和删除现有结构中的一个或多个文档。该命令的一个关键特性是它能够处理级联删除；移除父文档将同时移除其所有子文档。

此外，在移除所选文档后，该工具会自动扫描剩余文件，查找任何指向已删除文档的损坏链接。然后，它会尝试智能地修复或移除这些链接，以确保整个文档集的完整性。

## 命令用法

要开始移除过程，请导航到您项目的根目录并执行以下命令：

```sh icon=lucide:terminal
aigne doc remove-document
```

您也可以使用更短的别名 `remove` 或 `rm`：

```sh icon=lucide:terminal
aigne doc rm
```

### 1. 选择并确认文档

运行该命令后，您将看到当前文档的列表，以层级树状结构显示。您可以使用箭头键浏览此列表，并通过按空格键选择要移除的文档。选定所有要删除的文档后，按 `Enter` 键确认。如果您决定不移除任何文档，可以在未选择任何内容的情况下按 `Enter` 键取消操作。

```sh Select documents to remove icon=lucide:terminal
? Select documents to remove (Press Enter with no selection to finish):
❯◯ /overview
 ◯ /getting-started
 ◯ /guides
  ◯ /guides/generating-documentation
  ◯ /guides/updating-documentation
   ◉ /guides/updating-documentation/adding-a-document
   ◉ /guides/updating-documentation/removing-a-document
```

### 2. 链接验证与修复

文档删除后，DocSmith 会自动扫描您剩余的文档，查找任何现在指向不存在文件的链接。系统将提示您确认是否自动修复这些无效链接。

```sh Confirm link fixing icon=lucide:terminal
? Select documents with invalid links to fix (all selected by default, press Enter to confirm, or unselect all to skip):
❯◉ Update Document (/guides/updating-documentation.md) - Invalid Links(2): /guides/adding-a-document, /guides/removing-a-document
```

### 3. 审查摘要

最后，您的终端会显示一个摘要，列出所有成功移除的文档，并详细说明哪些文档中的无效链接已被修复。

```sh Removal summary icon=lucide:terminal
---
📊 Summary

🗑️  Removed Documents:
   Total: 2 document(s)

   1. /guides/adding-a-document
   2. /guides/removing-a-document

✅ Documents fixed (Removed invalid links):
   Total: 1 document(s)

   1. /guides/updating-documentation
      Invalid links fixed: /guides/adding-a-document, /guides/removing-a-document
```

此过程确保了文件移除的简便性，并且不会在其他文档中留下损坏的引用。

## 相关指南

整理完文档后，您可能需要执行其他更新。有关管理文档结构的更多信息，请参阅以下指南：

<x-cards data-columns="2">
  <x-card data-title="添加文档" data-icon="lucide:file-plus" data-href="/guides/adding-a-document">
    了解如何向现有文档结构中添加新文档。
  </x-card>
  <x-card data-title="更新文档" data-icon="lucide:file-pen-line" data-href="/guides/updating-document">
    了解如何修改现有文档的内容。
  </x-card>
</x-cards>