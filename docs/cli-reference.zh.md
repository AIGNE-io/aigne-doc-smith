# CLI 命令参考

本指南为所有可用的 `aigne doc` 子命令、其参数和选项提供了参考。它旨在帮助用户充分利用命令行界面。

通用语法是：

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
  label: "aigne doc init\n(交互式设置)"
  shape: rectangle
}

generate: {
  label: "aigne doc generate\n(创建/更新所有文档)"
  shape: rectangle
}

refinement-cycle: {
  label: "优化周期"
  shape: rectangle
  grid-columns: 2

  update: {
    label: "aigne doc update\n(优化单个文档)"
  }
  translate: {
    label: "aigne doc translate\n(本地化内容)"
  }
}

publish: {
  label: "aigne doc publish\n(部署文档)"
  shape: rectangle
}

End: {
  label: "文档上线"
  shape: circle
  style.fill: "#a2eeaf"
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
```

---

## `aigne doc generate`

分析您的源代码，并根据您的配置生成一套完整的文档。如果找不到配置，它会自动启动交互式设置向导。

### 选项

| 选项              | 类型    | 描述                                                                                                   |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `--feedback`        | string  | 提供反馈以调整和优化整体文档结构。                                   |
| `--forceRegenerate` | boolean | 丢弃现有内容并从头开始重新生成所有文档。                                     |
| `--model`           | string  | 指定用于生成的特定大语言模型（例如，`openai:gpt-4o`）。此选项将覆盖默认设置。 |

### 使用示例

**生成或更新文档：**

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

优化并重新生成特定文档。您可以以交互方式运行它来选择文档，或使用选项直接指定文档。这对于根据反馈进行有针对性的改进非常有用，而无需重新生成整个项目。

### 选项

| 选项     | 类型  | 描述                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------------- |
| `--docs`     | array | 要重新生成的文档路径列表。可多次使用。                         |
| `--feedback` | string | 提供具体反馈以改进所选文档的内容。              |

### 使用示例

**启动交互式会话以选择要更新的文档：**

```bash
aigne doc update
```

**使用有针对性的反馈更新特定文档：**

```bash
aigne doc update --docs overview.md --feedback "添加更详细的常见问题解答条目"
```

---

## `aigne doc translate`

将现有文档翻译成一种或多种语言。可以以交互方式运行以选择文档和语言，也可以通过将它们指定为参数以非交互方式运行。

### 选项

| 选项       | 类型  | 描述                                                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| `--docs`       | array | 要翻译的文档路径列表。可多次使用。                                         |
| `--langs`      | array | 目标语言代码列表（例如 `zh`、`ja`）。可多次使用。                            |
| `--feedback`   | string | 提供反馈以提高翻译质量。                                               |
| `--glossary`   | string | 术语表文件的路径，以确保跨语言术语的一致性。使用 `@path/to/glossary.md`。 |

### 使用示例

**启动交互式翻译会话：**

```bash
aigne doc translate
```

**将特定文档翻译成中文和日文：**

```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

**使用术语表和反馈进行翻译以获得更好的质量：**

```bash
aigne doc translate --glossary @glossary.md --feedback "始终如一地使用技术术语"
```

---

## `aigne doc publish`

将您生成的文档发布到 Discuss Kit 平台。您可以发布到官方的 AIGNE DocSmith 平台，也可以发布到您自己托管的实例。

### 选项

| 选项     | 类型   | 描述                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `--appUrl` | string | 您自托管的 Discuss Kit 实例的 URL。如果未提供，该命令将以交互方式运行。 |

### 使用示例

**启动交互式发布会话：**

```bash
aigne doc publish
```

**直接发布到自托管实例：**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc init`

手动启动交互式配置向导。这对于设置新项目或修改现有项目的配置非常有用。该向导会引导您定义源代码路径、设置输出目录、选择语言以及定义文档的风格和目标受众。

### 使用示例

**启动设置向导：**

```bash
aigne doc init
```

有关如何根据您的需求定制 DocSmith 的更多详细信息，请参阅[配置指南](./configuration.md)。