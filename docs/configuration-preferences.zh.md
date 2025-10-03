# 管理偏好设置

AIGNE DocSmith 旨在从您的反馈中学习。当您优化或纠正生成的内容时，DocSmith 可以将该反馈转换为持久性规则，称为偏好设置。这些规则确保您特定的风格、结构要求和内容策略在未来的文档任务中得到一致的应用。所有偏好设置都存储在位于您项目根目录下的一个人类可读的 YAML 文件中：`.aigne/doc-smith/preferences.yml`。

## 偏好设置的生命周期

下图说明了您的反馈如何成为一个可重用的规则，该规则可以应用于未来的任务并通过命令行进行管理。

```d2 偏好设置的生命周期
direction: down

developer: {
  label: "开发者"
  shape: person
}

docsmith_system: {
  label: "AIGNE DocSmith 系统"
  shape: rectangle

  cli: {
    label: "CLI 命令\n(refine / translate)"
    shape: rectangle
  }

  agent: {
    label: "内部分析 Agent"
    shape: rectangle
  }

  decision: {
    label: "反馈是否为\n可重用策略？"
    shape: diamond
  }

  create_rule: {
    label: "创建新偏好规则"
    shape: rectangle
  }
}

preferences_file: {
  label: ".aigne/doc-smith/preferences.yml"
  shape: cylinder
}

one_time_fix: {
  label: "作为一次性修复应用"
  shape: oval
}

developer -> docsmith_system.cli: "1. 提供反馈"
docsmith_system.cli -> docsmith_system.agent: "2. 捕获反馈"
docsmith_system.agent -> docsmith_system.decision: "3. 分析"
docsmith_system.decision -> docsmith_system.create_rule: "是"
docsmith_system.create_rule -> preferences_file: "4. 将规则保存到文件"
docsmith_system.decision -> one_time_fix: "否"
```

### 如何创建偏好设置

当您在 `refine` 或 `translate` 阶段提供反馈时，一个内部 Agent 会分析您的输入。它会判断该反馈是一次性修复（例如，纠正拼写错误）还是可重用策略（例如，“代码注释必须用英文编写”）。如果它代表一个持久性指令，Agent 就会创建一条新的偏好规则并将其保存到您项目的 `preferences.yml` 文件中。

### 规则属性

保存在 `preferences.yml` 中的每条规则都具有以下结构：

<x-field-group>
  <x-field data-name="id" data-type="string" data-desc="规则的唯一、随机生成的标识符（例如，pref_a1b2c3d4e5f6g7h8）。"></x-field>
  <x-field data-name="active" data-type="boolean" data-desc="指示规则当前是否已启用。未激活的规则在生成任务期间将被忽略。"></x-field>
  <x-field data-name="scope" data-type="string">
    <x-field-desc markdown>定义规则何时应用。有效范围是 `global`、`structure`、`document` 或 `translation`。</x-field-desc>
  </x-field>
  <x-field data-name="rule" data-type="string" data-desc="将在未来任务中传递给 AI 的具体、提炼后的指令。"></x-field>
  <x-field data-name="feedback" data-type="string" data-desc="用户提供的原始自然语言反馈，保留以供参考。"></x-field>
  <x-field data-name="createdAt" data-type="string" data-desc="指示规则创建时间的 ISO 8601 时间戳。"></x-field>
  <x-field data-name="paths" data-type="string[]" data-required="false">
    <x-field-desc markdown>一个可选的文件路径列表。如果存在，该规则仅适用于为这些特定源文件生成的内容。</x-field-desc>
  </x-field>
</x-field-group>

## 使用 CLI 管理偏好设置

您可以使用 `aigne doc prefs` 命令查看和管理所有已保存的偏好设置。这允许您列出、激活、停用或永久删除规则。

### 列出所有偏好设置

要查看所有已保存的偏好设置（包括激活和未激活的）的完整列表，请使用 `--list` 标志。

```bash 列出所有偏好设置 icon=lucide:terminal
aigne doc prefs --list
```

该命令会显示一个格式化的列表，其中显示了每条规则的状态、范围、ID 以及任何路径限制。

```text 输出示例 icon=lucide:clipboard-list
# 用户偏好设置

**格式说明：**
- 🟢 = 激活的偏好设置, ⚪ = 未激活的偏好设置
- [scope] = 偏好范围 (global, structure, document, translation)
- ID = 唯一偏好标识符
- Paths = 特定文件路径 (如果适用)

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   在概览文档末尾添加一个“后续步骤”部分。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   代码注释必须用英文编写。
```

### 停用和重新激活偏好设置

如果您需要暂时禁用某条规则而不删除它，可以使用 `--toggle` 标志切换其激活状态。在不带 ID 的情况下运行该命令将启动交互模式，允许您选择一个或多个偏好设置进行切换。

```bash 以交互方式切换偏好设置 icon=lucide:terminal
aigne doc prefs --toggle
```

要直接切换特定规则，请使用 `--id` 标志提供其 ID。此操作会更改规则的 `active` 属性。

```bash 切换特定偏好设置 icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### 删除偏好设置

要永久删除一个或多个偏好设置，请使用 `--remove` 标志。此操作无法撤销。

要获得交互式选择提示，请在不带 ID 的情况下运行该命令。

```bash 以交互方式删除偏好设置 icon=lucide:terminal
aigne doc prefs --remove
```

要直接删除特定规则，请使用 `--id` 标志提供其 ID。

```bash 删除特定偏好设置 icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 后续步骤

管理偏好设置是根据项目特定需求定制 DocSmith 的关键部分。有关更多自定义选项，请浏览主要的[配置指南](./configuration.md)。