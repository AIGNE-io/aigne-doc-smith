---
labels: ["Reference"]
---

# 语言支持

AIGNE DocSmith 旨在通过提供强大的 AI 驱动的翻译功能，帮助你的项目触达全球受众。它可以自动将你的文档翻译成十几种语言，确保不同地区的用户能够有效地理解和使用你的工作。

本指南提供了所有支持的语言的完整列表，并解释了如何为你的项目启用和管理翻译。

## 支持的语言

DocSmith 支持多种语言的自动翻译。下表列出了所有当前可用的语言及其对应的语言代码，这些代码用于配置和命令行界面。

| Language | Code |
|---|---|
| 英语 (en) | `en` |
| 简体中文 (zh) | `zh` |
| 繁体中文 (zh-TW) | `zh-TW` |
| 日语 (ja) | `ja` |
| 韩语 (ko) | `ko` |
| 西班牙语 (es) | `es` |
| 法语 (fr) | `fr` |
| 德语 (de) | `de` |
| 葡萄牙语 (pt) | `pt` |
| 俄语 (ru) | `ru` |
| 意大利语 (it) | `it` |
| 阿拉伯语 (ar) | `ar` |

## 如何启用和使用翻译

你可以在初始项目设置期间配置语言，也可以稍后添加。翻译的主要工具是 `aigne doc translate` 命令。

### 在初始设置期间

当你首次在新项目中运行 `aigne doc init` 或 `aigne doc generate` 时，你将进入一个交互式设置向导。该向导会提示你：

1.  为你的文档选择一个**主要语言**。
2.  从支持的语言列表中选择一个或多个**额外语言**用于翻译。

你的选择会保存在项目的配置文件中，以便在未来的翻译任务中使用。

### 使用 `translate` 命令

配置好语言后，你可以使用 `aigne doc translate` 命令来翻译你的文档。

#### 交互模式

要获得用户友好的引导式体验，只需运行不带任何参数的命令即可。这对大多数用户来说是理想的选择。

```bash 交互式翻译 icon=lucide:mouse-pointer-click
aigne doc translate
```

这将启动一个交互式菜单，允许你：
- 选择你想要翻译的现有文档。
- 从你配置的列表中选择目标语言。
- 如果需要，可以向你的项目配置中添加新语言。

#### 命令行模式

对于脚本编写、自动化或更高级的控制，你可以将所有选项指定为参数。这对于开发人员和在 CI/CD 流水线中特别有用。

```bash 翻译指定文档 icon=lucide:terminal
# 将 overview.md 和 examples.md 翻译成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

你还可以提供反馈或术语表来提高翻译的质量和一致性。

```bash 使用术语表进行翻译 icon=lucide:book-check
# 使用术语表文件以确保术语一致
aigne doc translate --glossary @glossary.md --feedback "请一致地使用技术术语"
```

### 关键命令参数

| Parameter | Description |
|---|---|
| `--langs` | 指定一个目标语言代码。你可以多次使用此选项来指定多种语言。 |
| `--docs` | 指定要翻译的文档的路径。你可以多次使用此选项。 |
| `--feedback` | 向 AI 提供反馈以提高翻译质量。 |
| `--glossary` | 提供术语表文件的路径（例如，`@path/to/glossary.md`）以确保术语一致。 |

---

借助 DocSmith 内置的翻译功能，维护多语言文档成为你开发工作流中无缝的一部分。要通过更详细的示例深入了解翻译过程，请参阅 [翻译文档](./features-translate-documentation.md) 指南。