# 管理偏好设置

您是否曾希望您的 AI 助手能够记住您的指示？本指南将说明如何查看、移除和切换已保存的文档生成偏好设置，让您能够精细地控制 AI 的输出，并确保其始终遵循您项目的特定风格。

当您生成或更新文档时，可以使用 `--feedback` 标志提供反馈。此反馈将作为“偏好设置”保存下来，以便在未来的会话中重复使用，从而确保 AI 与您之前的指示保持一致。`aigne doc prefs` 命令提供了一种直接管理这些已保存偏好设置的方法。

本指南详细介绍了如何列出、移除和切换已保存偏好设置的激活状态。

```d2
direction: down

User: {
  shape: c4-person
}

CLI-Interface: {
  label: "CLI: aigne doc prefs"
  shape: rectangle

  List-Action: {
    label: "--list"
    shape: oval
  }

  Remove-Action: {
    label: "--remove"
    shape: diamond

    Interactive-Remove: {
      label: "交互模式"
      shape: rectangle
    }

    Direct-Remove: {
      label: "直接模式\n(使用 --id)"
      shape: rectangle
    }
  }

  Toggle-Action: {
    label: "--toggle"
    shape: diamond

    Interactive-Toggle: {
      label: "交互模式"
      shape: rectangle
    }

    Direct-Toggle: {
      label: "直接模式\n(使用 --id)"
      shape: rectangle
    }
  }
}

Preference-Storage: {
  label: "偏好设置存储"
  shape: cylinder
}

User -> CLI-Interface: "执行命令"
CLI-Interface.List-Action -> Preference-Storage: "读取"
CLI-Interface.Remove-Action -> CLI-Interface.Interactive-Remove: "无 ID"
CLI-Interface.Remove-Action -> CLI-Interface.Direct-Remove: "指定 ID"
CLI-Interface.Interactive-Remove -> Preference-Storage: "删除所选"
CLI-Interface.Direct-Remove -> Preference-Storage: "删除指定"
CLI-Interface.Toggle-Action -> CLI-Interface.Interactive-Toggle: "无 ID"
CLI-Interface.Toggle-Action -> CLI-Interface.Direct-Toggle: "指定 ID"
CLI-Interface.Interactive-Toggle -> Preference-Storage: "更新所选"
CLI-Interface.Direct-Toggle -> Preference-Storage: "更新指定"
```

## 查看已保存的偏好设置

要查看所有已保存的偏好设置，请使用 `--list` 标志。此命令会显示每个偏好设置及其状态、作用域、唯一 ID 和内容。

```bash icon=lucide:terminal
aigne doc prefs --list
```

### 理解输出

列表的格式旨在清晰地提供每条偏好规则的信息：

*   **Status（状态）**: 表示偏好设置是激活还是非激活状态。
    *   `🟢`: 激活。该规则将在文档生成期间应用。
    *   `⚪`: 非激活。该规则已保存但将被忽略。
*   **Scope（作用域）**: 偏好设置适用的上下文（例如，`global`、`document`）。
*   **ID**: 偏好设置的唯一标识符，用于移除或切换状态。
*   **Paths（路径）**: 如果偏好设置仅适用于特定文件，此处会列出其路径。
*   **Rule Content（规则内容）**: 偏好规则本身的文本。

**输出示例：**

```
# User Preferences

**Format explanation:**
- 🟢 = Active preference, ⚪ = Inactive preference
- [scope] = Preference scope (global, structure, document, translation)
- ID = Unique preference identifier
- Paths = Specific file paths (if applicable)

🟢 [document] pref_a1b2c3d4e5f6a7b8 | Paths: /guides/generating-documentation.md
   Focus on concrete, verifiable facts and information. Avoid using vague or empty words that don't provide measurable or specific d...

⚪ [global] pref_b8a7f6e5d4c3b2a1
   Use a formal and academic tone throughout the documentation.

```

## 移除偏好设置

当不再需要某个偏好设置时，您可以使用 `--remove` 标志将其永久删除。您可以通过指定其 ID 或通过交互式菜单来移除偏好设置。

### 交互模式

要从列表中选择偏好设置，请在不带任何 ID 的情况下运行该命令。这将打开一个交互式提示，您可以在其中勾选希望删除的项目。

```bash icon=lucide:terminal
aigne doc prefs --remove
```

屏幕上将出现一个清单，允许您选择一个或多个偏好设置。这是推荐的方法，以确保您移除正确的项目。

### 直接模式

如果您已经知道要移除的偏好设置的唯一 ID，可以使用 `--id` 标志来指定它们。如果您确定要删除哪些项目，这种方式会更快。

```bash icon=lucide:terminal
# 移除单个偏好设置
aigne doc prefs --remove --id pref_a1b2c3d4e5f6a7b8

# 移除多个偏好设置
aigne doc prefs --remove --id pref_a1b2c3d4e5f6a7b8 --id pref_b8a7f6e5d4c3b2a1
```

## 切换偏好设置

除了永久删除偏好设置，您还可以临时启用或禁用它。当您希望为特定任务暂停某条规则但又不想丢失它时，这个功能非常有用。使用 `--toggle` 标志来更改偏好设置的激活状态。

### 交互模式

在不带 ID 的情况下运行该命令将启动一个交互式清单，与移除命令类似。

```bash icon=lucide:terminal
aigne doc prefs --toggle
```

您可以选择希望激活或停用的偏好设置。状态图标（`🟢`/`⚪`）将会更新以反映新的状态。

### 直接模式

要直接切换特定偏好设置的状态，请使用 `--id` 标志。

```bash icon=lucide:terminal
# 切换单个偏好设置
aigne doc prefs --toggle --id pref_a1b2c3d4e5f6a7b8

# 切换多个偏好设置
aigne doc prefs --toggle --id pref_a1b2c3d4e5f6a7b8 --id pref_b8a7f6e5d4c3b2a1
```

---

通过管理您的偏好设置，您可以对文档生成过程进行精细控制，确保输出始终符合您项目的特定要求和风格。