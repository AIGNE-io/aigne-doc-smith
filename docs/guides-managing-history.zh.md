# 管理历史记录

AIGNE DocSmith 会为您的文档所做的所有更新保留一份按时间顺序排列的日志。此功能允许您跟踪变更、审查更新期间提供的反馈，并了解文档随时间的演变过程。本指南说明了如何访问和解读此历史记录。

## 查看更新历史记录

要查看所有文档更新的日志，您可以使用 `history view` 命令。该命令会为每条记录显示一个紧凑的单行摘要，类似于版本控制日志。

在您的终端中执行以下命令：

```bash 查看历史记录 icon=material-symbols:history
aigne history view
```

`history` 命令还支持 `view` 子命令的两个别名：`log` 和 `list`。以下命令是等效的，并将产生相同的输出：

```bash
aigne history log
aigne history list
```

### 理解历史记录输出

`history view` 命令的输出经过格式化，以便一目了然地提供每次更新的关键信息。每一行代表一条更新记录。

以下是其格式的分解说明：

| 组件 | 描述 |
| :--- | :--- |
| **短哈希值** | 根据更新时间戳生成的 8 位字符唯一标识符。 |
| **日期** | 一个相对时间戳，表示更新发生的时间（例如，“5 分钟前”、“2 天前”）。对于较早的记录，会显示具体日期。 |
| **操作** | 执行的操作类型，例如 `generate_document` 或 `update_document_detail`。 |
| **文档路径** | 如果操作针对单个文件，则为被修改的具体文档的路径。该路径包含在括号中。 |
| **反馈** | 更新时提供的反馈或摘要信息。 |

### 示例

以下是运行 `aigne history view` 命令的示例输出。

```bash
📜 更新历史记录

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

此日志为您的文档修改历史提供了清晰有序的记录，有助于跟踪进度和回顾过去的变更。