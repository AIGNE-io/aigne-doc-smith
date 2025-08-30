---
labels: ["Reference"]
---

# CLI 命令参考

本指南为所有可用的 `aigne doc` 子命令及其参数和选项提供了全面的参考。它专为希望了解命令行界面全部功能的用户设计。

通用语法如下：

```bash
aigne doc <command> [options]
```

---

## `aigne doc generate`

**别名：** `gen`, `g`

自动分析您的源代码，并根据您的配置生成一整套文档。如果未找到配置，它将自动启动交互式设置向导。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--feedback` | string | 提供反馈以调整和优化整体文档结构规划。 |
| `--forceRegenerate` | boolean | 丢弃现有内容并从头开始重新生成所有文档。 |
| `--model` | string | 指定用于生成的特定 LLM（例如，`openai:gpt-4o`、`claude:claude-3-5-sonnet`）。这将覆盖默认模型。 |
| `--glossary` | string | 用于保持术语一致性的术语表文件路径。使用 `@path/to/glossary.md` 格式。 |

### 使用示例

**首次生成或更新文档：**
```bash
aigne doc generate
```

**强制完全重新生成所有文档：**
```bash
aigne doc generate --forceRegenerate
```

**通过反馈优化文档结构：**
```bash
aigne doc generate --feedback "为 API 示例添加一个新部分，并删除‘关于’页面。"
```

**使用 AIGNE Hub 中的特定模型进行生成：**
```bash
aigne doc generate --model google:gemini-1.5-flash
```

---

## `aigne doc update`

**别名：** `up`

优化并重新生成特定文档。您可以以交互方式运行它来选择文档，或直接使用选项指定文档。这对于根据反馈进行有针对性的改进非常有用，而无需重新生成整个项目。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--docs` | array | 要重新生成的文档路径列表（例如，`--docs overview.md --docs /features/authentication.md`）。 |
| `--feedback` | string | 提供具体反馈以改进所选文档的内容。 |
| `--glossary` | string | 用于保持术语一致性的术语表文件路径。使用 `@path/to/glossary.md` 格式。 |

### 使用示例

**启动交互式会话以选择要更新的文档：**
```bash
aigne doc update
```

**使用有针对性的反馈更新特定文档：**
```bash
aigne doc update --docs /cli-reference.md --feedback "阐明 --docs 和 --langs 选项之间的区别。"
```

---

## `aigne doc translate`

将现有文档翻译成一种或多种语言。可以以交互方式运行以选择文档和语言，也可以通过将它们指定为参数以非交互方式运行。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--docs` | array | 要翻译的文档路径列表。如果在交互模式下省略，您可以进行选择。 |
| `--langs` | array | 目标语言代码列表（例如，`zh`、`ja`、`es`）。如果省略，您可以以交互方式选择它们。 |
| `--feedback` | string | 提供反馈以提高翻译质量。 |
| `--glossary` | string | 用于确保跨语言术语一致性的术语表文件路径。使用 `@path/to/glossary.md`。 |

### 使用示例

**启动交互式翻译会话：**
```bash
aigne doc translate
```

**将特定文档翻译成中文和日文：**
```bash
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja
```

**结合使用术语表和反馈以获得更高质量的翻译：**
```bash
aigne doc translate --glossary @glossary.md --feedback "日语翻译请使用正式语言。"
```

---

## `aigne doc publish`

**别名：** `pub`, `p`

将您生成的文档发布到 Discuss Kit 平台。您可以发布到官方的 AIGNE DocSmith 平台，也可以发布到您自己自托管的实例。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--appUrl` | string | 您自托管的 Discuss Kit 实例的 URL。如果未提供，该命令将以交互方式运行，允许您在官方平台和自定义 URL 之间进行选择。 |

### 使用示例

**启动交互式发布会话：**
```bash
aigne doc publish
```

**直接发布到自托管实例：**
```bash
aigne doc publish --appUrl https://docs.my-company.com
```

---

## `aigne doc init`

手动启动交互式配置向导。这对于设置新项目或修改现有项目的配置非常有用。该向导会引导您定义源代码路径、设置输出目录、选择语言以及定义文档的风格和目标受众。

### 使用示例

**启动设置向导：**
```bash
aigne doc init
```

---

## `aigne doc prefs`

管理 DocSmith 随着时间的推移从您的反馈中学习到的用户偏好。这些偏好将在未来的生成和更新任务中作为规则应用，以保持与您的风格一致。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--list` | boolean | 列出所有已保存的偏好，显示其状态（激活/未激活）、范围和内容。 |
| `--remove` | boolean | 移除一个或多个偏好。如果未提供 `--id`，则以交互方式运行。 |
| `--toggle` | boolean | 切换一个或多个偏好的激活状态。如果未提供 `--id`，则以交互方式运行。 |
| `--id` | array | 指定要执行 `--remove` 或 `--toggle` 操作的偏好 ID。 |

### 使用示例

**列出所有已保存的偏好：**
```bash
aigne doc prefs --list
```

**以交互方式选择要移除的偏好：**
```bash
aigne doc prefs --remove
```

**通过 ID 切换特定偏好的状态：**
```bash
aigne doc prefs --toggle --id <preference-id>
```

有关如何根据您的需求定制 DocSmith 的更多详细信息，请参阅 [配置指南](./configuration.md)。