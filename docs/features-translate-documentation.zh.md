# 翻译文档

AIGNE DocSmith 可以将您的文档翻译成 12 种不同的语言，包括英语、中文和西班牙语，让您的项目触达全球受众。该工具提供两种管理翻译的方式：用于引导式设置的交互模式和用于精确控制和自动化的命令行参数。

## 交互式翻译

要获得引导式体验，请在不带任何参数的情况下运行 `translate` 命令。此方法非常适合偏好分步操作的用户。

```bash
aigne doc translate
```

此命令会启动一个交互式向导，引导您完成整个过程：

1.  **选择要翻译的文档：** 您将看到一个现有文档的列表。使用空格键选择您想要翻译的文档。

    ![选择要翻译的文档](../assets/screenshots/doc-translate.png)

2.  **选择目标语言：** 选择文档后，从支持的选项列表中选择一种或多种目标语言。

    ![选择要翻译成的语言](../assets/screenshots/doc-translate-langs.png)

3.  **确认并运行：** DocSmith 随后将处理翻译，为每个选定的语言生成所选文件的新版本。

## 命令行翻译

要在脚本或 CI/CD 管道中实现自动化，请使用命令行标志来控制翻译过程。此方法为开发人员和高级用户提供了更大的灵活性。

### 命令参数

<x-field-group>
  <x-field data-name="--langs" data-type="string" data-required="false" data-desc="指定一个目标语言。此标志可以多次使用以包含多种语言（例如，--langs zh --langs ja）。"></x-field>
  <x-field data-name="--docs" data-type="string" data-required="false" data-desc="指定要翻译的文档路径。此标志也可以多次使用以进行批量翻译。"></x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false" data-desc="向 AI 提供建议以指导翻译质量（例如，--feedback &quot;使用正式语气&quot;）。"></x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false" data-desc="使用 Markdown 格式的术语表文件，以确保特定术语的用词一致（例如，--glossary @path/to/glossary.md）。"></x-field>
  <x-field data-name="--model" data-type="string" data-required="false" data-desc="指定要使用的翻译模型，例如 'openai:gpt-4o' 或 'google:gemini-2.5-pro'。"></x-field>
</x-field-group>

### 示例

#### 翻译特定文档

要将 `overview.md` 和 `examples.md` 翻译成中文和日文，请运行以下命令：

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

#### 使用术语表和反馈

为确保品牌名称和技术术语翻译正确，您可以提供一个术语表文件。您还可以提供反馈以改进翻译风格。

```bash
aigne doc translate --glossary @path/to/glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

#### 指定翻译模型

要使用特定的 AI 模型执行翻译任务，请使用 `--model` 标志。

```bash
aigne doc translate --docs overview.md --langs fr --model openai:gpt-4o
```

## 支持的语言

DocSmith 支持以下 12 种语言的自动翻译：

| 语言 | 代码 |
| -------------------- | ------- |
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

文档翻译完成后，您就可以与全世界分享了。

<x-card data-title="下一步：发布您的文档" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="阅读更多">
  一份关于如何轻松将您的文档发布到公共平台或您自己的私人网站的指南。
</x-card>