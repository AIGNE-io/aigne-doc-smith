---
labels: ["Reference"]
---

# 翻译文档

通过自动将您的文档翻译成多种语言，触达全球受众。AIGNE DocSmith 通过 `aigne doc translate` 命令简化了此过程，该命令既可以交互式运行，也可以通过指定命令行选项进行自动化操作。

### 交互式翻译

最直接的方法是，在不带任何参数的情况下运行该命令。这将启动一个交互式向导，引导您完成整个过程。

```bash
aigne doc translate
```

交互模式将提示您：
1.  **选择要翻译的文档：** 系统将为您呈现一个现有文档列表供您选择。

    ![选择要翻译的文档](https://docsmith.aigne.io/image-bin/uploads/e2cf5fa45aa856c406a444fb4665ed2d.png)

2.  **选择目标语言：** 从 12 种以上支持的语言中选择一种或多种进行翻译。

    ![选择要翻译的语言](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

如果您希望在开始翻译过程前直观地确认所做选择，此模式是理想之选。

### 命令行翻译

对于脚本编写或更具体的需求，您可以使用命令行参数直接定义翻译任务。

#### 命令参数

| 参数 | 描述 |
| --- | --- |
| `--langs` | 指定目标语言。此选项可多次使用以选择多种语言（例如，`--langs zh --langs ja`）。 |
| `--docs` | 指定要翻译的文档路径。此选项也可多次使用以选择多个文档。 |
| `--feedback` | 提供具体说明以指导和提高翻译质量。 |
| `--glossary` | 使用术语表文件以确保术语一致。路径应以 `@` 为前缀（例如，`--glossary @path/to/glossary.md`）。 |

#### 示例

**将特定文档翻译成多种语言**

此命令可将 `examples.md` 和 `overview.md` 翻译成中文和日文。
```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

**使用自定义术语表进行翻译**

此命令使用一个术语表文件来确保品牌名称和技术术语的翻译保持一致，并结合反馈信息来指导翻译的语气。
```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

### 支持的语言

DocSmith 为以下语言提供自动翻译：

| 语言 | 代码 |
| --- | --- |
| English | en |
| 简体中文 (Simplified Chinese) | zh-CN |
| 繁體中文 (Traditional Chinese) | zh-TW |
| 日本語 (Japanese) | ja |
| 한국어 (Korean) | ko |
| Español (Spanish) | es |
| Français (French) | fr |
| Deutsch (German) | de |
| Português (Portuguese) | pt-BR |
| Русский (Russian) | ru |
| Italiano (Italian) | it |
| العربية (Arabic) | ar |

---

文档翻译完成后，下一步就是将其提供给您的受众。在[发布您的文档](./features-publish-your-docs.md)指南中了解如何操作。