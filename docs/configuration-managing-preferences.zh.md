# 管理偏好设置

在生成或更新文档时，您可以使用 `--feedback` 标志提供反馈。此反馈将作为“偏好设置”保存，以便在未来的会话中重复使用，确保 AI 与您之前的指令保持一致。`aigne doc prefs` 命令提供了一种直接管理这些已保存偏好设置的方法。

本指南详细介绍了如何列出、删除和切换已保存偏好设置的活动状态。

## 查看已保存的偏好设置

要查看所有已保存的偏好设置，请使用 `--list` 标志。此命令会显示每个偏好设置的状态、范围、唯一 ID 和内容。

```bash
aigne doc prefs --list
```

### 理解输出

列表经过格式化，以提供关于每个偏好规则的清晰信息：

*   **状态**：指示偏好设置是活动还是非活动状态。
    *   `🟢`：活动。该规则将在文档生成期间应用。
    *   `⚪`：非活动。该规则已保存但将被忽略。
*   **范围**：偏好设置适用的上下文（例如，`global`、`document`）。
*   **ID**：偏好设置的唯一标识符，用于删除或切换状态。
*   **路径**：如果偏好设置仅适用于特定文件，其路径会在此处列出。
*   **规则内容**：偏好规则本身的文本。

**输出示例：**

```
# 用户偏好设置

**格式说明：**
- 🟢 = 活动偏好，⚪ = 非活动偏好
- [scope] = 偏好范围 (global, structure, document, translation)
- ID = 唯一偏好标识符
- Paths = 特定文件路径（如适用）

🟢 [document] 2af5c | Paths: /guides/generating-documentation.md
   Focus on concrete, verifiable facts and information. Avoid using vague or empty words that don't provide measurable or specific d...

⚪ [global] 8b1e2
   Use a formal and academic tone throughout the documentation.

```

## 删除偏好设置

当不再需要某个偏好设置时，您可以使用 `--remove` 标志将其永久删除。您可以通过指定其 ID 或通过交互式菜单来删除偏好设置。

### 交互模式

要从列表中选择偏好设置，请在不带任何 ID 的情况下运行该命令。这将打开一个交互式提示，您可以在其中勾选要删除的项目。

```bash
aigne doc prefs --remove
```

将出现一个清单，允许您选择一个或多个偏好设置。这是确保您删除正确项目的推荐方法。

### 直接模式

如果您已经知道要删除的偏好设置的唯一 ID，可以使用 `--id` 标志来指定它们。如果您确定要删除哪些项目，这种方式会更快。

```bash
# 删除单个偏好设置
aigne doc prefs --remove --id 2af5c

# 删除多个偏好设置
aigne doc prefs --remove --id 2af5c --id 8b1e2
```

## 切换偏好设置

除了永久删除偏好设置，您还可以临时启用或禁用它。当您想为特定任务暂停某条规则但又不想丢失它时，这非常有用。使用 `--toggle` 标志来更改偏好设置的活动状态。

### 交互模式

在不带 ID 的情况下运行该命令将启动一个交互式清单，类似于删除命令。

```bash
aigne doc prefs --toggle
```

您可以选择希望激活或停用的偏好设置。状态图标（`🟢`/`⚪`）将更新以反映新状态。

### 直接模式

要直接切换特定偏好设置，请使用 `--id` 标志。

```bash
# 切换单个偏好设置
aigne doc prefs --toggle --id 2af5c

# 切换多个偏好设置
aigne doc prefs --toggle --id 2af5c --id 8b1e2
```

---

通过管理您的偏好设置，您可以对文档生成过程进行精细控制，确保输出始终符合您项目的特定要求和风格。