# 管理偏好

AIGNE DocSmith 旨在通过学习你的反馈进行优化。当你优化或修正生成的内容时，DocSmith 会将这些反馈转化为持久的规则，称为偏好。这些规则确保了你在未来的文档任务中能够始终应用你特定的风格、结构要求和内容策略。所有偏好都存储在项目根目录下的人类可读的 YAML 文件中，路径为 `.aigne/doc-smith/preferences.yml`。

## DocSmith 如何从反馈中学习

当你在 `refine` 或 `translate` 阶段提供反馈时，一个名为“Feedback Refiner”的内部 Agent 会分析你的输入。其目标是区分一次性修复（例如，修正一个拼写错误）和可重用的策略（例如，“代码注释必须用英文编写”）。如果它判断该反馈代表一个长期有效的指令，就会创建一条新的偏好规则。

每条规则都有几个关键属性来定义其行为：

| 属性 | 描述 |
|---|---|
| **ID** | 规则的唯一标识符（例如，`pref_a1b2c3d4`）。 |
| **Rule** | 在未来任务中将传递给 AI 的实际指令。 |
| **Scope** | 定义规则的应用时机：`global`、`structure`、`document` 或 `translation`。 |
| **Active** | 一个布尔值（`true`/`false`），指示规则当前是否启用。 |
| **Paths** | 一个可选的文件或目录路径列表。如果存在，该规则仅适用于为这些特定路径生成的内容。 |
| **Feedback** | 你提供的原始自然语言反馈。 |

## 通过 CLI 管理偏好

你可以使用 `aigne doc prefs` 命令轻松查看和管理所有已保存的偏好。该命令允许你列出、激活、停用或永久删除规则。

### 列出所有偏好

要查看所有已保存的偏好（包括激活和未激活的），请使用 `--list` 标志。

```bash
aigne doc prefs --list
```

该命令会显示一个格式化的列表，解释每条规则的状态、作用域、ID 以及任何路径限制。

**输出示例：**

```text
# 用户偏好

**格式说明：**
- 🟢 = 激活的偏好, ⚪ = 未激活的偏好
- [scope] = 偏好作用域 (global, structure, document, translation)
- ID = 偏好唯一标识符
- Paths = 特定文件路径 (如适用)

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   在概览文档末尾添加“后续步骤”部分。

⚪ [document] pref_i9j0k1l2m3n4o5p6
   代码注释必须用英文编写。
```

### 切换偏好状态

如果你想临时禁用某条规则而不删除它，可以切换其激活状态。请使用 `--toggle` 标志。

在不带 ID 的情况下运行该命令将启动交互模式，允许你选择一个或多个偏好来切换状态：

```bash
aigne doc prefs --toggle
```

要直接切换特定规则的状态，请使用 `--id` 标志提供其 ID：

```bash
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### 删除偏好

要永久删除一个或多个偏好，请使用 `--remove` 标志。此操作无法撤销。

要进入交互式选择提示，请在不带 ID 的情况下运行该命令：

```bash
aigne doc prefs --remove
```

要通过 ID 直接删除特定规则，请使用 `--id` 标志：

```bash
aigne doc prefs --remove --id pref_i9j0k1l2m3n4o5p6
```

## 后续步骤

管理偏好是根据项目特定需求定制 DocSmith 的关键部分。要了解更多自定义选项，请查阅主[配置指南](./configuration.md)。