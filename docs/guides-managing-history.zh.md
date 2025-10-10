# 管理历史记录

AIGNE DocSmith 会按时间顺序记录对您文档所做的所有更新。此功能让您可以跟踪变更，审查更新期间提供的反馈，并了解文档随时间的演变过程。本指南将说明如何访问和解读此历史记录。

## 查看更新历史记录

要查看所有文档更新的日志，您可以使用 `history view` 命令。该命令会为每个条目显示一个紧凑的单行摘要，类似于版本控制日志。

在您的终端中执行以下命令：

```bash 查看历史记录 icon=material-symbols:history
aigne history view
```

`history` 命令还支持 `view` 子命令的两个别名：`log` 和 `list`。以下命令是等效的，将产生相同的输出：

```bash
aigne history log
```

```bash
aigne history list
```

### 理解历史记录输出

`history view` 命令的输出格式旨在让您能一目了然地获取每次更新的关键信息。每一行代表一个单独的更新条目。

以下是格式的详细说明：

| 组件 | 描述 |
| :--- | :--- |
| **短哈希** | 一个根据更新时间戳生成的 7 个字符的唯一标识符。 |
| **日期** | 一个相对时间戳，指示更新发生的时间（例如，“5 minutes ago”、“2 days ago”）。对于较旧的条目，会显示具体日期。 |
| **操作** | 执行的操作类型，例如 `generate-document` 或 `update-document-detail`。 |
| **文档路径** | 被修改的具体文档的路径，如果操作针对单个文件。该路径包含在括号中。 |
| **反馈** | 进行更新时提供的反馈或摘要信息。 |

### 示例

以下是运行 `aigne history view` 命令的示例输出。

```bash
📜 更新历史记录

e5a4f8b 2 小时前 update-document-detail (/guides/generating-documentation): 添加了关于高级配置选项的新章节。
a3b1c9d 1 天前  update-document-detail (/overview): 优化了引言，使其更加简洁。
f8d2e0c 3 天前 generate-document (/guides/managing-history): 初次生成历史记录管理指南。
```

此日志为您的文档修改历史提供了清晰有序的记录，有助于跟踪进度和回顾过去的变更。