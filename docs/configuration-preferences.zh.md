# 管理偏好设置

AIGNE DocSmith 旨在从您的反馈中学习。当您优化或更正生成的内容时，DocSmith 可以将该反馈转换为持久性规则，称为偏好设置。这些规则确保您特定的风格、结构要求和内容策略在未来的文档任务中得到一致的应用。所有偏好设置都存储在项目根目录下一个人类可读的 YAML 文件中，路径为 `.aigne/doc-smith/preferences.yml`。

## 偏好设置的生命周期

下图说明了您的反馈如何成为一个可重用的规则，该规则可以应用于未来的任务，并可以通过命令行进行管理。

```d2 偏好设置的生命周期
direction: down

feedback: {
  label: "1. 用户在“优化”或“翻译”期间\n提供反馈"
  shape: rectangle
}

refiner: {
  label: "2. 反馈优化 Agent\n分析反馈"
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

### 如何创建偏好设置

当您在 `refine` 或 `translate` 阶段提供反馈时，一个内部 Agent 会分析您的输入。它会判断反馈是一次性修复（例如，更正拼写错误）还是可重用的策略（例如，“始终用英语编写代码注释”）。如果它代表一个持久的指令，它就会创建一个新的偏好设置规则。

### 规则属性

保存在 `preferences.yml` 中的每个规则都具有以下结构：

<x-field data-name="id" data-type="string" data-desc="规则的唯一、随机生成的标识符（例如，pref_a1b2c3d4e5f6g7h8）。"></x-field>
<x-field data-name="active" data-type="boolean" data-desc="指示规则当前是否已启用。在生成任务期间，非活动规则将被忽略。"></x-field>
<x-field data-name="scope" data-type="string" data-desc="定义规则应在何时应用。有效范围是 'global'、'structure'、'document' 或 'translation'。"></x-field>
<x-field data-name="rule" data-type="string" data-desc="将在未来任务中传递给 AI 的具体、精炼的指令。"></x-field>
<x-field data-name="feedback" data-type="string" data-desc="用户提供的原始自然语言反馈，保留以供参考。"></x-field>
<x-field data-name="createdAt" data-type="string" data-desc="表示规则创建时间的 ISO 8601 时间戳。"></x-field>
<x-field data-name="paths" data-type="string[]" data-required="false" data-desc="一个可选的文件路径列表。如果存在，该规则仅适用于为这些特定源文件生成的内容。"></x-field>

## 使用 CLI 管理偏好设置

您可以使用 `aigne doc prefs` 命令查看和管理所有已保存的偏好设置。这允许您列出、激活、停用或永久删除规则。

### 列出所有偏好设置

要查看所有已保存的偏好设置（包括活动的和非活动的），请使用 `--list` 标志。

```bash 列出所有偏好设置 icon=lucide:terminal
aigne doc prefs --list
```

该命令会显示一个格式化的列表，显示每个规则的状态、范围、ID 和任何路径限制。

```text 示例输出 icon=lucide:clipboard-list
# 用户偏好设置

**格式说明：**
- 🟢 = 活动偏好设置，⚪ = 非活动偏好设置
- [scope] = 偏好设置范围 (global, structure, document, translation)
- ID = 唯一偏好设置标识符
- Paths = 特定文件路径（如果适用）

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   在概述文档的末尾添加一个“后续步骤”部分。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   代码注释必须用英语编写。
```

### 停用和重新激活偏好设置

如果您想暂时禁用某个规则而不删除它，可以使用 `--toggle` 标志来切换其活动状态。在不带 ID 的情况下运行该命令将启动交互模式，允许您选择一个或多个偏好设置进行切换。

```bash 以交互方式切换偏好设置 icon=lucide:terminal
aigne doc prefs --toggle
```

要直接切换特定规则，请使用 `--id` 标志提供其 ID。这对应于 `deactivateRule` 函数，该函数将规则的 `active` 属性设置为 `false`。

```bash 切换特定偏好设置 icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### 删除偏好设置

要永久删除一个或多个偏好设置，请使用 `--remove` 标志。此操作对应于 `removeRule` 函数，且无法撤销。

要进入交互式选择提示，请在不带 ID 的情况下运行该命令。

```bash 以交互方式删除偏好设置 icon=lucide:terminal
aigne doc prefs --remove
```

要通过其 ID 直接删除特定规则，请使用 `--id` 标志。

```bash 删除特定偏好设置 icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 后续步骤

管理偏好设置是根据项目特定需求定制 DocSmith 的关键部分。要了解更多自定义选项，请探索主要的[配置指南](./configuration.md)。