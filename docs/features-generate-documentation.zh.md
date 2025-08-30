---
labels: ["Reference"]
---

# 生成文档

`aigne doc generate` 命令是 DocSmith 的核心功能，旨在通过一个命令将您的源代码转换为内容全面、结构清晰的文档套件。

该过程包括分析您的代码库、规划合理的文档结构，然后为每个部分生成详细内容。这是从零开始创建文档的主要方式。

## 首次生成

首先，请进入您项目的根目录并运行以下命令：

```bash
aigne doc generate
```

### 智能自动配置

如果您首次在项目中运行此命令，DocSmith 将智能地检测到尚无配置。它会自动启动一个交互式设置向导，引导您完成初始设置。这能确保在生成开始前，您已拥有一个正确配置的环境。

![首次运行 generate 命令会触发设置向导](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统将询问您一系列问题以定义：
- 文档生成规则和风格
- 目标受众
- 主要语言和翻译语言
- 源代码和输出路径

![回答几个问题以配置您的文档风格、语言和源路径](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 会继续进行文档生成。

![DocSmith 分析您的代码、规划结构并生成每个文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

成功完成后，您新创建的文档将位于您指定的输出目录中。

![完成后，您将在指定的输出目录中找到新文档](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 生成过程

`generate` 命令遵循一个清晰、自动化的工作流程，以确保结果的一致性和高质量。该过程的可视化流程如下：

```d2
direction: down

start: "开始"
run_cmd: "运行 `aigne doc generate`"
check_config: "配置是否存在？" {
  shape: diamond
}
interactive_setup: "交互式设置向导"
plan_structure: "分析代码并规划结构"
gen_content: "生成文档内容"
save_docs: "将文档保存到输出目录"
end: "结束"

start -> run_cmd -> check_config
check_config -> interactive_setup: "否"
interactive_setup -> plan_structure
check_config -> plan_structure: "是"
plan_structure -> gen_content -> save_docs -> end
```

## 微调生成过程

虽然默认的 `generate` 命令足以满足大多数使用场景，但您也可以使用一些选项来控制生成过程。这些选项在重新生成内容或优化文档结构时尤其有用。

| 选项              | 描述                                                                                                                             | 示例                                                              | 
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | 删除所有现有文档并从头开始重新生成。在对源代码或配置进行重大更改后使用此选项。                                                           | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | 提供高级反馈以优化整体文档结构规划，例如添加、删除或重组章节。                                                                           | `aigne doc generate --feedback "添加一个 API 参考部分"`         |
| `--model`           | 指定 AIGNE Hub 中的特定大语言模型用于内容生成，让您可以轻松切换模型。                                                                      | `aigne doc generate --model claude:claude-3-5-sonnet`                |

## 下一步

既然您已经生成了初始文档，您的项目还将继续迭代。为了使文档与代码保持同步，您需要更新文档。请继续阅读下一章节，了解如何进行针对性修改和重新生成特定文件。

<x-card data-title="更新和优化" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  了解当代码发生变化时如何智能更新文档，或利用反馈进行特定改进。
</x-card>.