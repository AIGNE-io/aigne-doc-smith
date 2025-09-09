# 管理偏好

AIGNE DocSmith 旨在从您的反馈中学习。当您优化或更正生成的内容时，DocSmith 可以将这些反馈转化为持久性规则，即偏好。这些规则确保您特定的风格、结构要求和内容策略在未来的文档任务中得到一致应用。所有偏好都存储在项目根目录下 `.aigne/doc-smith/preferences.yml` 文件中，该文件为人类可读的 YAML 格式。

## 偏好生命周期

下图说明了您的反馈如何成为一个可重用的规则，该规则可应用于未来的任务，并通过命令行进行管理。

```d2 偏好生命周期
direction: down

feedback: {
  label: "1. 用户在 'refine' 或 'translate' 期间\n提供反馈"
  shape: rectangle
}

refiner: {
  label: "2. Feedback Refiner Agent\n分析反馈"
  shape: rectangle
}

decision: {
  label: "这是一个可重用的策略吗？"
  shape: diamond
}

pref_file: {
  label: "3. preferences.yml\n规则已保存"
  shape: cylinder
}

future_tasks: {
  label: "4. 未来的任务\n应用已保存的规则"
  shape: rectangle
}

cli: {
  label: "5. CLI 管理\n('aigne doc prefs')"
  shape: rectangle
}

feedback -> refiner: "输入"
refiner -> decision: "分析"
decision -> pref_file: "是"
decision -> "丢弃（一次性修复）": "否"
pref_file -> future_tasks: "应用于"
cli <-> pref_file: "管理"

```

### DocSmith 如何从反馈中学习

当您在 `refine` 或 `translate` 阶段提供反馈时，一个名为 'Feedback Refiner' 的内部 Agent 会分析您的输入。其目标是区分一次性修复（例如，更正拼写错误）和可重用策略（例如，“始终用英语编写代码注释”）。如果它确定反馈代表一个持久性指令，就会创建一个新的偏好规则。

每个规则都有几个关键属性来定义其行为：

| 属性 | 描述 |
|---|---|
| **id** | 规则的唯一标识符（例如，`pref_a1b2c3d4`）。 |
| **active** | 一个布尔值（`true`/`false`），指示规则当前是否已启用。 |
| **scope** | 定义规则的应用时机：`global`、`structure`、`document` 或 `translation`。 |
| **rule** | 将在未来任务中传递给 AI 的指令。 |
| **feedback** | 您提供的原始自然语言反馈。 |
| **createdAt** | 规则创建时的 ISO 8601 时间戳。 |
| **paths** | 一个可选的文件路径列表。如果存在，该规则仅适用于为这些特定路径生成的内容。 |

## 通过 CLI 管理偏好

您可以使用 `aigne doc prefs` 命令查看和管理所有已保存的偏好。这允许您列出、激活、停用或永久删除规则。

### 列出所有偏好

要查看所有已保存的偏好（包括活动和非活动的），请使用 `--list` 标志。

```bash 列出所有偏好 icon=lucide:terminal
aigne doc prefs --list
```

该命令会显示一个格式化列表，解释每个规则的状态、范围、ID 以及任何路径限制。

**示例输出：**

```text 示例输出 icon=lucide:clipboard-list
# 用户偏好

**格式说明：**
- 🟢 = 活动偏好, ⚪ = 非活动偏好
- [scope] = 偏好范围 (global, structure, document, translation)
- ID = 偏好唯一标识符
- Paths = 特定文件路径 (如果适用)

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   在概览文档末尾添加一个 'Next Steps' 部分。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   代码注释必须用英语编写。
 
```

### 切换偏好状态

如果您想临时禁用某个规则而不删除它，可以切换其活动状态。请使用 `--toggle` 标志。

不带 ID 运行该命令将启动交互模式，允许您选择一个或多个要切换的偏好：

```bash 以交互方式切换偏好 icon=lucide:terminal
aigne doc prefs --toggle
```

要直接切换特定规则，请使用 `--id` 标志提供其 ID：

```bash 切换特定偏好 icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### 移除偏好

要永久删除一个或多个偏好，请使用 `--remove` 标志。此操作无法撤销。

要进入交互式选择提示，请不带 ID 运行该命令：

```bash 以交互方式移除偏好 icon=lucide:terminal
aigne doc prefs --remove
```

要通过 ID 直接移除特定规则，请使用 `--id` 标志：

```bash 移除特定偏好 icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 后续步骤

管理偏好是根据项目特定需求定制 DocSmith 的关键部分。要了解更多自定义选项，请查阅主要的[配置指南](./configuration.md)。