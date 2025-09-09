# 翻译文档

AIGNE DocSmith 可将您的文档翻译成 12 种语言，帮助您触达全球用户。此过程可通过简单的交互式向导进行管理，也可通过命令行参数实现自动化，以进行高级控制。

### 翻译工作流

`aigne doc translate` 命令提供两种主要操作模式：用于引导设置的交互模式和用于自动化的命令行模式。

```d2
direction: down

start: {
  label: "运行 'aigne doc translate'"
  shape: rectangle
}

interactive_vs_cli: {
  label: "是否带有\n参数？"
  shape: diamond
}

interactive_path: {
  label: "交互模式"
  shape: rectangle

  select_docs: {
    label: "1. 选择文档"
    shape: rectangle
  }
  select_langs: {
    label: "2. 选择语言"
    shape: rectangle
  }
  select_docs -> select_langs
}

cli_path: {
  label: "CLI 模式"
  shape: rectangle

  flags: {
    label: "提供参数\n--docs, --langs 等"
    shape: rectangle
  }
}

ai_translation: {
  label: "AI 翻译"
  shape: rectangle
}

end: {
  label: "已翻译文档\n已保存"
  shape: rectangle
}

start -> interactive_vs_cli
interactive_vs_cli -> interactive_path: "无参数"
interactive_vs_cli -> cli_path: "有参数"
interactive_path -> ai_translation
cli_path -> ai_translation
ai_translation -> end
```

## 交互式翻译

如需引导式体验，请运行不带任何参数的 `translate` 命令：

```bash
aigne doc translate
```

这将启动一个交互式向导，引导您完成整个过程：

1.  **选择要翻译的文档：** 系统将显示您现有文档的列表。使用空格键选择您想要翻译的文档。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择目标语言：** 选择文档后，从支持的选项列表中选择一种或多种目标语言。

    ![选择要翻译成的语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **确认并运行：** DocSmith 将处理翻译，为每个选定的语言生成所选文件的新版本。

## 命令行翻译

对于自动化或更具体的任务，您可以使用命令行标志来控制翻译过程。此方法适用于集成到 CI/CD 管道中。

以下是可用的主要选项：

| 参数 | 描述 |
|---|---|
| `--langs` | 指定一种或多种目标语言。此标志可多次使用（例如，`--langs zh --langs ja`）。 |
| `--docs` | 指定要翻译的文档路径。此标志也可多次使用。 |
| `--feedback` | 向 AI 提供建议，以提高未来翻译的质量（例如，`--feedback "使用正式语气"`）。 |
| `--glossary` | 使用 Markdown 格式的术语表文件，以确保特定术语的一致性（例如，`--glossary @path/to/glossary.md`）。 |

### 示例：翻译特定文档

要将 `overview.md` 和 `examples.md` 翻译成中文和日文，请运行：

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

### 示例：使用术语表和反馈

为确保品牌名称和技术术语翻译正确，您可以提供一个术语表文件。您还可以提供反馈以优化翻译风格。

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

## 支持的语言

DocSmith 支持以下语言的自动翻译：

| 语言 | 代码 |
|---|---|
| 英语 | en |
| 简体中文 | zh-CN |
| 繁体中文 | zh-TW |
| 日语 | ja |
| 韩语 | ko |
| 西班牙语 | es |
| 法语 | fr |
| 德语 | de |
| 葡萄牙语 | pt-BR |
| 俄语 | ru |
| 意大利语 | it |
| 阿拉伯语 | ar |

---

文档翻译完成后，您就可以与世界分享了。

<x-card data-title="下一步：发布您的文档" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="阅读更多">
  一份关于如何轻松将您的文档发布到公共平台或您自己的私人网站的指南。
</x-card>