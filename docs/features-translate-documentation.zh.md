# 翻译文档

AIGNE DocSmith 可以将您的文档翻译成 12 种不同的语言，使您的项目能够覆盖全球受众。该工具提供两种管理翻译的方式：用于引导式设置的交互模式和用于精确控制和自动化的命令行参数。

## 交互式翻译

如需引导式体验，请运行不带任何参数的 `translate` 命令。这对于喜欢逐步操作的用户来说是理想的选择。

```bash
aigne doc translate
```

此命令会启动一个交互式向导，引导您完成整个过程：

1.  **选择要翻译的文档：** 您将看到一个现有文档的列表。使用空格键选择您想要翻译的文档。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择目标语言：** 选择文档后，从支持的选项列表中选择一种或多种目标语言。

    ![选择要翻译成的语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

3.  **确认并运行：** DocSmith 随后将处理翻译，为每个选定的语言生成所选文件的新版本。

## 命令行翻译

对于脚本或 CI/CD 管道中的自动化，请使用命令行标志来控制翻译过程。此方法适合开发人员和高级用户。

### 命令参数

<x-field data-name="--langs" data-type="string" data-required="false" data-desc="指定一个目标语言。此标志可以多次使用以包含多种语言（例如，--langs zh --langs ja）。"></x-field>
<x-field data-name="--docs" data-type="string" data-required="false" data-desc="指定要翻译的文档的路径。此标志也可以多次使用以进行批量翻译。"></x-field>
<x-field data-name="--feedback" data-type="string" data-required="false" data-desc="向 AI 提供建议以指导翻译质量（例如，--feedback &quot;使用正式语气&quot;）。"></x-field>
<x-field data-name="--glossary" data-type="string" data-required="false" data-desc="使用 Markdown 格式的术语表文件，以确保特定术语的一致性（例如，--glossary @path/to/glossary.md）。"></x-field>

### 示例

#### 翻译特定文档

要将 `overview.md` 和 `examples.md` 翻译成中文和日文，请运行：

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

#### 使用术语表和反馈

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
  关于如何将您的文档发布到公共平台或您自己的私人网站的指南。
</x-card>