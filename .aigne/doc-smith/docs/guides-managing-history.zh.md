# 管理历史记录

是否想知道您的文档在何时进行了哪些更改？AIGNE DocSmith 会详细记录每一次更新。本指南将向您展示如何访问和阅读此历史记录，以便轻松追踪文档的演变过程。

## 查看更新历史记录

要查看所有文档更新的日志，您可以使用 `history view` 命令。此命令为每次更改提供一个紧凑的单行摘要，非常类似于版本控制系统的日志。

在您的项目根目录中运行以下命令：

```bash 查看历史记录日志 icon=lucide:history
aigne doc history view
```

### 命令别名

为方便起见，`history` 命令为 `view` 子命令提供了两个别名：`log` 和 `list`。这些命令执行完全相同的功能，并将产生相同的输出。

您可以使用以下任一命令作为快捷方式：

```bash
aigne doc history log
```

```bash
aigne doc history list
```

如果您尚未进行任何更新，该工具将通过消息 `No update history found` 通知您。

## 理解历史记录输出

`history` 命令的输出旨在让您一目了然地清晰了解每次更新。日志中的每一行代表一个单一的更新事件。

每个条目的格式分解如下：

| 组件 | 描述 |
| :--- | :--- |
| **短哈希值** | 一个根据更新时间戳生成的唯一的 8 字符标识符。此哈希值是确定性的，意味着相同的时间戳将始终产生相同的哈希值。 |
| **日期** | 一个相对时间戳，显示更新发生的时间（例如，“5 分钟前”、“2 天前”）。对于超过一周的条目，将显示具体日期。 |
| **操作** | 执行的操作类型，例如 `generate_document` 或 `update_document_detail`。 |
| **文档路径** | 如果操作是针对单个文件的，则显示被修改文档的路径。为清晰起见，此路径显示在括号中。 |
| **反馈** | 进行更新时提供的摘要或反馈信息。 |

### 输出示例

以下是您运行 `aigne doc history view` 命令时可能看到的示例。此示例展示了不同类型的更新是如何记录在日志中的。

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial creation of the history management guide.
```

此日志提供了所有更改的有序且易于浏览的记录，使其成为跟踪进度和回顾文档历史的有用工具。
