# 生成文档

`aigne doc generate` 命令是用于从源代码创建完整文档集的主要功能。该命令会启动一个流程，分析您的代码库、规划逻辑化的文档结构，然后为每个部分生成内容。这是从初始状态创建文档的标准方法。

## 首次生成

首先，请导航到您项目的根目录并运行以下命令：

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### 自动配置

如果您是首次在项目中运行此命令，DocSmith 会检测到尚无配置文件。然后，它将自动启动一个交互式设置向导，引导您完成所需的设置步骤。此过程可确保在生成开始前已存在有效的配置。

![首次运行 generate 命令会触发设置向导](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统将提示您回答一系列问题，以定义文档的关键方面，包括：

- 文档生成规则和风格
- 目标受众
- 主要语言及任何其他翻译语言
- 源代码输入和文档输出路径

![回答问题以配置文档风格、语言和源路径](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将继续进行文档生成。

![DocSmith 分析您的代码、规划结构并生成每个文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

成功完成后，新创建的文档将位于设置期间指定的输出目录中。

![完成后，您将在指定的输出目录中找到新文档](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 生成流程

`generate` 命令执行一个自动化的多步骤工作流。流程概述如下：

```d2
direction: down

User: {
  label: "用户"
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Config-Check: {
  label: "配置\n存在？"
  shape: diamond
}

Setup-Wizard: {
  label: "交互式\n设置向导"
}

Generation-Process: {
  label: "生成流程"
  grid-columns: 1

  Analyze: { label: "分析代码库" }
  Plan: { label: "规划结构" }
  Generate: { label: "生成内容" }
}

Source-Code: {
  label: "源代码"
  shape: cylinder
}

Config-File: {
  label: "config.yaml"
  shape: cylinder
}

Output-Directory: {
  label: "输出目录"
  shape: cylinder
}

User -> AIGNE-CLI: "1. aigne doc generate"
AIGNE-CLI -> Config-Check: "2. 检查配置"

Config-Check -> Setup-Wizard: "3a. 否"
Setup-Wizard -> User: "提示输入"
User -> Setup-Wizard: "提供答案"
Setup-Wizard -> Config-File: "创建"
Config-File -> Generation-Process: "使用"
Setup-Wizard -> Generation-Process: "4. 继续"

Config-Check -> Generation-Process: "3b. 是"

Source-Code -> Generation-Process.Analyze: "输入"
Generation-Process.Analyze -> Generation-Process.Plan
Generation-Process.Plan -> Generation-Process.Generate
Generation-Process.Generate -> Output-Directory: "5. 写入文档"

Output-Directory -> User: "6. 审阅文档"
```

## 命令选项

默认的 `generate` 命令足以满足大多数使用场景。但是，有几个选项可用于修改其行为，这对于强制完全重新生成或优化文档结构非常有用。

| 选项              | 说明                                                                                                                                 | 示例                                                  |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `--forceRegenerate` | 删除所有现有文档并从头开始重新生成。在对源代码或配置进行重大更改后使用此选项。 | `aigne doc generate --forceRegenerate`                   |
| `--feedback`        | 提供高层反馈以优化整体文档结构，例如添加、删除或重组章节。               | `aigne doc generate --feedback "添加一个 API 参考部分"` |
| `--model`           | 指定 AIGNE Hub 中的特定大型语言模型用于内容生成。这允许您在不同模型之间切换。    | `aigne doc generate --model openai:gpt-4o`               |

## 接下来做什么？

生成初始文档后，您的项目将继续演进。为了使文档与代码保持同步，您需要执行更新。下一节将介绍如何根据新需求或代码修改进行有针对性的更改并重新生成特定文件。

<x-card data-title="更新与优化" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
了解当代码发生变化时如何更新文档，或使用反馈进行特定改进。
</x-card>