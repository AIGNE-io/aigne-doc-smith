# 管理偏好

AIGNE DocSmith 旨在通过你的反馈进行学习。当你优化或更正生成的内容时，DocSmith 可以将该反馈转换为持久性规则，称为偏好。这些规则确保你特定的风格、结构要求和内容策略在未来的文档任务中得到一致应用。所有偏好都存储在项目根目录下一个名为 `.aigne/doc-smith/preferences.yml` 的人类可读 YAML 文件中。

## 偏好生命周期

下图说明了你的反馈如何成为一个可重用的规则，该规则可应用于未来的任务，并可通过命令行进行管理。

```d2 偏好生命周期
direction: down

feedback: {
  label: "1. 用户在“优化”或“翻译”期间提供反馈"
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
  label: "4. 未来任务\n应用已保存的规则"
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

### 如何创建偏好

当你在 `refine` 或 `translate` 阶段提供反馈时，一个内部 Agent 会分析你的输入。它会判断该反馈是一次性修复（例如，更正一个拼写错误）还是一个可重用的策略（例如，“始终用英语编写代码注释”）。如果它代表一个持久性指令，它就会创建一个新的偏好规则。

### 规则属性

保存在 `preferences.yml` 中的每个规则都具有以下结构：

<x-field data-name="id" data-type="string" data-desc="规则的唯一、随机生成的标识符（例如，pref_a1b2c3d4e5f6g7h8）。"></x-field>
<x-field data-name="active" data-type="boolean" data-desc="指示规则当前是否已启用。未启用的规则在生成任务期间将被忽略。"></x-field>
<x-field data-name="scope" data-type="string" data-desc="定义规则何时应用。有效范围为 'global'、'structure'、'document' 或 'translation'。"></x-field>
<x-field data-name="rule" data-type="string" data-desc="将在未来任务中传递给 AI 的具体、提炼后的指令。"></x-field>
<x-field data-name="feedback" data-type="string" data-desc="用户提供的原始自然语言反馈，保留以供参考。"></x-field>
<x-field data-name="createdAt" data-type="string" data-desc="表示规则创建时间的 ISO 8601 时间戳。"></x-field>
<x-field data-name="paths" data-type="string[]" data-required="false" data-desc="一个可选的文件路径列表。如果存在，该规则仅适用于为这些特定源文件生成的内容。"></x-field>

## 使用 CLI 管理偏好

你可以使用 `aigne doc prefs` 命令查看和管理所有已保存的偏好。这允许你列出、激活、停用或永久删除规则。

### 列出所有偏好

要查看所有已保存的偏好，包括已激活和未激活的，请使用 `--list` 标志。

```bash 列出所有偏好 icon=lucide:terminal
aigne doc prefs --list
```

该命令会显示一个格式化列表，展示每个规则的状态、范围、ID 以及任何路径限制。

```text 输出示例 icon=lucide:clipboard-list
# 用户偏好

**格式说明：**
- 🟢 = 已激活的偏好, ⚪ = 未激活的偏好
- [scope] = 偏好范围 (global, structure, document, translation)
- ID = 唯一偏好标识符
- Paths = 特定文件路径 (如果适用)

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   在概览文档末尾添加“后续步骤”部分。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   代码注释必须用英语编写。
```

### 停用和重新激活偏好

如果你想临时禁用一个规则而不删除它，可以使用 `--toggle` 标志来切换其激活状态。不带 ID 运行该命令将启动一个交互模式，允许你选择一个或多个偏好进行切换。

```bash 以交互方式切换偏好 icon=lucide:terminal
aigne doc prefs --toggle
```

要直接切换特定规则，请使用 `--id` 标志提供其 ID。这对应于 `deactivateRule` 函数，该函数将规则的 `active` 属性设置为 `false`。

```bash 切换特定偏好 icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### 删除偏好

要永久删除一个或多个偏好，请使用 `--remove` 标志。此操作对应于 `removeRule` 函数，且无法撤销。

要进入交互式选择提示，请不带 ID 运行该命令。

```bash 以交互方式删除偏好 icon=lucide:terminal
aigne doc prefs --remove
```

要通过 ID 直接删除特定规则，请使用 `--id` 标志。

```bash 删除特定偏好 icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 后续步骤

管理偏好是根据项目特定需求定制 DocSmith 的关键部分。有关更多自定义选项，请查阅主要的[配置指南](./configuration.md)。