---
labels: ["Reference"]
---

# 翻译文档

AIGNE DocSmith 打破语言壁垒，支持将你的文档自动翻译成超过 12 种语言。这一强大功能可帮助你轻松触达全球受众，确保世界各地的用户和开发者都能访问你的内容。

## 使用交互式向导进行翻译

翻译文档最简单的方式是使用交互模式。只需运行不带任何参数的命令：

```bash Command icon=lucide:terminal
aigne doc translate
```

这将启动一个分步向导，引导你完成整个过程：

1.  **选择文档：** 系统将列出你现有的文档以供选择。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择语言：** 接下来，从支持的选项列表中选择一个或多个目标语言。

    ![选择翻译语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

DocSmith 随后将处理翻译，并将新的特定语言文件保存在你的输出目录中。

## 通过命令行翻译

为实现更精细的控制或在自动化脚本中使用，你可以直接通过命令行参数指定文档和语言。

### 命令参数

| 参数 | 描述 |
|---|---|
| `--langs` | 指定目标语言。你可以多次使用此标志以指定多种语言（例如，`--langs zh --langs ja`）。 |
| `--docs` | 指定要翻译的文档路径。可多次使用此标志以指定多个文档。 |
| `--feedback` | 向 AI 提供具体指令或反馈，以提高翻译质量。 |
| `--glossary` | 使用术语表文件以确保术语一致性。路径前应加上 `@` 前缀（例如，`--glossary @/path/to/glossary.md`）。 |

### 示例

**将指定文档翻译成多种语言：**

```bash Command icon=lucide:terminal
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

**使用自定义术语表和反馈进行翻译：**

当你需要确保特定技术术语翻译一致并希望引导 AI 的语调时，此功能非常有用。

```bash Command icon=lucide:terminal
aigne doc translate --glossary @glossary.md --feedback "始终使用正式和技术性的术语" --docs overview.md --langs de
```

## 支持的语言

DocSmith 支持以下语言的自动翻译：

| 语言 | 代码 |
|---|---|
| 英语 | `en` |
| 简体中文 | `zh-CN` |
| 繁体中文 | `zh-TW` |
| 日语 | `ja` |
| 韩语 | `ko` |
| 西班牙语 | `es` |
| 法语 | `fr` |
| 德语 | `de` |
| 葡萄牙语 | `pt-BR` |
| 俄语 | `ru` |
| 意大利语 | `it` |
| 阿拉伯语 | `ar` |

---

既然你已经学会了如何让文档支持多语言，下一步就是将其与世界分享。请在 [发布你的文档](./features-publish-your-docs.md) 指南中了解具体方法。