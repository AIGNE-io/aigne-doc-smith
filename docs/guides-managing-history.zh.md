# 管理历史记录

AIGNE DocSmith 会按时间顺序记录对您文档所做的所有更新。此功能让您可以跟踪变更、查看每次更新提供的反馈，并观察文档随时间的演变。本指南将说明如何访问和解读此历史记录日志。

## 查看更新历史记录

要查看所有文档更新的日志，请使用 `aigne doc history view` 命令。此命令会为每个条目显示一个紧凑的单行摘要，其格式类似于版本控制日志。

在您项目的根目录中执行以下命令：

```bash 查看历史记录 icon=material-symbols:history
aigne doc history view
```

为方便起见，`doc history` 命令还支持 `view` 子命令的两个别名：`log` 和 `list`。以下命令与上述命令等效，并将产生相同的输出：

```bash
aigne doc history log
```

```bash
aigne doc history list
```

如果尚未进行任何更新，该工具将显示消息：`No update history found`。

### 理解历史记录输出

`aigne doc history view` 命令的输出结构旨在以简洁的格式提供每次更新的关键信息。日志中的每一行代表一个单一的更新事件。

其格式由以下几个部分组成：

| 组件 | 说明 |
| :--- | :--- |
| **短哈希值** | 一个 8 个字符的唯一标识符，根据更新的时间戳生成。此哈希值是确定性的，意味着相同的时间戳总是会产生相同的哈希值。 |
| **日期** | 一个相对时间戳，指示更新发生的时间（例如，“5 minutes ago”、“2 days ago”）。对于超过一周的条目，会显示具体日期。 |
| **操作** | 执行的操作类型，例如 `generate_document` 或 `update_document_detail`。 |
| **文档路径** | 如果操作针对单个文件，则为被修改的具体文档的路径。为清晰起见，此路径用括号括起来。 |
| **反馈** | 执行更新时提供的摘要信息或反馈。 |

### 输出示例

以下是运行 `aigne doc history view` 命令的示例输出。此示例展示了不同的操作是如何被记录在日志中的。

```bash
📜 Update History

e5a4f8b1 2 hours ago update_document_detail (/guides/generating-documentation): Added a new section on advanced configuration options.
a3b1c9d2 1 day ago  update_document_detail (/overview): Refined the introduction to be more concise.
f8d2e0c3 3 days ago generate_document (/guides/managing-history): Initial generation of the history management guide.
```

此日志为您文档的修改历史提供了清晰有序的记录，是跟踪进度和回顾过往变更的有效工具。