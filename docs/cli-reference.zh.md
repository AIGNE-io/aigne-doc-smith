---
labels: ["Reference"]
---

# CLI 命令参考

本指南为所有可用的 `aigne doc` 子命令及其参数和选项提供了全面的参考。它专为希望全面了解该命令行界面功能的用户而设计。

通用语法如下：

```bash
aigne doc <command> [options]
```

### 命令工作流

下图展示了使用 DocSmith 的 CLI 命令创建和维护文档的典型生命周期：

```d2
direction: down

Start: {
  label: "项目设置"
  shape: circle
}

init: {
  label: "aigne doc init\n（交互式设置）"
  shape: step
}

generate: {
  label: "aigne doc generate\n（创建/更新所有文档）"
  shape: step
}

refinement-cycle: {
  label: "优化周期"
  shape: package
  grid-columns: 2

  update: {
    label: "aigne doc update\n（优化单个文档）"
  }
  translate: {
    label: "aigne doc translate\n（本地化内容）"
  }
}

publish: {
  label: "aigne doc publish\n（部署文档）"
  shape: step
}

End: {
  label: "文档上线"
  shape: circle
  style.fill: "#a2eeaf"
}

prefs: {
  label: "aigne doc prefs\n（管理已学习的规则）"
  shape: stored_data
}

Start -> init: "可选" {
  style.stroke-dash: 4
}
init -> generate: "配置"
Start -> generate: "直接"
generate -> refinement-cycle: "优化"
refinement-cycle -> publish: "就绪"
generate -> publish: "直接部署"
publish -> End

prefs <-> generate: "影响" {
  style.stroke-dash: 2
}
prefs <-> refinement-cycle: "影响" {
  style.stroke-dash: 2
}
```

---

## `aigne doc generate`

**别名：** `gen`, `g`

自动分析您的源代码，并根据您的配置生成一套完整的文档。如果未找到配置，它将自动启动交互式设置向导。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--feedback` | string | 提供反馈以调整和优化整体文档结构规划。 |
| `--forceRegenerate` | boolean | 丢弃现有内容并从头开始重新生成所有文档。 |
| `--model` | string | 指定用于生成的特定 LLM（例如，`openai:gpt-4o`）。这将覆盖默认模型。 |
| `--glossary` | string | 用于确保术语一致的术语表文件路径。使用 `@path/to/glossary.md` 格式。 |

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

优化并重新生成特定文档。您可以以交互方式运行它来选择文档，或直接通过选项指定文档。这对于根据反馈进行有针对性的改进非常有用，而无需重新生成整个项目。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--docs` | array | 要重新生成的文档路径列表（例如，`--docs overview.md`）。可多次使用。 |
| `--feedback` | string | 提供具体反馈以改进所选文档的内容。 |
| `--glossary` | string | 用于确保术语一致的术语表文件路径。使用 `@path/to/glossary.md` 格式。 |
| `--reset` | boolean | 忽略之前的结果，为所选文档从头开始重新生成内容。 |

### 使用示例

**启动交互式会话以选择要更新的文档：**
```bash
aigne doc update
```

**使用针对性反馈更新特定文档：**
```bash
aigne doc update --docs /cli-reference.md --feedback "阐明 --docs 和 --langs 选项之间的区别。"
```

---

## `aigne doc translate`

将现有文档翻译成一种或多种语言。可以以交互方式运行它来选择文档和语言，也可以通过指定参数以非交互方式运行。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--docs` | array | 要翻译的文档路径列表。可多次使用。 |
| `--langs` | array | 目标语言代码列表（例如，`zh`、`ja`、`es`）。可多次使用。 |
| `--feedback` | string | 提供反馈以提高翻译质量。 |
| `--glossary` | string | 用于确保跨语言术语一致的术语表文件路径。使用 `@path/to/glossary.md`。 |

### 使用示例

**启动交互式翻译会话：**
```bash
aigne doc translate
```

**将特定文档翻译成中文和日文：**
```bash
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja
```

**使用术语表和反馈进行翻译以获得更好的质量：**
```bash
aigne doc translate --glossary @glossary.md --feedback "日语翻译请使用正式语言。"
```

---

## `aigne doc publish`

**别名：** `pub`, `p`

将您生成的文档发布到 Discuss Kit 平台。您可以发布到官方的 AIGNE DocSmith 平台，也可以发布到您自己托管的实例。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--appUrl` | string | 您自行托管的 Discuss Kit 实例的 URL。如果未提供，该命令将以交互方式运行。 |

### 使用示例

**启动交互式发布会话：**
```bash
aigne doc publish
```

**直接发布到自行托管的实例：**
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

管理 DocSmith 随时间从您的反馈中学习到的用户偏好。这些偏好将作为规则应用于未来的生成和更新任务，以保持与您的风格一致。

### 选项

| 选项 | 类型 | 描述 |
|---|---|---|
| `--list` | boolean | 列出所有已保存的偏好，显示其状态（激活/未激活）、范围和内容。 |
| `--remove` | boolean | 移除一个或多个偏好。如果未提供 `--id`，则以交互方式运行。 |
| `--toggle` | boolean | 切换一个或多个偏好的激活状态。如果未提供 `--id`，则以交互方式运行。 |
| `--id` | array | 为 `--remove` 或 `--toggle` 指定要操作的偏好 ID。可多次使用。 |

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

有关如何根据您的需求定制 DocSmith 的更多详细信息，请参阅[配置指南](./configuration.md)。
