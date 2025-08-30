---
labels: ["Reference"]
---

# 管理偏好

DocSmith 旨在通过您的反馈进行学习。当您优化文档并提供更正时，系统可以将这些反馈转化为称为“偏好”的持久、可重用的规则。这确保了您的风格选择、结构约定和具体指令在未来的操作中能够被记住并一致地应用。

所有偏好都存储在项目根目录下名为 `.aigne/doc-smith/preferences.yml` 的人类可读 YAML 文件中。虽然您可以查看此文件，但建议使用专用的 `aigne doc prefs` 命令行界面来管理您的偏好。

## 偏好是如何创建的

偏好在 `aigne doc refine` 等命令的反馈周期中自动生成。其过程如下：

```d2
direction: right

User: {
  shape: person
  label: "用户"
}

Refine: "`aigne doc refine` 命令"

FeedbackRefiner: "反馈→规则转换器"

PreferencesFile: "preferences.yml" {
  shape: document
}

User -> Refine: "提供反馈，例如‘不要翻译变量名’"
Refine -> FeedbackRefiner: "发送反馈进行分析"
FeedbackRefiner -> PreferencesFile: "保存新的可重用规则" {
  style.animated: true
}

```

1.  **反馈输入**：您在优化会话期间提供自然语言反馈。
2.  **规则生成**：一个内部 Agent 会分析您的反馈，以确定它代表的是可重用策略还是一次性修复。
3.  **规则创建**：如果被认为是可重用的，它会创建一个结构化规则，包含特定的作用域（例如，`document`、`translation`）、唯一的 ID 以及指令本身。
4.  **持久化**：新规则被保存到 `preferences.yml` 文件中，使其在未来的任务中生效。

## 通过 CLI 管理偏好

`aigne doc prefs` 命令是您查看和管理所有已保存偏好的主要工具。

### 列出所有偏好

要查看所有偏好的格式化列表，请使用 `--list` 标志。

```bash
aigne doc prefs --list
```

输出清晰地展示了每个规则的概览：

```text
# 用户偏好

**格式说明：**
- 🟢 = 活动偏好, ⚪ = 非活动偏好
- [scope] = 偏好作用域 (global, structure, document, translation)
- ID = 唯一偏好标识符
- Paths = 特定文件路径 (如果适用)

🟢 [translation] pref_1a2b3c4d
   在翻译期间保持代码和标识符不变，不得翻译它们。

⚪ [structure] pref_5e6f7g8h | 路径：overview.md, tutorials.md
   在概述和教程文档末尾添加“后续步骤”部分，并附上 2-3 个仓库内的链接。
```

- **状态 (🟢 / ⚪)**：显示规则当前是活动还是非活动状态。
- **作用域**：指明规则的应用范围（例如，`translation`、`structure`）。
- **ID**：用于管理规则的唯一标识符。
- **路径**：如果规则仅限于特定文件，这些文件将在此处列出。

### 切换偏好状态

您可以使用 `--toggle` 标志来激活或停用偏好。这在临时禁用某个规则而不想永久删除它时非常有用。

**交互模式**

如果您在运行命令时未指定 ID，将会出现一个交互式提示，允许您选择多个规则进行切换。

```bash
aigne doc prefs --toggle
```

**按 ID 操作**

要切换特定规则的状态，请使用 `--id` 选项提供其 ID。

```bash
aigne doc prefs --toggle --id pref_5e6f7g8h
```

### 删除偏好

要永久删除一个或多个偏好，请使用 `--remove` 标志。

**交互模式**

在不带 ID 的情况下运行该命令将启动一个交互式选择提示。

```bash
aigne doc prefs --remove
```

**按 ID 操作**

要删除特定规则，请传递其 ID。

```bash
aigne doc prefs --remove --id pref_1a2b3c4d
```

此操作不可逆，请谨慎使用。

---

通过管理您的偏好，您可以随着时间的推移微调 DocSmith 的行为，使文档处理过程越来越自动化，并与您项目的特定需求保持一致。要了解如何提供反馈，您可以在 [更新与优化](./features-update-and-refine.md) 指南中了解更多信息。