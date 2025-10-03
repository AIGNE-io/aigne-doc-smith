# CLI 命令参考

本指南为所有可用的 `aigne doc` 子命令及其参数和选项提供了全面的参考。它旨在帮助用户充分利用命令行界面的全部功能。

通用语法如下：

```bash command
aigne doc <command> [options]
```

### 命令工作流

下图展示了使用 DocSmith 的 CLI 命令创建和维护文档的典型生命周期，以及它们与之交互的数据。

```d2
direction: down

# 产物
Source-Code: {
  label: "源代码"
  shape: cylinder
}
Configuration: {
  label: "配置\n(.aigne/doc-smith/config.yml)"
  shape: cylinder
}
Generated-Docs: {
  label: "生成的文档"
  shape: cylinder
}
Published-Docs: {
  label: "发布的站点"
  shape: cylinder
}

# --- 核心工作流 ---
Lifecycle: {
  label: "文档生命周期"
  
  init: {
    label: "1. 初始化\n`aigne doc init`"
    shape: rectangle
  }

  generate: {
    label: "2. 生成\n`aigne doc generate`"
    shape: rectangle
  }

  Refinement: {
    label: "3. 优化 (迭代)"
    grid-columns: 2

    update: {
      label: "更新\n`aigne doc update`"
      shape: rectangle
    }
    translate: {
      label: "翻译\n`aigne doc translate`"
      shape: rectangle
    }
  }

  publish: {
    label: "4. 发布\n`aigne doc publish`"
    shape: rectangle
  }
}

# --- 工具命令 ---
Utilities: {
  label: "工具命令"
  grid-columns: 2
  
  prefs: {
    label: "查看配置\n`aigne doc prefs`"
    shape: rectangle
  }
  clear: {
    label: "清除数据\n`aigne doc clear`"
    shape: rectangle
  }
}


# --- 连接 ---

# 设置与生成
Lifecycle.init -> Configuration: "创建"
Source-Code -> Lifecycle.generate: "读取"
Configuration -> Lifecycle.generate: "读取"
Lifecycle.generate -> Generated-Docs: "创建 / 覆盖"
Lifecycle.generate -> Lifecycle.init: {
  label: "若无配置则运行"
  style.stroke-dash: 4
}

# 优化循环
Generated-Docs <-> Lifecycle.Refinement: "读取和写入"

# 发布
Lifecycle.Refinement -> Lifecycle.publish
Lifecycle.publish -> Published-Docs: "上传至"

# 工具连接
Utilities.prefs -> Configuration: "读取"
Utilities.clear -> Configuration: "删除"
Utilities.clear -> Generated-Docs: "删除"
```

---

## `aigne doc init`

手动启动交互式配置向导。这对于设置新项目或修改现有项目的配置非常有用。该向导将引导您定义源代码路径、设置输出目录、选择语言，以及定义文档的风格和目标受众。

### 使用示例

**启动设置向导：**

```bash
aigne doc init
```

有关如何根据您的需求定制 DocSmith 的更多详细信息，请参阅[配置指南](./configuration.md)。

---

## `aigne doc generate`

分析您的源代码，并根据您的配置生成一整套文档。如果未找到配置，它会自动启动交互式设置向导 (`aigne doc init`)。

### 选项

| Option              | Type    | Description                                                                                                   |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `--forceRegenerate` | boolean | 丢弃现有内容并从头开始重新生成所有文档。                                                                        |
| `--feedback`        | string  | 提供反馈以调整和优化整体文档结构。                                                                              |
| `--model`           | string  | 指定用于生成的特定大语言模型（例如 `anthropic:claude-3-5-sonnet`）。此设置将覆盖默认模型。                      |

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
aigne doc generate --feedback "为 API 示例添加一个新章节，并移除‘关于’页面。"
```

**使用特定模型生成：**

```bash
aigne doc generate --model openai:gpt-4o
```

---

## `aigne doc update`

优化并重新生成特定文档。您可以以交互方式运行它来选择文档，或直接使用选项指定它们。这对于在不重新生成整个项目的情况下，根据反馈进行有针对性的改进非常有用。

### 选项

| Option     | Type  | Description                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------------- |
| `--docs`     | array | 要重新生成的文档路径列表。可以多次指定。                                                      |
| `--feedback` | string | 提供具体反馈以改进所选文档的内容。                                                          |

### 使用示例

**启动交互式会话以选择要更新的文档：**

```bash
aigne doc update
```

**使用有针对性的反馈更新特定文档：**

```bash
aigne doc update --docs /overview.md --feedback "添加更详细的常见问题解答条目"
```

---

## `aigne doc translate`

将现有文档翻译成一种或多种语言。可以以交互方式运行它来选择文档和语言，也可以通过将它们指定为参数以非交互方式运行。

### 选项

| Option       | Type  | Description                                                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| `--docs`       | array | 要翻译的文档路径列表。可以多次指定。                                                                         |
| `--langs`      | array | 目标语言代码列表（例如 `zh-CN`、`ja`）。可以多次指定。                                                         |
| `--feedback`   | string | 提供反馈以提高翻译质量。                                                                                   |
| `--glossary`   | string | 词汇表文件路径，以确保跨语言术语的一致性。使用 `@path/to/glossary.md`。                                  |

### 使用示例

**启动交互式翻译会话：**

```bash
aigne doc translate
```

**将特定文档翻译成中文和日文：**

```bash
aigne doc translate --langs zh-CN --langs ja --docs /features/generate-documentation.md --docs /overview.md
```

**使用词汇表和反馈进行翻译以提高质量：**

```bash
aigne doc translate --glossary @glossary.md --feedback "确保技术术语使用一致"
```

---

## `aigne doc publish`

发布您的文档并生成一个可分享的链接。此命令会将您的内容上传到 Discuss Kit 实例。您可以使用官方的 AIGNE DocSmith 平台，或运行您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 实例。

### 选项

| Option     | Type   | Description                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `--appUrl` | string | 您自托管的 Discuss Kit 实例的 URL。如果未提供，该命令将以交互方式运行。                                  |

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

## `aigne doc prefs`

管理用户偏好设置和反馈驱动的规则。随着时间的推移，DocSmith 会从您的反馈中学习并创建持久化的偏好设置。此命令允许您查看、切换或移除这些习得的规则。

### 选项

| Option | Type | Description |
| --- | --- | --- |
| `--list` | boolean | 列出所有已保存的偏好设置。 |
| `--remove` | boolean | 以交互方式提示选择并移除一个或多个偏好设置。 |
| `--toggle` | boolean | 以交互方式提示选择并切换偏好设置的激活状态。 |
| `--id` | string | 指定一个偏好设置 ID 以直接移除或切换。 |

### 使用示例

**列出所有已保存的偏好设置：**

```bash
aigne doc prefs --list
```

**启动交互式移除模式：**

```bash
aigne doc prefs --remove
```

**通过 ID 切换特定的偏好设置：**

```bash
aigne doc prefs --toggle --id "pref_12345"
```

---

## `aigne doc clear`

启动一个交互式会话以清除本地存储的数据。这可以用于移除生成的文档、文档结构配置或缓存的身份验证令牌。

### 使用示例

**启动交互式清理过程：**

```bash
aigne doc clear
```