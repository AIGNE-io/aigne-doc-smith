# 生成文档

`aigne doc generate` 命令是用于从源代码创建完整文档集的主要功能。该命令会启动一个流程，分析您的代码库，规划逻辑化的文档结构，然后为每个部分生成内容。这是从初始状态创建文档的标准方法。

## 首次生成

首先，请导航到您项目的根目录并运行以下命令：

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### 自动配置

如果您是首次在项目中运行此命令，DocSmith 将检测到尚不存在任何配置。随后，它将自动启动一个交互式设置向导，引导您完成所需的设置步骤。此过程可确保在生成开始前已准备好有效的配置。

![运行 generate 命令，智能执行初始化](../assets/screenshots/doc-generate.png)

系统将提示您回答一系列问题，以定义文档的关键方面，包括：

*   文档生成规则和风格
*   目标受众
*   主要语言及任何其他翻译语言
*   源代码输入和文档输出路径

![回答问题以完成项目设置](../assets/screenshots/doc-complete-setup.png)

配置完成后，DocSmith 将继续进行文档生成。

![执行结构规划并生成文档](../assets/screenshots/doc-generate-docs.png)

成功完成后，新创建的文档将位于设置期间指定的输出目录中。

![文档生成成功](../assets/screenshots/doc-generated-successfully.png)

## 生成过程

`generate` 命令执行一个自动化的多步骤工作流。该过程概述如下：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"

  config-check: {
    label: "配置文件是否存在？"
    shape: diamond
  }

  interactive-setup: {
    label: "交互式设置向导"
  }

  generation-process: {
    label: "3. 生成过程"

    analyze-code: "分析代码"
    plan-structure: "规划结构"
    generate-content: "生成内容"

    analyze-code -> plan-structure -> generate-content
  }

  output: {
    label: "输出目录"
  }
}

User -> AIGNE-CLI.config-check: "'aigne doc generate'"
AIGNE-CLI.config-check -> AIGNE-CLI.interactive-setup: "[否] 2. 启动设置"
AIGNE-CLI.interactive-setup -> AIGNE-CLI.generation-process: "创建配置文件"
AIGNE-CLI.config-check -> AIGNE-CLI.generation-process: "[是]"
AIGNE-CLI.generation-process -> AIGNE-CLI.output: "4. 编写文档"
```

## 命令选项

默认的 `generate` 命令足以满足大多数使用场景。但是，有几个选项可用于修改其行为，这对于强制完全重新生成或优化文档结构非常有用。

| 选项              | 描述                                                                                                                                   | 示例                                                   |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `--forceRegenerate` | 删除所有现有文档并从头开始重新生成。在对源代码或配置进行重大更改后使用此选项。                                                                 | `aigne doc generate --forceRegenerate`                   |
| `--feedback`        | 提供高层反馈以优化整体文档结构，例如添加、删除或重组部分。                                                                                       | `aigne doc generate --feedback "添加 API 参考"`    |
| `--model`           | 指定 AIGNE Hub 中的特定大型语言模型用于内容生成，允许您在不同模型之间切换。                                                                      | `aigne doc generate --model openai:gpt-4o`               |

## 接下来做什么？

生成初始文档后，您的项目将继续发展。为了使您的文档与代码保持同步，您需要执行更新。下一节将解释如何根据新需求或代码修改进行有针对性的更改并重新生成特定文件。

<x-card data-title="更新和优化" data-icon="lucide:file-edit" data-href="/features/update-and-refine">了解如何在代码更改时更新文档，或使用反馈进行特定改进。</x-card>