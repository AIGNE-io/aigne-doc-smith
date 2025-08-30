---
labels: ["Reference"]
---

# 管理偏好

当您使用反馈优化文档时，AIGNE DocSmith 会学习您的风格和结构要求。它会将这些学习成果保存为持久化规则（称为“偏好”），以确保在未来所有文档生成中保持一致性。该系统使工具能够随着时间的推移适应您的特定需求。

本指南将说明如何根据您的反馈创建偏好，以及如何使用命令行界面 (CLI) 对其进行管理。所有偏好都存储在项目根目录下一个名为 `.aigne/doc-smith/preferences.yml` 的人类可读的 YAML 文件中。

## 偏好的创建方式

当您在使用 `aigne doc update` 等命令时通过 `--feedback` 标志提供反馈时，偏好会自动生成。一个名为“反馈优化器”的内部 Agent 会分析您的自然语言输入并执行以下几个关键操作：

1.  **提炼反馈**：将您的反馈（例如，“让代码示例更简单”）转换为简洁、可复用的指令（例如，“简化代码示例，使其最小且可运行。”）。
2.  **确定作用域**：为规则分配一个作用域，以控制其应用时机：
    *   `global`：适用于所有地方的通用写作或风格规则。
    *   `structure`：与整体文档结构相关的规则，例如添加特定章节。
    *   `document`：用于在特定文档内生成内容的规则。
    *   `translation`：仅在翻译过程中应用的规则。
3.  **设置路径限制**：如果您的反馈明确针对一组特定文件（例如，“在 `examples/` 目录下...”），则可以将规则限制为仅应用于这些路径。

## 偏好规则的结构

`preferences.yml` 文件中保存的每条规则都包含若干字段，用于定义其行为和来源。

以下是一条偏好规则的示例：

```yaml
- id: pref_a1b2c3d4e5f67890
  active: true
  scope: document
  rule: "Code comments must be written in English."
  feedback: "The code comments should be in English, not Chinese."
  createdAt: "2023-10-27T10:00:00.000Z"
  paths:
    - "src/utils/"
```

**规则字段**

| 字段          | 描述                                                                                               |
|---------------|------------------------------------------------------------------------------------------------------------|
| `id`          | 偏好的唯一标识符，以 `pref_` 为前缀。                                                                        |
| `active`      | 布尔值 (`true` 或 `false`)，表示该规则当前是否已启用。                                                       |
| `scope`       | 规则适用的上下文 (`global`、`structure`、`document` 或 `translation`)。                                   |
| `rule`        | 从反馈中提炼出的简洁、机器可读的指令。                                                                       |
| `feedback`    | 用户提供的原始反馈。                                                                                       |
| `createdAt`   | ISO 8601 格式的时间戳，表示规则的创建时间。                                                                |
| `paths`       | (可选) 一个文件或目录路径数组，此规则仅限于这些路径。                                                      |

## 通过 CLI 管理偏好

`aigne doc prefs` 命令是您与已保存的偏好进行交互的主要工具。它允许您列出、激活、停用和移除规则。

### 列出所有偏好

要查看所有已保存偏好的格式化列表，请运行：

```bash
aigne doc prefs --list
```

输出内容清晰地总结了每条规则，让您能够轻松查看哪些规则处于活动状态以及每条规则的作用。

**示例输出：**

```
# 用户偏好

**格式说明：**
- 🟢 = 活动偏好，⚪ = 非活动偏好
- [scope] = 偏好作用域 (global, structure, document, translation)
- ID = 偏好唯一标识符
- Paths = 特定文件路径 (如适用)

🟢 [document] pref_a1b2c3d4e5f67890 | Paths: src/utils/
   代码注释必须用英文编写。

⚪ [structure] pref_b2c3d4e5f67890a1
   在概述和教程文档的末尾，添加一个“后续步骤”部分...
```

### 激活或停用偏好

您可以临时停用某条规则，而不必永久删除它。这在测试或暂时不需要某条规则时非常有用。使用 `--toggle` 标志来切换规则的 `active` 状态。

要通过提供 ID 来切换特定规则的状态：

```bash
aigne doc prefs --toggle --id pref_a1b2c3d4e5f67890
```

如果您在不带 `--id` 标志的情况下运行该命令，将会出现一个交互式菜单，让您能够一次选择多个偏好来切换其状态。

```bash
aigne doc prefs --toggle
```

### 永久移除偏好

要永久删除一条或多条偏好，请使用 `--remove` 标志。**此操作无法撤销。**

要通过其 ID 移除特定规则：

```bash
aigne doc prefs --remove --id pref_a1b2c3d4e5f67890
```

如需通过交互式选择菜单来选择要删除的规则，请在不指定 ID 的情况下运行该命令：

```bash
aigne doc prefs --remove
```

通过管理偏好，您可以逐步优化 DocSmith 的行为，确保您的文档始终符合您不断变化的标准。有关更多自定义选项，请参阅主[配置指南](./configuration.md)。