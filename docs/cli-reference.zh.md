---
labels: ["Reference"]
---

# CLI 命令参考

本页面为所有 `aigne doc` 子命令及其参数和选项提供了全面的参考。请使用本指南详细了解如何使用 AIGNE DocSmith 命令行界面。

## `aigne doc generate`

根据项目配置从源代码生成一整套文档。如果未找到配置，将首先自动启动交互式 `init` 向导。

**别名:** `gen`, `g`

**选项**

| 选项 | 类型 | 描述 |
|---|---|---|
| `--forceRegenerate` | `boolean` | 删除现有文档并从头开始重新生成所有内容。 |
| `--feedback` | `string` | 提供反馈以优化整体文档结构规划。 |
| `--model` | `string` | 指定用于生成的 LLM (例如 `openai:gpt-4o`, `google:gemini-2.5-flash`)。 |
| `--glossary` | `string` | 用于确保术语一致的术语表文件路径 (例如 `@glossary.md`)。 |

**使用示例**

```bash
# 使用现有配置生成文档
aigne doc generate

# 强制完全重新生成所有文档
aigne doc generate --forceRegenerate

# 根据具体反馈重新生成结构规划
aigne doc generate --feedback "Add a new section for API examples."

# 使用特定 AI 模型生成文档
aigne doc generate --model claude:claude-3-5-sonnet
```

---

## `aigne doc init`

启动一个交互式向导，为您的项目配置文档生成设置。这包括定义源代码路径、输出目录、目标受众、语言和文档风格。

**选项**

该命令以完全交互模式运行，因此不接受命令行选项。

**使用示例**

```bash
# 启动交互式配置向导
aigne doc init
```

---

## `aigne doc update`

更新特定文档。您可以交互式运行以选择文档并提供反馈，也可以通过命令行选项直接指定文档和反馈。

**别名:** `up`

**选项**

| 选项 | 类型 | 描述 |
|---|---|---|
| `--docs` | `string` | 要更新的特定文档的路径。可多次使用。 |
| `--feedback` | `string` | 提供有针对性的反馈以改进所选文档的内容。 |
| `--glossary` | `string` | 用于确保术语一致的术语表文件路径 (例如 `@glossary.md`)。 |

**使用示例**

```bash
# 启动交互模式以选择要更新的文档
aigne doc update

# 针对特定文档提供反馈并进行更新
aigne doc update --docs overview.md --feedback "Clarify the section on AIGNE Hub integration."
```

---

## `aigne doc translate`

将现有文档翻译成一种或多种语言。可以交互式运行以选择文档和语言，也可以通过提供参数以非交互式方式运行。

**选项**

| 选项 | 类型 | 描述 |
|---|---|---|
| `--langs` | `string` | 要翻译的目标语言 (例如 `zh`, `ja`)。可多次使用。 |
| `--docs` | `string` | 要翻译的特定文档的路径。可多次使用。 |
| `--feedback` | `string` | 提供反馈以提高翻译质量。 |
| `--glossary` | `string` | 用于确保翻译中术语一致的术语表文件路径。 |

**使用示例**

```bash
# 启动交互模式以选择文档和目标语言
aigne doc translate

# 将特定文档翻译成中文和日文
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja

# 使用术语表进行翻译以确保术语一致
aigne doc translate --docs examples.md --langs de --glossary @technical-terms.md
```

---

## `aigne doc publish`

将您生成的文档发布到 Discuss Kit 平台。您可以发布到官方 AIGNE 平台或自托管实例。

**别名:** `pub`, `p`

**选项**

| 选项 | 类型 | 描述 |
|---|---|---|
| `--appUrl` | `string` | 要发布到的自托管 Discuss Kit 实例的 URL。 |

**使用示例**

```bash
# 启动交互模式以选择发布目的地
aigne doc publish

# 直接发布到自托管实例
aigne doc publish --appUrl https://docs.my-company.com
```

---

## `aigne doc prefs`

管理 DocSmith 从您的反馈中学习到的用户偏好。这些偏好将作为规则存储，影响未来的文档生成、更新和翻译。

**选项**

| 选项 | 类型 | 描述 |
|---|---|---|
| `--list` | `boolean` | 列出所有已保存的偏好及其状态 (激活/未激活)、范围和 ID。 |
| `--remove` | `boolean` | 移除一个或多个偏好。需要 `--id` 选项，如果未提供 ID，则以交互方式运行。 |
| `--toggle` | `boolean` | 切换一个或多个偏好的激活状态。需要 `--id` 选项，如果未提供 ID，则以交互方式运行。 |
| `--id` | `string` | 要管理的偏好的唯一 ID。可与 `--remove` 或 `--toggle` 多次使用。 |

**使用示例**

```bash
# 列出所有已保存的偏好
aigne doc prefs --list

# 以交互方式选择要移除的偏好
aigne doc prefs --remove

# 通过 ID 移除特定偏好
aigne doc prefs --remove --id 4a2b8e1f

# 切换多个偏好的激活状态
aigne doc prefs --toggle --id 4a2b8e1f --id 9c7d3f5a
```

本参考提供了所有核心命令的详细信息。有关详细设置，请参阅[配置指南](./configuration.md)。