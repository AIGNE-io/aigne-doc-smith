# 管理历史记录

AIGNE DocSmith 会按时间顺序记录对您文档所做的所有更新。此功能使您能够跟踪变更、查看每次更新所提供的反馈，并观察文档随时间推移的演变。本指南将说明如何访问和解读此历史记录。

## 查看更新历史记录

要查看所有文档更新的日志，请使用 `history view` 命令。该命令会为每条记录显示一个紧凑的单行摘要，其格式类似于版本控制日志。

在您项目的根目录中执行以下命令：

```bash 查看历史记录 icon=material-symbols:history
aigne history view
```

为方便起见，`history` 命令还支持 `view` 子命令的两个别名：`log` 和 `list`。以下命令与上述命令等效，并将产生相同的输出：

```bash
aigne history log
```

```bash
aigne history list
```

如果尚未进行任何更新，该工具将显示消息：`No update history found`。

### 理解历史记录输出

`history view` 命令的输出经过精心组织，以简洁的格式提供每次更新的关键信息。日志中的每一行代表一个独立的更新事件。

该格式由以下几个部分组成：

| 组件 | 描述 |
| :--- | :--- |
| **短哈希值** | 根据更新时间戳生成的 8 个字符的唯一标识符。此哈希值是确定性的，意味着相同的时间戳总是会生成相同的哈希值。 |
| **日期** | 一个相对时间戳，表示更新发生的时间（例如，“5 分钟前”，“2 天前”）。对于超过一周的记录，将显示具体日期。 |
| **操作** | 执行的操作类型，例如 `generate_document` 或 `update_document_detail`。 |
| **文档路径** | 如果操作针对单个文件，则显示被修改的具体文档的路径。为清晰起见，该路径用括号括起来。 |
| **反馈** | 执行更新时提供的摘要信息或反馈。 |

### 输出示例

以下是运行 `aigne history view` 命令的示例输出。此示例说明了日志中如何记录不同的操作。

```bash
📜 更新历史记录

e5a4f8b1 2 小时前 update_document_detail (/guides/generating-documentation): 新增了关于高级配置选项的章节。
a3b1c9d2 1 天前  update_document_detail (/overview): 优化了引言，使其更加简洁。
f8d2e0c3 3 天前 generate_document (/guides/managing-history): 初次生成历史记录管理指南。
```

此日志清晰有序地记录了您文档的修改历史，是跟踪进度和回顾过往变更的有效工具。