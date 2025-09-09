---
labels: ["Reference"]
---

# CLI 命令参考

AIGNE DocSmith 通过 `aigne doc` 命令行界面 (CLI) 进行操作。本参考提供了所有可用命令、其选项和用法示例的全面概述。从初始设置到最终发布的所有文档任务都通过这些命令进行管理。

有关安装说明，请参阅[快速入门](./getting-started.md)指南。

## 命令概述

以下是 DocSmith 中主要命令的快速摘要：

| 命令 | 别名 | 描述 |
| --- | --- | --- |
| `generate` | `gen`, `g` | 从源代码生成一套完整的文档。 |
| `update` | `up` | 根据反馈优化并重新生成单个文档。 |
| `translate` | | 将现有文档翻译成一种或多种语言。 |
| `publish` | `pub`, `p` | 将您的文档发布到 Discuss Kit 平台。 |
| `init` | | 启动一个交互式向导来配置您的文档项目。 |
| `prefs` | | 管理从您的反馈中随时间学习到的用户偏好。 |
| `chat` | | 启动一个交互式聊天助手，以获得引导式的文档编写体验。 |

---

## `generate`

自动分析您的代码库，规划文档结构，并为整个项目生成高质量的内容。

这是从头创建文档或在源代码发生重大更改后重新生成文档的主要命令。

### 用法

```bash Basic Usage
aigne doc generate
```

### 选项

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| `--forceRegenerate` | boolean | 删除所有现有文档并从头开始重新生成所有内容。 |
| `--feedback` | string | 提供反馈以优化整体文档结构规划（例如，“添加一个关于 API 身份验证的部分”）。 |
| `--model` | string | 指定用于生成的语言大模型（例如，`openai:gpt-4o`、`google:gemini-1.5-flash`）。 |
| `--glossary` | string | 指向术语表文件（`@path/to/glossary.md`）的路径，以确保术语一致性。 |

### 示例

**强制完全重新生成**

```bash icon=lucide:refresh-cw
aigne doc generate --forceRegenerate
```

**通过反馈优化结构**

```bash icon=lucide:edit
aigne doc generate --feedback "Remove the 'About' section and add a detailed API Reference."
```

**使用特定模型生成**

```bash icon=lucide:bot
aigne doc generate --model claude:claude-3-5-sonnet
```

---

## `update`

优化并重新生成特定文档。这对于根据反馈进行有针对性的改进或在代码发生微小更改后更新单个页面非常有用。

不带任何选项运行此命令将启动交互模式，允许您选择要更新的文档。

### 用法

```bash Basic Usage
aigne doc update
```

### 选项

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| `--docs` | array | 要更新的一个或多个文档的路径（例如，`--docs overview.md`）。可多次使用。 |
| `--feedback` | string | 用于改进所选文档内容的具体反馈。 |
| `--reset` | boolean | 忽略之前的结果，从头开始重新生成文档内容。 |
| `--glossary` | string | 指向术语表文件（`@path/to/glossary.md`）的路径，以确保术语一致性。 |

### 示例

**启动交互式更新模式**

```bash icon=lucide:mouse-pointer-click
aigne doc update
```

**使用反馈更新特定文档**

```bash icon=lucide:file-edit
aigne doc update --docs /features/generate-documentation.md --feedback "Add more details about the --forceRegenerate flag."
```

---

## `translate`

将现有文档翻译成 12 种以上受支持语言中的一种或多种。

不带选项运行该命令会启动一个交互式向导，帮助您选择文档和目标语言。

### 用法

```bash Basic Usage
aigne doc translate
```

### 选项

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| `--langs` | array | 指定一个或多个目标语言代码（例如 `zh`、`ja`、`fr`）。可多次使用。 |
| `--docs` | array | 要翻译的一个或多个文档的路径。如果省略，则视为所有文档。 |
| `--feedback` | string | 用于提高翻译质量和风格的反馈。 |
| `--glossary` | string | 指向术语表文件（`@path/to/glossary.md`）的路径，以确保跨语言的术语一致性。 |

### 示例

**启动交互式翻译模式**

```bash icon=lucide:languages
aigne doc translate
```

**将特定文档翻译成中文和日文**

```bash icon=lucide:globe
aigne doc translate --docs overview.md --docs getting-started.md --langs zh --langs ja
```

**使用术语表和反馈改进翻译**

```bash icon=lucide:book-check
aigne doc translate --docs cli-reference.md --langs de --glossary @glossary.md --feedback "Use formal address ('Sie') instead of informal ('du')."
```

---

## `publish`

将您生成的文档发布到 Discuss Kit 平台。这可以是官方公共平台或您自己自托管的实例。

不带选项运行该命令会启动一个交互式向导，以选择发布目的地。

### 用法

```bash Basic Usage
aigne doc publish
```

### 选项

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| `--appUrl` | string | 您的自托管 Discuss Kit 实例的 URL。 |

### 示例

**发布到官方平台（交互式）**

```bash icon=lucide:rocket
aigne doc publish
```

**发布到自托管实例**

```bash icon=lucide:server
aigne doc publish --appUrl https://docs.my-company.com
```

---

## `init`

启动一个交互式向导，为您的项目创建或更新 `aigne-doc.json` 配置文件。这是设置文档偏好的推荐方式，包括源路径、输出目录、语言和风格。

### 用法

```bash Basic Usage
aigne doc init
```

此命令没有选项，因为它是完全交互式的。

---

## `prefs`

管理 DocSmith 从您的反馈中学习到的用户偏好。这些偏好被存储为规则，应用于未来的生成、更新和翻译任务，以持续提高质量并与您的风格保持一致。

### 用法

```bash Basic Usage
aigne doc prefs --list
```

### 选项

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| `--list` | boolean | 列出所有已保存的偏好，显示其状态（激活/未激活）、范围和内容。 |
| `--remove` | boolean | 以交互方式选择并删除一个或多个偏好。 |
| `--toggle` | boolean | 以交互方式选择并切换一个或多个偏好的激活状态。 |
| `--id` | array | 指定偏好 ID，以直接应用 `--remove` 或 `--toggle` 操作。 |

### 示例

**列出所有已保存的偏好**

```bash icon=lucide:list
aigne doc prefs --list
```

**交互式删除偏好**

```bash icon=lucide:trash-2
aigne doc prefs --remove
```

**通过 ID 切换特定偏好的状态**

```bash icon=lucide:toggle-right
aigne doc prefs --toggle --id "pref_abc123"
```

---

## `chat`

启动一个交互式聊天助手，可以帮助您完成所有文档任务。您可以用对话的方式要求助手生成、更新或翻译文档。

### 用法

```bash Basic Usage
aigne doc chat
```

该命令为使用单个命令和选项提供了一个强大的、引导式的替代方案。