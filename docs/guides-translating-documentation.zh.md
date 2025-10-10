# 翻译文档

本指南介绍了如何使用 `aigne doc translate` 命令将您生成的文档翻译成多种语言。该过程使用 AI 来确保翻译能够感知上下文并保持技术准确性。

该工具支持 12 种语言，使您能够触达全球受众。您源文档的主要语言将自动从可用翻译语言列表中排除。

## `translate` 命令

`aigne doc translate` 命令用于为您现有的文档文件生成翻译。您可以以交互方式运行它来选择您想要的文档和语言，也可以使用命令行标志直接指定这些选项以实现自动化工作流。

### 交互模式

若需引导式体验，请不带任何参数运行该命令：

```bash
aigne doc translate
```

执行后，该工具将执行以下步骤：
1.  扫描现有文档。
2.  提示您从列表中选择希望翻译的特定文档。
3.  提示您选择目标翻译语言。为方便起见，先前选择的语言将被预先选中。
4.  为每个选定的文档和语言对开始翻译过程。
5.  将翻译后的文件保存在相应的特定语言目录中。

### 命令行选项

对于非交互式使用或编写脚本，您可以使用以下命令行标志来控制翻译过程。

<x-field-group>
  <x-field data-name="--docs" data-type="array<string>">
    <x-field-desc markdown>指定一个或多个要翻译的文档路径。如果未提供，该工具将进入交互模式，让您从可用文档列表中进行选择。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array<string>">
    <x-field-desc markdown>指定一个或多个目标语言代码（例如，`zh`、`ja`）。如果省略，系统将提示您以交互方式选择语言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string">
    <x-field-desc markdown>提供词汇表文件的路径（例如，`@path/to/glossary.md`）。这可确保特定技术术语在所有文档中得到一致的翻译。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string">
    <x-field-desc markdown>提供具体的说明或反馈来指导 AI 的翻译风格，例如调整语气或术语。</x-field-desc>
  </x-field>
</x-field-group>

### 用法示例

#### 1. 将特定文档翻译成多种语言

要将 `overview.md` 和 `examples.md` 翻译成中文（`zh`）和日文（`ja`）且无需交互式提示：

```bash
aigne doc translate --docs overview.md --docs examples.md --langs zh --langs ja
```

#### 2. 使用词汇表以确保术语一致

为确保技术术语翻译正确，请提供一个词汇表文件。这对于保持品牌名称或专业词汇的一致性非常有用。

```bash
aigne doc translate --glossary @./glossary.md
```

#### 3. 提供反馈以优化翻译风格

您可以通过提供反馈来指导翻译风格。例如，要请求更正式的语气：

```bash
aigne doc translate --feedback "Use a formal, technical tone for all translations."
```

此反馈将被记录在更新后文档的历史记录中。

## 支持的语言

该工具提供 12 种语言的翻译支持。文档的母语是英语（`en`）。

| 语言 | 代码 |
| :--- | :--- |
| 中文（简体） | `zh` |
| 中文（繁体）| `zh-TW`|
| 日语 | `ja` |
| 韩语 | `ko` |
| 西班牙语 | `es` |
| 法语 | `fr` |
| 德语 | `de` |
| 葡萄牙语 | `pt` |
| 俄语 | `ru` |
| 意大利语 | `it` |
| 阿拉伯语 | `ar` |

## 总结

`translate` 命令为本地化您的文档提供了一种结构化的方法。您可以使用其交互模式进行引导式翻译，或使用命令行选项实现自动化工作流。使用词汇表和反馈等功能有助于保持翻译内容的质量和一致性。

翻译完文档后，您可以继续[发布您的文档](./guides-publishing-your-docs.md)。