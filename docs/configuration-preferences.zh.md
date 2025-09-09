---
labels: ["Reference"]
---

# 管理偏好

DocSmith 旨在从您的反馈中学习。您无需重复相同的指令，该工具可以创建称为“偏好”的持久性规则，以确保未来的文档始终遵循您的风格和要求。本节将说明如何创建这些偏好，以及如何使用命令行界面 (CLI) 对其进行管理。

## DocSmith 如何从反馈中学习

当您在优化过程中（例如，使用 `aigne doc refine`）提供反馈时，一个名为“Feedback Refiner”的 AI Agent 会分析您的输入。它会判断您的反馈是一次性修复还是应保存以供将来使用的可复用策略。如果它是可复用策略，则会将其转换为清晰、可执行的规则。

此过程涉及几个关键决策：

1.  **保存或丢弃**：Agent 首先判断反馈是代表一项持久性策略（例如，“始终使用正式语言”）还是临时性修正（例如，“修复这个特定的拼写错误”）。只有可复用的策略才会被保存。
2.  **确定范围**：然后，它会为规则分配一个范围，该范围决定了规则的应用时机：
    *   `global`: 适用于生成和优化的所有阶段。
    *   `structure`: 仅在规划文档结构时适用。
    *   `document`: 在编写或优化文档主要内容时适用。
    *   `translation`: 专门适用于翻译过程。
3.  **路径限制**：如果您的反馈明确针对某个特定文件或一组文件，则该规则可以被限制为仅应用于这些路径。

## 使用 CLI 管理偏好

您可以通过 `aigne doc prefs` 命令完全控制已保存的偏好。这使您可以根据需要列出、激活、停用和删除规则。

### 列出所有偏好

要查看 DocSmith 已学习的所有规则，请运行 `--list` 命令。

```bash aigne doc prefs --list icon=lucide:list
$ aigne doc prefs --list

# 用户偏好

**格式说明：**
- 🟢 = 激活的偏好，⚪ = 未激活的偏好
- [scope] = 偏好范围 (global, structure, document, translation)
- ID = 偏好唯一标识符
- Paths = 特定文件路径（如适用）

🟢 [document] pref_a1b2c3d4e5f6a7b8 | Paths: docs/api/v1.md
   代码示例中包含 'spaceDid' 的端点字符串不应使用省略号进行缩写。

🟢 [structure] pref_f9e8d7c6b5a4b3c2
   在概览和教程文档末尾添加“后续步骤”部分，并附带 2-3 个内部链接。

⚪ [translation] pref_1a2b3c4d5e6f7a8b
   在翻译过程中保持代码和标识符不变；它们不得被翻译。
```

输出显示了每条规则的状态（激活或未激活）、范围、唯一 ID、任何关联的路径以及规则内容。

### 切换规则状态（激活/未激活）

如果您想临时禁用某条规则而不删除它，可以切换其状态。运行带有 `--toggle` 标志的 `prefs` 命令。您可以提供特定的规则 ID，也可以在不带 ID 的情况下运行以进入交互模式，在该模式下您可以从列表中选择要切换的规则。

**按 ID 切换：**

```bash aigne doc prefs --toggle --id icon=lucide:toggle-right
$ aigne doc prefs --toggle --id pref_1a2b3c4d5e6f7a8b

成功切换了 1 个偏好。
```

**交互模式：**

```bash aigne doc prefs --toggle icon=lucide:mouse-pointer-click
$ aigne doc prefs --toggle

# 系统将为您呈现所有偏好的清单供您选择。
```

### 移除偏好

要永久删除某条规则，请使用 `--remove` 标志。与切换状态类似，您可以直接指定 ID 或使用交互式选择模式。

**按 ID 移除：**

```bash aigne doc prefs --remove --id icon=lucide:trash-2
$ aigne doc prefs --remove --id pref_1a2b3c4d5e6f7a8b

成功移除了 1 个偏好。
```

**交互模式：**

```bash aigne doc prefs --remove icon=lucide:mouse-pointer-click
$ aigne doc prefs --remove

# 系统将为您呈现所有偏好的清单供您选择移除。
```

## 直接文件访问

对于高级用户，所有偏好都存储在项目根目录下 `.aigne/doc-smith/preferences.yml` 位置的一个人类可读的 YAML 文件中。虽然您可以直接编辑此文件，但我们建议使用 CLI 命令以避免格式错误。

---

通过管理偏好，您可以随着时间的推移微调 DocSmith 的行为，使其成为您文档工作流中越来越智能的伙伴。要进一步自定义生成过程，您可能需要探索 [LLM 设置](./configuration-llm-setup.md)。